"use client";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover, PaginatedSelect } from "@/components/shared";
import { useEntriesFilters, useAuth } from "@/hooks";
import { Button, Input } from "@/components";
import { DatePicker } from "@/components/ui/date-picker";
import { useState, useEffect } from "react";
import { usePagination } from "@/hooks/common";
import { UserResponse } from "@/types";
import { useDebounce } from "use-debounce";

export function EntriesFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useEntriesFilters();
  const { user } = useAuth();
  const [usersPage, setUsersPage] = useState(1);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [debouncedSearch] = useDebounce(searchValue, 350);

  // Synchronize local input state if URL search changes externally (e.g. clear filters)
  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  // Push debounced search to URL filters
  useEffect(() => {
    const current = filters.search || "";
    if (debouncedSearch !== current) {
      setFilters({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  const { data: users, totalPages: usersTotalPages, isLoading: isLoadingUsers } = usePagination<UserResponse>({
    endpoint: "/users",
    queryKey: ["users-for-filter"],
    queryParams: { page: usersPage, limit: 10 },
  });

  const usersOptions = users.map((u) => ({ label: u.name, value: u.id }));

  const hasActiveFilters = !!(
    filters.approvalStatus || filters.search || filters.startDate ||
    filters.endDate || filters.orderBy || filters.isVocabulary ||
    filters.isVocabularyEP || filters.isForeignism || filters.createdById ||
    filters.languageCode || filters.grammaticalCategory ||
    filters.entryType || filters.letter
  );

  const grammaticalCategoryOptions = [
    { label: "Substantivo", value: "substantivo" },
    { label: "Adjectivo", value: "adjectivo" },
    { label: "Verbo", value: "verbo" },
    { label: "Advérbio", value: "advérbio" },
    { label: "Pronome", value: "pronome" },
    { label: "Preposição", value: "preposição" },
    { label: "Conjunção", value: "conjunção" },
    { label: "Interjeição", value: "interjeição" },
    { label: "Numeral", value: "numeral" },
    { label: "Artigo", value: "artigo" },
  ];

  const entryTypeOptions = [
    { label: "VONALP", value: "vocabulary" },
    { label: "VONALP-EP", value: "vocabularyEP" },
    { label: "Estrangeirismo", value: "foreignism" },
    { label: "Vocabulário Geral", value: "general" },
    { label: "Com Divisão Silábica", value: "hasSyllabicDivision" },
    { label: "Com Pronúncia", value: "hasPronunciation" },
    { label: "Com Etimologia", value: "hasEtymology" },
    { label: "Com Áudio", value: "hasAudio" },
    { label: "Sigla / Acrónimo", value: "hasAcronym" },
    { label: "Abreviatura", value: "hasAbbreviation" },
  ];

  const letterOptions = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => ({
    label: `Letra ${l}`,
    value: l,
  }));

  const orderOptions = [
    { label: "Mais recentes", value: "createdAt-desc" },
    { label: "Mais antigos", value: "createdAt-asc" },
    { label: "Entrada (A-Z)", value: "entry-asc" },
    { label: "Entrada (Z-A)", value: "entry-desc" },
    { label: "Mais frequentes", value: "frequency-desc" },
    { label: "Menos frequentes", value: "frequency-asc" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper 
            search={searchValue}
            setSearch={setSearchValue}
            placeholder="Pesquisar entradas..." 
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover
            label="Categoria"
            icon="Bookmark"
            options={grammaticalCategoryOptions}
            value={filters.grammaticalCategory}
            onChange={(val) => setFilters({ grammaticalCategory: val ?? null })}
          />
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
            options={entryTypeOptions}
            value={
              filters.entryType ||
              (filters.isVocabulary === "true" ? "vocabulary" :
               filters.isVocabularyEP === "true" ? "vocabularyEP" :
               filters.isForeignism === "true" ? "foreignism" : null)
            }
            onChange={(val) => {
              if (val) {
                setFilters({
                  entryType: val,
                  isVocabulary: val === "vocabulary" ? "true" : null,
                  isVocabularyEP: val === "vocabularyEP" ? "true" : null,
                  isForeignism: val === "foreignism" ? "true" : null,
                });
              } else {
                setFilters({
                  entryType: null,
                  isVocabulary: null,
                  isVocabularyEP: null,
                  isForeignism: null,
                });
              }
            }}
          />

          <FilterPopover
            label="Letra"
            icon="Type"
            options={letterOptions}
            value={filters.letter}
            onChange={(val) => setFilters({ letter: val ?? null })}
          />

          <FilterPopover
            label="Ordenar por"
            icon="ArrowUpDown"
            options={orderOptions}
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

          <div>

          <Input
            value={filters.languageCode || ""}
            onChange={(event) => setFilters({ languageCode: event.target.value || null })}
            placeholder="Código da língua"
            startIcon="Languages"
            className="h-10 w-[160px]"
            />
            </div>

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
