"use client";
import { Button, ButtonSubmit, GlobalModal } from "@/components";
import { currentNeologismStore, useModal } from "@/stores";
import { NeologismFormContent } from "./neologism-form-content";

type NeologismModalProps = {
  action: "add" | "edit";
};

export function NeologismModal({ action }: NeologismModalProps) {
  const { open, closeModal } = useModal();
  const { currentNeologism } = currentNeologismStore();
  const modalId = action === "add" ? "NEOLOGISM_ADD_MODAL" : "NEOLOGISM_EDIT_MODAL";
  const isOpen = open[modalId];

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={action === "add" ? "Adicionar Neologismo" : "Editar Neologismo"}
      description={action === "add" ? "Adicione um novo neologismo" : "Actualize os dados do neologismo"}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="neologism-form">
            {action === "add" ? "Adicionar Neologismo" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <NeologismFormContent action={action} currentNeologism={currentNeologism} />
    </GlobalModal>
  );
}
