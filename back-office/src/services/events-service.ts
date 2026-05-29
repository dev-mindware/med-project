import type { EventData, EventResponse, EventStatus } from "@/types";
import { api } from "./api";

export const eventsService = {
  addEvent: async (data: EventData) => {
    return api.post<EventResponse>("/events", data);
  },
  updateEvent: async (id: string, data: EventData) => {
    return api.patch<EventResponse>(`/events/${id}`, data);
  },
  deleteEvent: async (id: string) => {
    return api.delete<EventResponse>(`/events/${id}`);
  },
  findEventById: async (id: string) => {
    return api.get<EventResponse>(`/events/${id}`);
  },
  updateStatus: async (id: string, data: { status: EventStatus }) => {
    return api.patch<EventResponse>(`/events/${id}/status`, data);
  },
};
