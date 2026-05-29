"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useAnthroponymActions, useAuth } from "@/hooks";

export function ButtonAddAnthroponym() {
  const { handleCreate } = useAnthroponymActions();
  const { user } = useAuth();

  // Somente ADMIN e OPERATOR podem adicionar antropónimos
  if (user?.role === "SUPERVISOR") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Antropónimo
    </Button>
  );
}
