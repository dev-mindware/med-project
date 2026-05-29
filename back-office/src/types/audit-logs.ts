import { BaseEntity } from "./common";

export type AuditLogResponse = BaseEntity & {
  action: string;
  entity: string;
  entityId?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: string;
  failureReason?: string | null;
  actor?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
  };
  changes?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
};
