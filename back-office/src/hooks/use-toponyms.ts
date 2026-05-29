import { ToponymData, ToponymResponse } from "@/types";
import { toponymsService } from "@/services/toponyms-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddToponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToponymData) => toponymsService.addToponym(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["toponyms"] });
    },
  });
}

export function useUpdateToponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ToponymData> }) =>
      toponymsService.updateToponym(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["toponyms"] });
    },
  });
}

export function useReviewToponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; reason?: string } }) => 
      toponymsService.reviewToponym(id, data as any),
    onSuccess: () => {
      SucessMessage("Estado de aprovação actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["toponyms"] });
    },
  });
}

export function useToggleVocabularyToponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "mark" | "unmark" }) =>
      toponymsService.toggleVocabulary(id, action),
    onSuccess: (_, variables) => {
      const message = variables.action === "mark" 
        ? "Marcado como vocabulário com sucesso!" 
        : "Desmarcado como vocabulário com sucesso!";
      SucessMessage(message);
      queryClient.invalidateQueries({ queryKey: ["toponyms"] });
    },
  });
}

export function useToggleForeignismToponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "mark" | "unmark" }) =>
      toponymsService.toggleForeignism(id, action),
    onSuccess: (_, variables) => {
      const message = variables.action === "mark" 
        ? "Marcado como estrangeirismo com sucesso!" 
        : "Desmarcado como estrangeirismo com sucesso!";
      SucessMessage(message);
      queryClient.invalidateQueries({ queryKey: ["toponyms"] });
    },
  });
}

export function useDeleteToponym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toponymsService.deleteToponym(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["toponyms"] });
    },
  });
}
