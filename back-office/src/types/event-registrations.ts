import { BaseEntity, RegistrationStatus } from "./common";

export type EventRegistrationData = {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  notes?: string;
};
export type EventRegistrationResponse = EventRegistrationData & BaseEntity & {
  status: RegistrationStatus;
  attended: boolean;
};
