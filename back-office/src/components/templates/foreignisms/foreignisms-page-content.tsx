"use client";
import { ForeignismsList } from "./foreignisms-list";
import { ForeignismModal } from "./foreignisms-modals";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common";

export function ForeignismsPageContent() {
  return (
    <>
      <Suspense fallback={<ListPageSkeleton cols={6} />}>
        <ForeignismsList />
      </Suspense>
      
      <ForeignismModal action="add" />
    </>
  );
}
