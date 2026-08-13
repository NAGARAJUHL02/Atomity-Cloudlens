# Atomity CloudLens

A cloud cost visualization interface built for the Atomity Frontend Engineering Intern technical challenge.

---

## Overview

CloudLens is an interactive cloud cost intelligence dashboard that helps users understand and explore cloud spending at a glance. The interface centers on a **Cost Explorer** — a two-level drill-down experience that lets users move from a high-level category summary down into individual service-level breakdowns, all with smooth animated transitions and a real data fetch.

---

## Feature Recreated

**Cost Explorer** was selected as the feature to implement. It is the core utility of any FinOps product: showing where money is going, broken down by category and service. The challenge of building it well sits at the intersection of data transformation, state management, responsive layout, and animation — a good surface area for demonstrating frontend engineering depth.

The feature supports two navigation levels:

- **Cluster level** — shows all product categories side by side with total spend, a bar chart, and a summary table.
- **Service level** — clicking any category (bar or table row) drills in to show individual services within that category, each with a compute / memory / other cost breakdown.

---

## Key Features

- **Two-level drill-down navigation** — breadcrumb-based back navigation between the cluster and service views
- **Animated bar chart** — spring-physics bars that grow from zero on mount, with staggered entrance per bar index; bars are keyboard-navigable (`Tab`, `Enter`, `Space`)
- **Cursor-following tooltip** — displays cost and percentage-of-total on hover, rendered outside the chart container to avoid clipping
- **Stat chips row** — four summary pills (Compute, Memory, Other, Total) with staggered fade-in and inline SVG icons; updates when the active drill level changes
- **Animated total** — a spring-physics count-up animation on the total spend figure using Framer Motion's `useSpring` + `useTransform`, updating without re-renders
- **Semantic data tables** — real `<table>` elements with proper `<thead>`, `<th scope>`, and `aria-label` attributes; rows slide in with a staggered entrance animation
- **Responsive table columns** — breakdown columns (Compute, Memory, Other) hide automatically on narrow containers using CSS `@container` queries, not `@media` queries
- **Glassmorphism card** — `backdrop-filter: blur(16px)` card container that establishes a CSS container context for child responsiveness
- **CloudWave hero visual** — a full-width SVG animation at the top of the page with three parallax wave layers (mouse-following via Framer Motion springs), ambient particles, and atmospheric glow ellipses
- **Gradient wave heading accent** — a thin animated SVG wave line that drifts behind the "Cost Explorer" heading using CSS keyframes on the compositor thread
- **Interactive mascot** — a small SVG face near the heading whose pupils track the user's mouse cursor with spring easing; includes idle blinking, breathing, and eye-drift animations
- **Shape grid background** — a full-viewport canvas layer drawing a dim line grid with small cross markers at intersections; intersection dots randomly illuminate and fade in the accent colour palette
- **Skeleton loading state** — a shimmer animation placeholder rendered while data is fetching
- **Error state with retry** — surfaces the fetch error message and provides a retry button that calls `refetch()`
- **`prefers-reduced-motion` support** — every Framer Motion transition, CSS keyframe animation, and canvas loop checks this preference and either removes or pauses motion

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Animation | Framer Motion 13 |
| Data fetching & caching | TanStack Query (React Query) v5 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Fonts | Inter, JetBrains Mono (via `next/font/google`) |
| Icons | Hand-built inline SVGs (no icon library) |
| Data source | `dummyjson.com/products` (public REST API) |
| Build tool | Next.js built-in (Turbopack / webpack) |

> **Note on icons:** `lucide-react` is listed in `package.json` but is not imported anywhere in the current source. All icons in the UI are hand-drawn inline SVGs.

---

## Architecture

```
src/
├── app/
│   ├── globals.css        # Design token CSS custom properties + base styles
│   ├── layout.tsx         # Root layout — fonts, global providers, background canvas
│   ├── page.tsx           # Home page (Server Component) — composes the main sections
│   └── providers.tsx      # Client boundary — wraps children with QueryClientProvider
│
├── components/
│   ├── CloudWave.tsx      # Parallax SVG wave hero visual
│   ├── cost-explorer/     # Feature-specific components
│   │   ├── Bar.tsx            # Single animated bar (spring-physics height)
│   │   ├── BarChart.tsx       # Bar container + tooltip state owner
│   │   ├── Badge.tsx          # Category label pill
│   │   ├── Breadcrumb.tsx     # Drill-down back navigation
│   │   ├── CostExplorerSection.tsx  # Main orchestrator — drill-down state, data wiring
│   │   ├── DataTable.tsx      # ClusterTable + ServiceTable with @container queries
│   │   ├── ErrorState.tsx     # Error UI with retry
│   │   ├── GradientWave.tsx   # Animated accent line behind the heading
│   │   ├── LoadingState.tsx   # Skeleton shimmer placeholders
│   │   ├── StatChip.tsx       # Cost summary pill + StatChipsRow
│   │   └── Tooltip.tsx        # Cursor-following bar tooltip (portal-rendered)
│   └── ui/
│       ├── AnimatedNumber.tsx # Spring count-up number display
│       ├── Card.tsx           # Glassmorphism card container
│       ├── CloudMascot.tsx    # Mouse-tracking interactive SVG mascot
│       └── ShapeGrid.tsx      # Canvas shape-grid background animation
│
├── hooks/
│   └── useCostData.ts     # TanStack Query wrapper — fetch + transform + cache
│
├── lib/
│   ├── api.ts             # fetch() wrapper for dummyjson products endpoint
│   └── transform.ts       # Products → CostCluster transformation pipeline
│
├── tokens/
│   └── tokens.ts          # TypeScript references to CSS custom properties
│
└── types/
    └── cost.ts            # Shared TypeScript interfaces for the data model
```

The architecture is deliberately layered: `api.ts` knows only the URL, `transform.ts` knows only the data shape, `useCostData.ts` owns the query lifecycle, and `CostExplorerSection.tsx` owns UI state. No component reaches past its layer.

---

## Data Fetching & State

**Source:** `https://dummyjson.com/products?limit=40` — a public REST API that returns an array of product objects with `id`, `title`, `price`, `category`, `thumbnail`, `brand`, and `rating`.

**Fetching:** A plain `fetch()` call in `src/lib/api.ts`. TanStack Query wraps this in `useCostData.ts` via `useQuery`, providing automatic loading, error, and success states, plus a `staleTime` of 60 seconds so that drill-down navigation (which unmounts and remounts components) is served from cache instantly without re-fetching.

**Transformation:** Since the API provides only a single `price` per product, `src/lib/transform.ts` applies a deliberate modelling decision: it splits each price into Compute (40%), Memory (35%), and Other (25%). This mirrors how real cloud billing dashboards break a service's total cost into resource-type buckets. Products are then grouped by `category` into `CostCluster` objects and sorted descending by total spend.

**UI state:** Drill-down level (`"clusters"` | `"services"`) and the active cluster object are held in `useState` inside `CostExplorerSection`. Level transitions are animated with Framer Motion's `AnimatePresence` (`mode="wait"`).

---

## Animation Approach

All motion is driven by **Framer Motion**, except for simple looping ambient animations which use CSS keyframes (more efficient for compositor-thread-only work).

| Animation | Mechanism |
|---|---|
| Bar chart grow-in | `motion.button` spring physics (`stiffness: 80, damping: 15`), staggered by `index * 0.06s` |
| Bar idle glow pulse | CSS `@keyframes bar-glow-pulse` — `box-shadow` breathes on a 3-second alternate loop |
| Bar hover/focus | Framer Motion `whileHover` / `whileFocus` — `scale: 1.04` with `150ms` ease |
| Stat chips entrance | `motion.div` fade + translate, staggered by `index * 0.08s` |
| Table row entrance | `motion.tr` slide from `x: -12` to `x: 0`, staggered by `i * 0.04s` |
| Cost Explorer section entrance | `useInView` + `motion.div` — fires once when scrolled into view |
| Drill-down level transition | `AnimatePresence mode="wait"` — outgoing view exits fully before incoming view enters |
| Total spend count-up | `useSpring` → `useTransform` — updates DOM directly, no React re-renders per frame |
| CloudWave hero | Three SVG wave paths animated with CSS keyframes; parallax offset driven by `useSpring` on mouse position via `useMotionValue` + `useTransform` |
| Gradient wave (heading) | SVG `translateX` drift on an 8-second CSS `alternate` keyframe |
| CloudMascot pupils | `useSpring` on `useMotionValue` rawX/rawY — pupils track mouse cursor with configurable spring |
| CloudMascot blink | React state toggle on a randomised `setTimeout` schedule (2.5–6.5s) |
| CloudMascot float | Framer Motion `animate()` on a `useMotionValue` — 4-second `easeInOut` loop |
| Shape grid glow dots | Canvas `requestAnimationFrame` loop — opacity state machine (fade-in → hold → fade-out) |

---

## Design System & Tokens

All visual values are declared as CSS custom properties in `src/app/globals.css` and referenced through a TypeScript object in `src/tokens/tokens.ts`. No component contains a hard-coded colour or spacing value.

**Token categories:**
- **Colours** — surface backgrounds, card backgrounds, accent palette (emerald `#34d399`, mint `#6ee7b7`, muted `#2ab383`), text hierarchy, semantic colours per cost type (compute green, memory blue, other purple)
- **Spacing** — 4px-base scale from `--space-1` (0.25rem) through `--space-16` (4rem)
- **Typography** — `clamp()`-based fluid type scale, two font families (`--font-sans` Inter, `--font-mono` JetBrains Mono)
- **Radius** — six steps from `--radius-sm` to `--radius-full`
- **Shadows** — card shadow + emerald glow preset
- **Transitions** — spring easing curve + three duration steps
- **Gradients** — bar fill, bar hover, per-cost-type gradients (declared in `tokens.ts` for use in JS)

`color-mix()` is used for programmatic hover/tint variants directly in CSS, removing the need for extra hardcoded hex values.

---

## Responsive Design

- **Page layout** — `flexDirection: column; alignItems: center` with `max-width: 1200px` and horizontal padding keeps the content readable from mobile to wide desktop.
- **CloudWave hero** — height is reduced from 340px → 260px → 180px at 1024px and 640px breakpoints via scoped CSS media queries.
- **Bar chart** — `overflowX: auto` on the chart wrapper lets bars scroll horizontally rather than collapse on narrow viewports; each bar has a `minWidth: 48px`.
- **Data tables** — `@container (max-width: 500px)` hides the Compute / Memory / Other breakdown columns, keeping only Category, Services, and Total visible on narrow containers. This uses the card's `container-type: inline-size` context, so the table responds to its own width, not the viewport.
- **Stat chips row** — `flexWrap: wrap` allows chips to reflow onto a second line on mobile rather than overflowing.

---

## Accessibility

- Bar chart bars are `<button>` elements — fully keyboard-navigable with `Tab`, `Enter`, and `Space`
- Bar chart container has `role="img"` and `aria-label` for screen readers
- Data tables use semantic `<table>`, `<thead>`, `<th>`, `<tbody>` elements with `aria-label` on the table element
- Cluster table rows have `role="button"` and `aria-label` describing the drill-down action; they respond to `Enter` and `Space` via `onKeyDown`
- Stat chips row has `role="group"` and `aria-label="Cost breakdown summary"`
- All decorative elements (`CloudWave`, `GradientWave`, shape grid canvas, glow divs) are `aria-hidden="true"`
- All inline SVG icons in `StatChip` are `aria-hidden="true"` — their meaning is conveyed by the adjacent text label
- Every animated component reads `useReducedMotion()` and either skips or instantly completes its motion when `prefers-reduced-motion: reduce` is set
- A global `@media (prefers-reduced-motion: reduce)` rule in `globals.css` sets `animation-duration: 0.01ms` on all elements as a blanket fallback

---

## Engineering Decisions

**Layered data pipeline** — `api.ts`, `transform.ts`, and `useCostData.ts` are intentionally separate. Each file has one responsibility. This makes the transformation logic independently testable and makes swapping the data source a one-file change.

**CSS custom properties as the single source of truth** — every colour, spacing, and radius value lives in `globals.css`. The `tokens.ts` file exposes them as typed JS references so that inline styles in components stay refactorable without magic strings.

**`@container` queries over `@media` queries for the data table** — the table lives inside a card that can theoretically be placed at any width. Using the card as a container context means the table's column visibility adapts to its own intrinsic width rather than the viewport, making the component portable.

**`AnimatePresence mode="wait"` for drill-down transitions** — ensures the exiting view fully disappears before the entering view starts animating. Without this, both views would overlap during the transition and the layout would jump.

**Spring physics for bar height** — a `stiffness: 80 / damping: 15` spring gives bars a natural grow-in that subtly communicates magnitude through the speed of the animation. Taller bars take slightly longer to settle, which draws the eye.

**TanStack Query `staleTime: 60_000`** — since the `dummyjson` data is static, 60 seconds of caching means navigating back from a drill-down view is instant. Without this, every breadcrumb navigation would fire a new network request.

**Server Component page, Client Component section** — `page.tsx` is a Next.js Server Component that streams the HTML shell immediately. `CostExplorerSection` is a Client Component boundary that hydrates independently. This keeps the initial paint fast.

---

## Tradeoffs

- **Cost split ratios are fixed** — the 40% / 35% / 25% compute / memory / other split is a modelling assumption. In a real product these figures would come directly from a billing API. The tradeoff was acknowledged explicitly in the code comments and the UI's note callout.
- **Mock data source** — `dummyjson.com/products` is a product catalogue, not a cloud billing API. The transformation layer maps product categories to cloud cost clusters, which works for the purposes of the challenge but would be replaced with a real billing endpoint in production.
- **Inline `<style>` tags for scoped keyframes** — some components (Bar, GradientWave, DataTable) inject `<style>` tags inside JSX to keep scoped CSS animations co-located with the component logic. This avoids a CSS module setup but means duplicate `<style>` tags can appear if the component is rendered multiple times.
- **No chart library** — the bar chart is built from scratch. This gives full visual and interaction control, but means features like axes, legends, and responsive scaling are also custom work.

---

## Future Improvements

- **Date range filter** — allow users to select a time period and see cost trends over time rather than a snapshot
- **Proportional bar colouring** — shade bars by cost type (compute / memory / other) as stacked segments within each bar
- **Search and filter** — text input to filter categories or services in the table
- **Cost change indicators** — delta percentages (↑ 12% MoM) next to each cluster total, sourced from a comparison period
- **Persistent URL state** — encode the active drill-down level and cluster in the URL so users can share or bookmark a specific view
- **Unit tests** — `transformProductsToClusters` and `deriveCostBreakdown` in `transform.ts` are pure functions with clear inputs and outputs, making them straightforward to cover with Vitest or Jest
- **Virtualised table rows** — for large datasets, only rendering visible rows with a library like TanStack Virtual would keep the table performant

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

---

## Live Demo

```
LIVE_DEMO_URL_HERE
```

## Repository

```
GITHUB_REPOSITORY_URL_HERE
```