import { PageWrapper } from "@/components/common";
import { EntriesPageContent } from "@/components/templates/entries";

export default function EntriesPage() {  
return (
    <PageWrapper
      subRoute="Entradas"
      showSeparator={true}
      routePath="/vonalp/entries"
      routeLabel="VONALP"
    >
      <EntriesPageContent />
    </PageWrapper>
  );
}
