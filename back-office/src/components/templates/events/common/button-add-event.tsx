"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useEventActions, useAuth } from "@/hooks";

export function ButtonAddEvent() {
  const { handleCreate } = useEventActions();
  const { user } = useAuth();

  // Somente ADMIN pode adicionar eventos
  if (user?.role !== "ADMIN") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Evento
    </Button>
  );
}
