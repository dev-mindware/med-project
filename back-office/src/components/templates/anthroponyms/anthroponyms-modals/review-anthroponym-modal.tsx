"use client";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ReviewAnthroponymFormContent } from "./review-anthroponym-form-content";
import { currentAnthroponymStore, useModal } from "@/stores";

export function ReviewAnthroponymModal() {
  const { currentAnthroponym } = currentAnthroponymStore();
  const { closeModal } = useModal();

  if (!currentAnthroponym) return null;

  return (
    <GlobalModal
      id="REVIEW_MODAL"
      title={`Revisão: ${currentAnthroponym.name}`}
      description="Actualize o estado de aprovação e adicione observações sobre este antropónimo."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("REVIEW_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-anthroponym-form">
            Guardar Revisão
          </ButtonSubmit>
        </div>
      }
    >
      <ReviewAnthroponymFormContent anthroponym={currentAnthroponym} />
    </GlobalModal>
  );
}
