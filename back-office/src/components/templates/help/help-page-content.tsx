"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth";
import { HelpHeader } from "./help-header";
import { HelpCards } from "./help-cards";
import { HelpFAQ } from "./help-faq";

const roleGuides = {
  ADMIN: {
    title: "Administrador",
    description: "Controle global, governanca editorial, utilizadores, relatorios, auditoria e publicacao.",
    focus: ["Gerir utilizadores e atribuicoes", "Acompanhar auditoria e notificacoes", "Validar conteudos publicados"],
    nextSteps: ["Rever o dashboard administrativo", "Consultar logs de auditoria", "Exportar relatórios por período"],
  },
  SUPERVISOR: {
    title: "Supervisor",
    description: "Revisao de conteudos, acompanhamento dos operadores atribuidos e controlo de qualidade linguistica.",
    focus: ["Aprovar ou solicitar correcao", "Acompanhar operadores", "Completar vocábulos VONALP pendentes"],
    nextSteps: ["Abrir itens aguardando revisao", "Ler historico de alteracoes", "Notificar operadores quando houver correcao"],
  },
  OPERATOR: {
    title: "Operador",
    description: "Criacao, importacao e correcao de dados linguisticos antes da revisao superior.",
    focus: ["Criar vocábulos completos", "Corrigir dados devolvidos", "Preparar ficheiros e multimédia"],
    nextSteps: ["Criar registos como rascunho", "Submeter para aprovacao", "Consultar notificacoes de estado"],
  },
};

export function HelpPageContent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const role = (user?.role || "OPERATOR") as keyof typeof roleGuides;
  const guide = roleGuides[role] || roleGuides.OPERATOR;

  const quickLinks = useMemo(
    () => [
      { icon: "BookOpen", label: "Dados linguisticos", text: "Entradas, toponimos, antroponimos e estrangeirismos." },
      { icon: "Workflow", label: "Fluxos de aprovacao", text: "Rascunho, revisao, correcao, aprovado e rejeitado." },
      { icon: "Bell", label: "Notificacoes", text: "Entenda quais eventos pedem a sua atencao." },
      { icon: "FileSpreadsheet", label: "Importacao e relatorios", text: "Templates, validacoes, exportacoes e resumo de erros." },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <HelpHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Guia do seu perfil</p>
              <h2 className="mt-2 text-2xl font-bold">{guide.title}</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{guide.description}</p>
            </div>
            <Badge variant="secondary">{guide.title}</Badge>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {guide.focus.map((item) => (
              <div key={item} className="rounded-lg border bg-background/60 p-3">
                <Icon name="CircleCheck" className="mb-2 h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border bg-card p-5">
          <p className="text-sm font-semibold">Proximas acoes recomendadas</p>
          <div className="mt-4 space-y-3">
            {guide.nextSteps.map((step, index) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <div key={link.label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Icon name={link.icon as any} className="h-5 w-5 text-primary" />
              </span>
              <p className="font-semibold">{link.label}</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{link.text}</p>
          </div>
        ))}
      </section>

      <HelpCards searchQuery={searchQuery} />
      <HelpFAQ searchQuery={searchQuery} />
    </div>
  );
}
