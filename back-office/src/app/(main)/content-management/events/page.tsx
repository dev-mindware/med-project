import { Suspense } from "react";
import { ListPageSkeleton, PageWrapper } from "@/components/common";
import { EventsList } from "@/components/templates/events/events-list";
import { EventModal } from "@/components/templates/events/events-modals";

export default function EventsPage() {
  return (
    <PageWrapper
      subRoute="Eventos"
      showSeparator={true}
      routePath="/content-management/events"
      routeLabel="Gestão de Conteúdo"
      >
      <Suspense fallback={<ListPageSkeleton cols={7} />}>
        <EventsList />
      </Suspense>
      <EventModal action="add" />
    </PageWrapper>
  );
}
