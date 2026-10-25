# Data Provenance & Honesty Policy

Noctra operates under strict epistemic honesty guidelines. Night shift workers depend on travel advice with their safety and punctuality; presenting unverified or guessed data as truth is unacceptable.

## 1. Epistemic Trust Classification

Every fact presented in Noctra is labeled with one of four states:

1. **KNOWN (Solid check / Teal #4FD1B5)**:
   - Fact verified by a live telemetry feed or recent direct observation within its specific Time-To-Live (TTL).
2. **PROBABLE (Half circle / Sky #7CB7FF)**:
   - Fact inferred from historical patterns or published static timetables (e.g. Metro schedule within operating hours), but not directly confirmed in real-time.
3. **OUTDATED (Clock icon / Strikethrough / Amber #F2B54A)**:
   - Fact was previously KNOWN, but its age has exceeded its freshness window (1×TTL to 6×TTL).
4. **UNKNOWN (Dashed outline / "?" / Violet-grey #B0A8C9)**:
   - No reliable data available. Noctra explicitly communicates this knowledge gap. **Private cab and ride-hail availability without live API feeds is strictly UNKNOWN.** We never invent driver counts or fake wait times.

## 2. Decay Rules (`decay.ts` / `decay.py`)

Each fact type decays on a deterministic clock:
- **Ride Availability**: 300 seconds (5 min) TTL
- **Transit Schedule**: 600 seconds (10 min) TTL
- **Road Closure**: 1,800 seconds (30 min) TTL
- **Weather**: 3,600 seconds (1 hour) TTL
- **Facility Hours**: 30 days TTL
- **Traffic**: 300 seconds (5 min) TTL

## 3. Transport Timetable Seed & Operating Windows (`data/nagpur_transport_seed.json`)

To evaluate nocturnal journeys accurately, Noctra models real-world temporal limits for Nagpur, Maharashtra:
- **Nagpur Metro (Orange & Aqua Lines)**: Operational 06:00 to 22:30. Last departure ~22:00-22:15. Trips after 22:15 cannot catch the metro (`INFEASIBLE` / `NOT_RUNNING`).
- **Aapli Bus (City Stage)**: Daytime routes 06:00 to 21:45. Night feeder pilot (N1) 22:30 to 01:30. At 02:15, regular and night city buses have ceased.
- **Indian Railways (Nagpur Junction NGP ↔ Ajni AJNI)**: Discrete late night halt connections (e.g. 01:15, 03:45, 05:10).
- **Shared Auto Rickshaws**: Fixed stands operate evening until ~00:00-00:30 (Sitabuldi, Medical Square, Dharampeth). Defunct by 01:00.
- **Private Auto-Rickshaw**: Available near 24h hospital gates based on historical presence heuristics (`PROBABLE`).
- **Private Cab / Ride-Hail**: Labeled strictly `UNKNOWN`.

> **Honesty Notice:** All timetable records in `data/nagpur_transport_seed.json` carry `verify_against_official=true` and `source_class: "static"` or `"simulated"`. They are plausible representations for demonstration and verification, not live feeds.

## 4. Risk Labeling Standard

Risk scores in Noctra are explicitly titled:
> **"Environmental risk proxy (not crime data)"**

Noctra computes risk solely based on environmental and physical factors:
- Density of 24×7 public refuges (hospitals, police stations, fuel stations)
- Street lighting and arterial road classifications
- Travel modality vulnerability
Noctra **never** claims to predict crime or present crime statistics.

## 5. Essential Night Services Seed (data/nagpur_services_seed.json)

To prevent night-shift workers from arriving at closed facilities at 02:30 AM, Noctra models essential night services (medical, pharmacy, police, fuel, food, and water) with deterministic opening hours evaluation:
- **Two Separate Evidence Records**:
  1. *Listing Evidence*: Proves existence and location of the facility (decays on 30-day facility TTL).
  2. *Opening Status Evidence*: Evaluated strictly at arrival time. Scheduled hours from OpenStreetMap or commercial listings yield PROBABLE at best. Only facilities with recent official directory verification (e.g. AIIMS Emergency, Sitabuldi Police Booth, HP 24h Lit Forecourt) qualify as KNOWN. Informal or unverified stalls without published hours are strictly labeled UNKNOWN.
- **Temporal Truth across Shifts**:
  - *22:00*: Daytime pharmacies and family dining open.
  - *02:30*: Only 24x7 hospital pharmacies, all-night highway dhabas, 24x7 fuel forecourts, and police booths open; daytime retail closed.
  - *04:45*: Early dawn openers (station chai stalls, dairy milk booths) open while day stores remain shut.
- **Detour & Deadline Feasibility**: Extra travel minutes and deadline slack impact are calculated relative to the planned journey corridor. Services making the deadline infeasible are flagged or penalized.
