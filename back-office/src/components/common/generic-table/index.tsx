"use client";
import type React from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EmptyState } from "@/components/common/empty-state";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}


export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ComponentProps<typeof EmptyState>["icon"];
  route?: string;
  page: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function GenericTable<T extends { id: string }>({
  data,
  columns,
  className,
  emptyMessage = "Nenhum dado encontrado",
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyIcon = "Inbox",
  page,
  total,
  totalPages,
  setPage,
  goToNextPage,
  goToPreviousPage,
  route,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newId = searchParams.get("newId");

  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((obj: any, k) => obj?.[k], item);
    }
    return item[key as keyof T];
  };

  const handleRowDoubleClick = (item: T) => {
    if (route) router.push(`${route}/${item.id}`);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      "text-left text-sm font-semibold text-muted-foreground tracking-wider",
                      column.className
                    )}
                  >
                    {column.header || "----------"}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-8"
                  >
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription ?? emptyMessage}
                      className="mt-0 border-0 bg-transparent"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      route && "cursor-pointer",
                      item.id === newId && "animate-pulse-twice"
                    )}
                    onDoubleClick={() => handleRowDoubleClick(item)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={cn(
                          "text-sm text-foreground",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(getValue(item, column.key), item)
                          : getValue(item, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/20">
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Página <span className="font-semibold text-foreground">{page}</span> de{" "}
              <span className="font-semibold text-foreground">{totalPages.toLocaleString("pt-PT")}</span> — Total:{" "}
              <span className="font-semibold text-foreground">{total.toLocaleString("pt-PT")}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Ir para:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  defaultValue={page}
                  key={`jump-${page}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = parseInt((e.target as HTMLInputElement).value);
                      if (!isNaN(target) && target >= 1 && target <= totalPages) {
                        setPage(target);
                      }
                    }
                  }}
                  className="w-14 h-8 px-2 text-center text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <Pagination className="w-max">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) goToPreviousPage();
                      }}
                      className={cn(
                        page <= 1 && "pointer-events-none opacity-40 cursor-not-allowed"
                      )}
                    />
                  </PaginationItem>

                  {/* First page link if far from start */}
                  {page > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(1);
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {page > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Window of surrounding pages */}
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      return start + i;
                    }
                  )
                    .filter((p) => p >= 1 && p <= totalPages)
                    .map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={page === pageNumber}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {/* Last page link if far from end */}
                  {page < totalPages - 2 && (
                    <>
                      {page < totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(totalPages);
                          }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) goToNextPage();
                      }}
                      className={cn(
                        page >= totalPages && "pointer-events-none opacity-40 cursor-not-allowed"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
