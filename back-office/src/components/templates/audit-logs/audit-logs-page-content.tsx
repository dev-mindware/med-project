"use client";

import { Suspense } from "react";
import { AuditLogsList } from "./audit-logs-list";
import { DetailsAuditLogModal } from "./details-audit-log-modal";
import { ListPageSkeleton } from "@/components/common";

export function AuditLogsPageContent() {
  return (
    <Suspense fallback={<ListPageSkeleton cols={5} rows={10} showAction={false} />}>
      <AuditLogsList />
      <DetailsAuditLogModal />
    </Suspense>
  );
}
