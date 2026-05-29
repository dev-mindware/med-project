"use client";
import { Button, GlobalModal } from "@/components";
import { currentNeologismStore, useModal } from "@/stores";
import { useDeleteNeologism } from "@/hooks";
import { ErrorMessage } from "@/utils/messages";

export function DeleteNeologismModal() {
  const { closeModal, open } = useModal();
  const { currentNeologism } = currentNeologismStore();
  const { mutateAsync: deleteNeologism, isPending } = useDeleteNeologism();

  async function onSubmit() {
    if (!currentNeologism) return;
    try {
      await deleteNeologism(currentNeologism.id);
      closeModal("NEOLOGISM_DELETE_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao eliminar");
    }
  }

  return (
    <GlobalModal
      title="Eliminar Neologismo"
      description="Tem a certeza de que pretende eliminar? Esta acção não pode ser desfeita."
      id="NEOLOGISM_DELETE_MODAL"
      className="!w-max"
    >
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={() => closeModal("NEOLOGISM_DELETE_MODAL")} disabled={isPending}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onSubmit} loading={isPending}>
          Eliminar
        </Button>
      </div>
    </GlobalModal>
  );
}
