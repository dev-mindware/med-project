"use client";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ReviewToponymFormContent } from "./review-toponym-form-content";
import { currentToponymStore, useModal } from "@/stores";

export function ReviewToponymModal() {
  const { currentToponym } = currentToponymStore();
  const { closeModal } = useModal();

  if (!currentToponym) return null;

  return (
    <GlobalModal
      id="REVIEW_MODAL"
      title={`Revisão: ${currentToponym.toponym}`}
      description="Actualize o estado de aprovação e adicione observações sobre este topónimo."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("REVIEW_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-toponym-form">
            Guardar Revisão
          </ButtonSubmit>
        </div>
      }
    >
      <ReviewToponymFormContent toponym={currentToponym} />
    </GlobalModal>
  );
}
