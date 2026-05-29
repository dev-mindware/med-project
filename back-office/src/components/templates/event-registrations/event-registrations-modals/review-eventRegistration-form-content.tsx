"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectField, Textarea } from "@/components";
import { reviewEventRegistrationSchema, ReviewEventRegistrationFormData } from "@/schemas/event-registrations";
import { useUpdateStatusEventRegistration } from "@/hooks";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { EventRegistrationResponse } from "@/types";

interface ReviewEventRegistrationFormContentProps {
  currentRegistration: EventRegistrationResponse;
}

const statusOptions = [
  { label: "Pendente", value: "PENDING" },
  { label: "Aprovado", value: "APPROVED" },
  { label: "Rejeitado", value: "REJECTED" },
  { label: "Cancelado", value: "CANCELLED" },
];

export function ReviewEventRegistrationFormContent({ 
  currentRegistration 
}: ReviewEventRegistrationFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: updateStatus } = useUpdateStatusEventRegistration();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReviewEventRegistrationFormData>({
    resolver: zodResolver(reviewEventRegistrationSchema),
    defaultValues: {
      status: currentRegistration.status as any || "PENDING",
      notes: currentRegistration.notes || "",
    }
  });

  const onSubmit = async (data: ReviewEventRegistrationFormData) => {
    try {
      await updateStatus({ 
        id: currentRegistration.id, 
        data: {
          status: data.status,
          rejectionReason: data.notes // Using notes as rejection reason in hook/service terminology
        } as any 
      });
      closeModal("REVIEW_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Erro ao actualizar estado");
    }
  };

  return (
    <form id="review-registration-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 min-w-[300px]">
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <SelectField
            label="Novo Estado"
            value={value}
            options={statusOptions}
            onValueChange={onChange}
            error={errors.status?.message}
          />
        )}
      />

      <Textarea
        label="Observações / Motivo (Opcional)"
        {...register("notes")}
        error={errors.notes?.message}
        placeholder="Adicione uma nota explicativa..."
        rows={3}
      />
    </form>
  );
}
