"use client";
import { useModal, currentToponymStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ToponymFormContent } from "./toponym-form-content";

type ToponymModalProps = {
  action: "add" | "edit";
};

export function ToponymModal({ action }: ToponymModalProps) {
  const { open, closeModal } = useModal();
  const { currentToponym } = currentToponymStore();
  
  const modalId = action === "add" ? "ADD_MODAL" : "EDIT_MODAL";
  const isOpen = open[modalId];
  const title = action === "add" ? "Adicionar Topónimo" : "Editar Topónimo";

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={title}
      description={action === "add" ? "Adicione um novo topónimo ao sistema" : "Actualize os dados do lugar"}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="toponym-form">
            {action === "add" ? "Adicionar Topónimo" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <ToponymFormContent action={action} currentToponym={currentToponym} />
    </GlobalModal>
  );
}
