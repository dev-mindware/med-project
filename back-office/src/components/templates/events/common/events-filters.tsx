"use client";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useEventsFilters } from "@/hooks";
import { Button, Input } from "@/components";
import { DatePicker } from "@/components/ui/date-picker";

export function EventsFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useEventsFilters();

  const hasActiveFilters = !!(
    filters.status || filters.search || filters.startDate ||
    filters.endDate || filters.orderBy || filters.period || filters.category
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper
            search={filters.search || ""}
            setSearch={(val) => setFilters({ search: val })}
            placeholder="Pesquisar eventos..."
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover
            label="Estado"
            icon="Activity"
            options={[
              { label: "Rascunho", value: "DRAFT" },
              { label: "Publicado", value: "PUBLISHED" },
              { label: "Cancelado", value: "CANCELLED" },
              { label: "Arquivado", value: "ARCHIVED" },
            ]}
            value={filters.status}
            onChange={(val) => setFilters({ status: val ?? null })}
          />

          <FilterPopover
            label="Período"
            icon="Calendar"
            options={[
              { label: "Próximos", value: "upcoming" },
              { label: "A Decorrer", value: "ongoing" },
              { label: "Passados", value: "past" },
            ]}
            value={filters.period}
            onChange={(val) => setFilters({ period: val ?? null })}
          />

          <div>
            <Input
              placeholder="Categoria..."
              value={filters.category || ""}
              onChange={(e) => setFilters({ category: e.target.value || null })}
              className="w-[140px] h-9"
            />
          </div>

          <FilterPopover
            label="Ordenar por"
            icon="ArrowUpDown"
            options={[
              { label: "Mais recentes", value: "createdAt-desc" },
              { label: "Mais antigos", value: "createdAt-asc" },
              { label: "Nome (A-Z)", value: "name-asc" },
              { label: "Nome (Z-A)", value: "name-desc" },
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
