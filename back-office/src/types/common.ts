export type UserRole = "ADMIN" | "SUPERVISOR" | "OPERATOR";
export type ApprovalStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "NEEDS_CORRECTION" | "ARCHIVED";
export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PostType = "ARTICLE" | "VIDEO" | "IMAGE" | "EVENT_COVERAGE" | "ANNOUNCEMENT";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "ARCHIVED";
export type RegistrationStatus = "PENDING" | "APPROVED" | "CANCELLED" | "REJECTED" | "ATTENDED";

export interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: any;
  size: number;
  url: string;
}

export type BaseEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type AuditableEntity = BaseEntity & {
  createdById?: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  correctionNotes?: string;
};

// Kept for backward compatibility while migrating
export type ItemStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
