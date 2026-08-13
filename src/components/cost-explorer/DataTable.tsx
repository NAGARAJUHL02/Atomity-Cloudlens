/**
 * DataTable.tsx — Semantic data table with staggered row entrance
 *
 * WHY a real <table>:
 * Accessibility best practice — screen readers understand <table>
 * semantics (rows, columns, headers) natively. A grid of divs
 * would require extensive ARIA attributes to convey the same
 * structure, and would break features like table navigation
 * in tools like VoiceOver and NVDA.
 *
 * WHY @container queries:
 * The table lives inside a Card with container-type: inline-size.
 * By using @container instead of @media queries, the table
 * adapts to its *own* container width, not the viewport. This
 * makes the component truly portable — it'll collapse columns
 * correctly whether it's in a sidebar, modal, or full-width card.
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import Badge from "@/components/cost-explorer/Badge";
import { formatCurrency, prettifyCategory } from "@/lib/transform";
import type { CostCluster, CostService } from "@/types/cost";

/* ── Cluster-level table (top level) ── */

interface ClusterTableProps {
  clusters: CostCluster[];
  onRowClick: (category: string) => void;
}

export function ClusterTable({ clusters, onRowClick }: ClusterTableProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="table-wrapper">
      <table
        aria-label="Cloud cost by category"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--text-sm)",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Category</th>
            <th style={{ ...thStyle, textAlign: "end" }}>Services</th>
            <th style={{ ...thStyle, textAlign: "end" }} className="hide-narrow">
              Compute
            </th>
            <th style={{ ...thStyle, textAlign: "end" }} className="hide-narrow">
              Memory
            </th>
            <th style={{ ...thStyle, textAlign: "end" }} className="hide-narrow">
              Other
            </th>
            <th style={{ ...thStyle, textAlign: "end" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((cluster, i) => (
            <motion.tr
              key={cluster.category}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : i * 0.04 + 0.2,
                duration: prefersReducedMotion ? 0 : 0.35,
              }}
              onClick={() => onRowClick(cluster.category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onRowClick(cluster.category);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Drill down into ${prettifyCategory(cluster.category)}`}
              style={{
                cursor: "pointer",
                transition: "background var(--duration-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <td style={tdStyle}>
                <Badge>{prettifyCategory(cluster.category)}</Badge>
              </td>
              <td style={{ ...tdStyle, textAlign: "end", fontFamily: "var(--font-mono)" }}>
                {cluster.serviceCount}
              </td>
              <td
                style={{ ...tdStyle, textAlign: "end", fontFamily: "var(--font-mono)" }}
                className="hide-narrow"
              >
                {formatCurrency(cluster.breakdown.compute)}
              </td>
              <td
                style={{ ...tdStyle, textAlign: "end", fontFamily: "var(--font-mono)" }}
                className="hide-narrow"
              >
                {formatCurrency(cluster.breakdown.memory)}
              </td>
              <td
                style={{ ...tdStyle, textAlign: "end", fontFamily: "var(--font-mono)" }}
                className="hide-narrow"
              >
                {formatCurrency(cluster.breakdown.other)}
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "end",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatCurrency(cluster.totalCost)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* @container query styles for hiding columns on narrow containers */}
      <style>{`
        .table-wrapper {
          container-type: inline-size;
          width: 100%;
          overflow-x: auto;
        }

        /* Hide breakdown columns when the container is narrower than 500px */
        @container (max-width: 500px) {
          .hide-narrow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Service-level table (drill-down) ── */

interface ServiceTableProps {
  services: CostService[];
}

export function ServiceTable({ services }: ServiceTableProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="service-table-wrapper">
      <table
        aria-label="Service-level cost breakdown"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--text-sm)",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Service</th>
            <th style={{ ...thStyle, textAlign: "end" }} className="srv-hide-narrow">
              Brand
            </th>
            <th style={{ ...thStyle, textAlign: "end" }}>
              <Badge variant="compute">Compute</Badge>
            </th>
            <th style={{ ...thStyle, textAlign: "end" }}>
              <Badge variant="memory">Memory</Badge>
            </th>
            <th style={{ ...thStyle, textAlign: "end" }} className="srv-hide-narrow">
              <Badge variant="other">Other</Badge>
            </th>
            <th style={{ ...thStyle, textAlign: "end" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, i) => (
            <motion.tr
              key={service.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : i * 0.04 + 0.1,
                duration: prefersReducedMotion ? 0 : 0.35,
              }}
              style={{
                transition: "background var(--duration-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <td style={tdStyle}>
                <span
                  style={{
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                  title={service.name}
                >
                  {service.name}
                </span>
              </td>
              <td
                style={{ ...tdStyle, textAlign: "end", color: "var(--color-text-muted)" }}
                className="srv-hide-narrow"
              >
                {service.brand}
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "end",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-compute)",
                }}
              >
                {formatCurrency(service.breakdown.compute)}
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "end",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-memory)",
                }}
              >
                {formatCurrency(service.breakdown.memory)}
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "end",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-other)",
                }}
                className="srv-hide-narrow"
              >
                {formatCurrency(service.breakdown.other)}
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "end",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatCurrency(service.totalCost)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .service-table-wrapper {
          container-type: inline-size;
          width: 100%;
          overflow-x: auto;
        }

        @container (max-width: 480px) {
          .srv-hide-narrow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Shared cell styles ── */

const thStyle: React.CSSProperties = {
  padding: "var(--space-3) var(--space-3)",
  textAlign: "start",
  fontWeight: 600,
  fontSize: "var(--text-xs)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBlockEnd: "1px solid var(--color-bg-card-border)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "var(--space-3) var(--space-3)",
  borderBlockEnd: "1px solid color-mix(in srgb, var(--color-bg-card-border) 40%, transparent)",
  verticalAlign: "middle",
};
