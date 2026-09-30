import { ConfigService } from '@nestjs/config';
import { BadGatewayException } from '@nestjs/common';
import { VocabularyAiService } from './vocabulary-ai.service';
import { AppLogger } from '../common/logger/app-logger.service';

describe('VocabularyAiService', () => {
  let service: VocabularyAiService;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    logger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;

    service = new VocabularyAiService(configService, logger);
  });

  // ─── Configuração ───────────────────────────────────────────────────────

  it('lança BadGatewayException quando nenhuma API key está configurada', async () => {
    configService.get.mockReturnValue(undefined);

    await expect(service.extractVocabulary('Algum texto')).rejects.toThrow(
      BadGatewayException,
    );
  });

  // ─── Parsing defensivo ─────────────────────────────────────────────────

  it('retorna [] sem lançar excepção quando a IA devolve JSON inválido', () => {
    const items = (service as any).parseItems(
      'Texto completamente inválido {{{',
    );
    expect(items).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('JSON'),
      expect.any(Object),
    );
  });

  it('retorna [] quando a IA devolve um array vazio', () => {
    const items = (service as any).parseItems('[]');
    expect(items).toEqual([]);
  });

  it('filtra items com sourceModel inválido', () => {
    const items = (service as any).parseItems(
      JSON.stringify([
        { sourceModel: 'ENTRY', confidence: 0.9, data: { entry: 'Luanda' } },
        { sourceModel: 'INVALID', confidence: 0.9, data: {} },
        {
          sourceModel: 'TOPONYM',
          confidence: 0.8,
          data: { toponym: 'Luanda' },
        },
      ]),
    );
    expect(items).toHaveLength(2);
    expect(items.map((i: any) => i.sourceModel)).toEqual(['ENTRY', 'TOPONYM']);
  });

  it('descarta items com confidence < 0.5', () => {
    const items = (service as any).parseItems(
      JSON.stringify([
        { sourceModel: 'ENTRY', confidence: 0.9, data: { entry: 'casa' } },
        { sourceModel: 'ENTRY', confidence: 0.49, data: { entry: 'coisa' } },
        { sourceModel: 'ENTRY', confidence: 0.5, data: { entry: 'terra' } },
      ]),
    );
    expect(items).toHaveLength(2);
    expect(items.map((i: any) => i.data.entry)).toEqual(['casa', 'terra']);
  });

  it('aceita items com confidence exactamente igual a 0.5 (limiar incluso)', () => {
    const items = (service as any).parseItems(
      JSON.stringify([
        { sourceModel: 'ENTRY', confidence: 0.5, data: { entry: 'musseque' } },
      ]),
    );
    expect(items).toHaveLength(1);
  });

  it('filtra items sem campo data ou com data nulo', () => {
    const items = (service as any).parseItems(
      JSON.stringify([
        { sourceModel: 'ENTRY', confidence: 0.9, data: null },
        { sourceModel: 'ENTRY', confidence: 0.9 },
        { sourceModel: 'ENTRY', confidence: 0.9, data: { entry: 'válido' } },
      ]),
    );
    expect(items).toHaveLength(1);
    expect(items[0].data.entry).toBe('válido');
  });

  // ─── Chunking por parágrafos ────────────────────────────────────────────

  it('cria chunk único quando o texto tem menos palavras que o limite', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'VOCABULARY_CHUNK_WORDS') return '2200';
      return undefined;
    });
    const texto = 'couve-flor s.f. Planta da família das crucíferas.';
    const chunks = (service as any).splitIntoChunks(texto);
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toContain('couve-flor');
  });

  it('não quebra uma entrada lexicográfica a meio de um parágrafo', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'VOCABULARY_CHUNK_WORDS') return '10'; // limite baixo para testar
      return undefined;
    });
    // 2 parágrafos separados por linha em branco — cada um é uma unidade
    const texto =
      'couve-flor s.f. Planta das crucíferas cultivada pela inflorescência.\n\n' +
      'musseque s.m. Bairro periférico característico das cidades angolanas.';
    const chunks = (service as any).splitIntoChunks(texto);
    // Cada parágrafo deve estar completo num chunk (nunca cortado a meio)
    chunks.forEach((chunk: string) => {
      if (chunk.includes('couve-flor')) {
        expect(chunk).toContain('crucíferas');
      }
      if (chunk.includes('musseque')) {
        expect(chunk).toContain('angolanas');
      }
    });
  });

  // ─── Tipos de palavra (AO45) ────────────────────────────────────────────

  it('preserva o hífen em compostos (couve-flor não é modificado pelo parseItems)', () => {
    const items = (service as any).parseItems(
      JSON.stringify([
        {
          sourceModel: 'ENTRY',
          confidence: 0.95,
          data: {
            entry: 'couve-flor',
            wordType: 'especie-botanica',
            firstDefinition: 'Planta.',
          },
        },
      ]),
    );
    expect(items[0].data.entry).toBe('couve-flor');
    expect(items[0].data.wordType).toBe('especie-botanica');
  });

  it('trata JSON embrulhado em markdown (```json ... ```) correctamente', () => {
    const wrapped =
      '```json\n[{"sourceModel":"ENTRY","confidence":0.9,"data":{"entry":"casa"}}]\n```';
    const items = (service as any).parseItems(wrapped);
    expect(items).toHaveLength(1);
    expect(items[0].data.entry).toBe('casa');
  });
});
