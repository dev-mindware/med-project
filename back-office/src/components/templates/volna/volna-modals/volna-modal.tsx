"use client";
import { Button, ButtonSubmit, GlobalModal } from "@/components";
import { currentVolnaStore, useModal } from "@/stores";
import { VolnaFormContent } from "./volna-form-content";

type VolnaModalProps = {
  action: "add" | "edit";
};

export function VolnaModal({ action }: VolnaModalProps) {
  const { open, closeModal } = useModal();
  const { currentVolnaTerm } = currentVolnaStore();
  const modalId = action === "add" ? "VOLNA_ADD_MODAL" : "VOLNA_EDIT_MODAL";

  if (!open[modalId]) return null;

  return (
    <GlobalModal
      id={modalId}
      title={action === "add" ? "Adicionar VOLNA" : "Editar VOLNA"}
      description={action === "add" ? "Adicione um vocábulo de uma língua nacional de Angola" : "Actualize os dados do vocábulo VOLNA"}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>Cancelar</Button>
          <ButtonSubmit form="volna-form">{action === "add" ? "Adicionar" : "Guardar alterações"}</ButtonSubmit>
        </div>
      }
    >
      <VolnaFormContent action={action} currentVolnaTerm={currentVolnaTerm} />
    </GlobalModal>
  );
}
