import type { EventRegistrationData, EventRegistrationResponse, RegistrationStatus } from "@/types";
import { api } from "./api";

export const eventRegistrationsService = {
  addEventRegistration: async (data: EventRegistrationData) => {
    return api.post<EventRegistrationResponse>("/event-registrations", data);
  },
  updateEventRegistration: async (id: string, data: EventRegistrationData) => {
    return api.put<EventRegistrationResponse>(`/event-registrations/${id}`, data);
  },
  deleteEventRegistration: async (id: string) => {
    return api.delete<EventRegistrationResponse>(`/event-registrations/${id}`);
  },
  updateStatus: async (id: string, data: { status: RegistrationStatus; notes?: string }) => {
    return api.patch<EventRegistrationResponse>(`/event-registrations/${id}/status`, data);
  },
  markAttendance: async (id: string, attended: boolean) => {
    return api.patch<EventRegistrationResponse>(`/event-registrations/${id}/attendance`, { attended });
  },
};
