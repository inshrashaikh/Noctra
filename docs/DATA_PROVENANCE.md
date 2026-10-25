# Data Provenance & Honesty Policy

Noctra operates under strict epistemic honesty guidelines. Night shift workers depend on travel advice with their safety and punctuality; presenting unverified or guessed data as truth is unacceptable.

## 1. Epistemic Trust Classification

Every fact presented in Noctra is labeled with one of four states:

1. **KNOWN (Solid check / Teal #4FD1B5)**:
   - Fact verified by a live telemetry feed or recent direct observation within its specific Time-To-Live (TTL).
2. **PROBABLE (Half circle / Sky #7CB7FF)**:
   - Fact inferred from historical patterns or high-confidence probabilistic priors, but not directly confirmed in real-time.
3. **OUTDATED (Clock icon / Strikethrough / Amber #F2B54A)**:
   - Fact was previously KNOWN, but its age has exceeded its freshness window (1×TTL to 6×TTL).
4. **UNKNOWN (Dashed outline / "?" / Violet-grey #B0A8C9)**:
   - No reliable data available. Noctra explicitly communicates this knowledge gap.

## 2. Decay Rules (`decay.ts`)

Each fact type decays on a deterministic clock:
- **Ride Availability**: 300 seconds (5 min) TTL
- **Transit Schedule**: 600 seconds (10 min) TTL
- **Road Closure**: 1,800 seconds (30 min) TTL
- **Weather**: 3,600 seconds (1 hour) TTL
- **Facility Hours**: 30 days TTL

## 3. Risk Labeling Standard

Risk scores in Noctra are explicitly titled:
> **"Environmental risk proxy (not crime data)"**

Noctra computes risk solely based on environmental and physical factors:
- Density of 24×7 public refuges (hospitals, police stations, fuel stations)
- Street lighting and arterial road classifications
- Travel modality vulnerability
Noctra **never** claims to predict crime or present crime statistics.
