import { useURLSearchParams } from "@/hooks/common";
import { useCallback } from "react";

export type EventsFilters = {
  orderBy: string | null;
  orderDirection: "asc" | "desc" | null;
  status: string | null;
  period: string | null;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  search: string | null;
  limit: number | null;
};

export function useEventsFilters() {
  const { 
    getParam, 
    setParams,
    clearParams, 
    page, 
    setPage,
    search: urlSearch,
  } = useURLSearchParams("events");

  const filters: EventsFilters = {
    orderBy: getParam("orderBy"),
    orderDirection: getParam("orderDirection") as "asc" | "desc" | null,
    status: getParam("status"),
    period: getParam("period"),
    category: getParam("category"),
    startDate: getParam("startDate"),
    endDate: getParam("endDate"),
    search: getParam("search") || urlSearch,
    limit: getParam("limit") ? parseInt(getParam("limit")!) : null,
  };

  const setFilters = useCallback((newFilters: Partial<EventsFilters>) => {
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
