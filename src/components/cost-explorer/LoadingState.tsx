/**
 * LoadingState.tsx — Skeleton loading placeholder
 *
 * WHY skeleton bars instead of a spinner:
 * Skeleton UIs preserve the spatial layout of the final content,
 * reducing layout shift and giving users a preview of what's
 * coming. The skeleton bars mimic the bar chart shape so the
 * transition from loading → loaded feels seamless.
 */

"use client";

export default function LoadingState() {
  /*
   * Generate pseudo-random bar heights for a realistic preview.
   * Using a fixed seed (index math) so the skeleton is deterministic —
   * no layout flicker across re-renders.
   */
  const skeletonBars = [65, 90, 45, 78, 55, 85, 40, 70];

  return (
    <div
      role="status"
      aria-label="Loading cost data"
      style={{ width: "100%" }}
    >
      {/* Skeleton bar chart */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "var(--space-2)",
          height: "var(--bar-max-height)",
          marginBlockEnd: "var(--space-8)",
          paddingBlockStart: "var(--space-4)",
        }}
      >
        {skeletonBars.map((height, i) => (
          <div
            key={i}
            style={{
              flex: "1 1 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-2)",
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <div
              className="skeleton-shimmer"
              style={{
                width: "100%",
                height: `${height}%`,
                borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                minHeight: "8px",
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: "60%",
                height: "10px",
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Skeleton table rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{
              height: "44px",
              borderRadius: "var(--radius-md)",
              /*
               * Stagger the animation delay so rows shimmer in
               * sequence rather than all at once.
               */
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading cost explorer data…</span>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}
