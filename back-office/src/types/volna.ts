import { ApprovalStatus, AuditableEntity } from "./common";

export type VolnaTermData = {
  term: string;
  language: string;
  grammaticalCategory?: string;
  grammaticalSubcategory?: string;
  definition: string;
  usageExample?: string;
  notes?: string;
  approvalStatus?: ApprovalStatus;
};

export type VolnaTermResponse = VolnaTermData & AuditableEntity & {
  approvedAt?: string | null;
  submittedAt?: string | null;
  rejectedAt?: string | null;
};
