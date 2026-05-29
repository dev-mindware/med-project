import type { AuditLogResponse } from "@/types";
import { api } from "./api";

export const auditLogsService = {
  getAuditLogs: async (params?: Record<string, any>) => {
    return api.get<AuditLogResponse>("/audit-logs", { params });
  },
  getAuditLog: async (id: string) => {
    return api.get<AuditLogResponse>(`/audit-logs/${id}`);
  },
  downloadPdfReport: async (period: "daily" | "monthly" | "annual") => {
    return api.get<Blob>("/audit-logs/report/pdf", {
      params: { period },
      responseType: "blob",
    });
  },
};
