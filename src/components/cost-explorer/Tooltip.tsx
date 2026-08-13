/**
 * Tooltip.tsx — Cursor-following tooltip for bar hover
 *
 * WHY a React portal:
 * The Card component uses `backdrop-filter` and `overflow: hidden`,
 * which in CSS creates a new "containing block" for fixed-position
 * descendants. This means a `position: fixed` tooltip rendered
 * inside the Card would be clipped and positioned relative to the
 * Card, not the viewport. Using createPortal to render into
 * document.body escapes this entirely.
 *
 * WHY Framer Motion for fade/scale:
 * AnimatePresence + motion.div gives us mount/unmount animation
 * with minimal code. The tooltip fades and scales in from 95% size
 * for a subtle "pop" that feels tactile without being distracting.
 */

"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/transform";

interface TooltipProps {
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Mouse X coordinate (viewport-relative) */
  x: number;
  /** Mouse Y coordinate (viewport-relative) */
  y: number;
  /** The item's exact total cost */
  value: number;
  /** Label for the hovered item */
  label: string;
  /** Sum of all items at the current drill level — used to compute percentage */
  levelTotal: number;
}

export default function Tooltip({
  visible,
  x,
  y,
  value,
  label,
  levelTotal,
}: TooltipProps) {
  const percentage =
    levelTotal > 0 ? ((value / levelTotal) * 100).toFixed(1) : "0.0";

  /*
   * Portal into document.body so the tooltip is never clipped by
   * Card's overflow:hidden + backdrop-filter containing block.
   * Guard against SSR where document is undefined.
   */
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          /*
           * key ensures AnimatePresence treats each show/hide cycle
           * as a distinct element, enabling the exit animation.
           */
          key="bar-tooltip"
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            /*
             * Offset 12px right and 16px above the cursor so the
             * tooltip doesn't sit directly under the pointer,
             * which would cause flickering mouse-enter/leave events.
             */
            left: x + 12,
            top: y - 16,
            transform: "translateY(-100%)",
            zIndex: 9999, // Numeric — must be above everything
            pointerEvents: "none", // Tooltip must never intercept mouse events
            maxWidth: "260px",
          }}
          aria-hidden="true" // Decorative — the bar's aria-label has the same info
        >
          <div
            style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-bg-card-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-3)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px var(--color-bg-card-border)",
            }}
          >
            {/* Item label */}
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                marginBlockEnd: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label}
            </div>
            {/* Value + percentage */}
            <div
              style={{
                fontSize: "var(--text-sm)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "var(--color-accent)" }}>
                {formatCurrency(value)}
              </span>
              <span
                style={{
                  color: "var(--color-text-muted)",
                  fontWeight: 400,
                  marginInlineStart: "var(--space-2)",
                }}
              >
                · {percentage}% of total
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
