import { EventData, EventResponse } from "@/types";
import { eventsService } from "@/services/events-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventData) => eventsService.addEvent(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventData> }) =>
      eventsService.updateEvent(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateStatusEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; rejectionReason?: string } }) => 
      eventsService.updateStatus(id, data as any),
    onSuccess: () => {
      SucessMessage("Estado actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
