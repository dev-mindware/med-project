"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyState, Icon } from "@/components/common";
import { GlobalModal } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui";
import { useDashboardStats } from "@/hooks";
import { useModal } from "@/stores/modal/use-modal-store";

const ROUTE_MAP: Record<string, string> = {
  entries: "/vonalp/entries",
  toponyms: "/vonalp/toponyms",
  anthroponyms: "/vonalp/anthroponyms",
  foreignisms: "/vonalp/foreignisms",
  "blog-posts": "/content-management/blog-posts",
  events: "/content-management/events",
};

const TYPE_LABEL: Record<string, string> = {
  entries: "Entrada",
  toponyms: "Topónimo",
  anthroponyms: "Antropónimo",
  foreignisms: "Estrangeirismo",
  "blog-posts": "Blog",
  events: "Evento",
};

const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  entries: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  toponyms: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  anthroponyms: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300" },
  foreignisms: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
  "blog-posts": { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
  events: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300" },
};

const MODAL_ID = "activity-details";

type Activity = {
  id: string;
  title: string;
  type: string;
  date: string;
  user: string;
};

export function RecentActivity() {
  const { data, isLoading } = useDashboardStats();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { openModal } = useModal();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="col-span-3 h-[380px] rounded-2xl" />
        <Skeleton className="col-span-2 h-[380px] rounded-2xl" />
      </div>
    );
  }

  const activities = (data?.recentActivity || []).slice(0, 6);
  const contributors = data?.topContributors || [];

  const selectedColors = selectedActivity
    ? MODULE_COLORS[selectedActivity.type] ?? { bg: "bg-muted", text: "text-muted-foreground" }
    : { bg: "bg-muted", text: "text-muted-foreground" };
  const selectedLabel = selectedActivity ? TYPE_LABEL[selectedActivity.type] ?? selectedActivity.type : "";
  const selectedRoute = selectedActivity ? ROUTE_MAP[selectedActivity.type] || "#" : "#";
  const selectedInitials = selectedActivity
    ? selectedActivity.user.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "";

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* Modal fora do loop — alimentado por estado local */}
      <GlobalModal
        id={MODAL_ID}
        title="Detalhes da Atividade"
        description="Informação detalhada sobre o registo criado ou modificado."
        canClose
        footer={
          selectedActivity ? (
            <Button variant="default" asChild className="gap-2 ml-auto">
              <Link href={selectedRoute}>
                Ver no Módulo <Icon name="ArrowRight" className="w-4 h-4" />
              </Link>
            </Button>
          ) : undefined
        }
      >
        {selectedActivity && (
          <div className="grid gap-4 py-2">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${selectedColors.bg}`}>
                <Icon name="Activity" className={`h-5 w-5 ${selectedColors.text}`} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-3">
              <span className="font-medium text-sm text-muted-foreground col-span-1 pt-0.5">Título</span>
              <span className="col-span-3 text-sm font-medium">{selectedActivity.title}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <span className="font-medium text-sm text-muted-foreground col-span-1">Módulo</span>
              <div className="col-span-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${selectedColors.bg} ${selectedColors.text}`}>
                  {selectedLabel}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <span className="font-medium text-sm text-muted-foreground col-span-1">Utilizador</span>
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                  {selectedInitials}
                </div>
                <span className="text-sm">{selectedActivity.user}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <span className="font-medium text-sm text-muted-foreground col-span-1">Data</span>
              <span className="col-span-3 text-sm">
                {format(new Date(selectedActivity.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
        )}
      </GlobalModal>

      <div className="col-span-3 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Atividade Recente</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Últimos registos adicionados ou modificados
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Título</th>
                <th className="px-5 py-3 text-left font-medium">Módulo</th>
                <th className="px-5 py-3 text-left font-medium">Data</th>
                <th className="px-5 py-3 text-left font-medium">Utilizador</th>
                <th className="px-5 py-3 text-right font-medium w-10" />
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8">
                    <EmptyState
                      icon="History"
                      title="Nenhuma actividade recente"
                      description="As últimas alterações aparecerão aqui quando forem registadas."
                      className="mt-0 border-0 bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                activities.map((activity) => {
                  const colors = MODULE_COLORS[activity.type] ?? {
                    bg: "bg-muted",
                    text: "text-muted-foreground",
                  };
                  const label = TYPE_LABEL[activity.type] ?? activity.type;
                  const initials = activity.user
                    .split(" ")
                    .slice(0, 2)
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={activity.id}
                      className="group border-t border-border hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <span className="font-medium text-foreground truncate block">
                          {activity.title}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.date), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                            {initials}
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {activity.user}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Ver detalhes"
                          onClick={() => {
                            setSelectedActivity(activity as Activity);
                            openModal(MODAL_ID);
                          }}
                        >
                          <Icon name="Eye" className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Top Contribuidores</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Utilizadores com mais registos
          </p>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {contributors.length === 0 ? (
            <EmptyState
              icon="Users"
              title="Sem contribuidores"
              description="Os utilizadores com mais registos aparecerão aqui."
              className="mt-0 border-0 bg-transparent py-8"
            />
          ) : (
            contributors.map((contributor, index) => {
              const max = contributors[0]?.count || 1;
              const pct = Math.round((contributor.count / max) * 100);
              const initials = contributor.name
                .split(" ")
                .slice(0, 2)
                .map((name) => name[0])
                .join("")
                .toUpperCase();

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground truncate">
                        {contributor.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {contributor.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
