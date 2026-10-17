import { AuditableEntity } from "./common";
import { VonalpCompletionStatus } from "./vonalp";

export type ToponymData = {
  toponym: string;
  pronunciation?: string;
  meaning?: string;
  province: string;
  municipality?: string;
  location?: string;
  gentilic?: string;
  locationImage?: string;
  toponymHistory?: string;
  toponymProvenance?: string;
  commonUsage?: string;
  graphicVariation?: string;
  toponymClasses?: string[];
  toponymSubclasses?: string[];
  languageCode?: string;
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
export type ToponymResponse = ToponymData & AuditableEntity;
