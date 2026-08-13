/**
 * api.ts — Data fetching layer
 *
 * Plain fetch wrapper for the dummyjson products endpoint.
 * This is the only file that knows the actual URL; everything
 * else works with our own domain types.
 */

import type { ProductsApiResponse } from "@/types/cost";

const PRODUCTS_URL = "https://dummyjson.com/products?limit=40";

/**
 * Fetches 40 products from dummyjson.
 * Throws on non-OK responses so TanStack Query can surface the error.
 */
export async function fetchProducts(): Promise<ProductsApiResponse> {
  const res = await fetch(PRODUCTS_URL);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch products: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}
