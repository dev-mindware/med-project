import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ManualVocabularyRawItem } from './manual-vocabulary.types';
import { AppLogger } from '../common/logger/app-logger.service';

const SYSTEM_PROMPT = `
Es um linguista especializado em portugues europeu, portugues angolano e linguas nacionais de Angola.
Extrai dados linguisticos de manuais e classifica cada item num dos modelos:
ENTRY, TOPONYM, ANTHROPONYM, FOREIGNISM.

Responde apenas com JSON valido no formato:
[
  {
    "sourceModel": "ENTRY",
    "confidence": 0.9,
    "data": {}
  }
]

Usa as keys tecnicas abaixo em data:
- ENTRY: entry, firstDefinition, secondDefinition, pronunciation, syllabicDivision, etymology, usageExample, grammaticalCategory, grammaticalSubcategory, grammaticalStatus, languageCode.
- TOPONYM: toponym, province, municipality, meaning, pronunciation, location, gentilic, toponymHistory, toponymProvenance, commonUsage, graphicVariation, toponymClasses, toponymSubclasses, languageCode.
- ANTHROPONYM: name, gender, meaning, etymology, surname, surnameMeaning, historicalFigure, historicalFigurePseudonym, historicalFigureDomain.
- FOREIGNISM: term, pronunciation, originalLanguage, originCountry, adaptedForm, originalForm, meaning, definition, usageExample, context, field, grammaticalCategory.

Regras:
- Nao inventes dados quando o texto nao oferecer contexto suficiente; deixa o campo vazio.
- Para termos comuns, privilegia vocabulos de 1, 2 ou 3 palavras.
- Nomes proprios, topónimos e antropónimos podem ser compostos quando fizer sentido.
- toponymClasses e toponymSubclasses devem ser arrays de strings.
`;

@Injectable()
export class VocabularyAiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async extractVocabulary(text: string): Promise<ManualVocabularyRawItem[]> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new BadGatewayException('OPENAI_API_KEY nao configurada');
    }

    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4.1-mini';
    const client = new OpenAI({ apiKey });
    const chunks = this.splitText(text);
    const allItems: ManualVocabularyRawItem[] = [];

    for (const chunk of chunks) {
      try {
        const response = await client.chat.completions.create({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: chunk },
          ],
        });

        const content = response.choices[0]?.message?.content || '[]';
        allItems.push(...this.parseItems(content));
      } catch (error) {
        this.logger.error('Failed to extract vocabulary with AI', {
          context: 'VocabularyAiService',
          action: 'VOCABULARY_AI_FAILED',
          error,
          meta: {
            model,
            chunkLength: chunk.length,
          },
        });
        throw new BadGatewayException(`Falha ao analisar vocabulario com IA: ${this.errorMessage(error)}`);
      }
    }

    return allItems;
  }

  private splitText(text: string) {
    const words = text.split(/\s+/).filter(Boolean);
    const chunkWords = Number(this.configService.get<string>('VOCABULARY_CHUNK_WORDS') || 2200);
    const chunks: string[] = [];

    for (let index = 0; index < words.length; index += chunkWords) {
      chunks.push(words.slice(index, index + chunkWords).join(' '));
    }

    return chunks.length > 0 ? chunks : [''];
  }

  private parseItems(content: string): ManualVocabularyRawItem[] {
    const raw = content.trim();
    const json = raw.startsWith('[') ? raw : raw.match(/\[[\s\S]*\]/)?.[0] || '[]';
    const parsed = JSON.parse(json) as ManualVocabularyRawItem[];

    return parsed.filter((item) =>
      ['ENTRY', 'TOPONYM', 'ANTHROPONYM', 'FOREIGNISM'].includes(item.sourceModel) &&
      item.data &&
      typeof item.data === 'object',
    );
  }

  private errorMessage(error: unknown) {
    return error instanceof Error && error.message ? error.message : 'servico IA indisponivel';
  }
}
