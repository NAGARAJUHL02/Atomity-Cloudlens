# CloudLens AI — Demo Build

> This is a working demo of the CloudLens AI platform UI, built with Next.js and Tailwind CSS.

## 🚀 Quick start

See the [Getting Started](docs/GETTING_STARTED.md) guide for full setup instructions.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## 🛠️ Tech stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Components**: Custom, framer-motion
- **Animations**: framer-motion, canvas
- **Icons**:lucide-react

## 📂 Project structure

```
cloudlens-ai/
├── app/               # Next.js pages
│   ├── (app)/         # Public pages
│   ├── (dashboard)/   # Authenticated dashboard
│   └── api/           # API routes
├── components/        # React components
│   ├── ui/            # UI primitives
│   ├── auth/          # Auth UI
│   ├── dashboard/     # Dashboard-specific components
│   └── docs/          # Documentation components
├── docs/              # Documentation (mdx)
├── lib/               # Utilities & helpers
├── styles/            # Global styles
└── middleware.ts      # Authentication middleware
```

## 🎨 Brand guidelines

### Colors

| Role             | Token                     | Value                          |
| ---------------- | ------------------------- | ------------------------------ |
| Primary brand    | `--color-primary`         | `#0b0d14`                      |
| Secondary brand  | `--color-secondary`       | `#282c34`                      |
| Accent           | `--color-accent`          | `#34d399` (`#6ee7b7` bright) |
| Success          | `--color-success`         | `#10b981`                      |
| Warning          | `--color-warning`         | `#f59e0b`                      |
| Error            | `--color-error`           | `#ef4444`                      |
| Background       | `--color-bg-page`         | `#070910`                      |
| Card             | `--color-bg-card`         | `#14161e`                      |
| Border           | `--color-border-muted`    | `#1f222a`                      |
| Subdued          | `--color-text-subdued`    | `#94a3b8` (`#475569` dark)   |
| Muted            | `--color-text-muted`      | `#e2e8f0` (`#94a3b8` dim)    |
| Heading          | `--color-text-heading`    | `#f1f5f9`                      |
| White/highlight  | `--color-text-white`      | `#ffffff`                      |
| White/dim        | `--color-text-white-dim`  | `#e2e8f0`                      |

> Full palette: [Design tokens](docs/DESIGN_TOKENS.md#color-tokens)

### Typography

| Role            | Font family      | Size range     | Weight    |
| --------------- | ---------------- | -------------- | --------- |
| Page headings   | Inter            | 40px – 72px    | 600–700   |
| Section headings | Inter            | 24px – 32px    | 500–600   |
| Body text       | Inter            | 14px – 16px    | 400–500   |
| Labels          | Inter            | 12px – 14px    | 500–600   |
| Monospace       | JetBrains Mono   | 12px – 14px    | 400–500   |

> Full details: [Typography](docs/DESIGN_TOKENS.md#typography-tokens)

### Spacing & layout

- **Base unit**: 4px
- **Spacing scale**: Multiples of 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80…)
- **Grid**: 8px-based layout with 40px section rhythm

> More info: [Spacing](docs/DESIGN_TOKENS.md#spacing-scale)

### Component specs

- **Cards**: Soft rounded corners (8px), elevation via subtle shadows, generous padding (20–32px).
- **Buttons**: Pill-shaped or rounded rectangles, clear hover/active states, sufficient contrast.
- **Input fields**: Clean, rounded, clear focus indicator.
- **Nav**: Compact header (64px tall) with subtle divider, clear current-page indicator.

> Full specs: [Component library](docs/COMPONENT_LIBRARY.md)

## 🎨 Unique UI patterns

### Accent color system

We use three accent colors to support different product areas:

- **Azure (`#34d399`)** — Primary, AI/insights, memory
- **Electric Indigo (`#a78bff`)** — Secondary, analysis, workflows
- **Neon cyan (`#22d3ee`)** — Tertiary, exploration, networking

All accents are used in:

- Status indicators (success, warning, error)
- Data visualizations
- Active states
- Brand accents

More: [Accent system](docs/DESIGN_TOKENS.md#color-system)

### Full-bleed background canvas

Public pages use a **full-bleed canvas effect**:

- Shape patterns
- Animated particles
- Cloud-like gradients
- Subtle motion (respects reduced motion)

Protected dashboard uses **muted dark mode** with minimal background decoration.

More: [Visual polish](docs/VISUAL_POLISH.md)

### Status indicators

- Success: green ring / badge
- Warning: amber ring / badge
- Error: red ring / badge
- Pending: purple pulsing ring

These appear in:

- Job list
- Navigation
- Status banners

More: [Status indicators](docs/FEATURE_SPECIFICATIONS.md#status-indicators)

### Navigation

- **Public sidebar**: Simple, compact navigation with clear active states.
- **Dashboard sidebar**: Compact, nested navigation with subtle highlighting.
- **Context menus & toast patterns**: Consistent patterns across the app.

More: [Navigation patterns](docs/NAVIGATION_PATTERNS.md)

### Component animations

- Smooth fades (0.3–0.6s)
- Subtle easing (ease-out, ease-in-out)
- Scale & transform animations
- Reduced-motion fallback

More: [Animation system](docs/ANIMATION_SYSTEM.md)

## 🎯 Dashboard feature areas

### Jobs list

- Grid with status badges
- Quick actions (run, pause, cancel)
- Color-coded status

More: [Job list](docs/FEATURE_SPECIFICATIONS.md#job-list)

### Job detail view

- **Main area**: Job info, controls, output
- **Right panel**: Related entities (knowledge, models, agents)
- **Side nav**: Breadcrumbs & navigation

More: [Job detail view](docs/FEATURE_SPECIFICATIONS.md#job-detail-view)

### Entity pages

- Knowledge pages
- Model pages
- Agent pages
- Job history

More: [Entity pages](docs/FEATURE_SPECIFICATIONS.md#entity-pages)

### Cloud configuration

- Multi-cloud selection
- Job-level overrides
- Security settings
- Monitoring preferences

More: [Cloud configuration](docs/FEATURE_SPECIFICATIONS.md#cloud-configuration)

### Search & discovery

- Unified search bar
- Entity search
- Recent searches
- Advanced filtering

More: [Search & discovery](docs/FEATURE_SPECIFICATIONS.md#search--discovery)

### Notifications & alerts

- Toast notifications
- In-app alerts
- Alert rules
- Notification preferences

More: [Notifications