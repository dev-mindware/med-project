import { api } from "./api";
import { NotificationResponse } from "@/types";

export const notificationsService = {
  list: async (limit = 8) => {
    const response = await api.get<NotificationResponse[]>("/notifications", {
      params: { limit },
    });
    return response.data;
  },

  unreadCount: async () => {
    const response = await api.get<{ count: number }>("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },
};
