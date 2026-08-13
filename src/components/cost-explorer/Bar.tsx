/**
 * Bar.tsx — A single animated bar in the bar chart
 *
 * WHY <button> not <div>:
 * Bars are interactive — clicking drills down into a category.
 * Using a <button> gives us keyboard accessibility (Tab, Enter,
 * Space) for free, plus proper focus management and screen-reader
 * announcements. A <div> with onClick is an anti-pattern for
 * interactive elements.
 *
 * WHY spring-based height animation:
 * Framer Motion's spring physics creates a natural "grow-in"
 * effect that feels more organic than a linear tween. The bar
 * height represents data, so the animation subtly draws
 * attention to magnitude differences.
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { gradients } from "@/tokens/tokens";

interface BarProps {
  /** Percentage height (0-100) of the bar relative to the tallest bar */
  heightPercent: number;
  /** Label displayed below the bar */
  label: string;
  /** Formatted cost displayed above the bar */
  value: string;
  /** Animation delay index for staggered entrance */
  index: number;
  /** Click handler for drill-down */
  onClick?: () => void;
  /** Whether this bar is interactive (clickable) */
  isClickable?: boolean;
  /** Accessible description */
  ariaLabel: string;
  /** Mouse event callbacks for tooltip positioning */
  onBarMouseMove?: (e: React.MouseEvent) => void;
  onBarMouseLeave?: () => void;
}

export default function Bar({
  heightPercent,
  label,
  value,
  index,
  onClick,
  isClickable = true,
  ariaLabel,
  onBarMouseMove,
  onBarMouseLeave,
}: BarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-2)",
        flex: "1 1 0",
        minWidth: 0,
      }}
    >
      {/* Cost value label above the bar */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : index * 0.06 + 0.3,
          duration: prefersReducedMotion ? 0 : 0.4,
        }}
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-mono)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {value}
      </motion.span>

      {/* Bar container — fixed height, bar grows from bottom */}
      <div
        style={{
          width: "100%",
          height: "var(--bar-max-height)",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {/*
         * WHY <button>: interactive bars must be keyboard-accessible.
         * See module doc comment above.
         */}
        <motion.button
          onClick={isClickable ? onClick : undefined}
          disabled={!isClickable}
          onMouseMove={onBarMouseMove}
          onMouseLeave={onBarMouseLeave}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: `${Math.max(heightPercent, 3)}%`,
            opacity: 1,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: index * 0.06,
                }
          }
          whileHover={
            isClickable
              ? { scale: 1.04, transition: { duration: 0.15 } }
              : undefined
          }
          whileFocus={
            isClickable
              ? { scale: 1.04, transition: { duration: 0.15 } }
              : undefined
          }
          aria-label={ariaLabel}
          className="bar-el"
          style={{
            width: "100%",
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            background: gradients.bar,
            /* Electric border — thin line matching the emerald gradient */
            border: "1px solid rgba(52, 211, 153, 0.55)",
            /* Layered glow: inner soft bloom + outer electric halo */
            boxShadow: [
              "0 0 0 1px rgba(52,211,153,0.08)",        /* hairline ring   */
              "0 0 6px 1px rgba(52,211,153,0.35)",      /* inner glow      */
              "0 0 14px 3px rgba(34,211,238,0.18)",     /* outer cyan halo */
            ].join(", "),
            cursor: isClickable ? "pointer" : "default",
            position: "relative",
            overflow: "visible",
            outline: "none",
            padding: 0,
            minHeight: "8px",
          }}
        >
          {/* Hover/focus shimmer overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
              opacity: 0,
              transition: "opacity var(--duration-fast)",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
            className="bar-shimmer"
          />
        </motion.button>
      </div>

      {/* ── Scoped electric-border styles ── */}
      <style>{`
        /* Idle pulse: glow breathes gently */
        .bar-el {
          animation: bar-glow-pulse 3s ease-in-out infinite alternate;
        }
        @keyframes bar-glow-pulse {
          0% {
            box-shadow:
              0 0 0 1px rgba(52,211,153,0.06),
              0 0 5px 1px rgba(52,211,153,0.28),
              0 0 12px 2px rgba(34,211,238,0.12);
          }
          100% {
            box-shadow:
              0 0 0 1px rgba(52,211,153,0.12),
              0 0 9px 2px rgba(52,211,153,0.48),
              0 0 20px 5px rgba(34,211,238,0.22);
          }
        }

        /* Hover / focus: fully lit electric border */
        .bar-el:hover,
        .bar-el:focus-visible {
          border-color: rgba(110, 231, 183, 0.85) !important;
          box-shadow:
            0 0 0 1px rgba(52,211,153,0.25),
            0 0 10px 3px rgba(52,211,153,0.65),
            0 0 28px 8px rgba(34,211,238,0.30),
            0 0 50px 14px rgba(34,211,238,0.10) !important;
          animation-play-state: paused;
        }
        .bar-el:hover .bar-shimmer,
        .bar-el:focus-visible .bar-shimmer {
          opacity: 1 !important;
        }

        /* Freeze pulse for reduced-motion users */
        @media (prefers-reduced-motion: reduce) {
          .bar-el { animation-play-state: paused !important; }
        }
      `}</style>

      {/* Category label below the bar */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: prefersReducedMotion ? 0 : index * 0.06 + 0.2,
          duration: prefersReducedMotion ? 0 : 0.3,
        }}
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          textAlign: "center",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
        title={label}
      >
        {label}
      </motion.span>
    </div>
  );
}
