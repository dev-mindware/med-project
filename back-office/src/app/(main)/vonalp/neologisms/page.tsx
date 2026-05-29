import { PageWrapper } from "@/components/common";
import { NeologismsPageContent } from "@/components/templates/neologisms";

export default function NeologismsPage() {
  return (
    <PageWrapper
      subRoute="Neologismos"
      showSeparator={true}
      routePath="/vonalp/neologisms"
      routeLabel="VONALP"
    >
      <NeologismsPageContent />
    </PageWrapper>
  );
}
