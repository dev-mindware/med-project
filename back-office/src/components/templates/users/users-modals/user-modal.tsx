"use client";
import { useModal, currentUserStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { UserFormContent } from "./user-form-content";

type UserModalProps = {
  action: "add" | "edit";
};

export function UserModal({ action }: UserModalProps) {
  const { open, closeModal } = useModal();
  const { currentUser } = currentUserStore();
  
  const modalId = action === "add" ? "ADD_MODAL" : "EDIT_MODAL";
  const isOpen = open[modalId];
  const title = action === "add" ? "Adicionar Utilizador" : "Editar Utilizador";

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={title}
      description={action === "add" ? "Crie uma nova conta de acesso" : "Actualize os dados do utilizador"}
      canClose
      className="!w-[35rem]"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="user-form">
            {action === "add" ? "Criar Utilizador" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <UserFormContent action={action} currentUser={currentUser} />
    </GlobalModal>
  );
}
