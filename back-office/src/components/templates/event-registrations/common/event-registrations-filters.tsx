"use client";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover, PaginatedSelect } from "@/components/shared";
import { useEventRegistrationsFilters } from "@/hooks";
import { Button } from "@/components";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { usePagination } from "@/hooks/common";

export function EventRegistrationsFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useEventRegistrationsFilters();
  const [eventsPage, setEventsPage] = useState(1);

  const { data: events, totalPages: eventsTotalPages, isLoading: isLoadingEvents } = usePagination<{ id: string; title: string }>({
    endpoint: "/events",
    queryKey: ["events-for-filter"],
    queryParams: { page: eventsPage, limit: 10 },
  });

  const eventsOptions = events.map((e) => ({ label: e.title, value: e.id }));

  const hasActiveFilters = !!(
    filters.status || filters.search || filters.startDate ||
    filters.endDate || filters.orderBy || filters.eventId
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper 
            search={filters.search || ""}
            setSearch={(val) => setFilters({ search: val })}
            placeholder="Pesquisar inscrições..." 
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover
            label="Estado"
            icon="Activity"
            options={[
              { label: "Pendente", value: "PENDING" },
              { label: "Aprovado", value: "APPROVED" },
              { label: "Rejeitado", value: "REJECTED" },
              { label: "Cancelado", value: "CANCELLED" },
              { label: "Compareceu", value: "ATTENDED" },
            ]}
            value={filters.status}
            onChange={(val) => setFilters({ status: val ?? null })}
          />

          <PaginatedSelect
            options={[{ label: "Todos os eventos", value: "" }, ...eventsOptions]}
            value={filters.eventId}
            onChange={(val) => setFilters({ eventId: val || null })}
            isLoading={isLoadingEvents}
            pagination={{ page: eventsPage, totalPages: eventsTotalPages || 1 }}
            onPageChange={setEventsPage}
            placeholder="Filtrar por evento..."
            className="w-[180px]"
          />

          <FilterPopover
            label="Ordenar por"
            icon="ArrowUpDown"
            options={[
              { label: "Mais recentes", value: "createdAt-desc" },
              { label: "Mais antigos", value: "createdAt-asc" },
            ]}
            value={filters.orderBy ? `${filters.orderBy}-${filters.orderDirection}` : null}
            onChange={(val) => {
              if (val) {
                const [orderBy, orderDirection] = val.split("-");
                setFilters({ orderBy, orderDirection: orderDirection as "asc" | "desc" });
              } else {
                setFilters({ orderBy: null, orderDirection: null });
              }
            }}
          />

          <div className="flex items-center gap-2">
            <DatePicker 
              value={filters.startDate ? new Date(filters.startDate) : undefined}
              onChange={(_, formatted) => setFilters({ startDate: formatted ?? null })}
              placeholder="Data inicial"
              className="w-[150px]"
              disabledDates={undefined}
            />
            <DatePicker 
              value={filters.endDate ? new Date(filters.endDate) : undefined}
              onChange={(_, formatted) => setFilters({ endDate: formatted ?? null })}
              placeholder="Data final"
              className="w-[150px]"
              disabledDates={undefined}
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
