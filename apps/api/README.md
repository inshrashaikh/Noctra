# Noctra Decision Engine API (Backend Stub)

This directory houses the future Python-based decision engine for Noctra.
In the current phase (Phase 1/Prototype), all typed contracts are mirrored by `@noctra/contracts` and served by MSW in `apps/web`.

## Planned Modules

- `app/planner/`: Multi-modal graph routing, deadline slack evaluation, candidate ranking.
- `app/risk/`: Environmental risk proxy computation based on lighting, refuge proximity, and road class.
- `app/evidence/`: Epistemic fact classification (KNOWN/PROBABLE/OUTDATED/UNKNOWN) and decay engine.
- `app/services/`: 24x7 refuge indexing (hospitals, pharmacies, police, fuel).
- `app/scenarios/`: Simulation injectors for testing demo conditions.

## Health Route

```bash
uvicorn app.main:app --port 8000 --reload
```
