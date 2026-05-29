"use client";

import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { EmptyState } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export function RecentActivity() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  const activities = data?.recentActivity || [];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-6 pb-4">
        <h3 className="font-semibold leading-none tracking-tight">Atividade Recente</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Os últimos registos adicionados ao sistema.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-y border-border">
            <tr>
              <th className="px-6 py-3 font-medium">Título</th>
              <th className="px-6 py-3 font-medium">Módulo</th>
              <th className="px-6 py-3 font-medium">Data</th>
              <th className="px-6 py-3 font-medium">Utilizador</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8">
                  <EmptyState
                    icon="History"
                    title="Nenhuma actividade recente"
                    description="Os últimos registos adicionados aparecerão aqui."
                    className="mt-0 border-0 bg-transparent"
                  />
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id} className="border-b border-border hover:bg-muted/30 transition-colors last:border-0">
                  <td className="px-6 py-4 font-medium text-foreground">{activity.title}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="capitalize">
                      {activity.type.replace(/s$/, "")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: ptBR })}
                  </td>
                  <td className="px-6 py-4">{activity.user}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
