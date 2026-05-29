"use client";
import { Button, GlobalModal } from "@/components";
import { currentEventStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { useDeleteEvent } from "@/hooks";

export function DeleteEventModal() {
  const { closeModal, open } = useModal();
  const { currentEvent } = currentEventStore();
  const { mutateAsync: deleteEvent, isPending } = useDeleteEvent();

  const isOpen = open["DELETE_MODAL"];

  async function onSubmit() {
    if (!currentEvent) return;
    try {
      await deleteEvent(currentEvent.id);
      closeModal("DELETE_MODAL");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao eliminar"
      );
    }
  }

  return (
    <GlobalModal
      title="Eliminar Evento"
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
