/**
 * Card.tsx — Glassmorphism container component
 *
 * WHY glassmorphism:
 * The frosted-glass aesthetic ties into the "cloud" theme and
 * creates visual depth against the dark background. We use
 * backdrop-blur + a semi-transparent background + a subtle
 * accent-tinted border.
 *
 * WHY container-type: inline-size:
 * This turns the card into a @container context so child
 * components (like DataTable) can use @container queries
 * for component-intrinsic responsive behaviour instead of
 * relying on viewport width.
 */

"use client";

import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={className}
      style={{
        /*
         * container-type: inline-size enables @container queries
         * on this element's width for child responsiveness.
         */
        containerType: "inline-size",
        background: "var(--color-bg-card)",
        backdropFilter: "blur(16px) saturate(1.4)",
        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        border: "1px solid var(--color-bg-card-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        padding: "var(--space-6)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top-edge glow line for extra glass-panel effect */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          insetBlockStart: 0,
          insetInline: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, var(--color-accent-muted), transparent)",
        }}
      />
      {children}
    </div>
  );
}
