import { api } from "./api";
import { ReportFormat, ReportType } from "@/types";

export const reportsService = {
  downloadReport: async (type: ReportType, format: ReportFormat) => {
    const response = await api.get(`/reports/generate/${type}`, {
      params: { format },
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"];
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/i);
    const fallback = `${type}_report.${format}`;

    return {
      blob: response.data as Blob,
      filename: filenameMatch?.[1] || fallback,
    };
  },
};
