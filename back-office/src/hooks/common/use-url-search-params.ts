import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useURLSearchParams(prefix?: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setParams = useCallback(
    (newParams: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const clearParams = useCallback((newParams?: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams();
    if (newParams) {
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.set(key, value);
        }
      });
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [pathname, router]);

  const page = parseInt(searchParams.get("page") || "1");
  const setPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", p.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Convenience for search param
  const search = getParam("search") || "";
  const setSearch = useCallback(
    (value: string) => {
      setParam("search", value);
    },
    [setParam]
  );

  return {
    getParam,
    setParam,
    setParams,
    clearParams,
    page,
    setPage,
    search,
    setSearch,
  };
}
