import { useCallback, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Manages filters, pagination and sorting for the users table via URL search params.
 */
export function useUserTableFilters(pagination) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchTerm = searchParams.get("q") || "";
  const areaId = searchParams.get("areaId") || "all";
  const status = searchParams.get("status") || "all";
  const currentPage = pagination?.page || Number(searchParams.get("page") || 1);
  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.totalCount || 0;
  const sortKey = searchParams.get("sortKey") || "";
  const sortDirection = searchParams.get("sortDirection") || "asc";

  const navigateWithParams = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "" || v === "all") params.delete(k);
        else params.set(k, String(v));
      });
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  const handleSortChange = useCallback(
    (key, direction) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key) params.set("sortKey", key);
      else params.delete("sortKey");
      if (direction) params.set("sortDirection", direction);
      else params.delete("sortDirection");
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, startTransition, router]
  );

  const searchDebounceRef = useRef(null);

  const handleSearchChange = useCallback(
    (value) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        navigateWithParams({ q: value, page: 1 });
      }, 250);
    },
    [navigateWithParams]
  );

  const handleAreaChange = useCallback(
    (value) => {
      navigateWithParams({ areaId: value, page: 1 });
    },
    [navigateWithParams]
  );

  const handleStatusChange = useCallback(
    (value) => {
      navigateWithParams({ status: value, page: 1 });
    },
    [navigateWithParams]
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      navigateWithParams({ page: nextPage });
    },
    [navigateWithParams]
  );

  return {
    isPending,
    filters: {
      searchTerm,
      areaId,
      status,
    },
    paginationState: {
      currentPage,
      totalPages,
      totalCount,
    },
    sortConfig: {
      key: sortKey || null,
      direction: sortDirection === "desc" ? "desc" : "asc",
    },
    handlers: {
      handleSearchChange,
      handleAreaChange,
      handleStatusChange,
      handlePageChange,
      handleSortChange,
    },
  };
}

