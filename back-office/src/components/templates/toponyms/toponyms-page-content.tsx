"use client";
import { ToponymsList } from "./toponyms-list";
import { ToponymModal } from "./toponyms-modals";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common";

export function ToponymsPageContent() {
  return (
    <>
      <Suspense fallback={<ListPageSkeleton cols={6} />}>
        <ToponymsList />
      </Suspense>
      
      <ToponymModal action="add" />
    </>
  );
}
