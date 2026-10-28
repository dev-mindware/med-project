"use client";
import { useState, useEffect } from "react";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover, PaginatedSelect } from "@/components/shared";
import { useAuth, useNeologismsFilters } from "@/hooks";
import { Button, Input, Icon } from "@/components";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { usePagination } from "@/hooks/common";
import { UserResponse } from "@/types";
import { useDebounce } from "use-debounce";

export function NeologismsFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useNeologismsFilters();
  const { user } = useAuth();
  const [usersPage, setUsersPage] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Debounced search handling for smooth input typing
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [debouncedSearch] = useDebounce(searchValue, 350);

  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const current = filters.search || "";
    if (debouncedSearch !== current) {
      setFilters({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  const { data: users, totalPages: usersTotalPages, isLoading: isLoadingUsers } = usePagination<UserResponse>({
    endpoint: "/users",
    queryKey: ["users-for-filter-neologisms"],
    queryParams: { page: usersPage, limit: 10 },
  });

  const usersOptions = users.map((u) => ({ label: u.name, value: u.id }));

  // Count active secondary/advanced filters
  const advancedFiltersCount = [
    Boolean(filters.createdById),
    Boolean(filters.languageCode),
    Boolean(filters.startDate || filters.endDate),
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    filters.approvalStatus ||
    filters.search ||
    filters.startDate ||
    filters.endDate ||
    filters.orderBy ||
    filters.isVocabulary ||
    filters.isVocabularyEP ||
    filters.isForeignism ||
    filters.createdById ||
    filters.languageCode
  );

  const selectedCreator = users.find((u) => u.id === filters.createdById);

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* ── Linha Principal: Barra de Pesquisa e Filtros Rápidos ─────────── */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Campo de Pesquisa Responsivo (Mobile-first, min-w-0 flex-1) */}
        <div className="min-w-0 flex-1">
          <SearchHandlerWrapper
            search={searchValue}
            setSearch={setSearchValue}
            placeholder="Pesquisar neologismos por lema, termo ou significado..."
            className="w-full"
          />
        </div>

        {/* Grupo de Filtros Primários e Controlos de Acção */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <FilterPopover
            label="Estado"
            icon="Activity"
            options={[
              { label: "Rascunho", value: "DRAFT" },
              { label: "Pendente", value: "PENDING_APPROVAL" },
              { label: "Aprovado", value: "APPROVED" },
              { label: "Rejeitado", value: "REJECTED" },
              { label: "Correcção necessária", value: "NEEDS_CORRECTION" },
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
              filters.isVocabulary === "true"
                ? "vocabulary"
                : filters.isVocabularyEP === "true"
                ? "vocabularyEP"
                : filters.isForeignism === "true"
                ? "foreignism"
                : null
            }
            onChange={(val) => {
              if (val === "vocabulary")
                setFilters({ isVocabulary: "true", isVocabularyEP: null, isForeignism: null });
              else if (val === "vocabularyEP")
                setFilters({ isVocabularyEP: "true", isVocabulary: null, isForeignism: null });
              else if (val === "foreignism")
                setFilters({ isForeignism: "true", isVocabulary: null, isVocabularyEP: null });
              else
                setFilters({ isVocabulary: null, isVocabularyEP: null, isForeignism: null });
            }}
          />

          <FilterPopover
            label="Ordenar por"
            icon="ArrowUpDown"
            options={[
              { label: "Mais recentes", value: "createdAt-desc" },
              { label: "Mais antigos", value: "createdAt-asc" },
              { label: "Neologismo (A-Z)", value: "entry-asc" },
              { label: "Neologismo (Z-A)", value: "entry-desc" },
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

          {/* Botão de Alternância de Filtros Avançados */}
          <Button
            type="button"
            variant={isAdvancedOpen || advancedFiltersCount > 0 ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsAdvancedOpen((prev) => !prev)}
            className="h-10 px-3 flex items-center gap-1.5 transition-colors border-border/80"
          >
            <Icon name="SlidersHorizontal" className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {advancedFiltersCount > 0 && (
              <Badge variant="default" className="ml-1 px-1.5 py-0 h-4 min-w-[16px] text-[10px]">
                {advancedFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Botão de Limpeza Rápida */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-10 px-2.5 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
            >
              <Icon name="RotateCcw" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Painel de Filtros Secundários (Grid Responsivo Perfeito) ─────── */}
      {(isAdvancedOpen || advancedFiltersCount > 0) && (
        <div className="p-3.5 bg-muted/40 dark:bg-muted/15 rounded-xl border border-border/70 shadow-sm animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* Criador do Neologismo */}
            {(user?.role === "ADMIN" || user?.role === "SUPERVISOR") && (
              <div className="flex flex-col gap-1 w-full">
                <span className="text-xs font-medium text-muted-foreground">Criado por</span>
                <PaginatedSelect
                  options={[{ label: "Todos os criadores", value: "" }, ...usersOptions]}
                  value={filters.createdById}
                  onChange={(val) => setFilters({ createdById: val || null })}
                  isLoading={isLoadingUsers}
                  pagination={{ page: usersPage, totalPages: usersTotalPages || 1 }}
                  onPageChange={setUsersPage}
                  placeholder="Selecione o autor..."
                  className="w-full h-10"
                />
              </div>
            )}

            {/* Código da Língua */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs font-medium text-muted-foreground">Código da Língua</span>
              <Input
                value={filters.languageCode || ""}
                onChange={(event) => setFilters({ languageCode: event.target.value || null })}
                placeholder="Ex: pt, kmb, umb..."
                startIcon="Languages"
                className="h-10 w-full"
              />
            </div>

            {/* Data Inicial */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs font-medium text-muted-foreground">Data Inicial</span>
              <DatePicker
                value={filters.startDate ? new Date(filters.startDate) : undefined}
                onChange={(_, formatted) => setFilters({ startDate: formatted ?? null })}
                placeholder="A partir de..."
                className="w-full h-10"
                disabledDates={undefined}
              />
            </div>

            {/* Data Final */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs font-medium text-muted-foreground">Data Final</span>
              <DatePicker
                value={filters.endDate ? new Date(filters.endDate) : undefined}
                onChange={(_, formatted) => setFilters({ endDate: formatted ?? null })}
                placeholder="Até à data..."
                className="w-full h-10"
                disabledDates={undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Chips de Filtros Activos para Remoção Instantânea ────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-muted-foreground font-medium mr-1 text-[11px] uppercase tracking-wider">
            Filtros activos:
          </span>

          {filters.search && (
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2.5 font-normal hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => setFilters({ search: null })}
            >
              <span>Pesquisa: &ldquo;{filters.search}&rdquo;</span>
              <Icon name="X" className="w-3 h-3 cursor-pointer" />
            </Badge>
          )}

          {filters.approvalStatus && (
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2.5 font-normal hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => setFilters({ approvalStatus: null })}
            >
              <span>Estado: {filters.approvalStatus}</span>
              <Icon name="X" className="w-3 h-3 cursor-pointer" />
            </Badge>
          )}

          {(filters.isVocabulary || filters.isVocabularyEP || filters.isForeignism) && (
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2.5 font-normal hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => setFilters({ isVocabulary: null, isVocabularyEP: null, isForeignism: null })}
            >
              <span>
                Tipo:{" "}
                {filters.isVocabulary === "true"
                  ? "VONALP"
                  : filters.isVocabularyEP === "true"
                  ? "VONALP-EP"
                  : "Estrangeirismo"}
              </span>
              <Icon name="X" className="w-3 h-3 cursor-pointer" />
            </Badge>
          )}

          {filters.createdById && (
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2.5 font-normal hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => setFilters({ createdById: null })}
            >
              <span>Criador: {selectedCreator?.name || filters.createdById}</span>
              <Icon name="X" className="w-3 h-3 cursor-pointer" />
            </Badge>
          )}

          {filters.languageCode && (
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2.5 font-normal hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => setFilters({ languageCode: null })}
            >
              <span>Língua: {filters.languageCode}</span>
              <Icon name="X" className="w-3 h-3 cursor-pointer" />
            </Badge>
          )}

          {(filters.startDate || filters.endDate) && (
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2.5 font-normal hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => setFilters({ startDate: null, endDate: null })}
            >
              <span>Período: {filters.startDate || "Início"} até {filters.endDate || "Hoje"}</span>
              <Icon name="X" className="w-3 h-3 cursor-pointer" />
            </Badge>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-primary hover:underline text-[11px] font-semibold ml-2"
          >
            Limpar todos
          </button>
        </div>
      )}
    </div>
  );
}
