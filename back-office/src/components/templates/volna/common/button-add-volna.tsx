"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useAuth, useVolnaActions } from "@/hooks";

export function ButtonAddVolna() {
  const { handleCreate } = useVolnaActions();
  const { user } = useAuth();

  if (user?.role === "SUPERVISOR") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="h-4 w-4" />
      Adicionar VOLNA
    </Button>
  );
}
