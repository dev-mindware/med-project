"use client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { useBlogPostActions, useAuth } from "@/hooks";

export function ButtonAddBlogPost() {
  const { handleCreate } = useBlogPostActions();
  const { user } = useAuth();

  // Somente ADMIN pode adicionar posts de blog
  if (user?.role !== "ADMIN") return null;

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Icon name="Plus" className="w-4 h-4" />
      Adicionar Post
    </Button>
  );
}
