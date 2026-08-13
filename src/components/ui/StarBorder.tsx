"use client";

/**
 * StarBorder.tsx — Animated star / shimmer border wrapper
 *
 * A thin rotating conic-gradient border that makes any wrapped element
 * look like it has an iridescent "star light" outline. The gradient
 * spins continuously so bright spots travel around the perimeter.
 *
 * Implementation notes:
 *   • Uses a ::before pseudo-element emulated via a sibling <span> so
 *     it works with React without needing to inject <style> tags per-use.
 *   • The actual border is a conic-gradient on the wrapper, clipped by
 *     an inner <div> that paints the card background colour.
 *   • Respects prefers-reduced-motion (stops the spin, keeps the glow).
 */

import { useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

interface StarBorderProps {
  children: ReactNode;
  /** Border thickness in px. Default: 1.5 */
  borderWidth?: number;
  /** Border-radius string. Default: var(--radius-md) */
  radius?: string;
  /** Speed of one full rotation in seconds. Default: 6 */
  speed?: number;
  /** Extra className for the inner content wrapper */
  className?: string;
  style?: CSSProperties;
}

export default function StarBorder({
  children,
  borderWidth = 1.5,
  radius = "var(--radius-md)",
  speed = 6,
  className,
  style,
}: StarBorderProps) {
  const prefersReduced = useReducedMotion();

  const animationStyle: CSSProperties = prefersReduced
    ? {}
    : {
        animation: `star-border-spin ${speed}s linear infinite`,
      };

  return (
    <>
      {/* Inject keyframes once via a <style> tag scoped to this module */}
      <style>{`
        @keyframes star-border-spin {
          0%   { --star-border-angle: 0deg; }
          100% { --star-border-angle: 360deg; }
        }
        @property --star-border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          borderRadius: radius,
          padding: borderWidth,
          /* The rotating conic-gradient forms the visible border */
          background: `conic-gradient(
            from var(--star-border-angle, 0deg),
            transparent 0deg,
            rgba(110, 231, 183, 0.9)  60deg,
            rgba(52,  211, 153, 1.0)  90deg,
            rgba(167, 243, 208, 0.7) 120deg,
            rgba(56,  189, 248, 0.6) 160deg,
            rgba(167, 139, 250, 0.4) 200deg,
            transparent              260deg
          )`,
          ...animationStyle,
          /* Outer glow */
          boxShadow: "0 0 12px rgba(52, 211, 153, 0.18), 0 0 24px rgba(52, 211, 153, 0.08)",
          display: "block",
          ...style,
        }}
      >
        {/* Inner fill — covers the background so only the border ring is visible */}
        <div
          className={className}
          style={{
            borderRadius: `calc(${radius} - ${borderWidth}px)`,
            background: "var(--color-bg-card)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
