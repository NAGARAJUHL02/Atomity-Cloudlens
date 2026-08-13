/**
 * Badge.tsx — Small status / category indicator
 *
 * Used in the DataTable to tag cost categories.
 * Kept intentionally minimal — just a styled <span>.
 */

"use client";

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  /** Visual variant — maps to different accent colors */
  variant?: "default" | "compute" | "memory" | "other";
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  default: {
    bg: "var(--color-accent-muted)",
    text: "var(--color-accent)",
  },
  compute: {
    bg: "color-mix(in srgb, var(--color-compute) 15%, transparent)",
    text: "var(--color-compute)",
  },
  memory: {
    bg: "color-mix(in srgb, var(--color-memory) 15%, transparent)",
    text: "var(--color-memory)",
  },
  other: {
    bg: "color-mix(in srgb, var(--color-other) 15%, transparent)",
    text: "var(--color-other)",
  },
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const style = variantStyles[variant];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        paddingInline: "var(--space-2)",
        paddingBlock: "var(--space-1)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        lineHeight: 1,
        borderRadius: "var(--radius-full)",
        background: style.bg,
        color: style.text,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
