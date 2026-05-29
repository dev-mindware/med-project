import type { AnthroponymData, AnthroponymResponse, ApprovalStatus } from "@/types";
import { api } from "./api";

export const anthroponymsService = {
  addAnthroponym: async (data: AnthroponymData) => {
    return api.post<AnthroponymResponse>("/anthroponyms", data);
  },
  updateAnthroponym: async (id: string, data: AnthroponymData) => {
    return api.put<AnthroponymResponse>(`/anthroponyms/${id}`, data);
  },
  deleteAnthroponym: async (id: string) => {
    return api.delete<AnthroponymResponse>(`/anthroponyms/${id}`);
  },
  reviewAnthroponym: async (id: string, data: { status: ApprovalStatus; reason?: string }) => {
    return api.patch<AnthroponymResponse>(`/anthroponyms/${id}/review`, data);
  },
  toggleVocabulary: async (id: string, action: "mark" | "unmark") => {
    const payload = { sourceType: "ANTHROPONYM", sourceId: id, vocabularyType: "VONALP" };
    return action === "mark"
      ? api.post("/vonalp/mark", payload)
      : api.post("/vonalp/unmark", payload);
  },
  toggleForeignism: async (id: string, action: "mark" | "unmark") => {
    return api.patch<AnthroponymResponse>(`/anthroponyms/${id}/foreignism/${action}`, {});
  },
  generateSchema: async (id: string) => {
    return api.get<any>(`/anthroponyms/${id}/schema`);
  },
};
