"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useAuth, useNeologismActions } from "@/hooks";

export function ButtonAddNeologism() {
  const { handleCreate } = useNeologismActions();
  const { user } = useAuth();

  if (user?.role === "SUPERVISOR") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Neologismo
    </Button>
  );
}
