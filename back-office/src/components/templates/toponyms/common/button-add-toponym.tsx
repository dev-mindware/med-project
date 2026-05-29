"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useToponymActions, useAuth } from "@/hooks";

export function ButtonAddToponym() {
  const { handleCreate } = useToponymActions();
  const { user } = useAuth();

  // Somente ADMIN e OPERATOR podem adicionar topónimos
  if (user?.role === "SUPERVISOR") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Topónimo
    </Button>
  );
}
