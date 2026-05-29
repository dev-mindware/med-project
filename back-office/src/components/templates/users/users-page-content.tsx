"use client";
import { UsersList } from "./users-list";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common";

export function UsersPageContent() {
  return (
    <>
      <Suspense fallback={<ListPageSkeleton cols={6} />}>
        <UsersList />
      </Suspense>
    </>
  );
}
