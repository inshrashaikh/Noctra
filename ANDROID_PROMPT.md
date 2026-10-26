# Noctra Android App — Master Prompt (OpenCode)

## Context

Noctra is a night-time travel decision engine for night-shift workers in Nagpur.
The existing web app lives in `apps/web/` (React + Vite + TypeScript).
We need a new React Native (Expo) Android app at `apps/mobile/` that mirrors the core user flow.

Shared contracts/types are in `packages/contracts/src/schemas.ts` and `packages/contracts/src/index.ts`.
Mock data fixtures are in `apps/web/src/mocks/fixtures/`.

---

## Goal

Build `apps/mobile/` — a React Native Expo app for Android.
Scope: **MVP only** — core planner flow, nothing else.

---

## Screens (MVP only)

1. **HomeScreen** — Form to enter origin, destination, shift-end time, deadline, transport modes. On submit → calls plan service → navigates to ResultsScreen.
2. **ResultsScreen** — Shows list of route candidates. Each card shows: mode icon, ETA (best/expected/worst), risk badge, evidence label (KNOWN / PROBABLE / OUTDATED / UNKNOWN). Tap a card → selects it (highlight).
3. **ServicesScreen** (tab) — List of nearby essential services (hospitals, pharmacies, ATMs) with open/closed status and distance.

Navigation: Bottom tab navigator with 2 tabs: **Planner** (Home → Results stack) and **Services**.

---

## Data

Use the same mock data as the web app. Copy or import:
- `apps/web/src/mocks/fixtures/nurse-2-15am.ts` → mock plan response
- `apps/web/src/mocks/fixtures/services.ts` → mock services

Create a simple `src/services/mockPlanService.ts` that returns the mock fixtures directly (no MSW, no fetch).

---

## Tech Stack

- **Expo SDK 51** (managed workflow)
- **React Native** with TypeScript strict
- **Expo Router** v3 for navigation (file-based)
- **NativeWind v4** for styling (Tailwind classes)
- **TanStack Query v5** for data fetching
- **Zod** for form validation (reuse `JourneyFormSchema` logic from `packages/contracts`)

No maps, no MapLibre, no MSW, no complex state — keep it simple.

---

## Key Domain Types (from `packages/contracts`)

```ts
// Evidence freshness label
type EvidenceLabel = 'KNOWN' | 'PROBABLE' | 'OUTDATED' | 'UNKNOWN';

// Transport modes
type TransportMode = 'auto_rickshaw' | 'city_bus' | 'walk' | 'cab' | 'two_wheeler_taxi';

// Route candidate (simplified)
interface RouteCandidate {
  id: string;
  mode: TransportMode;
  eta_best_min: number;
  eta_expected_min: number;
  eta_worst_min: number;
  risk_score: number;        // 0–1, label as "Environmental risk proxy"
  evidence_label: EvidenceLabel;
  cost_inr_min: number;
  cost_inr_max: number;
  is_viable: boolean;
}

// Service point (simplified)
interface ServicePoint {
  id: string;
  name: string;
  kind: 'hospital' | 'pharmacy' | 'atm' | 'police' | 'petrol';
  is_open_now: boolean;
  distance_m: number;
  evidence_label: EvidenceLabel;
}
```

---

## Honesty Rules (must implement)

1. Every screen with mock data shows a **"SIMULATED DATA"** yellow banner at the top.
2. Risk score always labeled: `"Environmental risk proxy (not crime data)"`.
3. Evidence labels styled:
   - KNOWN → green
   - PROBABLE → yellow
   - OUTDATED → orange
   - UNKNOWN → red/gray

---

## File Structure

```
apps/mobile/
  app/
    (tabs)/
      _layout.tsx       ← bottom tab navigator
      index.tsx         ← Planner tab (HomeScreen)
      services.tsx      ← Services tab
    results.tsx         ← Results screen (pushed from index)
    _layout.tsx         ← root layout (QueryClient, fonts)
  src/
    components/
      RouteCard.tsx
      ServiceRow.tsx
      EvidenceBadge.tsx
      SimulatedBanner.tsx
    services/
      mockPlanService.ts
    types/
      domain.ts         ← simplified types (copy from contracts)
  app.json
  package.json
  tsconfig.json
  babel.config.js
  tailwind.config.js
```

---

## Instructions

1. Scaffold the Expo project with `npx create-expo-app apps/mobile --template blank-typescript`.
2. Install deps: `expo-router`, `nativewind`, `@tanstack/react-query`, `zod`, `@expo/vector-icons`.
3. Build all screens and components listed above.
4. Wire mock data — no real API calls.
5. Make sure the app runs on Android with `npx expo start --android`.
6. Add `mobile` workspace to root `pnpm-workspace.yaml`.

Do NOT add iOS-specific code, maps, auth, or anything outside the MVP scope.
