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
  isForeignism?: boolean;
  vonalpCompletionStatus?: VonalpCompletionStatus;
  vonalpEpCompletionStatus?: VonalpCompletionStatus;
};
export type ForeignismResponse = ForeignismData & AuditableEntity;
