"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, GlobalModal, MultiSelect, SelectOption } from "@/components";
import { currentUserStore, useModal } from "@/stores";
import {
  useAssignSupervisorOperators,
  useOperatorUsers,
  useSupervisorOperators,
} from "@/hooks";
import { UserResponse } from "@/types";
import { ErrorMessage } from "@/utils/messages";

const emptyUsers: UserResponse[] = [];

export function ManageOperatorsUserModal() {
  const { closeModal, open } = useModal();
  const { currentUser } = currentUserStore();
  const isOpen = open["MANAGE_OPERATORS_MODAL"];
  const isSupervisor = currentUser?.role === "SUPERVISOR";
  const [selectedOperatorIds, setSelectedOperatorIds] = useState<string[]>([]);

  const { data: operators = emptyUsers, isLoading: isLoadingOperators } =
    useOperatorUsers(Boolean(isOpen && isSupervisor));
  const { data: managedOperators = emptyUsers, isLoading: isLoadingManaged } =
    useSupervisorOperators(currentUser?.id, Boolean(isOpen && isSupervisor));
  const { mutateAsync: assignOperators, isPending } =
    useAssignSupervisorOperators();

  useEffect(() => {
    if (!isOpen || !isSupervisor) {
      return;
    }

    const nextIds = managedOperators.map((operator) => operator.id);
    setSelectedOperatorIds((currentIds) => {
      const hasSameIds =
        currentIds.length === nextIds.length &&
        currentIds.every((id) => nextIds.includes(id));

      return hasSameIds ? currentIds : nextIds;
    });
  }, [managedOperators, isOpen, isSupervisor]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedOperatorIds((currentIds) =>
        currentIds.length === 0 ? currentIds : []
      );
    }
  }, [isOpen]);

  const operatorOptions = useMemo<SelectOption[]>(
    () =>
      operators.map((operator) => ({
        label: `${operator.name} (${operator.email})`,
        value: operator.id,
      })),
    [operators]
  );

  const selectedOptions = useMemo(
    () =>
      operatorOptions.filter((option) =>
        selectedOperatorIds.includes(option.value)
      ),
    [operatorOptions, selectedOperatorIds]
  );

  async function onSubmit() {
    if (!currentUser || !isSupervisor) return;

    try {
      await assignOperators({
        id: currentUser.id,
        operatorIds: selectedOperatorIds,
      });
      closeModal("MANAGE_OPERATORS_MODAL");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao atribuir operadores"
      );
    }
  }

  if (!currentUser || !isSupervisor) return null;

  return (
    <GlobalModal
      canClose
      id="MANAGE_OPERATORS_MODAL"
      title="Gerir operadores"
      description={`Defina quais operadores serao acompanhados por ${currentUser.name}`}
      className="!max-w-md min-h-[70vh]"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => closeModal("MANAGE_OPERATORS_MODAL")}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} loading={isPending}>
            Guardar atribuições
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-4">
        <MultiSelect
          label="Operadores geridos"
          options={operatorOptions}
          value={selectedOptions}
          onChange={(options) =>
            setSelectedOperatorIds(options.map((option) => option.value))
          }
          placeholder="Seleccione os operadores"
          isLoading={isLoadingOperators || isLoadingManaged}
        />

        <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground z-10">
          {selectedOperatorIds.length === 0
            ? "Nenhum operador selecionado para este supervisor."
            : `${selectedOperatorIds.length} operador(es) selecionado(s).`}
        </div>
      </div>
    </GlobalModal>
  );
}
