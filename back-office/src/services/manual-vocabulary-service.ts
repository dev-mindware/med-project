import {
  ExtractionProgress,
  ManualExtractionJobState,
  ManualExtractionLogsResponse,
  ManualVocabularyDraft,
  ManualVocabularyDraftSummary,
  ManualVocabularyCommitPayload,
  ManualVocabularyCommitResult,
  ManualVocabularyExtractPreviewResult,
  ManualVocabularyExtractResult,
  ManualVocabularySourceModel,
  ManualVocabularyWorkbookData,
} from "@/types";
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
  /**
   * Extrai vocabulário via IA do PDF e devolve os dados estruturados em JSON para curadoria no frontend.
   */
  extractPreview: async (
    file: File,
    modules?: ManualVocabularySourceModel[],
    options?: { startPage?: number; endPage?: number },
    onProgress?: (progress: ExtractionProgress) => void,
    onJobId?: (jobId: string) => void,
    signal?: AbortSignal,
  ): Promise<ManualVocabularyExtractPreviewResult> => {
    const jobId = await manualVocabularyService.startExtraction(file, modules, options);
    onJobId?.(jobId);
    return manualVocabularyService.waitForExtraction(jobId, onProgress, signal);
  },

  /** Envia o PDF para a fila de extracção (persistente no servidor) e devolve o id. */
  startExtraction: async (
    file: File,
    modules?: ManualVocabularySourceModel[],
    options?: { startPage?: number; endPage?: number },
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", "json");
    formData.append("async", "true");
    if (modules && modules.length > 0) {
      formData.append("modules", modules.join(","));
    }
    if (options?.startPage) {
      formData.append("startPage", String(options.startPage));
    }
    if (options?.endPage) {
      formData.append("endPage", String(options.endPage));
    }

    const start = await api.post<{ jobId: string }>(
      "/manuals/vocabulary/extract?format=json&async=true",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        timeout: 300000,
      },
    );
    return start.data.jobId;
  },

  /**
   * Acompanha uma extracção por polling até terminar. A extracção corre no servidor e
   * sobrevive a reinícios, por isso pode ser retomada depois de recarregar a página.
   */
  waitForExtraction: async (
    jobId: string,
    onProgress?: (progress: ExtractionProgress) => void,
    signal?: AbortSignal,
  ): Promise<ManualVocabularyExtractPreviewResult> => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    // Manuais de centenas de páginas podem demorar mais de uma hora na fila
    const deadline = Date.now() + 6 * 60 * 60 * 1000;
    let pollErrors = 0;

    while (Date.now() < deadline) {
      if (signal?.aborted) throw Object.assign(new Error("Acompanhamento interrompido"), { aborted: true });
      await sleep(2000);
      if (signal?.aborted) throw Object.assign(new Error("Acompanhamento interrompido"), { aborted: true });
      try {
        const data = await manualVocabularyService.getExtractionJob(jobId);
        pollErrors = 0;
        onProgress?.(data.progress);

        if (data.status === "done" && data.result) return data.result;
        if (data.status === "error") {
          throw Object.assign(new Error(data.error?.message || "Falha na extracção"), {
            response: { data: { message: data.error?.message } },
            fatal: true,
            cancelled: Boolean(data.cancelled),
          });
        }
      } catch (err: any) {
        if (err?.fatal || err?.response?.status === 404 || ++pollErrors > 10) {
          throw Object.assign(err, { fatal: true });
        }
      }
    }
    throw new Error("A extracção excedeu o tempo máximo de espera.");
  },

  getExtractionJob: async (jobId: string): Promise<ManualExtractionJobState> => {
    const { data } = await api.get<ManualExtractionJobState>(
      `/manuals/vocabulary/extract/jobs/${jobId}`,
    );
    return data;
  },

  cancelExtraction: async (jobId: string): Promise<void> => {
    await api.post(`/manuals/vocabulary/extract/jobs/${jobId}/cancel`);
  },

  // ─── Rascunhos de curadoria (guardados no servidor) ────────────────────────

  listDrafts: async (): Promise<ManualVocabularyDraftSummary[]> => {
    const { data } = await api.get<ManualVocabularyDraftSummary[]>("/manuals/vocabulary/drafts");
    return data;
  },

  getDraft: async (id: string): Promise<ManualVocabularyDraft> => {
    const { data } = await api.get<ManualVocabularyDraft>(`/manuals/vocabulary/drafts/${id}`);
    return data;
  },

  createDraft: async (
    filename: string,
    workbookData: ManualVocabularyWorkbookData,
  ): Promise<ManualVocabularyDraftSummary> => {
    const { data } = await api.post<ManualVocabularyDraftSummary>("/manuals/vocabulary/drafts", {
      filename,
      workbookData,
    });
    return data;
  },

  updateDraft: async (id: string, workbookData: ManualVocabularyWorkbookData): Promise<void> => {
    await api.patch(`/manuals/vocabulary/drafts/${id}`, { workbookData }, { timeout: 60000 });
  },

  deleteDraft: async (id: string): Promise<void> => {
    await api.delete(`/manuals/vocabulary/drafts/${id}`);
  },

  /**
   * Carrega um ficheiro Excel (.xlsx) existente e devolve as folhas processadas para curadoria.
   */
  importExcel: async (file: File): Promise<ManualVocabularyExtractPreviewResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ManualVocabularyExtractPreviewResult>(
      "/manuals/vocabulary/import-excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        timeout: 120000,
      },
    );

    return response.data;
  },

  /**
   * Descarrega o ficheiro Excel (.xlsx) com todas as correcções e curadoria realizadas no ecrã.
   */
  exportExcel: async (workbookData: ManualVocabularyWorkbookData, customFilename?: string): Promise<void> => {
    const response = await api.post(
      "/manuals/vocabulary/export-excel",
      { workbookData },
      {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
        timeout: 120000,
      },
    );

    const filename =
      customFilename ||
      parseFilename(response.headers["content-disposition"]) ||
      `vocabulario_curado_${Date.now()}.xlsx`;

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Grava os dados curados na base de dados PostgreSQL com validação forte de duplicatas.
   */
  commitToDatabase: async (
    payload: ManualVocabularyCommitPayload,
  ): Promise<ManualVocabularyCommitResult> => {
    const response = await api.post<ManualVocabularyCommitResult>(
      "/manuals/vocabulary/commit-to-database",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 120000,
      },
    );

    return response.data;
  },

  extract: async (
    file: File,
    modules?: ManualVocabularySourceModel[],
    options?: { startPage?: number; endPage?: number },
  ): Promise<ManualVocabularyExtractResult> => {
    const formData = new FormData();
    formData.append("file", file);
    if (modules && modules.length > 0) {
      formData.append("modules", modules.join(","));
    }
    if (options?.startPage) {
      formData.append("startPage", String(options.startPage));
    }
    if (options?.endPage) {
      formData.append("endPage", String(options.endPage));
    }

    const response = await api.post("/manuals/vocabulary/extract", formData, {
      responseType: "blob",
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000,
    });

    return {
      blob: response.data as Blob,
      filename: parseFilename(response.headers["content-disposition"]),
      stats: {
        totalTerms: parseNumberHeader(response.headers["x-total-terms"]),
        validRows: parseNumberHeader(response.headers["x-valid-rows"]),
        entries: parseNumberHeader(response.headers["x-entries"]),
        neologisms: parseNumberHeader(response.headers["x-neologisms"]),
        toponyms: parseNumberHeader(response.headers["x-toponyms"]),
        anthroponyms: parseNumberHeader(response.headers["x-anthroponyms"]),
        foreignisms: parseNumberHeader(response.headers["x-foreignisms"]),
        nationalLanguages: parseNumberHeader(response.headers["x-national-languages"]),
        warnings: parseNumberHeader(response.headers["x-warnings"]),
        duplicatesRemoved: parseNumberHeader(response.headers["x-duplicates-removed"]),
      },
    };
  },

  getLogs: async (params?: {
    skip?: number;
    take?: number;
    userId?: string;
  }): Promise<ManualExtractionLogsResponse> => {
    const response = await api.get<ManualExtractionLogsResponse>(
      "/manuals/vocabulary/logs",
      { params },
    );
    return response.data;
  },
};
