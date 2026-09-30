import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { manualVocabularyService } from "@/services";
import {
  ManualVocabularyCommitPayload,
  ManualVocabularySourceModel,
  ManualVocabularyWorkbookData,
} from "@/types";

export interface ExtractPayload {
  file: File;
  modules?: ManualVocabularySourceModel[];
  startPage?: number;
  endPage?: number;
}

/**
 * Executa a extracção via IA e devolve o objecto estruturado em memória para pré-visualização e curadoria.
 */
export function useExtractManualVocabularyPreview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, modules, startPage, endPage }: ExtractPayload) =>
      manualVocabularyService.extractPreview(file, modules, { startPage, endPage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-vocabulary-logs"] });
    },
  });
}

/**
 * Importa um ficheiro Excel (.xlsx) e converte em folhas na memória para curadoria.
 */
export function useImportExcelManualVocabulary() {
  return useMutation({
    mutationFn: (file: File) => manualVocabularyService.importExcel(file),
  });
}

/**
 * Descarrega o ficheiro Excel (.xlsx) gerado a partir do estado actual curado.
 */
export function useExportExcelManualVocabulary() {
  return useMutation({
    mutationFn: ({
      workbookData,
      filename,
    }: {
      workbookData: ManualVocabularyWorkbookData;
      filename?: string;
    }) => manualVocabularyService.exportExcel(workbookData, filename),
  });
}

/**
 * Grava na base de dados PostgreSQL com validação forte de duplicatas.
 */
export function useCommitManualVocabularyToDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualVocabularyCommitPayload) =>
      manualVocabularyService.commitToDatabase(payload),
    onSuccess: () => {
      // Invalida listas dos módulos para reflectir os novos dados
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["neologisms"] });
      queryClient.invalidateQueries({ queryKey: ["toponyms"] });
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
      queryClient.invalidateQueries({ queryKey: ["foreignisms"] });
      queryClient.invalidateQueries({ queryKey: ["manual-vocabulary-logs"] });
    },
  });
}

/**
 * Extracção directa com download automático do ficheiro Excel legado.
 */
export function useExtractManualVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, modules, startPage, endPage }: ExtractPayload) =>
      manualVocabularyService.extract(file, modules, { startPage, endPage }),
    onSuccess: ({ blob, filename }) => {
      queryClient.invalidateQueries({ queryKey: ["manual-vocabulary-logs"] });

      // Descarrega o ficheiro Excel automaticamente
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useManualVocabularyLogs(params?: {
  skip?: number;
  take?: number;
  userId?: string;
}) {
  return useQuery({
    queryKey: ["manual-vocabulary-logs", params],
    queryFn: () => manualVocabularyService.getLogs(params),
  });
}
