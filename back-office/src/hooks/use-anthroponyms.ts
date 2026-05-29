import { AnthroponymData, AnthroponymResponse } from "@/types";
import { anthroponymsService } from "@/services/anthroponyms-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddAnthroponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AnthroponymData) => anthroponymsService.addAnthroponym(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
    },
  });
}

export function useUpdateAnthroponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AnthroponymData> }) =>
      anthroponymsService.updateAnthroponym(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
    },
  });
}

export function useReviewAnthroponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; reason?: string } }) => 
      anthroponymsService.reviewAnthroponym(id, data as any),
    onSuccess: () => {
      SucessMessage("Estado de aprovação actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
    },
  });
}

export function useToggleVocabularyAnthroponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "mark" | "unmark" }) =>
      anthroponymsService.toggleVocabulary(id, action),
    onSuccess: (_, variables) => {
      const message = variables.action === "mark" 
        ? "Marcado como vocabulário com sucesso!" 
        : "Desmarcado como vocabulário com sucesso!";
      SucessMessage(message);
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
    },
  });
}

export function useToggleForeignismAnthroponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "mark" | "unmark" }) =>
      anthroponymsService.toggleForeignism(id, action),
    onSuccess: (_, variables) => {
      const message = variables.action === "mark" 
        ? "Marcado como estrangeirismo com sucesso!" 
        : "Desmarcado como estrangeirismo com sucesso!";
      SucessMessage(message);
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
    },
  });
}

export function useDeleteAnthroponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => anthroponymsService.deleteAnthroponym(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
    },
  });
}
