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
  isForeignism?: boolean;
  vonalpCompletionStatus?: VonalpCompletionStatus;
  vonalpEpCompletionStatus?: VonalpCompletionStatus;
};
export type ToponymResponse = ToponymData & AuditableEntity;
