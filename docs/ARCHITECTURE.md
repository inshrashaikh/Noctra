# Architecture

## Repository Structure

### `apps/web/`
React frontend application built with Vite, TypeScript, and Tailwind CSS v4. Contains all UI components, route pages, feature modules, mock service layer, and tests.

### `apps/api/`
Python backend stub (FastAPI). Contains placeholder modules for the decision engine that will be built later. Currently serves only a `/health` endpoint concept.

### `packages/contracts/`
Single source of truth for API schemas (zod) and TypeScript types. Imported by both web and api to ensure contract compliance. Contains the evidence decay function.

### `packages/config/`
Shared configuration presets: TypeScript config base, ESLint rules, Prettier settings. Keeps tooling consistent across the monorepo.

### `data/`
Planned location for the Nagpur road graph, facility database, and data manifest (MANIFEST.json). Currently contains placeholder READMEs explaining the planned data structure.

### `docs/`
Project documentation: this architecture doc, design system reference, data provenance policy, demo guide, and architecture decision records (ADRs).

### `scripts/`
Shell scripts for development and CI: `dev.sh` (start dev server), `check.sh` (run all quality checks).

## Key Architectural Decisions

### Service Layer Abstraction
The `planService` interface abstracts the data source. The web app imports only the interface; at runtime, either the mock implementation (MSW-backed) or the real API client is selected based on `VITE_DATA_MODE`. This means the backend can be swapped in with zero UI changes.

### Evidence Decay
Labels (KNOWN/PROBABLE/OUTDATED/UNKNOWN) are computed by a pure function in `@noctra/contracts`. Each fact type has a TTL; as time passes, labels degrade. This function runs in both the frontend (for demo clock simulation) and will run in the backend.

### Tiered Connectivity
The app operates in three tiers:
- **Tier 0:** Full connectivity, live data
- **Tier 1:** Some feeds unavailable, cached data with OUTDATED labels
- **Tier 2:** Backend unreachable, last stored plan with UNKNOWN labels, emergency info shown

### Feature-Based Organization
Code is organized by feature domain (journey, routes, map, services, evidence, alerts, connectivity, demo) rather than by technical layer. Each feature folder contains its components, hooks, and feature-specific logic.

## Data Flow

```
User Input → JourneyForm → planService.plan() → [MSW | API] → PlanResponse
                                                                    ↓
                                                        RouteList, MapView, NightRibbon
                                                                    ↓
                                                        Evidence chips (with decay)
                                                                    ↓
                                                        User selects route → details
```
