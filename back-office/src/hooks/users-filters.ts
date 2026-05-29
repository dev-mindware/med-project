import { useURLSearchParams } from "@/hooks/common";
import { useCallback } from "react";

export type UsersFilters = {
  orderBy: string | null;
  orderDirection: "asc" | "desc" | null;
  startDate: string | null;
  endDate: string | null;
  search: string | null;
  limit: number | null;
  role: string | null;
  isActive: string | null;
};

export function useUsersFilters() {
  const { 
    getParam, 
    setParams,
    clearParams, 
    page, 
    setPage,
    search: urlSearch,
  } = useURLSearchParams("users");

  const filters: UsersFilters = {
    orderBy: getParam("orderBy"),
    orderDirection: getParam("orderDirection") as "asc" | "desc" | null,
    startDate: getParam("startDate"),
    endDate: getParam("endDate"),
    search: getParam("search") || urlSearch,
    limit: getParam("limit") ? parseInt(getParam("limit")!) : null,
    role: getParam("role"),
    isActive: getParam("isActive"),
  };

  const setFilters = useCallback((newFilters: Partial<UsersFilters>) => {
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
