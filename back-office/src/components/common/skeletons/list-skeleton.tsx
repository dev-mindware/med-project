import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  rows?: number;
  cols?: number;
};

export function ListSkeleton({ cols = 6, rows = 5 }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: cols }).map((_, index) => (
                <TableHead key={index} className="py-3">
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-4">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Footer skeleton for pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <Skeleton className="h-4 w-[150px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
