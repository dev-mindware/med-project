import { AuditableEntity } from "./common";
import { VonalpCompletionStatus } from "./vonalp";

export type ForeignismData = {
  term: string;
  pronunciation?: string;
  originalLanguage?: string;
  originCountry?: string;
  adaptedForm?: string;
  originalForm?: string;
  meaning?: string;
  definition?: string;
  usageExample?: string;
  context?: string;
  field?: string;
  abbreviation?: string;
  acronym?: string;
  reduction?: string;
  shortForm?: string;
  fullForm?: string;
  grammaticalCategory?: string;
  isVocabulary?: boolean;
  isVocabularyEP?: boolean;
  frequency?: number;
  firstSourceId?: string | null;
  firstSource?: string | null;
  sourceDocument?: {
    id: string;
    filename: string;
    category?: string;
    pageCount?: number;
  } | null;
  importBatchId?: string | null;
  vonalpCompletionStatus?: VonalpCompletionStatus;
  vonalpEpCompletionStatus?: VonalpCompletionStatus;
};
export type ForeignismResponse = ForeignismData & AuditableEntity;
