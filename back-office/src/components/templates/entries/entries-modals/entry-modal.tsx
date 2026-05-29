"use client";
import { useModal, currentEntryStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { EntryFormContent } from "./entry-form-content";

type EntryModalProps = {
  action: "add" | "edit";
};

export function EntryModal({ action }: EntryModalProps) {
  const { open, closeModal } = useModal();
  const { currentEntry } = currentEntryStore();
  
  const modalId = action === "add" ? "ADD_MODAL" : "EDIT_MODAL";
  const isOpen = open[modalId];
  const title = action === "add" ? "Adicionar Entrada" : "Editar Entrada";

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={title}
      description={action === "add" ? "Adicione uma nova entrada ao dicionário" : "Actualize os dados da entrada"}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="entry-form">
            {action === "add" ? "Adicionar Entrada" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <EntryFormContent action={action} currentEntry={currentEntry} />
    </GlobalModal>
  );
}


