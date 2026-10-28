import { AuditableEntity } from "./common";
import { VonalpCompletionStatus } from "./vonalp";

export type EntryData = {
  entry: string;
  pronunciation?: string;
  syllabicDivision?: string;
  etymology?: string;
  firstDefinition: string;
  secondDefinition?: string;
  thirdDefinition?: string;
  usageExample?: string;
  abbreviation?: string;
  acronym?: string;
  acronymMeaning?: string;
  reduction?: string;
  reductionMeaning?: string;
  shortForm?: string;
  fullForm?: string;
  grammaticalCategory?: string;
  grammaticalSubcategory?: string;
  grammaticalStatus?: string;
  languageCode?: string;
  isVocabulary?: boolean;
  isVocabularyEP?: boolean;
  isForeignism?: boolean;
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
  occurrences?: Array<{
    id: string;
    filename: string;
    category: string;
    count: number;
    pages?: number[];
  }>;
  vonalpCompletionStatus?: VonalpCompletionStatus;
  vonalpEpCompletionStatus?: VonalpCompletionStatus;
};
export type EntryResponse = EntryData & AuditableEntity;
