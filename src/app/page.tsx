/**
 * page.tsx — Home page (Server Component)
 *
 * This is intentionally minimal. The heavy lifting happens in
 * CostExplorerSection (a client component). Keeping the page as
 * a server component means Next.js can stream the shell instantly
 * while the client component hydrates and fetches data.
 */

import CostExplorerSection from "@/components/cost-explorer/CostExplorerSection";
import CloudMascot from "@/components/ui/CloudMascot";
import CloudWave from "@/components/CloudWave";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        zIndex: 1,            // sits above the fixed pixel-snow canvas (z-index: 0)
        overflow: "hidden",
        paddingBlockStart: "var(--space-8)",
        paddingBlockEnd: "var(--space-16)",
      }}
    >
      {/* Futuristic 3D wave visual at top surface */}
      <CloudWave />
      {/* Hero tagline */}
      <div
        style={{
          textAlign: "center",
          marginBlockEnd: "var(--space-8)",
          paddingInline: "var(--space-4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
          }}
        >
          <h1
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, var(--color-accent-bright), var(--color-accent), var(--color-accent-dim))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            CloudLens
          </h1>
          <CloudMascot />
        </div>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: "var(--color-text-muted)",
            marginBlockStart: "var(--space-2)",
          }}
        >
          Visualize and drill into your cloud spending
        </p>
      </div>

      <CostExplorerSection />
    </main>
  );
}
