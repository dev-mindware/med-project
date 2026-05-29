"use client";
import { useModal, currentEventRegistrationStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ReviewEventRegistrationFormContent } from "./review-eventRegistration-form-content";

export function ReviewEventRegistrationModal() {
  const { open, closeModal } = useModal();
  const { currentEventRegistration } = currentEventRegistrationStore();
  
  const isOpen = open["REVIEW_MODAL"];

  if (!isOpen || !currentEventRegistration) return null;

  return (
    <GlobalModal
      id="REVIEW_MODAL"
      title="Revisar Inscrição"
      description={`Alterar o status da inscrição de ${currentEventRegistration.name}`}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("REVIEW_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-registration-form">
            Guardar Alterações
          </ButtonSubmit>
        </div>
      }
    >
      <ReviewEventRegistrationFormContent currentRegistration={currentEventRegistration} />
    </GlobalModal>
  );
}
