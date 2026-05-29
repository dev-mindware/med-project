"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useEntryActions, useAuth } from "@/hooks";

export function ButtonAddEntry() {
  const { handleCreate } = useEntryActions();
  const { user } = useAuth();

  // Somente ADMIN e OPERATOR podem adicionar entradas
  if (user?.role === "SUPERVISOR") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Entrada
    </Button>
  );
}
