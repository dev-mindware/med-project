"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonSubmit, GlobalModal, SelectField, Textarea } from "@/components";
import { useReviewVolnaTerm } from "@/hooks";
import { ReviewVolnaFormData, reviewVolnaSchema } from "@/schemas";
import { currentVolnaStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";

const statusOptions = [
  { label: "Rascunho", value: "DRAFT" },
  { label: "Pendente", value: "PENDING_APPROVAL" },
  { label: "Aprovado", value: "APPROVED" },
  { label: "Rejeitado", value: "REJECTED" },
  { label: "Correcção necessária", value: "NEEDS_CORRECTION" },
  { label: "Arquivado", value: "ARCHIVED" },
];

export function ReviewVolnaModal() {
  const { closeModal, open } = useModal();
  const { currentVolnaTerm } = currentVolnaStore();
  const { mutateAsync: reviewVolnaTerm } = useReviewVolnaTerm();
  const { control, register, handleSubmit, formState: { errors } } = useForm<ReviewVolnaFormData>({
    resolver: zodResolver(reviewVolnaSchema),
    values: { status: currentVolnaTerm?.approvalStatus || "DRAFT", reason: "" },
  });

  async function onSubmit(data: ReviewVolnaFormData) {
    if (!currentVolnaTerm) return;
    try {
      await reviewVolnaTerm({ id: currentVolnaTerm.id, data });
      closeModal("VOLNA_REVIEW_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao actualizar o estado");
    }
  }

  if (!open["VOLNA_REVIEW_MODAL"]) return null;

  return (
    <GlobalModal
      id="VOLNA_REVIEW_MODAL"
      title="Actualizar estado VOLNA"
      description="Controle a visibilidade pública deste vocábulo."
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("VOLNA_REVIEW_MODAL")}>Cancelar</Button>
          <ButtonSubmit form="volna-review-form">Guardar estado</ButtonSubmit>
        </div>
      }
    >
      <form id="volna-review-form" onSubmit={handleSubmit(onSubmit)} className="w-[420px] max-w-full space-y-4 py-4">
        <Controller
          control={control}
          name="status"
          render={({ field: { value, onChange } }) => (
            <SelectField label="Estado" value={value} options={statusOptions} onValueChange={onChange} error={errors.status?.message} />
          )}
        />
        <Textarea label="Motivo ou observação" {...register("reason")} error={errors.reason?.message} rows={4} />
      </form>
    </GlobalModal>
  );
}
