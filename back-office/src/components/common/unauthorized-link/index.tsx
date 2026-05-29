"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UnauthorizedLink() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <h1 className="text-2xl font-bold">Acesso Negado</h1>
      <p className="text-muted-foreground text-center">
        Não tem permissão para aceder a esta página.
      </p>
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/dashboard">
            Voltar ao Início
          </Link>
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Página Anterior
        </Button>
      </div>
    </div>
  );
}
