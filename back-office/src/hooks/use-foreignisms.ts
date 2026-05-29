import { ForeignismData, ForeignismResponse } from "@/types";
import { foreignismsService } from "@/services/foreignisms-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddForeignism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ForeignismData) => foreignismsService.addForeignism(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["foreignisms"] });
    },
  });
}

export function useUpdateForeignism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ForeignismData> }) =>
      foreignismsService.updateForeignism(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["foreignisms"] });
    },
  });
}

export function useReviewForeignism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; reason?: string } }) => 
      foreignismsService.reviewForeignism(id, data as any),
    onSuccess: () => {
      SucessMessage("Estado de aprovação actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["foreignisms"] });
    },
  });
}

export function useToggleVocabularyForeignism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "mark" | "unmark" }) =>
      foreignismsService.toggleVocabulary(id, action),
    onSuccess: (_, variables) => {
      const message = variables.action === "mark" 
        ? "Marcado como vocabulário com sucesso!" 
        : "Desmarcado como vocabulário com sucesso!";
      SucessMessage(message);
      queryClient.invalidateQueries({ queryKey: ["foreignisms"] });
    },
  });
}

export function useDeleteForeignism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => foreignismsService.deleteForeignism(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["foreignisms"] });
    },
  });
}
