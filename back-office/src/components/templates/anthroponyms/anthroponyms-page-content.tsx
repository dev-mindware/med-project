"use client";
import { AnthroponymsList } from "./anthroponyms-list";
import { AnthroponymModal } from "./anthroponyms-modals";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common";

export function AnthroponymsPageContent() {
  return (
    <>
      <Suspense fallback={<ListPageSkeleton cols={5} />}>
        <AnthroponymsList />
      </Suspense>
      
      <AnthroponymModal action="add" />
    </>
  );
}
