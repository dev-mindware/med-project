import { useURLSearchParams } from "@/hooks/common";
import { useCallback } from "react";

export type BlogPostsFilters = {
  orderBy: string | null;
  orderDirection: "asc" | "desc" | null;
  status: string | null;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  search: string | null;
  limit: number | null;
};

export function useBlogPostsFilters() {
  const { 
    getParam, 
    setParams,
    clearParams, 
    page, 
    setPage,
    search: urlSearch,
  } = useURLSearchParams("blog-posts");

  const filters: BlogPostsFilters = {
    orderBy: getParam("orderBy"),
    orderDirection: getParam("orderDirection") as "asc" | "desc" | null,
    status: getParam("status"),
    category: getParam("category"),
    startDate: getParam("startDate"),
    endDate: getParam("endDate"),
    search: getParam("search") || urlSearch,
    limit: getParam("limit") ? parseInt(getParam("limit")!) : null,
  };

  const setFilters = useCallback((newFilters: Partial<BlogPostsFilters>) => {
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
