import { PageWrapper } from "@/components/common";
import { ToponymsPageContent } from "@/components/templates/toponyms";

export default function ToponymsPage() {
  return (
    <PageWrapper
      subRoute="Topónimos"
      showSeparator={true}
      routePath="/vonalp/toponyms"
      routeLabel="VONALP"
    >
      <ToponymsPageContent />
    </PageWrapper>
  );
}
