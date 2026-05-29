import { PageWrapper } from "@/components/common";
import { DashboardPageContent } from "@/components/templates/dashboard";

export default function DashboardPage() {
  return (
    <PageWrapper 
      routeLabel="Dashboard" 
      subRoute="Visão Geral"
    >
      <DashboardPageContent />
    </PageWrapper>
  );
}
