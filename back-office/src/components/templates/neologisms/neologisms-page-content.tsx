"use client";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common";
import { NeologismsList } from "./neologisms-list";
import { NeologismModal } from "./neologisms-modals/neologism-modal";

export function NeologismsPageContent() {
  return (
    <>
      <Suspense fallback={<ListPageSkeleton cols={8} />}>
        <NeologismsList />
      </Suspense>
      <NeologismModal action="add" />
    </>
  );
}
