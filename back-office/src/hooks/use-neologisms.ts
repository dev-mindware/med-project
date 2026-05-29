import { ApprovalStatus, NeologismData } from "@/types";
import { neologismsService } from "@/services/neologisms-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddNeologism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NeologismData) => neologismsService.addNeologism(data),
    onSuccess: () => {
      SucessMessage("Neologismo adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["neologisms"] });
    },
  });
}

export function useUpdateNeologism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NeologismData> }) =>
      neologismsService.updateNeologism(id, data),
    onSuccess: () => {
      SucessMessage("Neologismo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["neologisms"] });
    },
  });
}

export function useReviewNeologism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: ApprovalStatus; reason?: string } }) =>
      neologismsService.reviewNeologism(id, data),
    onSuccess: () => {
      SucessMessage("Estado de revisão actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["neologisms"] });
    },
  });
}

export function useDeleteNeologism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => neologismsService.deleteNeologism(id),
    onSuccess: () => {
      SucessMessage("Neologismo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["neologisms"] });
    },
  });
}
