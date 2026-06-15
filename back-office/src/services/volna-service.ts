import { ApprovalStatus, VolnaTermData, VolnaTermResponse } from "@/types";
import { api } from "./api";

export const volnaService = {
  addVolnaTerm: async (data: VolnaTermData) => {
    return api.post<VolnaTermResponse>("/volna", data);
  },
  updateVolnaTerm: async (id: string, data: Partial<VolnaTermData>) => {
    return api.patch<VolnaTermResponse>(`/volna/${id}`, data);
  },
  deleteVolnaTerm: async (id: string) => {
    return api.delete<VolnaTermResponse>(`/volna/${id}`);
  },
  reviewVolnaTerm: async (id: string, data: { status: ApprovalStatus; reason?: string }) => {
    return api.patch<VolnaTermResponse>(`/volna/${id}/review`, data);
  },
};
