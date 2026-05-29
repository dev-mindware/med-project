import { api } from "./api";
import type { ImportApiResult, ImportPayloadRow } from "@/components/templates/vonalp-importer/types";

export const vonalpImportService = {
  importRows: async (endpoint: string, rows: ImportPayloadRow[]) => {
    const response = await api.post<ImportApiResult>(`${endpoint}/import`, { rows });
    return response.data;
  },
};
