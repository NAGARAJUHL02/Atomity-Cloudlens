/**
 * cost.ts — Shared type definitions for the Cost Explorer feature
 *
 * These interfaces describe the shape of data at each transformation
 * stage: raw API → grouped clusters → drill-down services.
 */

/** Raw product shape from dummyjson.com/products */
export interface RawProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  thumbnail: string;
  brand?: string;
  rating: number;
}

/** API response wrapper from dummyjson */
export interface ProductsApiResponse {
  products: RawProduct[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Deliberate cost-split interpretation:
 * Since the dummyjson API only provides a single `price` per product,
 * we derive a compute / memory / other breakdown using fixed ratios
 * (40% / 35% / 25%). This is a *deliberate modelling choice* to
 * simulate a real cloud-cost breakdown — not fake or randomly
 * generated data. In a production system these values would come
 * from a billing API.
 */
export interface CostBreakdown {
  compute: number;
  memory: number;
  other: number;
}

/** A single "service" (product) within a cost cluster */
export interface CostService {
  id: number;
  name: string;
  totalCost: number;
  breakdown: CostBreakdown;
  thumbnail: string;
  brand: string;
  rating: number;
}

/**
 * A top-level "cluster" — one per product category.
 * `totalCost` is the sum of all service prices in the category.
 */
export interface CostCluster {
  category: string;
  totalCost: number;
  serviceCount: number;
  services: CostService[];
  breakdown: CostBreakdown;
}

/** Which drill-down level the user is currently viewing */
export type DrillLevel = "clusters" | "services";

/** Current state of the drill-down navigation */
export interface DrillState {
  level: DrillLevel;
  activeCluster: CostCluster | null;
}
