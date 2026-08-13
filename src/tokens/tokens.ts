/**
 * tokens.ts — TypeScript references to CSS custom properties
 *
 * WHY: Components import from here instead of typing raw CSS var()
 * strings. This gives us autocomplete, typo protection, and a single
 * place to see every available token. The values are CSS `var(…)`
 * expressions — they resolve at render time in the browser, not at
 * build time, so the actual colors come from globals.css.
 */

export const colors = {
  bgPrimary: "var(--color-bg-primary)",
  bgSecondary: "var(--color-bg-secondary)",
  bgCard: "var(--color-bg-card)",
  bgCardBorder: "var(--color-bg-card-border)",
  bgCardHover: "var(--color-bg-card-hover)",

  accent: "var(--color-accent)",
  accentDim: "var(--color-accent-dim)",
  accentBright: "var(--color-accent-bright)",
  accentHover: "var(--color-accent-hover)",
  accentMuted: "var(--color-accent-muted)",
  accentSubtle: "var(--color-accent-subtle)",

  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  textOnAccent: "var(--color-text-on-accent)",

  error: "var(--color-error)",
  errorBg: "var(--color-error-bg)",
  warning: "var(--color-warning)",

  compute: "var(--color-compute)",
  memory: "var(--color-memory)",
  other: "var(--color-other)",
} as const;

export const spacing = {
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  8: "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
  16: "var(--space-16)",
} as const;

export const radius = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  full: "var(--radius-full)",
} as const;

export const typography = {
  fontSans: "var(--font-sans)",
  fontMono: "var(--font-mono)",
  xs: "var(--text-xs)",
  sm: "var(--text-sm)",
  base: "var(--text-base)",
  lg: "var(--text-lg)",
  xl: "var(--text-xl)",
  "2xl": "var(--text-2xl)",
  "3xl": "var(--text-3xl)",
} as const;

export const shadows = {
  card: "var(--shadow-card)",
  glow: "var(--shadow-glow)",
} as const;

export const transitions = {
  easeSpring: "var(--ease-spring)",
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
} as const;

/**
 * Gradient presets for the bar chart.
 * Each gradient uses design-token colors for consistency.
 */
export const gradients = {
  bar: "linear-gradient(to top, var(--color-accent-dim), var(--color-accent))",
  barHover: "linear-gradient(to top, var(--color-accent), var(--color-accent-bright))",
  compute: "linear-gradient(to top, #1a9a6e, var(--color-compute))",
  memory: "linear-gradient(to top, #0284c7, var(--color-memory))",
  other: "linear-gradient(to top, #7c3aed, var(--color-other))",
} as const;
