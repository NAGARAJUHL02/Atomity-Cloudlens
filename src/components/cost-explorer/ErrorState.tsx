/**
 * ErrorState.tsx — Error view with retry capability
 *
 * WHY we show the actual error message:
 * In a dashboard context, knowing *why* the fetch failed (network
 * error, 500, etc.) helps the user decide whether to retry or
 * escalate. Generic "something went wrong" messages are less
 * useful for technical users.
 */

"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
      }}
    >
      {/* Error icon with tinted background */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-full)",
          background: "var(--color-error-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertTriangle
          size={24}
          style={{ color: "var(--color-error)" }}
          aria-hidden="true"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h3
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Failed to load cost data
        </h3>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            margin: 0,
            maxWidth: "360px",
          }}
        >
          {message}
        </p>
      </div>

      <button
        onClick={onRetry}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-2) var(--space-4)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          fontFamily: "inherit",
          color: "var(--color-text-on-accent)",
          background: "var(--color-accent)",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          transition: "background var(--duration-fast), transform var(--duration-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-accent-hover)";
          e.currentTarget.style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--color-accent)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label="Retry loading cost data"
      >
        <RefreshCw size={16} aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
