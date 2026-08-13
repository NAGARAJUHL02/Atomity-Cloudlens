/**
 * Breadcrumb.tsx — Drill-down navigation trail
 *
 * Shows "Cost Explorer" at the top level, and
 * "Cost Explorer / Category Name" when drilled into a cluster.
 * Clicking "Cost Explorer" navigates back up.
 */

"use client";

import { prettifyCategory } from "@/lib/transform";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  /** Currently active category slug, or null for top level */
  activeCategory: string | null;
  /** Callback to navigate back to cluster view */
  onNavigateBack: () => void;
}

export default function Breadcrumb({
  activeCategory,
  onNavigateBack,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Cost Explorer breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        fontSize: "var(--text-sm)",
        marginBlockEnd: "var(--space-4)",
      }}
    >
      {activeCategory ? (
        <>
          {/*
           * WHY <button> instead of <a>:
           * This is an in-page navigation action, not a URL change.
           * A button is semantically correct for triggering actions.
           */}
          <button
            onClick={onNavigateBack}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-accent)",
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
              fontFamily: "inherit",
              textDecoration: "none",
              transition: "color var(--duration-fast)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-accent-bright)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-accent)")
            }
            aria-label="Navigate back to all categories"
          >
            Cost Explorer
          </button>
          <ChevronRight
            size={14}
            style={{ color: "var(--color-text-muted)" }}
            aria-hidden="true"
          />
          <span style={{ color: "var(--color-text-secondary)" }}>
            {prettifyCategory(activeCategory)}
          </span>
        </>
      ) : (
        <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
          Cost Explorer
        </span>
      )}
    </nav>
  );
}
