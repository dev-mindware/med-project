"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useUserActions, useAuth } from "@/hooks";

export function ButtonAddUser() {
  const { handleCreate } = useUserActions();
  const { user } = useAuth();

  // Apenas ADMIN pode adicionar utilizadores
  if (user?.role !== "ADMIN") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Utilizador
    </Button>
  );
}
