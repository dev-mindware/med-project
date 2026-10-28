import { ApprovalStatus, AuditableEntity } from "./common";

export type VolnaTermData = {
  term: string;
  language: string;
  grammaticalCategory?: string;
  grammaticalSubcategory?: string;
  definition: string;
  usageExample?: string;
  notes?: string;
  frequency?: number;
  firstSourceId?: string | null;
  firstSource?: string | null;
  sourceDocument?: {
    id: string;
    filename: string;
    category?: string;
    pageCount?: number;
  } | null;
  approvalStatus?: ApprovalStatus;
};

export type VolnaTermResponse = VolnaTermData & AuditableEntity & {
  approvedAt?: string | null;
  submittedAt?: string | null;
  rejectedAt?: string | null;
};
