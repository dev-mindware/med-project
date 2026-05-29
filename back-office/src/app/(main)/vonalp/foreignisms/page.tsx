import { PageWrapper } from "@/components/common";
import { ForeignismsPageContent } from "@/components/templates/foreignisms";

export default function ForeignismsPage() {
  return (
    <PageWrapper
      subRoute="Estrangeirismos"
      showSeparator={true}
      routePath="/vonalp/foreignisms"
      routeLabel="VONALP"
      >
      <ForeignismsPageContent />
    </PageWrapper>
  );
}
