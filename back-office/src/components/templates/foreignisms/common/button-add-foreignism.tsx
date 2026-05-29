"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useForeignismActions, useAuth } from "@/hooks";

export function ButtonAddForeignism() {
  const { handleCreate } = useForeignismActions();
  const { user } = useAuth();

  // Somente ADMIN e OPERATOR podem adicionar estrangeirismos
  if (user?.role === "SUPERVISOR") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Estrangeirismo
    </Button>
  );
}
