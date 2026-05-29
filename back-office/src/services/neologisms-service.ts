import { ApprovalStatus, NeologismData, NeologismResponse } from "@/types";
import { api } from "./api";

export const neologismsService = {
  addNeologism: async (data: NeologismData) => {
    return api.post<NeologismResponse>("/neologisms", data);
  },
  updateNeologism: async (id: string, data: Partial<NeologismData>) => {
    return api.patch<NeologismResponse>(`/neologisms/${id}`, data);
  },
  deleteNeologism: async (id: string) => {
    return api.delete<NeologismResponse>(`/neologisms/${id}`);
  },
  reviewNeologism: async (id: string, data: { status: ApprovalStatus; reason?: string }) => {
    return api.patch<NeologismResponse>(`/neologisms/${id}/review`, data);
  },
  generateSchema: async (id: string) => {
    return api.get<any>(`/neologisms/${id}/schema`);
  },
};
