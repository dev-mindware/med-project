import { PageWrapper } from "@/components/common";
import { AnthroponymsPageContent } from "@/components/templates/anthroponyms";

export default function AnthroponymsPage() {
  return (
    <PageWrapper
      subRoute="Antropónimos"
      showSeparator={true}
      routePath="/vonalp/antroponyms"
      routeLabel="VONALP"
      >
      <AnthroponymsPageContent />
    </PageWrapper>
  );
}
