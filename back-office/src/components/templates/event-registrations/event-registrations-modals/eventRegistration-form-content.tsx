"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Textarea } from "@/components";
import { eventRegistrationSchema, EventRegistrationFormData } from "@/schemas/event-registrations";
import { EventRegistrationResponse } from "@/types";
import { useAddEventRegistration, useUpdateEventRegistration } from "@/hooks";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { useEffect } from "react";

interface EventRegistrationFormContentProps {
  action: "add" | "edit";
  currentRegistration?: EventRegistrationResponse;
  eventId?: string;
}

export function EventRegistrationFormContent({ 
  action, 
  currentRegistration, 
  eventId 
}: EventRegistrationFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addRegistration } = useAddEventRegistration();
  const { mutateAsync: updateRegistration } = useUpdateEventRegistration();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      eventId: eventId || "",
    }
  });

  useEffect(() => {
    if (action === "edit" && currentRegistration) {
      reset(currentRegistration);
    } else {
      reset({ eventId: eventId || "" });
    }
  }, [action, currentRegistration, reset, eventId]);

  const onSubmit = async (data: EventRegistrationFormData) => {
    try {
      if (action === "add") {
        await addRegistration(data);
      } else if (currentRegistration) {
        await updateRegistration({ id: currentRegistration.id, data });
      }
      closeModal(action === "add" ? "ADD_MODAL" : "EDIT_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Erro ao guardar inscrição");
    }
  };

  return (
    <form id="event-registration-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <input type="hidden" {...register("eventId")} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome Completo"
          {...register("name")}
          error={errors.name?.message}
          placeholder="Ex: João Silva"
        />
        <Input
          label="E-mail"
          {...register("email")}
          error={errors.email?.message}
          placeholder="Ex: joao@email.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Telefone (Opcional)"
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="Ex: +244 ..."
        />
        <Input
          label="Organização (Opcional)"
          {...register("organization")}
          error={errors.organization?.message}
          placeholder="Ex: Empresa X"
        />
      </div>

      <Textarea
        label="Observações (Opcional)"
        {...register("notes")}
        error={errors.notes?.message}
        placeholder="Informações adicionais..."
        rows={3}
      />
    </form>
  );
}
