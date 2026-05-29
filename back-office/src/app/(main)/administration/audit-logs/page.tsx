import { PageWrapper } from "@/components/common";
import { AuditLogsPageContent } from "@/components/templates/audit-logs";

export const metadata = {
  title: "Logs de Auditoria | MedProject",
  description: "Histórico de acções realizadas no sistema",
};

export default function AuditLogsPage() {
  return (
    <PageWrapper
      subRoute="Logs de Auditoria"
      showSeparator={true}
      routePath="/administration/audit-logs"
      routeLabel="Administração"
    >
      <AuditLogsPageContent />
    </PageWrapper>
  );
}
