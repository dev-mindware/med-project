"use client";
import { Button, GlobalModal } from "@/components";
import { currentUserStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { useUpdateStatusUser } from "@/hooks";

export function ToggleStatusUserModal() {
  const { closeModal, open } = useModal();
  const { currentUser } = currentUserStore();
  const { mutateAsync: updateStatus, isPending } = useUpdateStatusUser();

  const isOpen = open["TOGGLE_STATUS_MODAL"];

  async function onSubmit() {
    if (!currentUser) return;
    try {
      await updateStatus({ 
        id: currentUser.id, 
        data: { isActive: !currentUser.isActive } 
      });
      closeModal("TOGGLE_STATUS_MODAL");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao actualizar o estado"
      );
    }
  }

  const nextStatusLabel = currentUser?.isActive ? "Desactivar" : "Activar";

  return (
    <GlobalModal
      title={`${nextStatusLabel} utilizador`}
      description={`Tem a certeza de que pretende ${nextStatusLabel.toLowerCase()} o utilizador ${currentUser?.name}?`}
      id="TOGGLE_STATUS_MODAL"
      className="!w-max"
    >
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={() => closeModal("TOGGLE_STATUS_MODAL")} disabled={isPending}>
          Cancelar
        </Button>
        <Button 
          variant={currentUser?.isActive ? "destructive" : "default"} 
          onClick={onSubmit} 
          loading={isPending}
        >
          {nextStatusLabel}
        </Button>
      </div>
    </GlobalModal>
  );
}
