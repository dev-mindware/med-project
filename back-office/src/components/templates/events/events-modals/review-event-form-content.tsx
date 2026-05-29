"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  SelectField,
  Textarea
} from "@/components";
import { reviewEventSchema, ReviewEventFormData } from "@/schemas/events";
import { EventResponse } from "@/types";
import { eventsService } from "@/services/events-service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/stores";

interface ReviewEventFormContentProps {
  event: EventResponse;
}

const eventStatusOptions = [
  { label: "Rascunho", value: "DRAFT" },
  { label: "Publicado", value: "PUBLISHED" },
  { label: "Cancelado", value: "CANCELLED" },
  { label: "Arquivado", value: "ARCHIVED" },
];

export function ReviewEventFormContent({ event }: ReviewEventFormContentProps) {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReviewEventFormData>({
    resolver: zodResolver(reviewEventSchema),
    defaultValues: {
      status: (event.status as any) || "DRAFT",
    },
  });

  const selectedStatus = watch("status");

  const onSubmit = async (data: ReviewEventFormData) => {
    try {
      await eventsService.updateStatus(event.id, data as any);
      toast.success("Estado actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      closeModal("REVIEW_MODAL");
    } catch (error) {
      toast.error("Erro ao actualizar estado");
      console.error(error);
    }
  };

  return (
    <form id="review-event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <SelectField
            label="Estado do Evento"
            value={value}
            options={eventStatusOptions}
            onValueChange={onChange}
            error={errors.status?.message}
            placeholder="Seleccione o novo estado"
          />
        )}
      />

      {selectedStatus === "CANCELLED" && (
        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <Textarea
              {...field}
              label="Motivo do Cancelamento"
              placeholder="Descreva o motivo do cancelamento..."
              error={(errors as any).reason?.message}
            />
          )}
        />
      )}
    </form>
  );
}
