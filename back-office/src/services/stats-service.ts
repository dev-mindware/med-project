import { DashboardStats } from "@/types";
import api from "./api";

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/stats/dashboard");
    return response.data;
  },

  getMeStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/stats/dashboard/me");
    return response.data;
  },
};
