import { Input } from "@/components/ui";

interface HelpHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function HelpHeader({ searchQuery, setSearchQuery }: HelpHeaderProps) {
  return (
    <div className="space-y-5 rounded-lg border bg-card p-5 md:p-7">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Centro de ajuda</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Como podemos ajudar?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Encontre orientacoes rapidas para operar a plataforma, compreender permissoes, rever conteudos e resolver
          duvidas frequentes de acordo com o seu perfil.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Input
          type="text"
          placeholder="Pesquisar por modulo, estado, importacao, aprovacao, relatorio..."
          startIcon="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
        <div className="rounded-lg border bg-background/60 p-3">
          <span className="font-semibold text-foreground">Guias por funcao</span>
          <p className="mt-1">Conteudo filtrado para Admin, Supervisor e Operador.</p>
        </div>
        <div className="rounded-lg border bg-background/60 p-3">
          <span className="font-semibold text-foreground">Fluxos linguisticos</span>
          <p className="mt-1">Estados, validacoes, VONALP e revisao editorial.</p>
        </div>
        <div className="rounded-lg border bg-background/60 p-3">
          <span className="font-semibold text-foreground">Suporte rapido</span>
          <p className="mt-1">Perguntas frequentes e contacto institucional.</p>
        </div>
      </div>
    </div>
  );
}
