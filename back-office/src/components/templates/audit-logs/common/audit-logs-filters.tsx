"use client";

import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover, PaginatedSelect } from "@/components/shared";
import { useAuditLogsFilters } from "@/hooks/audit-logs-filters";
import { Button } from "@/components";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { usePagination } from "@/hooks/common";
import { UserResponse } from "@/types";

export function AuditLogsFilters() {
  const { filters, setFilters, clearAllFilters } = useAuditLogsFilters();
  const [usersPage, setUsersPage] = useState(1);

  const { data: users, totalPages: usersTotalPages, isLoading: isLoadingUsers } = usePagination<UserResponse>({
    endpoint: "/users",
    queryKey: ["users-for-audit-filter"],
    queryParams: { page: usersPage, limit: 10 },
  });

  const usersOptions = users.map((u) => ({ label: u.name, value: u.id }));

  const hasActiveFilters = !!(
    filters.actorId || filters.action || filters.entity ||
    filters.search || filters.startDate || filters.endDate || filters.orderBy
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper
            search={filters.search || ""}
            setSearch={(val) => setFilters({ search: val })}
            placeholder="Pesquisar logs por ação ou entidade..."
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover
            label="Acção"
            icon="Zap"
            options={[
              { label: "Criação", value: "CREATE" },
              { label: "Actualização", value: "UPDATE" },
              { label: "Eliminação", value: "DELETE" },
              { label: "Login", value: "LOGIN" },
              { label: "Outra ação", value: "OTHER" },
            ]}
            value={filters.action}
            onChange={(val) => setFilters({ action: val ?? null })}
          />

          <FilterPopover
            label="Entidade"
            icon="Box"
            options={[
              { label: "Entrada", value: "Entry" },
              { label: "Topónimo", value: "Toponym" },
              { label: "Antropónimo", value: "Anthroponym" },
              { label: "Estrangeirismo", value: "Foreignism" },
              { label: "Utilizador", value: "User" },
              { label: "Publicação", value: "BlogPost" },
              { label: "Evento", value: "Event" },
              { label: "Inscrição em evento", value: "EventRegistration" },
              { label: "Multimédia", value: "MediaAsset" },
              { label: "Autenticação", value: "Auth" },
            ]}
            value={filters.entity}
            onChange={(val) => setFilters({ entity: val ?? null })}
          />

          <PaginatedSelect
            options={[{ label: "Todos os atores", value: "" }, ...usersOptions]}
            value={filters.actorId}
            onChange={(val) => setFilters({ actorId: val || null })}
            isLoading={isLoadingUsers}
            pagination={{ page: usersPage, totalPages: usersTotalPages || 1 }}
            onPageChange={setUsersPage}
            placeholder="Ator..."
            className="w-[160px]"
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
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
