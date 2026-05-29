"use client";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ReviewEntryFormContent } from "./review-entry-form-content";
import { useEntryActions } from "@/hooks";
import { useModal } from "@/stores";

export function ReviewEntryModal() {
  const { selectedEntry } = useEntryActions();
  const { closeModal } = useModal();

  if (!selectedEntry) return null;

  return (
    <GlobalModal
      id="review-entry"
      title={`Revisão: ${selectedEntry.entry}`}
      description="Actualize o estado de aprovação e adicione observações sobre esta entrada."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("review-entry")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-entry-form">
            Guardar Revisão
          </ButtonSubmit>
        </div>
      }
    >
      <ReviewEntryFormContent entry={selectedEntry} />
    </GlobalModal>
  );
}
