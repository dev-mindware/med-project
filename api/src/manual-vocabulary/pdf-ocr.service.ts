import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../common/logger/app-logger.service';

@Injectable()
export class PdfOcrService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async extractText(
    file: Express.Multer.File,
    options?: { startPage?: number; endPage?: number },
  ): Promise<string> {
    // 1. Tentar extracção nativa digital rápida (instantânea para PDFs de centenas de páginas)
    try {
      // Importação dinâmica de pdf-parse para suportar CJS e ESM
      const pdfParseModule = await import('pdf-parse');
      const pdfParse =
        typeof pdfParseModule === 'function'
          ? pdfParseModule
          : (pdfParseModule as any).default || pdfParseModule;

      let pageCounter = 0;
      let totalPagesInPdf = 0;
      const parseOptions: any = {};

      if (options?.startPage || options?.endPage) {
        parseOptions.pagerender = async (pageData: any) => {
          pageCounter++;
          totalPagesInPdf = Math.max(totalPagesInPdf, pageCounter);

          if (options.startPage && pageCounter < options.startPage) {
            return '';
          }
          if (options.endPage && pageCounter > options.endPage) {
            return '';
          }

          const textContent = await pageData.getTextContent();
          return (
            textContent.items.map((item: any) => item.str).join(' ') + '\n\n'
          );
        };
      }

      const pdfData = await pdfParse(file.buffer, parseOptions);
      const text = pdfData.text ? pdfData.text.trim() : '';

      this.logger.info('PDF processado por extractor digital nativo', {
        context: 'PdfOcrService',
        action: 'PDF_PARSE_SUCCESS',
        meta: {
          filename: file.originalname,
          totalPages: pdfData.numpages || totalPagesInPdf,
          startPage: options?.startPage,
          endPage: options?.endPage,
          extractedLength: text.length,
        },
      });

      // Se o documento tiver camada de texto legível (> 50 caracteres)
      if (text.length > 50) {
        return this.cleanText(text);
      }

      this.logger.warn(
        'PDF com camada de texto digital insuficiente ou nula (< 50 caracteres). A recorrer ao Google Gemini Vision OCR...',
        {
          context: 'PdfOcrService',
          action: 'PDF_PARSE_EMPTY_FALLBACK',
          meta: { filename: file.originalname, textLength: text.length },
        },
      );
    } catch (parseError) {
      this.logger.warn(
        'Falha no extractor nativo de PDF. A recorrer ao Google Gemini Vision...',
        {
          context: 'PdfOcrService',
          action: 'PDF_PARSE_FALLBACK',
          error: parseError,
          meta: { filename: file.originalname },
        },
      );
    }

    // 2. Fallback: Leitura multimodal do documento via Google Gemini Vision
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      throw new BadGatewayException('GEMINI_API_KEY nao configurada');
    }

    const model =
      this.configService.get<string>('GEMINI_OCR_MODEL') ||
      this.configService.get<string>('ai.geminiOcrModel') ||
      this.configService.get<string>('GEMINI_MODEL') ||
      this.configService.get<string>('ai.geminiModel') ||
      'gemini-2.5-flash';

    const prompt =
      'És um sistema especializado em extracção de texto e leitura de documentos e manuais escolares.\n' +
      'Extrai TODO o conteúdo textual deste documento PDF com a máxima fidelidade.\n' +
      'Directrizes:\n' +
      '1. Mantém a ordem original de leitura e a integridade de todas as palavras, vocábulos e glossários.\n' +
      '2. Transcreve tabelas em formato Markdown legível.\n' +
      '3. Não resumas, não omitas definições ou exemplos, nem adiciones comentários próprios.\n' +
      '4. Preserva rigorosamente a acentuação e a ortografia original (incluindo palavras compostas e hífenes).';

    try {
      let documentPart: any;

      // Para ficheiros superiores a 15MB, a API do Gemini rejeita payloads inline (>20MB base64).
      // Utilizamos o Google Files API para ficheiros grandes (suporta até 2GB e 1.000 páginas).
      if (file.buffer.length > 15 * 1024 * 1024) {
        this.logger.info(
          'Ficheiro PDF de grande dimensão. A efectuar upload via Google Files API...',
          {
            context: 'PdfOcrService',
            action: 'GEMINI_FILE_UPLOAD_START',
            meta: { filename: file.originalname, size: file.size },
          },
        );

        const fileUri = await this.uploadToGeminiFilesApi(file, apiKey);
        documentPart = {
          file_data: {
            mime_type: 'application/pdf',
            file_uri: fileUri,
          },
        };
      } else {
        const base64Pdf = file.buffer.toString('base64');
        documentPart = {
          inline_data: {
            mime_type: 'application/pdf',
            data: base64Pdf,
          },
        };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }, documentPart],
            },
          ],
          generationConfig: {
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Gemini API HTTP ${response.status} ${response.statusText}: ${errorData}`,
        );
      }

      const data = await response.json();
      const rawText =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text || '')
          ?.join('\n\n') || '';

      if (!rawText.trim()) {
        throw new Error('Nenhum texto retornado pelo modelo Gemini');
      }

      return this.cleanText(rawText);
    } catch (error) {
      this.logger.error('Failed to extract text from PDF via Gemini', {
        context: 'PdfOcrService',
        action: 'PDF_GEMINI_OCR_FAILED',
        error,
        meta: {
          filename: file.originalname,
          size: file.size,
          model,
        },
      });
      throw new BadGatewayException(
        `Falha ao extrair texto do PDF via Gemini: ${this.errorMessage(error)}`,
      );
    }
  }

  /**
   * Upload de ficheiros grandes para a Google Files API.
   * Suporta documentos até 2GB e até 1.000 páginas sem sobrecarregar o payload HTTP.
   */
  private async uploadToGeminiFilesApi(
    file: Express.Multer.File,
    apiKey: string,
  ): Promise<string> {
    const metadata = JSON.stringify({
      file: { display_name: file.originalname },
    });
    const initRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': file.buffer.length.toString(),
          'X-Goog-Upload-Header-Content-Type': 'application/pdf',
          'Content-Type': 'application/json',
        },
        body: metadata,
      },
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(`Google Files API Init falhou: ${errText}`);
    }

    const uploadUrl = initRes.headers.get('x-goog-upload-url');
    if (!uploadUrl) {
      throw new Error(
        'Google Files API não forneceu o cabeçalho de upload URL',
      );
    }

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Length': file.buffer.length.toString(),
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
      },
      body: new Uint8Array(file.buffer),
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Google Files API Upload falhou: ${errText}`);
    }

    const fileData = await uploadRes.json();
    if (!fileData?.file?.uri) {
      throw new Error('Google Files API não retornou o URI do ficheiro');
    }

    return fileData.file.uri;
  }

  /**
   * Limpa e normaliza o texto extraído pelo OCR do PDF.
   *
   * Operações (por ordem):
   * 1. Remove formatação Markdown introduzida pelo Gemini OCR
   * 2. Reconstrói palavras hifenizadas quebradas por fim de linha no PDF
   *    (ex: "couve-↵flor" → "couve-flor" | sílabas sem hífen: "bran↵co" → "branco")
   * 3. Remove caracteres de controlo invisíveis típicos de PDFs escaneados
   * 4. Normaliza aspas tipográficas para ASCII
   * 5. Remove linhas que contêm apenas números (números de página)
   * 6. Remove linhas em maiúsculas isoladas (cabeçalhos de secção, ex: "CAPÍTULO III")
   * 7. Colapsa espaços e quebras de linha em excesso
   */
  private cleanText(text: string): string {
    return (
      text
        // 1. Remove formatação Markdown do OCR / Leitura
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*|__|\*(?!\w)|_(?!\w)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // 2a. Reconstrói palavras hifenizadas quebradas no fim de linha
        //     "couve-\nflor" → "couve-flor"
        .replace(/(\w)-\r?\n(\w)/g, '$1-$2')
        // 2b. Reconstrói sílabas sem hífen quebradas por paginação
        .replace(/([a-záéíóúâêôãõçàü])\r?\n([a-záéíóúâêôãõçàü])/gi, '$1$2')
        // 3. Remove caracteres de controlo invisíveis (excepto \t \n \r)
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        // 4. Normaliza aspas tipográficas para ASCII
        .replace(/[""«»]/g, '"')
        .replace(/[''‹›]/g, "'")
        // 5. Remove linhas que contêm apenas números (números de página)
        .replace(/^\s*\d+\s*$/gm, '')
        // 6. Remove linhas em MAIÚSCULAS isoladas com 4+ caracteres (cabeçalhos de secção)
        .replace(/^([A-ZÁÉÍÓÚÂÊÔÃÕÇ\s-]{4,})$/gm, (match) =>
          match.trim() === match.trim().toUpperCase() ? '' : match,
        )
        // 7. Colapsa espaços em excesso e limita quebras de linha consecutivas a 2
        .replace(/[ \t]{3,}/g, '  ')
        .replace(/(\r?\n){3,}/g, '\n\n')
        .trim()
    );
  }

  private errorMessage(error: unknown) {
    return error instanceof Error && error.message
      ? error.message
      : 'servico OCR indisponivel';
  }
}
