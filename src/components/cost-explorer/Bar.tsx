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
          style={{
            width: "100%",
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            background: gradients.bar,
            border: "none",
            cursor: isClickable ? "pointer" : "default",
            position: "relative",
            overflow: "hidden",
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
            }}
            className="bar-shimmer"
          />
        </motion.button>
      </div>

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
