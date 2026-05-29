"use client";
import { useModal, currentAnthroponymStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { AnthroponymFormContent } from "./anthroponym-form-content";

type AnthroponymModalProps = {
  action: "add" | "edit";
};

export function AnthroponymModal({ action }: AnthroponymModalProps) {
  const { open, closeModal } = useModal();
  const { currentAnthroponym } = currentAnthroponymStore();
  
  const modalId = action === "add" ? "ADD_MODAL" : "EDIT_MODAL";
  const isOpen = open[modalId];
  const title = action === "add" ? "Adicionar Antropónimo" : "Editar Antropónimo";

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={title}
      description={action === "add" ? "Adicione um novo antropónimo ao sistema" : "Actualize os dados da pessoa"}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="anthroponym-form">
            {action === "add" ? "Adicionar Antropónimo" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <AnthroponymFormContent action={action} currentAnthroponym={currentAnthroponym} />
    </GlobalModal>
  );
}
