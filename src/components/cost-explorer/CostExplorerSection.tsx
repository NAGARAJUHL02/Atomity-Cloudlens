/**
 * CostExplorerSection.tsx — Main orchestrator component
 *
 * This is the primary section that ties together the bar chart,
 * data table, breadcrumb, and drill-down state. It manages:
 *
 * 1. Scroll-triggered entrance via Framer Motion's useInView
 * 2. Drill-down navigation between cluster and service levels
 * 3. AnimatePresence for smooth level transitions
 * 4. Total cost summary with animated number counting
 *
 * WHY useInView with `once: true`:
 * The entrance animation should play once when the section scrolls
 * into view, then stay visible. Re-triggering on every scroll
 * would be distracting and wasteful.
 */

"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { useCostData } from "@/hooks/useCostData";
import Card from "@/components/ui/Card";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import BarChart from "@/components/cost-explorer/BarChart";
import { ClusterTable, ServiceTable } from "@/components/cost-explorer/DataTable";
import Breadcrumb from "@/components/cost-explorer/Breadcrumb";
import Badge from "@/components/cost-explorer/Badge";
import { StatChipsRow } from "@/components/cost-explorer/StatChip";
import GradientWave from "@/components/cost-explorer/GradientWave";
import StarBorder from "@/components/ui/StarBorder";
import LoadingState from "@/components/cost-explorer/LoadingState";
import ErrorState from "@/components/cost-explorer/ErrorState";
import { formatCurrency, prettifyCategory } from "@/lib/transform";
import type { CostCluster, DrillState } from "@/types/cost";

export default function CostExplorerSection() {
  const { data: clusters, isLoading, isError, error, refetch } = useCostData();
  const prefersReducedMotion = useReducedMotion();

  /* ── Scroll-triggered entrance ── */
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    once: true, // Fire only once — don't re-animate on scroll
    margin: "-100px", // Trigger slightly before fully visible
  });

  /* ── Drill-down state ── */
  const [drillState, setDrillState] = useState<DrillState>({
    level: "clusters",
    activeCluster: null,
  });

  const handleDrillDown = useCallback(
    (categoryId: string) => {
      if (!clusters) return;
      const cluster = clusters.find((c) => c.category === categoryId);
      if (cluster) {
        setDrillState({ level: "services", activeCluster: cluster });
      }
    },
    [clusters]
  );

  const handleNavigateBack = useCallback(() => {
    setDrillState({ level: "clusters", activeCluster: null });
  }, []);

  /* ── Computed values ── */
  const totalCost = clusters?.reduce((sum, c) => sum + c.totalCost, 0) ?? 0;
  const activeClusters = drillState.activeCluster
    ? [drillState.activeCluster]
    : clusters ?? [];

  /*
   * Level-aware aggregate breakdowns for the StatChipsRow.
   * At cluster level: sum across all clusters.
   * At service level: use the active cluster's breakdown.
   * useMemo prevents recomputation on every render.
   */
  const levelBreakdown = useMemo(() => {
    if (drillState.level === "services" && drillState.activeCluster) {
      return {
        compute: drillState.activeCluster.breakdown.compute,
        memory: drillState.activeCluster.breakdown.memory,
        other: drillState.activeCluster.breakdown.other,
        total: drillState.activeCluster.totalCost,
      };
    }
    if (!clusters) return { compute: 0, memory: 0, other: 0, total: 0 };
    return {
      compute: clusters.reduce((s, c) => s + c.breakdown.compute, 0),
      memory: clusters.reduce((s, c) => s + c.breakdown.memory, 0),
      other: clusters.reduce((s, c) => s + c.breakdown.other, 0),
      total: totalCost,
    };
  }, [clusters, drillState, totalCost]);

  /* ── Bar chart data mapping ── */
  const barItems =
    drillState.level === "clusters"
      ? (clusters ?? []).map((c) => ({
        id: c.category,
        label: c.category,
        value: c.totalCost,
      }))
      : (drillState.activeCluster?.services ?? []).map((s) => ({
        id: String(s.id),
        label: s.name,
        value: s.totalCost,
      }));

  /* ── Animation variants for level transitions ── */
  const levelVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  };

  return (
    <section
      ref={sectionRef}
      id="cost-explorer"
      aria-labelledby="cost-explorer-heading"
      style={{
        width: "100%",
        maxWidth: "1200px",
        marginInline: "auto",
        padding: "var(--space-8) var(--space-4)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        }
      >
        {/* ── Section Header ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            marginBlockEnd: "var(--space-6)",
          }}
        >
          <div style={{ position: "relative" }}>
            {/* Gradient wave drifts behind the heading text */}
            <GradientWave />
            <h2
              id="cost-explorer-heading"
              style={{
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: 0,
                lineHeight: 1.2,
                position: "relative", // Above the wave
              }}
            >
              Cost Explorer
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                margin: 0,
                marginBlockStart: "var(--space-1)",
                position: "relative",
              }}
            >
              Cloud spend breakdown by category · hover a bar for details
            </p>
          </div>

          {/* Total cost badge */}
          {!isLoading && !isError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Total Spend
              </span>
              <AnimatedNumber
                value={totalCost}
                prefix="$"
                className="total-cost-display"
              />
              <style>{`
                .total-cost-display {
                  font-size: var(--text-xl);
                  font-weight: 700;
                  color: var(--color-accent);
                  font-family: var(--font-mono);
                }
              `}</style>
            </div>
          )}
        </div>

        {/* ── Main Card ── */}
        <Card>
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred"
              }
              onRetry={() => refetch()}
            />
          ) : clusters && clusters.length > 0 ? (
            <>
              {/* Breadcrumb navigation */}
              <Breadcrumb
                activeCategory={drillState.activeCluster?.category ?? null}
                onNavigateBack={handleNavigateBack}
              />

              {/*
               * AnimatePresence enables exit animations when the
               * drill-down level changes. `mode="wait"` ensures
               * the outgoing view fully exits before the incoming
               * view enters, preventing layout overlap.
               */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={drillState.level + (drillState.activeCluster?.category ?? "")}
                  variants={levelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  {/* Drill-down summary when viewing a specific category */}
                  {drillState.level === "services" && drillState.activeCluster && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        marginBlockEnd: "var(--space-4)",
                        paddingBlockEnd: "var(--space-4)",
                        borderBlockEnd:
                          "1px solid var(--color-bg-card-border)",
                      }}
                    >
                      <Badge>{prettifyCategory(drillState.activeCluster.category)}</Badge>
                      <span
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {drillState.activeCluster.serviceCount} services
                      </span>
                      <span style={{ flex: 1 }} />
                      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                        <CostPill
                          label="Compute"
                          value={drillState.activeCluster.breakdown.compute}
                          color="var(--color-compute)"
                        />
                        <CostPill
                          label="Memory"
                          value={drillState.activeCluster.breakdown.memory}
                          color="var(--color-memory)"
                        />
                        <CostPill
                          label="Other"
                          value={drillState.activeCluster.breakdown.other}
                          color="var(--color-other)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Stat Chips — level-aware aggregate values */}
                  <StatChipsRow
                    compute={levelBreakdown.compute}
                    memory={levelBreakdown.memory}
                    other={levelBreakdown.other}
                    total={levelBreakdown.total}
                  />

                  {/* Bar Chart */}
                  <BarChart
                    items={barItems}
                    onBarClick={
                      drillState.level === "clusters"
                        ? handleDrillDown
                        : undefined
                    }
                    isInteractive={drillState.level === "clusters"}
                    ariaLabel={
                      drillState.level === "clusters"
                        ? "Cost by category bar chart"
                        : `Services in ${prettifyCategory(drillState.activeCluster?.category ?? "")}`
                    }
                  />

                  {/* Data Table */}
                  <div style={{ marginBlockStart: "var(--space-6)" }}>
                    {drillState.level === "clusters" ? (
                      <ClusterTable
                        clusters={clusters}
                        onRowClick={handleDrillDown}
                      />
                    ) : drillState.activeCluster ? (
                      <ServiceTable
                        services={drillState.activeCluster.services}
                      />
                    ) : null}
                  </div>

                  {/* Deliberate interpretation note — wrapped in animated star border */}
                  <StarBorder
                    borderWidth={1.5}
                    radius="var(--radius-lg)"
                    speed={6}
                    style={{ marginBlockStart: "var(--space-6)" }}
                  >
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                        padding: "var(--space-4)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: "var(--color-accent-bright)" }}>Note:</strong>{" "}
                      Cost breakdown (Compute 40% / Memory 35% / Other 25%) is a
                      deliberate interpretation derived from each product&apos;s total
                      price. The source API (dummyjson.com) provides only a single
                      price per item — the split models a typical compute-heavy cloud
                      workload.
                    </p>
                  </StarBorder>
                </motion.div>
              </AnimatePresence>
            </>
          ) : null}
        </Card>
      </motion.div>
    </section>
  );
}

/* ── Helper: Small cost pill for the drill-down summary ── */

function CostPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        fontSize: "var(--text-xs)",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "var(--radius-full)",
          background: color,
        }}
        aria-hidden="true"
      />
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span
        style={{
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
        }}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}
