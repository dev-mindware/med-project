import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vonalpService } from "@/services";
import {
  MarkVonalpPayload,
  UpdateVonalpPayload,
  VonalpSourceType,
  VonalpVocabularyType,
} from "@/types";
import { useModal } from "@/stores";
import { ErrorMessage, SucessMessage, WarningMessage } from "@/utils/messages";

const queryKeyBySource: Record<VonalpSourceType, string> = {
  ENTRY: "entries",
  TOPONYM: "toponyms",
  ANTHROPONYM: "anthroponyms",
  FOREIGNISM: "foreignisms",
};

function vocabularyLabel(type: VonalpVocabularyType) {
  return type === "VONALP_EP" ? "VONALP-EP" : "VONALP";
}

function getErrorMessage(error: any) {
  const message = error?.response?.data?.message || error?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || "Não foi possível concluir a operação";
}

export function useMarkVonalpTerm() {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  return useMutation({
    mutationFn: (payload: MarkVonalpPayload) => vonalpService.mark(payload),
    onSuccess: (term) => {
      queryClient.invalidateQueries({ queryKey: [queryKeyBySource[term.sourceType]] });
      queryClient.invalidateQueries({ queryKey: ["vonalp"] });

      if (term.requiresModal) {
        WarningMessage("Preencha os campos obrigatórios para concluir a marcação.");
        openModal("VONALP_MODAL", term);
        return;
      }

      SucessMessage(`Termo marcado como ${vocabularyLabel(term.vocabularyType)}.`);
    },
    onError: (error) => {
      ErrorMessage(getErrorMessage(error));
    },
  });
}

export function useUnmarkVonalpTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkVonalpPayload) => vonalpService.unmark(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: [queryKeyBySource[payload.sourceType]] });
      queryClient.invalidateQueries({ queryKey: ["vonalp"] });
      SucessMessage(`Termo removido de ${vocabularyLabel(payload.vocabularyType)}.`);
    },
    onError: (error) => {
      ErrorMessage(getErrorMessage(error));
    },
  });
}

export function useUpdateVonalpTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVonalpPayload }) =>
      vonalpService.update(id, data),
    onSuccess: (term) => {
      queryClient.invalidateQueries({ queryKey: [queryKeyBySource[term.sourceType]] });
      queryClient.invalidateQueries({ queryKey: ["vonalp"] });
      SucessMessage(
        term.completionStatus === "COMPLETE"
          ? "Termo VONALP completo e guardado."
          : "Termo VONALP guardado como incompleto.",
      );
    },
    onError: (error) => {
      ErrorMessage(getErrorMessage(error));
    },
  });
}

export function useVonalpActions(sourceType: VonalpSourceType) {
  const mark = useMarkVonalpTerm();
  const unmark = useUnmarkVonalpTerm();

  const markOrUnmark = (sourceId: string, vocabularyType: VonalpVocabularyType, isMarked?: boolean) => {
    const payload = { sourceType, sourceId, vocabularyType };

    if (isMarked) {
      unmark.mutate(payload);
      return;
    }

    mark.mutate(payload);
  };

  return {
    isPending: mark.isPending || unmark.isPending,
    markOrUnmark,
  };
}
