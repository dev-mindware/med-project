import { useModal, currentEventRegistrationStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { EventRegistrationFormContent } from "./eventRegistration-form-content";

type EventRegistrationModalProps = {
  action: "add" | "edit";
  eventId?: string;
};

export function EventRegistrationModal({ action, eventId }: EventRegistrationModalProps) {
  const { closeModal, open } = useModal();
  const { currentEventRegistration } = currentEventRegistrationStore();
  
  const isOpen = open[action === "add" ? "ADD_MODAL" : "EDIT_MODAL"];
  const title = action === "add" ? "Adicionar Inscrito" : "Editar Inscrição";

  if (!isOpen) return null;

  return (
    <GlobalModal
      title={title}
      description="Preencha os campos abaixo para registrar a inscrição."
      id={action === "add" ? "ADD_MODAL" : "EDIT_MODAL"}
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(action === "add" ? "ADD_MODAL" : "EDIT_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="event-registration-form">
            {action === "add" ? "Guardar Registo" : "Actualizar Registo"}
          </ButtonSubmit>
        </div>
      }
    >
      <EventRegistrationFormContent 
        action={action} 
        currentRegistration={currentEventRegistration} 
        eventId={eventId}
      />
    </GlobalModal>
  );
}
