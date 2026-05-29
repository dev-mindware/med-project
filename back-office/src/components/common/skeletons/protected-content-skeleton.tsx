import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedContentSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 lg:p-12">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-[420px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-[280px] lg:col-span-3" />
        <Skeleton className="h-[280px] lg:col-span-2" />
      </div>

      <Skeleton className="h-[320px] w-full" />
    </div>
  );
}
