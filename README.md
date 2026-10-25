# Noctra — Night-Time Decision Engine

> **"It's 2:30 AM. Your shift just ended. How do you get home safely?"**

Noctra is a night-time decision engine for night-shift workers in Nagpur. It shows feasible travel plans, deadline slack under best/expected/worst case, route risk evidence, essential services, and labels every fact as KNOWN, PROBABLE, OUTDATED, or UNKNOWN.

Built for **CASCADE '26 at IIIT Nagpur** — Problem 1.1: "The City That Sleeps While You Work."

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 9+
pnpm install
pnpm dev          # Start dev server at http://localhost:5173
```

### Demo Mode

Visit `http://localhost:5173/planner?demo=1` to see the interactive demo panel with scenario controls.

### Key URLs

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/planner` | Planner dashboard |
| `/planner?demo=1` | Dashboard with demo controls |
| `/about` | About & data provenance |

## Project Structure

```
noctra/
  apps/web/          → React frontend (Vite + TypeScript)
  apps/api/          → Python backend stub (FastAPI placeholder)
  packages/contracts/ → Shared zod schemas & TypeScript types
  packages/config/   → Shared config presets
  data/              → Data manifests and graph placeholders
  docs/              → Architecture, design system, decisions
  scripts/           → Dev and CI helper scripts
```

## Stack

- **Frontend:** React 18, TypeScript strict, Vite, Tailwind CSS v4, shadcn/ui
- **Routing:** TanStack Router + TanStack Query
- **State:** Zustand (small UI state)
- **Map:** MapLibre GL JS via react-map-gl
- **Mocking:** MSW (browser worker)
- **Tests:** Vitest + Testing Library + Playwright

## Data Modes

Set `VITE_DATA_MODE` in `.env`:
- `mock` — MSW intercepts API calls with simulated fixtures (default)
- `api` — Calls real backend at `VITE_API_BASE_URL`

## Honesty Principles

1. Mock data is never presented as live — every simulated data point shows a **SIMULATED** badge.
2. Risk scores are labeled **"Environmental risk proxy (not crime data)"**.
3. No invented transport timings, opening hours, or safety statistics.
4. Evidence labels degrade over time: KNOWN → PROBABLE → OUTDATED → UNKNOWN.

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright end-to-end tests
pnpm check        # All checks: typecheck + lint + test + build
```

## License

Built for CASCADE '26. Map data © OpenStreetMap contributors.
