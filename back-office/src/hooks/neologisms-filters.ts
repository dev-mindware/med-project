import { useURLSearchParams } from "@/hooks/common";
import { useCallback } from "react";

export type NeologismsFilters = {
  orderBy: string | null;
  orderDirection: "asc" | "desc" | null;
  approvalStatus: string | null;
  isVocabulary: string | null;
  isVocabularyEP: string | null;
  isForeignism: string | null;
  createdById: string | null;
  languageCode: string | null;
  startDate: string | null;
  endDate: string | null;
  search: string | null;
  limit: number | null;
};

export function useNeologismsFilters() {
  const { getParam, setParams, clearParams, page, setPage, search: urlSearch } = useURLSearchParams("neologisms");

  const filters: NeologismsFilters = {
    orderBy: getParam("orderBy"),
    orderDirection: getParam("orderDirection") as "asc" | "desc" | null,
    approvalStatus: getParam("approvalStatus"),
    isVocabulary: getParam("isVocabulary"),
    isVocabularyEP: getParam("isVocabularyEP"),
    isForeignism: getParam("isForeignism"),
    createdById: getParam("createdById"),
    languageCode: getParam("languageCode"),
    startDate: getParam("startDate"),
    endDate: getParam("endDate"),
    search: getParam("search") || urlSearch,
    limit: getParam("limit") ? parseInt(getParam("limit")!) : null,
  };

  const setFilters = useCallback((newFilters: Partial<NeologismsFilters>) => {
    setParams(newFilters as Record<string, string | null | undefined>);
  }, [setParams]);

  const clearAllFilters = useCallback(() => {
    clearParams();
  }, [clearParams]);

  return { filters, setFilters, clearAllFilters, page, setPage };
}
