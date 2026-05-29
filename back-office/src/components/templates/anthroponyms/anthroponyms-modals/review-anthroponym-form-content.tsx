"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Textarea, 
  SelectField
} from "@/components";
import { reviewAnthroponymSchema, ReviewAnthroponymFormData } from "@/schemas/anthroponyms";
import { AnthroponymResponse, ApprovalStatus } from "@/types";
import { anthroponymsService } from "@/services/anthroponyms-service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/stores";

interface ReviewAnthroponymFormContentProps {
  anthroponym: AnthroponymResponse;
}

const approvalStatusOptions: { value: ApprovalStatus; label: string }[] = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "PENDING_APPROVAL", label: "À espera de aprovação" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
  { value: "NEEDS_CORRECTION", label: "Necessita Correção" },
  { value: "ARCHIVED", label: "Arquivado" },
];

export function ReviewAnthroponymFormContent({ anthroponym }: ReviewAnthroponymFormContentProps) {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewAnthroponymFormData>({
    resolver: zodResolver(reviewAnthroponymSchema),
    defaultValues: {
      status: anthroponym.approvalStatus || "PENDING_APPROVAL",
      reason: anthroponym.rejectionReason || "",
    },
  });

  const onSubmit = async (data: ReviewAnthroponymFormData) => {
    try {
      await anthroponymsService.reviewAnthroponym(anthroponym.id, data);
      toast.success("Revisão salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["anthroponyms"] });
      closeModal("REVIEW_MODAL");
    } catch (error) {
      toast.error("Erro ao guardar revisão");
      console.error(error);
    }
  };

  return (
    <form id="review-anthroponym-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
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
