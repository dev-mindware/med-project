import { Suspense } from "react";
import { ListPageSkeleton, PageWrapper } from "@/components/common";
import { VolnaList, VolnaModal } from "@/components/templates/volna";

export default function VolnaPage() {
  return (
    <PageWrapper
      subRoute="VOLNA"
      showSeparator={true}
      routePath="/volna"
      routeLabel="Vocabulário das Línguas Nacionais de Angola"
    >
      <Suspense fallback={<ListPageSkeleton cols={6} />}>
        <VolnaList />
      </Suspense>
      <VolnaModal action="add" />
    </PageWrapper>
  );
}
