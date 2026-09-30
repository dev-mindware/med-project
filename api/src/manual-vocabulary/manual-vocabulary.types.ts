/**
 * Acordo Ortográfico de 1945 — Tipologia lexical do português europeu e angolano.
 * Todos os tipos de palavra reconhecidos pelo sistema de extracção de manuais.
 */
export type ManualVocabularySourceModel =
  'ENTRY' | 'NEOLOGISM' | 'TOPONYM' | 'ANTHROPONYM' | 'FOREIGNISM';

/**
 * Classificação morfológica da entrada conforme o AO45.
 *
 * - simples            → palavra não composta (ex: casa, terra, água)
 * - composto-hifenizado → justaposição com autonomia fonética (ex: couve-flor, guarda-chuva)
 * - aglutinado         → composto cuja noção de composição se perdeu (ex: girassol, pontapé)
 * - especie-botanica   → nome de planta com hífen obrigatório (ex: erva-doce, feijão-verde)
 * - especie-zoologica  → nome de animal com hífen obrigatório (ex: bem-te-vi, joão-de-barro)
 * - locucao-nominal    → conjunto de palavras com função de substantivo (ex: fim de semana)
 * - locucao-adverbial  → conjunto de palavras com função de advérbio (ex: de repente)
 * - prefixado          → derivação com prefixo e hífen (ex: pré-natal, anti-inflamatório)
 * - bantuismo          → palavra de origem bantu incorporada no português angolano
 * - angolanismo        → expressão ou sentido particular do português angolano
 */
export type WordType =
  | 'simples'
  | 'composto-hifenizado'
  | 'aglutinado'
  | 'especie-botanica'
  | 'especie-zoologica'
  | 'locucao-nominal'
  | 'locucao-adverbial'
  | 'prefixado'
  | 'bantuismo'
  | 'angolanismo';

/** Grau de integração de um estrangeirismo no léxico português */
export type IntegrationLevel = 'adaptado' | 'nao-adaptado' | 'em-transicao';

export type ManualVocabularyRawItem = {
  sourceModel: ManualVocabularySourceModel;
  /** Confiança da classificação IA (0.0–1.0). Items < 0.5 são descartados. */
  confidence: number;
  data: Record<string, unknown>;
};

export type ManualVocabularyWarning = {
  sourceModel: ManualVocabularySourceModel;
  rowNumber: number;
  field?: string;
  term?: string;
  message: string;
};

export type ManualVocabularyWorkbookData = {
  entries: Record<string, unknown>[];
  neologisms: Record<string, unknown>[];
  toponyms: Record<string, unknown>[];
  anthroponyms: Record<string, unknown>[];
  foreignisms: Record<string, unknown>[];
  warnings: ManualVocabularyWarning[];
  stats: ManualVocabularyStats;
};

export type ManualVocabularyStats = {
  totalTerms: number;
  validRows: number;
  entries: number;
  neologisms: number;
  toponyms: number;
  anthroponyms: number;
  foreignisms: number;
  warnings: number;
  duplicatesRemoved: number;
  /** Items descartados por confiança de IA abaixo do limiar (< 0.5) */
  lowConfidenceDiscarded: number;
};

export type ManualVocabularyExtractionResult = {
  buffer: Buffer;
  filename: string;
  stats: ManualVocabularyStats;
  workbookData: ManualVocabularyWorkbookData;
  processingMs: number;
};

export type ManualVocabularyCommitPayload = {
  entries?: Record<string, unknown>[];
  neologisms?: Record<string, unknown>[];
  toponyms?: Record<string, unknown>[];
  anthroponyms?: Record<string, unknown>[];
  foreignisms?: Record<string, unknown>[];
};

export type ManualVocabularyCommitResult = {
  success: boolean;
  insertedCount: number;
  duplicatesCount: number;
  totalProcessed: number;
  details: {
    entries: { inserted: number; duplicates: number };
    neologisms: { inserted: number; duplicates: number };
    toponyms: { inserted: number; duplicates: number };
    anthroponyms: { inserted: number; duplicates: number };
    foreignisms: { inserted: number; duplicates: number };
  };
  skippedDuplicates: Array<{
    module: ManualVocabularySourceModel;
    term: string;
    reason: string;
  }>;
};
