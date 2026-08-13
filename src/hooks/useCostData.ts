/**
 * useCostData.ts — Custom hook for cost data
 *
 * Wraps TanStack Query to provide a clean interface
 * for components to consume cost cluster data.
 *
 * WHY staleTime is 60_000:
 * The dummyjson data is static, so we cache for 60 seconds
 * to avoid unnecessary re-fetches when the user navigates
 * away and returns. This also means drill-down → back → drill
 * into another cluster feels instant.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { transformProductsToClusters } from "@/lib/transform";
import type { CostCluster } from "@/types/cost";

export function useCostData() {
  return useQuery<CostCluster[]>({
    queryKey: ["cost-clusters"],

    queryFn: async () => {
      const response = await fetchProducts();
      return transformProductsToClusters(response.products);
    },

    /*
     * Keep data fresh for 60 seconds. During this window,
     * re-mounts won't trigger a network request — the cached
     * data is served instantly.
     */
    staleTime: 60_000,
  });
}
