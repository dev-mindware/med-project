"use client";
import { useModal, currentEventStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { EventFormContent } from "./event-form-content";

type EventModalProps = {
  action: "add" | "edit";
};

export function EventModal({ action }: EventModalProps) {
  const { open, closeModal } = useModal();
  const { currentEvent } = currentEventStore();
  
  const modalId = action === "add" ? "ADD_MODAL" : "EDIT_MODAL";
  const isOpen = open[modalId];
  const title = action === "add" ? "Adicionar Evento" : "Editar Evento";

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={title}
      description={action === "add" ? "Crie um novo evento no sistema" : "Actualize os detalhes do evento"}
      canClose
      className="!w-[50rem]"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="event-form">
            {action === "add" ? "Criar Evento" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <EventFormContent action={action} currentEvent={currentEvent} />
    </GlobalModal>
  );
}
