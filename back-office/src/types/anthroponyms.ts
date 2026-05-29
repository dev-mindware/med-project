import { AuditableEntity } from "./common";
import { VonalpCompletionStatus } from "./vonalp";

export type AnthroponymData = {
  name: string;
  gender?: string;
  etymology?: string;
  meaning?: string;
  surname?: string;
  surnameMeaning?: string;
  historicalFigure?: string;
  historicalFigurePseudonym?: string;
  historicalFigureDomain?: string;
  isVocabulary?: boolean;
  isVocabularyEP?: boolean;
  isForeignism?: boolean;
  vonalpCompletionStatus?: VonalpCompletionStatus;
  vonalpEpCompletionStatus?: VonalpCompletionStatus;
};
export type AnthroponymResponse = AnthroponymData & AuditableEntity;
