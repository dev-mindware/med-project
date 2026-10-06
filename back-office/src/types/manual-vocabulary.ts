export type ManualVocabularySourceModel =
  | 'ENTRY'
  | 'NEOLOGISM'
  | 'TOPONYM'
  | 'ANTHROPONYM'
  | 'FOREIGNISM';

/** Módulos da curadoria: os 5 extraídos pela IA + o vocabulário das línguas nacionais (derivado). */
export type ManualVocabularyModule = ManualVocabularySourceModel | 'NATIONAL_LANGUAGE';

export type ManualVocabularyStats = {
  totalTerms: number;
  validRows: number;
  entries: number;
  neologisms: number;
  toponyms: number;
  anthroponyms: number;
  foreignisms: number;
  nationalLanguages: number;
  warnings: number;
  duplicatesRemoved: number;
};

export type ManualVocabularyWarning = {
  sourceModel: ManualVocabularyModule;
  rowNumber: number;
  field?: string;
  term?: string;
  message: string;
};

export type ManualVocabularyWorkbookData = {
  entries: Record<string, any>[];
  neologisms: Record<string, any>[];
  toponyms: Record<string, any>[];
  anthroponyms: Record<string, any>[];
  foreignisms: Record<string, any>[];
  nationalLanguages: Record<string, any>[];
  warnings: ManualVocabularyWarning[];
  stats: ManualVocabularyStats;
};

export type ManualVocabularyExtractPreviewResult = {
  success: boolean;
  filename: string;
  stats: ManualVocabularyStats;
  workbookData: ManualVocabularyWorkbookData;
  processingMs?: number;
};

export type ManualVocabularyExtractResult = {
  blob: Blob;
  filename: string;
  stats: ManualVocabularyStats;
};

export type ManualVocabularyCommitPayload = {
  entries?: Record<string, any>[];
  neologisms?: Record<string, any>[];
  toponyms?: Record<string, any>[];
  anthroponyms?: Record<string, any>[];
  foreignisms?: Record<string, any>[];
  nationalLanguages?: Record<string, any>[];
  directApproval?: boolean;
};

export type ManualVocabularySkippedDuplicate = {
  module: ManualVocabularyModule;
  term: string;
  reason: string;
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
    nationalLanguages: { inserted: number; duplicates: number };
  };
  /** Vocábulos já existentes cuja frequência foi somada à da nova varredura */
  frequencyUpdatedCount: number;
  skippedDuplicates: ManualVocabularySkippedDuplicate[];
};

export type ManualExtractionLogItem = {
  id: string;
  filename: string;
  fileSize: number;
  userId?: string | null;
  model: string;
  totalTerms: number;
  validRows: number;
  entries: number;
  neologisms: number;
  toponyms: number;
  anthroponyms: number;
  foreignisms: number;
  warnings: number;
  duplicatesRemoved: number;
  lowConfidenceDiscarded: number;
  processingMs: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

export type ManualExtractionLogsResponse = {
  items: ManualExtractionLogItem[];
  total: number;
};

export type ExtractionStage =
  | 'queued'
  | 'reading'
  | 'extracting'
  | 'verifying'
  | 'processing'
  | 'done'
  | 'error';

/** Progresso real reportado pelo servidor durante a extracção. */
export type ExtractionProgress = {
  stage: ExtractionStage;
  done: number;
  total: number;
};
