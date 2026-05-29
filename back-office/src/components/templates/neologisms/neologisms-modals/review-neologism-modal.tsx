"use client";
import { Controller, useForm } from "react-hook-form";
import { Button, ButtonSubmit, GlobalModal, SelectField, Textarea } from "@/components";
import { useReviewNeologism } from "@/hooks";
import { currentNeologismStore, useModal } from "@/stores";
import { ApprovalStatus } from "@/types";
import { ErrorMessage } from "@/utils/messages";

type ReviewFormData = {
  status: ApprovalStatus;
  reason?: string;
};

const approvalStatusOptions = [
  { label: "Rascunho", value: "DRAFT" },
  { label: "Pendente", value: "PENDING_APPROVAL" },
  { label: "Aprovado", value: "APPROVED" },
  { label: "Rejeitado", value: "REJECTED" },
  { label: "Necessita correcção", value: "NEEDS_CORRECTION" },
  { label: "Arquivado", value: "ARCHIVED" },
];

export function ReviewNeologismModal() {
  const { closeModal, open } = useModal();
  const { currentNeologism } = currentNeologismStore();
  const { mutateAsync: reviewNeologism, isPending } = useReviewNeologism();
  const { control, register, handleSubmit, reset } = useForm<ReviewFormData>({
    values: {
      status: currentNeologism?.approvalStatus || "DRAFT",
      reason: currentNeologism?.rejectionReason || currentNeologism?.correctionNotes || "",
    },
  });

  if (!currentNeologism || !open["NEOLOGISM_REVIEW_MODAL"]) return null;

  async function onSubmit(data: ReviewFormData) {
    if (!currentNeologism) return;
    try {
      await reviewNeologism({ id: currentNeologism.id, data });
      reset();
      closeModal("NEOLOGISM_REVIEW_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao actualizar o estado");
    }
  }

  return (
    <GlobalModal
      id="NEOLOGISM_REVIEW_MODAL"
      title={`Revisão: ${currentNeologism.entry}`}
      description="Actualize o estado de aprovação do neologismo"
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("NEOLOGISM_REVIEW_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-neologism-form" isLoading={isPending}>
            Guardar revisão
          </ButtonSubmit>
        </div>
      }
    >
      <form id="review-neologism-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4 min-w-[360px]">
        <Controller
          control={control}
          name="status"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Estado de aprovação"
              value={value}
              options={approvalStatusOptions}
              onValueChange={onChange}
            />
          )}
        />
        <Textarea
          label="Observações"
          {...register("reason")}
          placeholder="Indique o motivo quando houver rejeição ou pedido de correcção"
          rows={4}
        />
      </form>
    </GlobalModal>
  );
}
