"use client";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ReviewEventFormContent } from "./review-event-form-content";
import { currentEventStore, useModal } from "@/stores";

export function ReviewEventModal() {
  const { currentEvent } = currentEventStore();
  const { closeModal } = useModal();

  if (!currentEvent) return null;

  return (
    <GlobalModal
      id="REVIEW_MODAL"
      title={`Alterar Estado`}
      description="Seleccione o novo estado para este evento."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("REVIEW_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-event-form">
            Actualizar Estado
          </ButtonSubmit>
        </div>
      }
    >
      <ReviewEventFormContent event={currentEvent} />
    </GlobalModal>
  );
}
