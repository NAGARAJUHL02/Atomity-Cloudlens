/**
 * StatChip.tsx — Aggregate stat pill with inline SVG icon
 *
 * WHY hand-built inline SVGs instead of an icon library:
 * The requirement is "no icon library". Simple SVG paths for
 * compute (CPU), memory (RAM chip), other (layers), and total
 * (sigma) keep the bundle tiny and give full control over
 * stroke/fill colors via design tokens.
 *
 * WHY stagger animation:
 * Chips appear in a horizontal row. A subtle left-to-right
 * stagger (via `index * 0.08s` delay) creates a domino-like
 * entrance that draws the eye across all four values.
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatCurrency } from "@/lib/transform";

/* ── Inline SVG icons (16×16, no external dependency) ── */

function ComputeIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Simplified CPU: a square with notches on each side */}
      <rect
        x="4"
        y="4"
        width="8"
        height="8"
        rx="1.5"
        stroke={color}
        strokeWidth="1.4"
      />
      {/* Top pins */}
      <line x1="6" y1="1.5" x2="6" y2="4" stroke={color} strokeWidth="1.2" />
      <line x1="10" y1="1.5" x2="10" y2="4" stroke={color} strokeWidth="1.2" />
      {/* Bottom pins */}
      <line x1="6" y1="12" x2="6" y2="14.5" stroke={color} strokeWidth="1.2" />
      <line x1="10" y1="12" x2="10" y2="14.5" stroke={color} strokeWidth="1.2" />
      {/* Left pins */}
      <line x1="1.5" y1="6" x2="4" y2="6" stroke={color} strokeWidth="1.2" />
      <line x1="1.5" y1="10" x2="4" y2="10" stroke={color} strokeWidth="1.2" />
      {/* Right pins */}
      <line x1="12" y1="6" x2="14.5" y2="6" stroke={color} strokeWidth="1.2" />
      <line x1="12" y1="10" x2="14.5" y2="10" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function MemoryIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Simplified RAM stick */}
      <rect
        x="2"
        y="4"
        width="12"
        height="8"
        rx="1"
        stroke={color}
        strokeWidth="1.4"
      />
      {/* Chip blocks inside */}
      <rect x="4" y="6" width="2" height="4" rx="0.5" fill={color} opacity="0.5" />
      <rect x="7" y="6" width="2" height="4" rx="0.5" fill={color} opacity="0.5" />
      <rect x="10" y="6" width="2" height="4" rx="0.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function OtherIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Stacked layers icon */}
      <path d="M8 2L2 5.5L8 9L14 5.5L8 2Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M2 8L8 11.5L14 8" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M2 10.5L8 14L14 10.5" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function TotalIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Sigma (Σ) symbol — represents summation/total */}
      <path
        d="M12 3H4.5L8.5 8L4.5 13H12"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Icon map ── */
const iconMap = {
  compute: ComputeIcon,
  memory: MemoryIcon,
  other: OtherIcon,
  total: TotalIcon,
} as const;

/* ── Color map matching the design tokens ── */
const colorMap = {
  compute: "var(--color-compute)",
  memory: "var(--color-memory)",
  other: "var(--color-other)",
  total: "var(--color-accent)",
} as const;

/* ── Component ── */

export type StatChipVariant = "compute" | "memory" | "other" | "total";

interface StatChipProps {
  variant: StatChipVariant;
  label: string;
  value: number;
  /** Index for staggered entrance animation */
  index: number;
}

export default function StatChip({ variant, label, value, index }: StatChipProps) {
  const prefersReducedMotion = useReducedMotion();
  const color = colorMap[variant];
  const Icon = iconMap[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              delay: index * 0.08 + 0.15,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-full)",
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
        fontSize: "var(--text-xs)",
        whiteSpace: "nowrap",
        /*
         * Slight shrink on narrow viewports so the row doesn't
         * force horizontal scroll before the bar chart does.
         */
        flexShrink: 0,
      }}
    >
      <Icon color={color} />
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          color,
        }}
      >
        {formatCurrency(value)}
      </span>
    </motion.div>
  );
}

/* ── Convenience: render the full row of 4 chips ── */

interface StatChipsRowProps {
  compute: number;
  memory: number;
  other: number;
  total: number;
}

export function StatChipsRow({ compute, memory, other, total }: StatChipsRowProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-2)",
        marginBlockEnd: "var(--space-4)",
      }}
      aria-label="Cost breakdown summary"
      role="group"
    >
      <StatChip variant="compute" label="Compute" value={compute} index={0} />
      <StatChip variant="memory" label="Memory" value={memory} index={1} />
      <StatChip variant="other" label="Other" value={other} index={2} />
      <StatChip variant="total" label="Total" value={total} index={3} />
    </div>
  );
}
