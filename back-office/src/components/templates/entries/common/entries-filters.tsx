"use client";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover, PaginatedSelect } from "@/components/shared";
import { useEntriesFilters, useAuth } from "@/hooks";
import { Button, Input } from "@/components";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { usePagination } from "@/hooks/common";
import { UserResponse } from "@/types";

export function EntriesFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useEntriesFilters();
  const { user } = useAuth();
  const [usersPage, setUsersPage] = useState(1);

  const { data: users, totalPages: usersTotalPages, isLoading: isLoadingUsers } = usePagination<UserResponse>({
    endpoint: "/users",
    queryKey: ["users-for-filter"],
    queryParams: { page: usersPage, limit: 10 },
  });

  const usersOptions = users.map((u) => ({ label: u.name, value: u.id }));

  const hasActiveFilters = !!(
    filters.approvalStatus || filters.search || filters.startDate ||
    filters.endDate || filters.orderBy || filters.isVocabulary ||
    filters.isVocabularyEP || filters.isForeignism || filters.createdById || filters.languageCode
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper 
            search={filters.search || ""}
            setSearch={(val) => setFilters({ search: val })}
            placeholder="Pesquisar entradas..." 
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover
            label="Estado"
            icon="Activity"
            options={[
              { label: "Rascunho", value: "DRAFT" },
              { label: "Pendente", value: "PENDING_APPROVAL" },
              { label: "Aprovado", value: "APPROVED" },
              { label: "Rejeitado", value: "REJECTED" },
              { label: "Correção Necessária", value: "NEEDS_CORRECTION" },
              { label: "Arquivado", value: "ARCHIVED" },
            ]}
            value={filters.approvalStatus}
            onChange={(val) => setFilters({ approvalStatus: val ?? null })}
          />

          <FilterPopover
            label="Tipo"
            icon="Tag"
            options={[
              { label: "VONALP", value: "vocabulary" },
              { label: "VONALP-EP", value: "vocabularyEP" },
              { label: "Estrangeirismo", value: "foreignism" },
            ]}
            value={
              filters.isVocabulary === "true" ? "vocabulary" :
              filters.isVocabularyEP === "true" ? "vocabularyEP" :
              filters.isForeignism === "true" ? "foreignism" : null
            }
            onChange={(val) => {
              if (val === "vocabulary") setFilters({ isVocabulary: "true", isVocabularyEP: null, isForeignism: null });
              else if (val === "vocabularyEP") setFilters({ isVocabularyEP: "true", isVocabulary: null, isForeignism: null });
              else if (val === "foreignism") setFilters({ isForeignism: "true", isVocabulary: null, isVocabularyEP: null });
              else setFilters({ isVocabulary: null, isVocabularyEP: null, isForeignism: null });
            }}
          />

          <FilterPopover
            label="Ordenar por"
            icon="ArrowUpDown"
            options={[
              { label: "Mais recentes", value: "createdAt-desc" },
              { label: "Mais antigos", value: "createdAt-asc" },
              { label: "Entrada (A-Z)", value: "entry-asc" },
              { label: "Entrada (Z-A)", value: "entry-desc" },
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

          {(user?.role === "ADMIN" || user?.role === "SUPERVISOR") && (
            <PaginatedSelect
              options={[{ label: "Todos os criadores", value: "" }, ...usersOptions]}
              value={filters.createdById}
              onChange={(val) => setFilters({ createdById: val || null })}
              isLoading={isLoadingUsers}
              pagination={{ page: usersPage, totalPages: usersTotalPages || 1 }}
              onPageChange={setUsersPage}
              placeholder="Criado por..."
              className="w-[160px]"
            />
          )}

          <Input
            value={filters.languageCode || ""}
            onChange={(event) => setFilters({ languageCode: event.target.value || null })}
            placeholder="Código da língua"
            startIcon="Languages"
            className="h-10 w-[160px]"
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
