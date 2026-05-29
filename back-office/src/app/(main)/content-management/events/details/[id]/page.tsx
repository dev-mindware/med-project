"use client";
import { PageWrapper } from "@/components";
import { EventDetailsPageContent } from "@/components/templates/events/event-details-page-content";
import { Suspense } from "react";
import { EventDetailsSkeleton } from "@/components";

export default function EventDetailsPage() {
  return (
    <PageWrapper subRoute="Detalhes" showSeparator={true} routePath="/content-management/events" routeLabel="Eventos">
      <Suspense fallback={<EventDetailsSkeleton />}>
        <EventDetailsPageContent />
      </Suspense>
    </PageWrapper>
  );
}
