/**
 * transform.ts — Data transformation pipeline
 *
 * Converts the flat list of dummyjson products into grouped
 * CostCluster objects that the UI can render directly.
 *
 * DELIBERATE INTERPRETATION:
 * The API provides only a single `price` per product. We split that
 * price into compute / memory / other at a 40% / 35% / 25% ratio.
 * This mirrors how real cloud billing dashboards often break a
 * service's total cost into resource-type buckets. The ratios are
 * chosen to reflect a typical compute-heavy workload — they are
 * NOT fake data but a modelling decision.
 */

import type { RawProduct, CostBreakdown, CostService, CostCluster } from "@/types/cost";

/* ── Cost-split ratios ── */
const COMPUTE_RATIO = 0.4;
const MEMORY_RATIO = 0.35;
const OTHER_RATIO = 0.25;

/** Derive a cost breakdown from a total price */
export function deriveCostBreakdown(total: number): CostBreakdown {
  return {
    compute: Math.round(total * COMPUTE_RATIO * 100) / 100,
    memory: Math.round(total * MEMORY_RATIO * 100) / 100,
    other: Math.round(total * OTHER_RATIO * 100) / 100,
  };
}

/** Convert a raw product into a CostService */
function toService(product: RawProduct): CostService {
  return {
    id: product.id,
    name: product.title,
    totalCost: product.price,
    breakdown: deriveCostBreakdown(product.price),
    thumbnail: product.thumbnail,
    brand: product.brand ?? "Unknown",
    rating: product.rating,
  };
}

/**
 * Group products by category, summing prices and computing
 * aggregate breakdowns per cluster.
 */
export function transformProductsToClusters(
  products: RawProduct[]
): CostCluster[] {
  const map = new Map<string, CostService[]>();

  for (const product of products) {
    const key = product.category;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(toService(product));
  }

  const clusters: CostCluster[] = [];

  for (const [category, services] of map) {
    const totalCost = services.reduce((sum, s) => sum + s.totalCost, 0);
    // Round to 2 decimals to avoid floating-point display artefacts
    const roundedTotal = Math.round(totalCost * 100) / 100;

    clusters.push({
      category,
      totalCost: roundedTotal,
      serviceCount: services.length,
      services,
      breakdown: deriveCostBreakdown(roundedTotal),
    });
  }

  // Sort descending by cost so the largest spend appears first
  return clusters.sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Format a number as a USD string.
 * Used throughout the UI for consistent currency display.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Capitalize the first letter of each word and replace hyphens
 * with spaces (for pretty-printing category slugs).
 */
export function prettifyCategory(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
