"use client";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useUsersFilters } from "@/hooks";
import { Button } from "@/components";
import { DatePicker } from "@/components/ui/date-picker";

export function UsersFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useUsersFilters();

  const hasActiveFilters = !!(
    filters.search || filters.startDate || filters.endDate ||
    filters.orderBy || filters.role || filters.isActive
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper 
            search={filters.search || ""}
            setSearch={(val) => setFilters({ search: val })}
            placeholder="Pesquisar utilizadores..." 
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover
            label="Cargo"
            icon="Shield"
            options={[
              { label: "Administrador", value: "ADMIN" },
              { label: "Supervisor", value: "SUPERVISOR" },
              { label: "Operador", value: "OPERATOR" },
            ]}
            value={filters.role}
            onChange={(val) => setFilters({ role: val ?? null })}
          />

          <FilterPopover
            label="Estado"
            icon="CircleDot"
            options={[
              { label: "Activo", value: "true" },
              { label: "Inactivo", value: "false" },
            ]}
            value={filters.isActive}
            onChange={(val) => setFilters({ isActive: val ?? null })}
          />

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
