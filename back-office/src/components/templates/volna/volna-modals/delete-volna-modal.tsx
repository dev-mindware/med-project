"use client";
import { Button, GlobalModal } from "@/components";
import { useDeleteVolnaTerm } from "@/hooks";
import { currentVolnaStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";

export function DeleteVolnaModal() {
  const { closeModal, open } = useModal();
  const { currentVolnaTerm } = currentVolnaStore();
  const { mutateAsync: deleteVolnaTerm, isPending } = useDeleteVolnaTerm();

  async function onSubmit() {
    if (!currentVolnaTerm) return;
    try {
      await deleteVolnaTerm(currentVolnaTerm.id);
      closeModal("VOLNA_DELETE_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao eliminar");
    }
  }

  return (
    <GlobalModal
      id="VOLNA_DELETE_MODAL"
      title="Eliminar VOLNA"
      description="Tem a certeza de que pretende eliminar este vocábulo?"
      className="!w-max"
    >
      {open["VOLNA_DELETE_MODAL"] && (
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("VOLNA_DELETE_MODAL")} disabled={isPending}>Cancelar</Button>
          <Button variant="destructive" onClick={onSubmit} loading={isPending}>Eliminar</Button>
        </div>
      )}
    </GlobalModal>
  );
}
