"use client";
import { Button, GlobalModal } from "@/components";
import { currentUserStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { useDeleteUser } from "@/hooks";

export function DeleteUserModal() {
  const { closeModal, open } = useModal();
  const { currentUser } = currentUserStore();
  const { mutateAsync: deleteUser, isPending } = useDeleteUser();

  const isOpen = open["DELETE_MODAL"];

  async function onSubmit() {
    if (!currentUser) return;
    try {
      await deleteUser(currentUser.id);
      closeModal("DELETE_MODAL");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao eliminar"
      );
    }
  }

  return (
    <GlobalModal
      title="Eliminar Utilizador"
      description="Tem a certeza de que pretende eliminar? Esta acção não pode ser desfeita."
      id="DELETE_MODAL"
      className="!w-max"
    >
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={() => closeModal("DELETE_MODAL")} disabled={isPending}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onSubmit} loading={isPending}>
          Eliminar
        </Button>
      </div>
    </GlobalModal>
  );
}
