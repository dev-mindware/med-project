import type { ForeignismData, ForeignismResponse, ApprovalStatus } from "@/types";
import { api } from "./api";

export const foreignismsService = {
  addForeignism: async (data: ForeignismData) => {
    return api.post<ForeignismResponse>("/foreignisms", data);
  },
  updateForeignism: async (id: string, data: ForeignismData) => {
    return api.put<ForeignismResponse>(`/foreignisms/${id}`, data);
  },
  deleteForeignism: async (id: string) => {
    return api.delete<ForeignismResponse>(`/foreignisms/${id}`);
  },
  reviewForeignism: async (id: string, data: { status: ApprovalStatus; reason?: string }) => {
    return api.patch<ForeignismResponse>(`/foreignisms/${id}/review`, data);
  },
  toggleVocabulary: async (id: string, action: "mark" | "unmark") => {
    const payload = { sourceType: "FOREIGNISM", sourceId: id, vocabularyType: "VONALP" };
    return action === "mark"
      ? api.post("/vonalp/mark", payload)
      : api.post("/vonalp/unmark", payload);
  },
};
