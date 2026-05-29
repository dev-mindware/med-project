import { api } from "./api";
import {
  MarkVonalpPayload,
  UpdateVonalpPayload,
  VonalpTermResponse,
} from "@/types";

export const vonalpService = {
  mark: async (payload: MarkVonalpPayload) => {
    const response = await api.post<VonalpTermResponse>("/vonalp/mark", payload);
    return response.data;
  },

  unmark: async (payload: MarkVonalpPayload) => {
    const response = await api.post<{ success: boolean }>("/vonalp/unmark", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateVonalpPayload) => {
    const response = await api.patch<VonalpTermResponse>(`/vonalp/${id}`, payload);
    return response.data;
  },
};
