"use client";
import { Button, GlobalModal } from "@/components";
import { currentToponymStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { useDeleteToponym } from "@/hooks";

export function DeleteToponymModal() {
  const { closeModal, open } = useModal();
  const { currentToponym } = currentToponymStore();
  const { mutateAsync: deleteToponym, isPending } = useDeleteToponym();

  const isOpen = open["DELETE_MODAL"];

  async function onSubmit() {
    if (!currentToponym) return;
    try {
      await deleteToponym(currentToponym.id);
      closeModal("DELETE_MODAL");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao eliminar"
      );
    }
  }

  return (
    <GlobalModal
      title="Eliminar Topónimo"
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
