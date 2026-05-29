"use client";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useBlogPostsFilters } from "@/hooks";
import { Button, Input } from "@/components";
import { DatePicker } from "@/components/ui/date-picker";

export function BlogPostsFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useBlogPostsFilters();

  const hasActiveFilters = !!(
    filters.status || filters.search || filters.startDate ||
    filters.endDate || filters.orderBy || filters.category
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper
            search={filters.search || ""}
            setSearch={(val) => setFilters({ search: val })}
            placeholder="Pesquisar publicações..."
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
              { label: "Arquivado", value: "ARCHIVED" },
            ]}
            value={filters.status}
            onChange={(val) => setFilters({ status: val ?? null })}
          />

          <div>
            <Input
              placeholder="Categoria..."
              value={filters.category || ""}
              onChange={(e) => setFilters({ category: e.target.value || null })}
              className="w-[120px]"
            />
          </div>

          <FilterPopover
            label="Ordenar por"
            icon="ArrowUpDown"
            options={[
              { label: "Mais recentes", value: "createdAt-desc" },
              { label: "Mais antigos", value: "createdAt-asc" },
              { label: "Título (A-Z)", value: "title-asc" },
              { label: "Título (Z-A)", value: "title-desc" },
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
