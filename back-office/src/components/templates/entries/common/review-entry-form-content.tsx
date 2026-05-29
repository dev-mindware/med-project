"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Button, 
  Textarea, 
  SelectField, 
  ButtonSubmit 
} from "@/components";
import { reviewEntrySchema, ReviewEntryFormData } from "@/schemas/entries";
import { EntryResponse, ApprovalStatus } from "@/types";
import { entriesService } from "@/services/entries-service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/stores";

interface ReviewEntryFormContentProps {
  entry: EntryResponse;
}

const approvalStatusOptions: { value: ApprovalStatus; label: string }[] = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "PENDING_APPROVAL", label: "À espera de aprovação" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
  { value: "NEEDS_CORRECTION", label: "Necessita Correção" },
  { value: "ARCHIVED", label: "Arquivado" },
];

export function ReviewEntryFormContent({ entry }: ReviewEntryFormContentProps) {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ReviewEntryFormData>({
    resolver: zodResolver(reviewEntrySchema),
    defaultValues: {
      status: entry.approvalStatus || "PENDING_APPROVAL",
      reason: entry.rejectionReason || "",
    },
  });

  const onSubmit = async (data: ReviewEntryFormData) => {
    try {
      await entriesService.reviewEntry(entry.id, data);
      toast.success("Revisão salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      closeModal("review-entry");
    } catch (error) {
      toast.error("Erro ao guardar revisão");
      console.error(error);
    }
  };

  return (
    <form id="review-entry-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <SelectField
            label="Estado de Aprovação"
            value={value}
            options={approvalStatusOptions}
            onValueChange={onChange}
            error={errors.status?.message}
            placeholder="Seleccione o novo estado"
          />
        )}
      />

      <Controller
        control={control}
        name="reason"
        render={({ field: { value, onChange } }) => (
          <Textarea
            label="Motivo / Observação"
            value={value}
            onChange={onChange}
            error={errors.reason?.message}
            placeholder="Descreva o motivo da decisão (opcional)..."
            className="min-h-[100px]"
          />
        )}
      />

    </form>
  );
}
