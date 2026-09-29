export type ManualVocabularySourceModel =
  'ENTRY' | 'TOPONYM' | 'ANTHROPONYM' | 'FOREIGNISM';

export type ManualVocabularyRawItem = {
  sourceModel: ManualVocabularySourceModel;
  confidence?: number;
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
  toponyms: number;
  anthroponyms: number;
  foreignisms: number;
  warnings: number;
  duplicatesRemoved: number;
};

export type ManualVocabularyExtractionResult = {
  buffer: Buffer;
  filename: string;
  stats: ManualVocabularyStats;
};
