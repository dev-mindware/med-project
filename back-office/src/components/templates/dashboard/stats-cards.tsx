"use client";

import { useDashboardStats } from "@/hooks";
import { DynamicMetricCard, EmptyState, type IconName } from "@/components";
import { DynamicMetricCardSkeleton } from "@/components/common/skeletons";

/**
 * Fallback descriptions for each card label sent by the API.
 * If the API already provides `description`, that takes priority.
 */
const CARD_DESCRIPTIONS: Record<string, string> = {
  // Entries / Entradas
  "Entradas":          "Total de entradas linguísticas registadas",
  "Total de Entradas": "Total de entradas linguísticas registadas",

  // Toponyms / Topónimos
  "Topónimos":          "Nomes de lugares catalogados no sistema",
  "Total de Topónimos": "Nomes de lugares catalogados no sistema",

  // Anthroponyms / Antropónimos
  "Antropónimos":          "Nomes próprios e patronímicos registados",
  "Total de Antropónimos": "Nomes próprios e patronímicos registados",

  // Foreignisms / Estrangeirismos
  "Estrangeirismos":          "Vocábulos de origem estrangeira documentados",
  "Total de Estrangeirismos": "Vocábulos de origem estrangeira documentados",

  // Users
  "Utilizadores":          "Utilizadores registados na plataforma",
  "Total de Utilizadores": "Utilizadores registados na plataforma",

  // Operators
  "Operadores":          "Operadores com acesso à plataforma",
  "Total de Operadores": "Operadores com acesso à plataforma",

  // Pending
  "Pendentes":           "Registos aguardando revisão editorial",
  "Em Revisão":          "Registos em processo de validação",
  "Aprovados":           "Registos validados e publicados",
  "Rascunhos":           "Registos em elaboração pelos operadores",

  // Events
  "Eventos":             "Eventos académicos e culturais programados",
  "Total de Eventos":    "Eventos académicos e culturais programados",

  // Corpus & Quality
  "Total do Acervo":     "Total de entradas linguísticas catalogadas",
  "Documentos Fonte":    "Obras e documentos oficiais catalogados",
  "Ocorrências no Corpus": "Citações e ocorrências textuais documentadas",
  "Conformidade AO45":   "Rigor fonológico, silábico e etimológico",
};

function cleanDescription(desc?: string, label?: string): string | undefined {
  if (desc) {
    return desc
      .replace(/1:N/gi, "documentada")
      .replace(/proveniência 1:N/gi, "proveniência documental");
  }
  return label ? CARD_DESCRIPTIONS[label] : undefined;
}

export function StatsCards() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <DynamicMetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = data?.cards || [];

  if (cards.length === 0) {
    return (
      <EmptyState
        icon="ChartBar"
        title="Sem métricas disponíveis"
        description="Ainda não existem dados suficientes para apresentar os indicadores."
        className="mt-0"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <DynamicMetricCard
          key={index}
          title={card.value.toLocaleString()}
          subtitle={card.label}
          description={cleanDescription(card.description, card.label)}
          icon={card.icon as IconName}
          variant="default"
        />
      ))}
    </div>
  );
}
