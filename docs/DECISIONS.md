# Architecture Decision Records (ADRs)

## ADR 001: Monorepo with Shared `@noctra/contracts` Package
- **Context:** The frontend and future Python decision engine must share identical data models without drift.
- **Decision:** Define single source of truth schemas in `packages/contracts` using Zod. Export TypeScript types and runtime validation schemas.
- **Consequence:** MSW mocks and real API requests guarantee 100% schema alignment.

## ADR 002: Dual-Mode Service Layer (`VITE_DATA_MODE`)
- **Context:** We need a fully working interactive prototype before the Python engine is complete.
- **Decision:** Abstract all data fetching behind the `PlanService` interface. At runtime, select `mockPlanService` (with MSW) or `apiPlanService` based on `VITE_DATA_MODE`.
- **Consequence:** Swapping to the real Python backend requires zero UI code modifications.

## ADR 003: Pure Decay Function for Epistemic Freshness
- **Context:** Data freshness decays over time; static data cannot be trusted indefinitely at night.
- **Decision:** Implement pure deterministic `computeLabel` function in `@noctra/contracts/src/decay.ts` parameterized by fact TTL.
- **Consequence:** Time advance events in the demo immediately degrade labels from KNOWN → OUTDATED → UNKNOWN.

## ADR 004: Dark Instrument Panel Aesthetic
- **Context:** Night shift workers use the application in pitch darkness or dimly lit transit corridors.
- **Decision:** High-contrast dark cockpit aesthetic with deep blues/grays (`#0F1419`, `#171E26`) and single warm amber accent (`#F2B54A`).
- **Consequence:** Eliminates eye strain; meets WCAG AA contrast standards.
