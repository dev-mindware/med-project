import type { ToponymData, ToponymResponse, ApprovalStatus } from "@/types";
import { api } from "./api";

export const toponymsService = {
  addToponym: async (data: ToponymData) => {
    return api.post<ToponymResponse>("/toponyms", data);
  },
  updateToponym: async (id: string, data: ToponymData) => {
    return api.put<ToponymResponse>(`/toponyms/${id}`, data);
  },
  deleteToponym: async (id: string) => {
    return api.delete<ToponymResponse>(`/toponyms/${id}`);
  },
  reviewToponym: async (id: string, data: { status: ApprovalStatus; reason?: string }) => {
    return api.patch<ToponymResponse>(`/toponyms/${id}/review`, data);
  },
  toggleVocabulary: async (id: string, action: "mark" | "unmark") => {
    const payload = { sourceType: "TOPONYM", sourceId: id, vocabularyType: "VONALP" };
    return action === "mark"
      ? api.post("/vonalp/mark", payload)
      : api.post("/vonalp/unmark", payload);
  },
  toggleForeignism: async (id: string, action: "mark" | "unmark") => {
    return api.patch<ToponymResponse>(`/toponyms/${id}/foreignism/${action}`, {});
  },
  generateSchema: async (id: string) => {
    return api.get<any>(`/toponyms/${id}/schema`);
  },
};
