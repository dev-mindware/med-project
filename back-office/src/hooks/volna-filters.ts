import { useURLSearchParams } from "@/hooks/common";
import { useCallback } from "react";

export type VolnaFilters = {
  search: string | null;
  language: string | null;
  grammaticalCategory: string | null;
  grammaticalSubcategory: string | null;
  approvalStatus: string | null;
  orderBy: string | null;
  orderDirection: "asc" | "desc" | null;
  limit: number | null;
};

export function useVolnaFilters() {
  const { getParam, setParams, clearParams, page, setPage, search: urlSearch } = useURLSearchParams("volna");

  const filters: VolnaFilters = {
    search: getParam("search") || urlSearch,
    language: getParam("language"),
    grammaticalCategory: getParam("grammaticalCategory"),
    grammaticalSubcategory: getParam("grammaticalSubcategory"),
    approvalStatus: getParam("approvalStatus"),
    orderBy: getParam("orderBy"),
    orderDirection: getParam("orderDirection") as "asc" | "desc" | null,
    limit: getParam("limit") ? parseInt(getParam("limit")!) : null,
  };

  const setFilters = useCallback((newFilters: Partial<VolnaFilters>) => {
    setParams(newFilters as Record<string, string | null | undefined>);
  }, [setParams]);

  const clearAllFilters = useCallback(() => {
    clearParams();
  }, [clearParams]);

  return { filters, setFilters, clearAllFilters, page, setPage };
}
