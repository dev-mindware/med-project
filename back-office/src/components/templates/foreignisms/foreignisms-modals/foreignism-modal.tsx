"use client";
import { useModal, currentForeignismStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ForeignismFormContent } from "./foreignism-form-content";

type ForeignismModalProps = {
  action: "add" | "edit";
};

export function ForeignismModal({ action }: ForeignismModalProps) {
  const { open, closeModal } = useModal();
  const { currentForeignism } = currentForeignismStore();
  
  const modalId = action === "add" ? "ADD_MODAL" : "EDIT_MODAL";
  const isOpen = open[modalId];
  const title = action === "add" ? "Adicionar Estrangeirismo" : "Editar Estrangeirismo";

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={title}
      description={action === "add" ? "Adicione um novo vocábulo estrangeiro" : "Actualize os dados do vocábulo"}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="foreignism-form">
            {action === "add" ? "Adicionar" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <ForeignismFormContent action={action} currentForeignism={currentForeignism} />
    </GlobalModal>
  );
}
