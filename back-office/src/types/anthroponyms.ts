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
export type AnthroponymResponse = AnthroponymData & AuditableEntity;
