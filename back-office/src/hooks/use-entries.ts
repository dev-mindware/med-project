import { EntryData, EntryResponse, ApprovalStatus } from "@/types";
import { entriesService } from "@/services/entries-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EntryData) => entriesService.addEntry(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EntryData> }) =>
      entriesService.updateEntry(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useReviewEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: ApprovalStatus; reason?: string } }) => 
      entriesService.reviewEntry(id, data),
    onSuccess: () => {
      SucessMessage("Estado de revisão actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useToggleVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "mark" | "unmark" }) => 
      entriesService.toggleVocabulary(id, action),
    onSuccess: () => {
      SucessMessage("Estado de vocabulário actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useToggleForeignism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "mark" | "unmark" }) => 
      entriesService.toggleForeignism(id, action),
    onSuccess: () => {
      SucessMessage("Estado de estrangeirismo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => entriesService.deleteEntry(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useGenerateSchema(id: string) {
  return useQuery({
    queryKey: ["entries", id, "schema"],
    queryFn: () => entriesService.generateSchema(id),
    enabled: !!id,
  });
}
