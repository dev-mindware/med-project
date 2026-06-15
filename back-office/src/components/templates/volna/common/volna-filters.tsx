"use client";
import { Button } from "@/components";
import { FilterPopover } from "@/components/shared";
import { SearchHandlerWrapper } from "@/components/common";
import { grammatical_category } from "@/constants";
import { useVolnaFilters } from "@/hooks";
import { angolanNationalLanguages } from "./angolan-languages";

export function VolnaFiltersTSX() {
  const { filters, setFilters, clearAllFilters } = useVolnaFilters();

  const selectedCategory = grammatical_category.find((item) => item.value === filters.grammaticalCategory);
  const hasActiveFilters = !!(
    filters.search ||
    filters.language ||
    filters.grammaticalCategory ||
    filters.grammaticalSubcategory ||
    filters.approvalStatus ||
    filters.orderBy
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 max-w-sm">
          <SearchHandlerWrapper
            search={filters.search || ""}
            setSearch={(value) => setFilters({ search: value })}
            placeholder="Pesquisar vocábulos VOLNA..."
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover
            label="Língua nacional"
            icon="Languages"
            options={angolanNationalLanguages}
            value={filters.language}
            onChange={(value) => setFilters({ language: value ?? null })}
          />
          <FilterPopover
            label="Classe gramatical"
            icon="Tags"
            options={grammatical_category.map(({ label, value }) => ({ label, value }))}
            value={filters.grammaticalCategory}
            onChange={(value) => setFilters({ grammaticalCategory: value ?? null, grammaticalSubcategory: null })}
          />
          <FilterPopover
            label="Subclasse"
            icon="ListTree"
            options={(selectedCategory?.subcategories || []).map(({ label, value }) => ({ label, value }))}
            value={filters.grammaticalSubcategory}
            onChange={(value) => setFilters({ grammaticalSubcategory: value ?? null })}
          />
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
            onChange={(value) => setFilters({ approvalStatus: value ?? null })}
          />
          <FilterPopover
            label="Ordenar por"
            icon="ArrowUpDown"
            options={[
              { label: "Mais recentes", value: "createdAt-desc" },
              { label: "Mais antigos", value: "createdAt-asc" },
              { label: "Vocábulo (A-Z)", value: "term-asc" },
              { label: "Vocábulo (Z-A)", value: "term-desc" },
            ]}
            value={filters.orderBy ? `${filters.orderBy}-${filters.orderDirection}` : null}
            onChange={(value) => {
              if (!value) {
                setFilters({ orderBy: null, orderDirection: null });
                return;
              }
              const [orderBy, orderDirection] = value.split("-");
              setFilters({ orderBy, orderDirection: orderDirection as "asc" | "desc" });
            }}
          />
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
