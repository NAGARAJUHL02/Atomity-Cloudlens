/**
 * layout.tsx — Root layout for the Next.js App Router
 *
 * WHY Providers wraps {children}:
 * The root layout is a Server Component by default. We can't use
 * React context (QueryClientProvider) in a server component, so we
 * delegate to Providers — a "use client" boundary that holds all
 * client-side context providers.
 *
 * WHY Inter font via next/font:
 * next/font automatically self-hosts the font, avoids FOUT (flash
 * of unstyled text), and generates optimal font-display and
 * preload hints.
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "@/app/providers";
import ShapeGrid from "@/components/ui/ShapeGrid";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atomity CloudLens — Cost Explorer",
  description:
    "Interactive cloud cost drill-down dashboard with animated visualizations. Explore spend by category and drill into individual services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {/* Fixed shape-grid canvas — line grid with glowing intersection dots */}
        <ShapeGrid />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
