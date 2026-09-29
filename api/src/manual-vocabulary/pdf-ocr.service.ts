import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../common/logger/app-logger.service';

@Injectable()
export class PdfOcrService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async extractText(file: Express.Multer.File) {
    const apiKey = this.configService.get<string>('MISTRAL_API_KEY');
    if (!apiKey) {
      throw new BadGatewayException('MISTRAL_API_KEY nao configurada');
    }

    const model =
      this.configService.get<string>('MISTRAL_OCR_MODEL') ||
      'mistral-ocr-latest';
    const { Mistral } = await import('@mistralai/mistralai');
    const client = new Mistral({ apiKey });
    const base64Pdf = file.buffer.toString('base64');

    try {
      const result = await client.ocr.process({
        model,
        document: {
          type: 'document_url',
          documentUrl: `data:application/pdf;base64,${base64Pdf}`,
          documentName: file.originalname,
        },
        includeImageBase64: false,
        tableFormat: 'markdown',
      });

      return this.cleanText(
        result.pages.map((page) => page.markdown).join('\n\n'),
      );
    } catch (error) {
      this.logger.error('Failed to extract text from PDF', {
        context: 'PdfOcrService',
        action: 'PDF_OCR_FAILED',
        error,
        meta: {
          filename: file.originalname,
          size: file.size,
          model,
        },
      });
      throw new BadGatewayException(
        `Falha ao extrair texto do PDF: ${this.errorMessage(error)}`,
      );
    }
  }

  private cleanText(text: string) {
    return text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*|__|\*|_/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s{3,}/g, '  ')
      .trim();
  }

  private errorMessage(error: unknown) {
    return error instanceof Error && error.message
      ? error.message
      : 'servico OCR indisponivel';
  }
}
