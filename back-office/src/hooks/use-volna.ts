import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApprovalStatus, VolnaTermData } from "@/types";
import { volnaService } from "@/services";
import { SucessMessage } from "@/utils/messages";

export function useAddVolnaTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VolnaTermData) => volnaService.addVolnaTerm(data),
    onSuccess: () => {
      SucessMessage("Vocábulo VOLNA adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["volna"] });
    },
  });
}

export function useUpdateVolnaTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VolnaTermData> }) =>
      volnaService.updateVolnaTerm(id, data),
    onSuccess: () => {
      SucessMessage("Vocábulo VOLNA actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["volna"] });
    },
  });
}

export function useDeleteVolnaTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => volnaService.deleteVolnaTerm(id),
    onSuccess: () => {
      SucessMessage("Vocábulo VOLNA eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["volna"] });
    },
  });
}

export function useReviewVolnaTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: ApprovalStatus; reason?: string } }) =>
      volnaService.reviewVolnaTerm(id, data),
    onSuccess: () => {
      SucessMessage("Estado do vocábulo VOLNA actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["volna"] });
    },
  });
}
