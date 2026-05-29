import { BaseEntity, EventStatus } from "./common";

export type EventData = {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  location: string;
  registrationCount?: number;
  maxRegistrations?: number;
  status?: EventStatus;
};
export type EventResponse = EventData & BaseEntity & {
  publishedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
};
