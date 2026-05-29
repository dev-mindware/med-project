import { ManualVocabularyExtractResult } from "@/types";
import { api } from "./api";

function parseFilename(contentDisposition?: string) {
  const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1]) : `vocabulario_manual_${Date.now()}.xlsx`;
}

function parseNumberHeader(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const manualVocabularyService = {
  extract: async (file: File): Promise<ManualVocabularyExtractResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/manuals/vocabulary/extract", formData, {
      responseType: "blob",
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });

    return {
      blob: response.data as Blob,
      filename: parseFilename(response.headers["content-disposition"]),
      stats: {
        totalTerms: parseNumberHeader(response.headers["x-total-terms"]),
        validRows: parseNumberHeader(response.headers["x-valid-rows"]),
        warnings: parseNumberHeader(response.headers["x-warnings"]),
        duplicatesRemoved: parseNumberHeader(response.headers["x-duplicates-removed"]),
      },
    };
  },
};
