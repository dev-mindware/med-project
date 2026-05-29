"use client";
import { TitleList } from "@/components/common";
import { EntriesList } from "./entries-list";
import { EntryModal } from "./entries-modals";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common";

export function EntriesPageContent() {

  return (
    <>
      <Suspense fallback={<ListPageSkeleton cols={7} />}>
        <EntriesList />
      </Suspense>
      
      <EntryModal action="add" />
    </>
  );
}
