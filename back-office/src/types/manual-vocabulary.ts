export type ManualVocabularyExtractResult = {
  blob: Blob;
  filename: string;
  stats: {
    totalTerms: number;
    validRows: number;
    warnings: number;
    duplicatesRemoved: number;
  };
};
