"use client";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ReviewForeignismFormContent } from "./review-foreignism-form-content";
import { currentForeignismStore, useModal } from "@/stores";

export function ReviewForeignismModal() {
  const { currentForeignism } = currentForeignismStore();
  const { closeModal } = useModal();

  if (!currentForeignism) return null;

  return (
    <GlobalModal
      id="REVIEW_MODAL"
      title={`Revisão: ${currentForeignism.term}`}
      description="Actualize o estado de aprovação e adicione observações sobre este estrangeirismo."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("REVIEW_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-foreignism-form">
            Guardar Revisão
          </ButtonSubmit>
        </div>
      }
    >
      <ReviewForeignismFormContent foreignism={currentForeignism} />
    </GlobalModal>
  );
}
