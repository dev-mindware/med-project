import { useURLSearchParams } from "@/hooks/common";
import { useCallback } from "react";

export type ForeignismsFilters = {
  orderBy: string | null;
  orderDirection: "asc" | "desc" | null;
  approvalStatus: string | null;
  isVocabulary: string | null;
  isVocabularyEP: string | null;
  isForeignism: string | null;
  createdById: string | null;
  startDate: string | null;
  endDate: string | null;
  search: string | null;
  limit: number | null;
};

export function useForeignismsFilters() {
  const { 
    getParam, 
    setParams,
    clearParams, 
    page, 
    setPage,
    search: urlSearch,
  } = useURLSearchParams("foreignisms");

  const filters: ForeignismsFilters = {
    orderBy: getParam("orderBy"),
    orderDirection: getParam("orderDirection") as "asc" | "desc" | null,
    approvalStatus: getParam("approvalStatus"),
    isVocabulary: getParam("isVocabulary"),
    isVocabularyEP: getParam("isVocabularyEP"),
    isForeignism: getParam("isForeignism"),
    createdById: getParam("createdById"),
    startDate: getParam("startDate"),
    endDate: getParam("endDate"),
    search: getParam("search") || urlSearch,
    limit: getParam("limit") ? parseInt(getParam("limit")!) : null,
  };

  const setFilters = useCallback((newFilters: Partial<ForeignismsFilters>) => {
    setParams(newFilters as Record<string, string | null | undefined>);
  }, [setParams]);

  const clearAllFilters = useCallback(() => {
    clearParams();
  }, [clearParams]);

  return {
    filters,
    setFilters,
    clearAllFilters,
    page,
    setPage,
  };
}
