"use client";
import { Button, GlobalModal } from "@/components";
import { currentUserStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { useUpdateRoleUser } from "@/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export function UpdateRoleUserModal() {
  const { closeModal, open } = useModal();
  const { currentUser } = currentUserStore();
  const { mutateAsync: updateRole, isPending } = useUpdateRoleUser();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const isOpen = open["UPDATE_ROLE_MODAL"];

  useEffect(() => {
    if (currentUser?.role) {
      setSelectedRole(currentUser.role);
    }
  }, [currentUser, isOpen]);

  async function onSubmit() {
    if (!currentUser || !selectedRole) return;
    try {
      await updateRole({ 
        id: currentUser.id, 
        data: { role: selectedRole } 
      });
      closeModal("UPDATE_ROLE_MODAL");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao actualizar a função"
      );
    }
  }

  return (
    <GlobalModal
      title="Alterar Função"
      description={`Seleccione a nova função para o utilizador ${currentUser?.name}`}
      id="UPDATE_ROLE_MODAL"
      className="!w-max"
    >
      <div className="space-y-4 mt-4">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione uma função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
            <SelectItem value="OPERATOR">OPERATOR</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => closeModal("UPDATE_ROLE_MODAL")} disabled={isPending}>
            Cancelar
          </Button>
          <Button 
            onClick={onSubmit} 
            loading={isPending}
            disabled={selectedRole === currentUser?.role}
          >
            Guardar Alteração
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
