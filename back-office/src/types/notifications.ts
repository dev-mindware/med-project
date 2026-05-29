export type NotificationResponse = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  entity?: string | null;
  entityId?: string | null;
  readAt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
};
