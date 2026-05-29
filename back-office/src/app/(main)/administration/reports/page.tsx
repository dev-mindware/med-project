import { PageWrapper } from "@/components/common";
import { ReportsPageContent } from "@/components/templates/reports";

export const metadata = {
  title: "Relatórios | MedProject",
  description: "Geração de relatórios Excel e PDF",
};

export default function ReportsPage() {
  return (
    <PageWrapper
      subRoute="Relatórios"
      showSeparator={true}
      routePath="/administration/reports"
      routeLabel="Administração"
    >
      <ReportsPageContent />
    </PageWrapper>
  );
}
