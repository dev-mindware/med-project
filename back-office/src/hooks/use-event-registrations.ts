import { EventRegistrationData, EventRegistrationResponse } from "@/types";
import { eventRegistrationsService } from "@/services/event-registrations-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventRegistrationData) => eventRegistrationsService.addEventRegistration(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}

export function useUpdateEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventRegistrationData> }) =>
      eventRegistrationsService.updateEventRegistration(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}

export function useUpdateStatusEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; rejectionReason?: string } }) => 
      eventRegistrationsService.updateStatus(id, data as any),
    onSuccess: () => {
      SucessMessage("Estado actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}

export function useDeleteEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventRegistrationsService.deleteEventRegistration(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}

export function useToggleAttendanceEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, attended }: { id: string; attended: boolean }) => 
      eventRegistrationsService.markAttendance(id, attended),
    onSuccess: () => {
      SucessMessage("Presença actualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
    },
  });
}
