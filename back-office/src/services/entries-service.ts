import { ApprovalStatus, EntryData, EntryResponse } from "@/types";
import { api } from "./api";

export const entriesService = {
  addEntry: async (data: EntryData) => {
    return api.post<EntryResponse>("/entries", data);
  },
  updateEntry: async (id: string, data: EntryData) => {
    return api.put<EntryResponse>(`/entries/${id}`, data);
  },
  deleteEntry: async (id: string) => {
    return api.delete<EntryResponse>(`/entries/${id}`);
  },
  reviewEntry: async (id: string, data: { status: ApprovalStatus; reason?: string }) => {
    return api.patch<EntryResponse>(`/entries/${id}/review`, data);
  },
  toggleVocabulary: async (id: string, action: "mark" | "unmark") => {
    const payload = { sourceType: "ENTRY", sourceId: id, vocabularyType: "VONALP" };
    return action === "mark"
      ? api.post("/vonalp/mark", payload)
      : api.post("/vonalp/unmark", payload);
  },
  toggleForeignism: async (id: string, action: "mark" | "unmark") => {
    return api.patch<EntryResponse>(`/entries/${id}/foreignism/${action}`, {});
  },
  generateSchema: async (id: string) => {
    return api.get<any>(`/entries/${id}/schema`);
  },
};
