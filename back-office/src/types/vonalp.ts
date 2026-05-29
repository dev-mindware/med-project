export type VonalpVocabularyType = "VONALP" | "VONALP_EP";
export type VonalpSourceType = "ENTRY" | "TOPONYM" | "ANTHROPONYM" | "FOREIGNISM";
export type VonalpCompletionStatus = "COMPLETE" | "INCOMPLETE" | "ARCHIVED";

export type VonalpFieldKey =
  | "term"
  | "pronunciation"
  | "grammaticalCategory"
  | "grammaticalSubcategory"
  | "syllabicDivision"
  | "etymology"
  | "firstDefinition"
  | "secondDefinition"
  | "origin";

export type VonalpTermData = Record<VonalpFieldKey, string | null | undefined>;

export type VonalpTermResponse = VonalpTermData & {
  id: string;
  vocabularyType: VonalpVocabularyType;
  sourceType: VonalpSourceType;
  sourceId: string;
  completionStatus: VonalpCompletionStatus;
  missingFields: VonalpFieldKey[];
  requiresModal: boolean;
  canSaveIncomplete: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarkVonalpPayload = {
  sourceType: VonalpSourceType;
  sourceId: string;
  vocabularyType: VonalpVocabularyType;
};

export type UpdateVonalpPayload = Partial<VonalpTermData> & {
  saveIncomplete?: boolean;
};
