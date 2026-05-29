import { StatsCards } from "./stats-cards";
import { ActivityCharts } from "./activity-charts";
import { RecentActivity } from "./recent-activity";
import { TitleList } from "@/components/common";

export function DashboardPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList suTitle="Monitorize o progresso e as métricas da plataforma linguística em tempo real." />
      <StatsCards />
      <ActivityCharts />
      <RecentActivity />
    </div>
  );
}
