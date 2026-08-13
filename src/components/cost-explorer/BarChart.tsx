/**
 * BarChart.tsx — Bar chart container with tooltip support
 *
 * Renders an array of Bar components side by side.
 * The tallest bar always fills 100% of the available height;
 * other bars are scaled proportionally.
 *
 * WHY role="img" on the chart wrapper:
 * Screen readers should treat the chart as a single image with
 * an accessible label rather than reading every bar individually.
 * Individual bars are still keyboard-navigable as buttons.
 *
 * WHY tooltip state lives here (not in Bar):
 * The tooltip needs to know the *level total* (sum of all items)
 * to compute percentages. BarChart already has access to all items,
 * so it's the natural owner of hover state. Each Bar just reports
 * mouse events upward.
 */

"use client";

import { useState, useCallback } from "react";
import Bar from "@/components/cost-explorer/Bar";
import Tooltip from "@/components/cost-explorer/Tooltip";
import { formatCurrency, prettifyCategory } from "@/lib/transform";

interface BarChartItem {
  id: string;
  label: string;
  value: number;
}

interface BarChartProps {
  items: BarChartItem[];
  /** Called when a bar is clicked; receives the item id */
  onBarClick?: (id: string) => void;
  /** Whether bars are clickable (false in drill-down level) */
  isInteractive?: boolean;
  /** Accessible chart title */
  ariaLabel: string;
}

/** State for the cursor-following tooltip */
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  value: number;
  label: string;
}

export default function BarChart({
  items,
  onBarClick,
  isInteractive = true,
  ariaLabel,
}: BarChartProps) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const levelTotal = items.reduce((sum, i) => sum + i.value, 0);

  /* ── Tooltip hover state ── */
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    label: "",
  });

  const handleBarMouseMove = useCallback(
    (e: React.MouseEvent, item: BarChartItem) => {
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        value: item.value,
        label: prettifyCategory(item.label),
      });
    },
    []
  );

  const handleBarMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <>
      <div
        role="img"
        aria-label={ariaLabel}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "var(--bar-gap)",
          width: "100%",
          paddingBlockStart: "var(--space-4)",
          paddingBlockEnd: "var(--space-2)",
          overflowX: "auto",
          /*
           * min-width on each flex child prevents the chart from
           * collapsing on very narrow viewports — it scrolls instead.
           */
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{ flex: "1 1 0", minWidth: "48px" }}
          >
            <Bar
              heightPercent={(item.value / maxValue) * 100}
              label={prettifyCategory(item.label)}
              value={formatCurrency(item.value)}
              index={index}
              onClick={() => onBarClick?.(item.id)}
              isClickable={isInteractive}
              ariaLabel={`${prettifyCategory(item.label)}: ${formatCurrency(item.value)}${isInteractive ? ". Click to drill down." : ""}`}
              onBarMouseMove={(e) => handleBarMouseMove(e, item)}
              onBarMouseLeave={handleBarMouseLeave}
            />
          </div>
        ))}
      </div>

      {/* Cursor-following tooltip — rendered outside the chart flex container
          so it's not clipped by overflow:auto */}
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        value={tooltip.value}
        label={tooltip.label}
        levelTotal={levelTotal}
      />
    </>
  );
}
