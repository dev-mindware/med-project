import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "./list-skeleton";

type ListPageSkeletonProps = {
  cols?: number;
  rows?: number;
  filterCount?: number;
  showAction?: boolean;
  showTitle?: boolean;
};

export function ListPageSkeleton({
  cols = 6,
  rows = 5,
  filterCount = 4,
  showAction = true,
  showTitle = true,
}: ListPageSkeletonProps) {
  return (
    <div className="mt-6 space-y-8">
      {showTitle && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-full max-w-[320px]" />
          </div>
          {showAction && <Skeleton className="h-10 w-full sm:w-36" />}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-full sm:flex-1" />
          <Skeleton className="h-10 w-full sm:w-48" />
        </div>
        {filterCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {Array.from({ length: filterCount }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        )}
      </div>

      <ListSkeleton cols={cols} rows={rows} />
    </div>
  );
}
