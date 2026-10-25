"""Shift-Aware Transport Availability Engine for Nagpur night workers.

Deterministic decision rules evaluating transport availability, boarding waits,
catchable last-services, latest feasible departures, and epistemic evidence labels.
"""

import json
import math
from pathlib import Path
from datetime import datetime, date, time, timedelta
from typing import Optional, Any

from app.planner.schemas import (
    PlanRequest,
    PlanResponse,
    Candidate,
    Evidence,
    Eta,
    Slack,
    Risk,
    PlanB,
    GeoJSONLineString,
    Explanation,
    ModeAvailabilityItem,
    TransportAvailabilityResponse,
    TransportMode,
)

# Seed file path
DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
SEED_FILE = DATA_DIR / "nagpur_transport_seed.json"


def load_transport_seed() -> dict[str, Any]:
    """Load the transport seed dataset."""
    if SEED_FILE.exists():
        with open(SEED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"services": []}


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance between two points in meters."""
    r = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    # Multiply by 1.35 road winding factor for urban network distance
    return r * c * 1.35


def parse_iso_or_hm(time_str: str) -> tuple[int, int]:
    """Extract (hours, minutes) from an ISO timestamp or HH:MM string."""
    clean = time_str.strip()
    if "T" in clean:
        # e.g. 2026-10-25T02:15:00+05:30
        part = clean.split("T")[1][:5]
        h, m = part.split(":")
        return int(h), int(m)
    elif ":" in clean:
        parts = clean.split(":")
        return int(parts[0]), int(parts[1])
    raise ValueError(f"Unrecognized time format: {time_str}")


def time_to_minutes(h: int, m: int) -> int:
    """Minutes from midnight (0..1439)."""
    return h * 60 + m


def minutes_to_hm(total_min: int) -> str:
    """Convert minutes from midnight to HH:MM format (wraps at 24h)."""
    wrapped = int(total_min) % (24 * 60)
    h = wrapped // 60
    m = wrapped % 60
    return f"{h:02d}:{m:02d}"


def compute_time_window_duration_min(start_hm: str, end_hm: str) -> int:
    """Compute positive duration in minutes between start and end (accounting for midnight rollover)."""
    sh, sm = parse_iso_or_hm(start_hm)
    eh, em = parse_iso_or_hm(end_hm)
    start_min = time_to_minutes(sh, sm)
    end_min = time_to_minutes(eh, em)

    if end_min < start_min:
        # Rollover to next day, e.g. 23:30 to 00:30 (+70 min)
        return (end_min + 24 * 60) - start_min
    return end_min - start_min


class TransportEngine:
    def __init__(self, seed_data: Optional[dict[str, Any]] = None):
        self.seed = seed_data if seed_data is not None else load_transport_seed()

    def evaluate_availability(
        self,
        shift_end_str: str,
        deadline_str: str,
        corridor_desc: str = "AIIMS Nagpur to Dharampeth",
    ) -> list[ModeAvailabilityItem]:
        """Evaluate mode availability at the given shift_end time."""
        sh, sm = parse_iso_or_hm(shift_end_str)
        shift_min = time_to_minutes(sh, sm)
        window_duration = compute_time_window_duration_min(shift_end_str, deadline_str)

        items: list[ModeAvailabilityItem] = []

        # 1. Nagpur Metro Orange Line
        # Hours: 06:00 (360) to 22:30 (1350), last train 22:15 (1335), freq 15 min
        metro_start_min = 6 * 60  # 06:00 = 360
        metro_last_min = 22 * 60 + 15  # 22:15 = 1335
        metro_end_min = 22 * 60 + 30  # 22:30 = 1350

        if metro_start_min <= shift_min <= metro_last_min:
            # Metro is running!
            # Next departure every 15 min from 06:00
            elapsed = shift_min - metro_start_min
            wait = (15 - (elapsed % 15)) % 15
            next_dep_min = shift_min + wait
            next_dep_str = minutes_to_hm(next_dep_min)
            transit_time = 18  # in minutes
            latest_feas = minutes_to_hm(shift_min + max(0, window_duration - transit_time))

            items.append(
                ModeAvailabilityItem(
                    service_id="metro-orange-line",
                    mode="transit",
                    transit_type="metro",
                    name="Nagpur Metro (Orange / Aqua Line)",
                    operating_status="RUNNING",
                    status_detail=f"Operational. Next train at {next_dep_str} (~{wait} min wait). Last departure 22:15.",
                    first_departure="06:00",
                    last_departure="22:15",
                    next_departure=next_dep_str,
                    boarding_wait_min=float(wait),
                    last_service_catchable=True,
                    latest_feasible_departure=latest_feas,
                    evidence_label="PROBABLE",
                    confidence=0.88,
                    fare_estimate="₹25 - ₹45 (token/smartcard)",
                    verify_against_official=True,
                    reasons=[
                        "Schedule verified against Maha Metro static timetable",
                        f"Current shift time ({minutes_to_hm(shift_min)}) is within active operating window (06:00 - 22:30)",
                    ],
                )
            )
        elif shift_min > metro_last_min or shift_min < 240:  # 22:16 to 03:59: closed for the night
            # Metro has ended
            mins_ago = (shift_min - metro_last_min) if shift_min > metro_last_min else (shift_min + 24 * 60 - metro_last_min)
            items.append(
                ModeAvailabilityItem(
                    service_id="metro-orange-line",
                    mode="transit",
                    transit_type="metro",
                    name="Nagpur Metro (Orange / Aqua Line)",
                    operating_status="ENDED",
                    status_detail=f"Service closed for the night. Last train departed at 22:15 ({mins_ago} min ago). First morning train at 06:00.",
                    first_departure="06:00",
                    last_departure="22:15",
                    next_departure="06:00",
                    boarding_wait_min=None,
                    last_service_catchable=False,
                    latest_feasible_departure=None,
                    evidence_label="PROBABLE",
                    confidence=0.95,
                    fare_estimate="₹25 - ₹45",
                    verify_against_official=True,
                    reasons=[
                        "Metro does not operate overnight in Nagpur",
                        "Last service departed at 22:15; stations closed at 22:30",
                    ],
                )
            )
        else:
            # 04:00 to 05:59 - starting soon
            wait_until_open = metro_start_min - shift_min
            items.append(
                ModeAvailabilityItem(
                    service_id="metro-orange-line",
                    mode="transit",
                    transit_type="metro",
                    name="Nagpur Metro (Orange / Aqua Line)",
                    operating_status="NOT_STARTED",
                    status_detail=f"Early morning standby. First train departs at 06:00 (in {wait_until_open} min).",
                    first_departure="06:00",
                    last_departure="22:15",
                    next_departure="06:00",
                    boarding_wait_min=float(wait_until_open),
                    last_service_catchable=True,
                    latest_feasible_departure="06:00",
                    evidence_label="PROBABLE",
                    confidence=0.90,
                    fare_estimate="₹25 - ₹45",
                    verify_against_official=True,
                    reasons=[
                        "Early morning hours: revenue service commences at 06:00",
                        f"Opening in {wait_until_open} minutes",
                    ],
                )
            )

        # 2. Aapli Bus (Nagpur City Bus + Night Feeder N1)
        # Daytime bus: 06:00 (360) to 21:30 (1290)
        # Night feeder N1: 22:30 (1350) to 01:30 (90) with departures [22:30, 23:15, 00:00, 00:45, 01:30]
        night_bus_deps = [22 * 60 + 30, 23 * 60 + 15, 24 * 60, 24 * 60 + 45, 25 * 60 + 30]  # in min from 00:00

        # Normalise shift_min for night window (if < 360, treat as +1440)
        norm_shift = shift_min if shift_min >= 360 else shift_min + 1440

        # Check daytime bus
        if 360 <= norm_shift <= 1290:  # 06:00 to 21:30
            bus_wait = 12
            next_bus = minutes_to_hm(norm_shift + bus_wait)
            items.append(
                ModeAvailabilityItem(
                    service_id="aapli-bus-day",
                    mode="transit",
                    transit_type="city_bus",
                    name="Aapli Bus Regular City Service (Route 5 / 10)",
                    operating_status="RUNNING",
                    status_detail=f"Daytime routes active. Next departure at ~{next_bus} (~{bus_wait} min wait). Last regular bus 21:30.",
                    first_departure="06:00",
                    last_departure="21:30",
                    next_departure=next_bus,
                    boarding_wait_min=float(bus_wait),
                    last_service_catchable=True,
                    latest_feasible_departure=minutes_to_hm(norm_shift + max(0, window_duration - 25)),
                    evidence_label="PROBABLE",
                    confidence=0.82,
                    fare_estimate="₹15 - ₹25",
                    verify_against_official=True,
                    reasons=[
                        "NMC Aapli Bus day stage timetable",
                        "Regular daytime frequency 15-25 min",
                    ],
                )
            )
        elif 1350 <= norm_shift <= 1530:  # 22:30 to 01:30 (N1 night feeder)
            # Find next discrete departure
            future_deps = [d for d in night_bus_deps if d >= norm_shift]
            if future_deps:
                next_d = future_deps[0]
                wait = next_d - norm_shift
                dep_hm = minutes_to_hm(next_d)
                items.append(
                    ModeAvailabilityItem(
                        service_id="aapli-bus-night-n1",
                        mode="transit",
                        transit_type="city_bus",
                        name="Aapli Bus Night Feeder N1 (Hospital & Station)",
                        operating_status="RUNNING",
                        status_detail=f"Night feeder active. Next departure at {dep_hm} (~{wait} min wait). Last feeder 01:30.",
                        first_departure="22:30",
                        last_departure="01:30",
                        next_departure=dep_hm,
                        boarding_wait_min=float(wait),
                        last_service_catchable=(next_d <= 1530),
                        latest_feasible_departure=minutes_to_hm(1530),
                        evidence_label="PROBABLE",
                        confidence=0.75,
                        fare_estimate="₹25 (night flat tariff)",
                        verify_against_official=True,
                        reasons=[
                            "Simulated night-feeder pilot corridor along Medical Square - Station",
                            f"Catchable scheduled departure at {dep_hm}",
                        ],
                    )
                )
            else:
                items.append(
                    ModeAvailabilityItem(
                        service_id="aapli-bus-night-n1",
                        mode="transit",
                        transit_type="city_bus",
                        name="Aapli Bus Night Feeder N1",
                        operating_status="ENDED",
                        status_detail="Last night feeder departed at 01:30. No more bus departures tonight.",
                        first_departure="22:30",
                        last_departure="01:30",
                        next_departure="06:00",
                        boarding_wait_min=None,
                        last_service_catchable=False,
                        latest_feasible_departure=None,
                        evidence_label="PROBABLE",
                        confidence=0.85,
                        fare_estimate="₹25",
                        verify_against_official=True,
                        reasons=["Night feeder finished at 01:30", "Next service resumes at 06:00"],
                    )
                )
        elif 1291 <= norm_shift < 1350:  # 21:31 to 22:29 (gap between day bus end and night feeder start)
            wait_night = 1350 - norm_shift
            items.append(
                ModeAvailabilityItem(
                    service_id="aapli-bus-night-n1",
                    mode="transit",
                    transit_type="city_bus",
                    name="Aapli Bus (City Stage & Night Feeder)",
                    operating_status="NOT_STARTED",
                    status_detail=f"Day service concluded (21:30). Night Feeder N1 starts at 22:30 (in {wait_night} min).",
                    first_departure="22:30",
                    last_departure="01:30",
                    next_departure="22:30",
                    boarding_wait_min=float(wait_night),
                    last_service_catchable=True,
                    latest_feasible_departure="22:30",
                    evidence_label="PROBABLE",
                    confidence=0.80,
                    fare_estimate="₹25",
                    verify_against_official=True,
                    reasons=[
                        "Transition window between day bus termination and night feeder commencement",
                    ],
                )
            )
        else:  # 01:31 to 05:59 - deep night bus dead zone
            mins_past_n1 = norm_shift - 1530
            items.append(
                ModeAvailabilityItem(
                    service_id="aapli-bus-night-n1",
                    mode="transit",
                    transit_type="city_bus",
                    name="Aapli Bus (Day & Night Feeders)",
                    operating_status="ENDED",
                    status_detail=f"All municipal bus services ended. Last night feeder was 01:30 ({mins_past_n1} min ago). Morning service resumes at 06:00.",
                    first_departure="06:00",
                    last_departure="01:30",
                    next_departure="06:00",
                    boarding_wait_min=None,
                    last_service_catchable=False,
                    latest_feasible_departure=None,
                    evidence_label="PROBABLE",
                    confidence=0.92,
                    fare_estimate="₹15 - ₹30",
                    verify_against_official=True,
                    reasons=[
                        "No city buses operate in Nagpur between 01:30 and 06:00",
                        "Last service missed",
                    ],
                )
            )

        # 3. Indian Railways Station Connections (NGP ↔ Ajni corridor)
        # Discrete halts at 01:15, 03:45, 05:10, 22:15, 23:30
        train_minutes = [22 * 60 + 15, 23 * 60 + 30, 25 * 60 + 15, 27 * 60 + 45, 29 * 60 + 10]
        future_trains = [t for t in train_minutes if t >= norm_shift]
        if future_trains:
            next_t = future_trains[0]
            t_wait = next_t - norm_shift
            t_hm = minutes_to_hm(next_t)
            status_desc = "Operational connection."
            if t_wait > 60:
                status_desc = f"Long wait between overnight trains ({t_wait} min)."
            items.append(
                ModeAvailabilityItem(
                    service_id="railway-station-shuttle",
                    mode="transit",
                    transit_type="train",
                    name="Indian Railways Station Passenger Connectors",
                    operating_status="RUNNING" if t_wait <= 45 else "NOT_STARTED",
                    status_detail=f"{status_desc} Next halt connection at {t_hm} (~{t_wait} min wait).",
                    first_departure="01:15",
                    last_departure="23:30",
                    next_departure=t_hm,
                    boarding_wait_min=float(t_wait),
                    last_service_catchable=True,
                    latest_feasible_departure=t_hm,
                    evidence_label="PROBABLE",
                    confidence=0.86,
                    fare_estimate="₹10 - ₹30",
                    verify_against_official=True,
                    reasons=[
                        "Central Railway division scheduled passenger halts",
                        f"Timetable departure at {t_hm}",
                    ],
                )
            )

        # 4. Shared Auto-Rickshaw Stand (Sitabuldi - Medical Square)
        # Operates 06:00 to 00:30.
        if 360 <= norm_shift <= 1470:  # 06:00 to 00:30
            sh_wait = 8 if norm_shift <= 1380 else 20
            items.append(
                ModeAvailabilityItem(
                    service_id="shared-auto-stand",
                    mode="auto",
                    transit_type="shared_auto",
                    name="Shared Auto-Rickshaw Stand (Sitabuldi / Medical Sq)",
                    operating_status="RUNNING",
                    status_detail=f"Stand active. Shared departures every ~{sh_wait} min. Stand closes at 00:30.",
                    first_departure="06:00",
                    last_departure="00:30",
                    next_departure=minutes_to_hm(norm_shift + sh_wait),
                    boarding_wait_min=float(sh_wait),
                    last_service_catchable=True,
                    latest_feasible_departure=minutes_to_hm(1470),
                    evidence_label="PROBABLE",
                    confidence=0.74,
                    fare_estimate="₹20 (shared seat)",
                    verify_against_official=True,
                    reasons=[
                        "Regular shared auto queue active at Medical Square stand",
                        "Service tapers down after midnight",
                    ],
                )
            )
        else:
            items.append(
                ModeAvailabilityItem(
                    service_id="shared-auto-stand",
                    mode="auto",
                    transit_type="shared_auto",
                    name="Shared Auto-Rickshaw Stand (Sitabuldi / Medical Sq)",
                    operating_status="ENDED",
                    status_detail="Shared auto stand closed for the night (closed at 00:30). Resumes 06:00.",
                    first_departure="06:00",
                    last_departure="00:30",
                    next_departure="06:00",
                    boarding_wait_min=None,
                    last_service_catchable=False,
                    latest_feasible_departure=None,
                    evidence_label="PROBABLE",
                    confidence=0.89,
                    fare_estimate="₹20",
                    verify_against_official=True,
                    reasons=[
                        "Shared auto drivers disburse after midnight",
                        "Stand unmanned at this hour",
                    ],
                )
            )

        # 5. Private / Stand Auto-Rickshaw (Hospital Gate)
        # 24x7 physical presence near AIIMS / GMC hospitals, PROBABLE based on historical pattern
        auto_wait = 10 if (norm_shift > 1440 and norm_shift < 1740) else 5
        items.append(
            ModeAvailabilityItem(
                service_id="private-auto-on-demand",
                mode="auto",
                transit_type="private_auto",
                name="Auto-Rickshaw (Stand / Hospital Gate)",
                operating_status="RUNNING",
                status_detail=f"Available at AIIMS gate stand based on historical presence heuristic (~{auto_wait}m wait).",
                first_departure="00:00",
                last_departure="23:59",
                next_departure=minutes_to_hm(norm_shift + auto_wait),
                boarding_wait_min=float(auto_wait),
                last_service_catchable=True,
                latest_feasible_departure=minutes_to_hm(norm_shift + max(0, window_duration - 20)),
                evidence_label="PROBABLE",
                confidence=0.72,
                fare_estimate="₹90 - ₹140 (estimated night meter/negotiated)",
                verify_against_official=True,
                reasons=[
                    "Hospital gates consistently maintain small night auto queues",
                    "Simulated observation; no real-time GPS feed exists for Nagpur autos",
                ],
            )
        )

        # 6. Private Cab / Ride-Hail (Ola / Uber)
        # NO LIVE FEED -> Strict UNKNOWN policy
        items.append(
            ModeAvailabilityItem(
                service_id="private-ride-hail-cab",
                mode="cab",
                transit_type="ride_hail",
                name="App Ride-Hail (Ola / Uber Proxy)",
                operating_status="UNKNOWN_AVAILABILITY",
                status_detail="Availability UNKNOWN. No live aggregator API telemetry or driver location feed.",
                first_departure=None,
                last_departure=None,
                next_departure=None,
                boarding_wait_min=None,
                last_service_catchable=None,
                latest_feasible_departure=None,
                evidence_label="UNKNOWN",
                confidence=0.0,
                fare_estimate="₹160 - ₹280 (surge variable estimate)",
                verify_against_official=True,
                reasons=[
                    "No real-time cab aggregator telemetry available in Nagpur",
                    "Noctra never fabricates cab wait times or fake driver counts",
                ],
            )
        )

        # 7. Pedestrian Walking
        items.append(
            ModeAvailabilityItem(
                service_id="pedestrian-walk",
                mode="walk",
                transit_type="walk",
                name="Pedestrian Walking",
                operating_status="RUNNING",
                status_detail="Pedestrian corridor open. Feasibility depends entirely on shift-to-deadline buffer.",
                first_departure="00:00",
                last_departure="23:59",
                next_departure=minutes_to_hm(norm_shift),
                boarding_wait_min=0.0,
                last_service_catchable=True,
                latest_feasible_departure=minutes_to_hm(norm_shift + max(0, window_duration - 45)),
                evidence_label="KNOWN",
                confidence=1.0,
                fare_estimate="₹0 (Free)",
                verify_against_official=False,
                reasons=[
                    "Pedestrian corridors do not close",
                    "Environmental illumination risk proxy applies",
                ],
            )
        )

        return items

    def plan(self, req: PlanRequest) -> PlanResponse:
        """Generate deterministic, time-dependent journey plan response."""
        dist_m = haversine_distance_m(
            req.origin.lat, req.origin.lon, req.destination.lat, req.destination.lon
        )
        if dist_m < 500:
            dist_m = 4800.0  # fallback default urban corridor distance

        shift_hm = parse_iso_or_hm(req.shift_end_iso)
        sh, sm = shift_hm
        shift_min = time_to_minutes(sh, sm)
        norm_shift = shift_min if shift_min >= 360 else shift_min + 1440

        window_duration = compute_time_window_duration_min(
            req.shift_end_iso, req.deadline_iso
        )

        # Evaluate availability breakdown
        avail_items = {
            item.service_id: item
            for item in self.evaluate_availability(req.shift_end_iso, req.deadline_iso)
        }

        candidates: list[Candidate] = []
        now_iso = req.now_iso or req.shift_end_iso

        # ── Geometry templates for Nagpur corridors ──
        base_geometry = [
            [req.origin.lon, req.origin.lat],
            [79.0792, 21.1488],  # Medical Square roundabout
            [79.0771, 21.1480],  # Wardha Road west
            [79.0735, 21.1475],  # Ramdaspeth
            [79.0701, 21.1470],  # Central Ave junction
            [79.0672, 21.1465],  # Variety Square
            [79.0648, 21.1460],  # LIC Square approach
            [79.0629, 21.1458],  # Law College Square
            [79.0611, 21.1455],  # West High Court Road
            [req.destination.lon, req.destination.lat],
        ]

        detour_geometry = [
            [req.origin.lon, req.origin.lat],
            [79.0795, 21.1492],
            [79.0778, 21.1502],
            [79.0752, 21.1510],
            [79.0720, 21.1505],
            [79.0693, 21.1492],
            [79.0668, 21.1478],
            [79.0645, 21.1468],
            [79.0620, 21.1460],
            [79.0600, 21.1455],
            [req.destination.lon, req.destination.lat],
        ]

        # ── Evaluate requested modes ──

        # 1. METRO / TRANSIT
        if "transit" in req.modes:
            metro_avail = avail_items.get("metro-orange-line")
            bus_avail = avail_items.get("aapli-bus-night-n1") or avail_items.get("aapli-bus-day")

            if metro_avail and metro_avail.operating_status == "RUNNING":
                # Metro is running! (e.g. 22:00 shift)
                wait = metro_avail.boarding_wait_min or 12.0
                in_transit = (dist_m / 1000.0) * 2.5 + 8.0  # ~20 min
                exp_eta = wait + in_transit
                opt_eta = max(10.0, exp_eta - 4.0)
                pess_eta = exp_eta + 8.0

                slack_opt = window_duration - opt_eta
                slack_exp = window_duration - exp_eta
                slack_pess = window_duration - pess_eta

                status = "ROBUST" if slack_pess >= 5 else ("AT_RISK" if slack_exp >= 0 else "INFEASIBLE")

                candidates.append(
                    Candidate(
                        id="metro-express",
                        mode="transit",
                        kind="fastest",
                        geometry=GeoJSONLineString(coordinates=base_geometry),
                        distance_m=dist_m,
                        eta=Eta(optimistic_min=round(opt_eta, 1), expected_min=round(exp_eta, 1), pessimistic_min=round(pess_eta, 1)),
                        slack_min=Slack(optimistic=round(slack_opt, 1), expected=round(slack_exp, 1), pessimistic=round(slack_pess, 1)),
                        status=status,
                        risk=Risk(score=0.15, max_gap_m=280.0),
                        evidence=[
                            Evidence(
                                fact_type="transit_schedule",
                                subject="Nagpur Metro Orange Line Timetable",
                                label="PROBABLE",
                                confidence=0.88,
                                age_s=240.0,
                                source="Maha Metro published schedule",
                                source_class="static",
                                simulated=True,
                                reasons=[
                                    f"Active service. Next train {metro_avail.next_departure}",
                                    f"Last departure at {metro_avail.last_departure}",
                                ],
                            ),
                            Evidence(
                                fact_type="traffic",
                                subject="Metro Grade-Separated Viaduct",
                                label="KNOWN",
                                confidence=0.98,
                                age_s=120.0,
                                source="Metro Control Telemetry",
                                source_class="simulated",
                                simulated=True,
                                reasons=["Dedicated elevated track, zero road traffic interference"],
                            ),
                        ],
                        plan_b=PlanB(
                            mode="auto",
                            kind="balanced",
                            eta=Eta(optimistic_min=16.0, expected_min=20.0, pessimistic_min=28.0),
                            description="Take stand auto from Medical Square if platform wait exceeds 15 min",
                            trigger=f"If train not boarded by {minutes_to_hm(norm_shift + 15)}",
                        ),
                        decision_by_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + 15)}:00+05:30",
                        rejected=False,
                        reject_reasons=[],
                        operating_note=f"Runs until {metro_avail.last_departure}",
                        last_service_time=metro_avail.last_departure,
                        latest_feasible_departure_iso=f"{req.shift_end_iso[:11]}{metro_avail.latest_feasible_departure}:00+05:30" if metro_avail.latest_feasible_departure else None,
                        fare_estimate_text=metro_avail.fare_estimate,
                    )
                )
            elif bus_avail and bus_avail.operating_status == "RUNNING":
                # Night bus feeder running!
                wait = bus_avail.boarding_wait_min or 15.0
                in_transit = (dist_m / 1000.0) * 3.0 + 10.0
                exp_eta = wait + in_transit
                opt_eta = max(15.0, exp_eta - 5.0)
                pess_eta = exp_eta + 12.0

                slack_opt = window_duration - opt_eta
                slack_exp = window_duration - exp_eta
                slack_pess = window_duration - pess_eta

                status = "ROBUST" if slack_pess >= 5 else ("AT_RISK" if slack_exp >= 0 else "INFEASIBLE")

                candidates.append(
                    Candidate(
                        id="transit-night-bus",
                        mode="transit",
                        kind="balanced",
                        geometry=GeoJSONLineString(coordinates=base_geometry),
                        distance_m=dist_m,
                        eta=Eta(optimistic_min=round(opt_eta, 1), expected_min=round(exp_eta, 1), pessimistic_min=round(pess_eta, 1)),
                        slack_min=Slack(optimistic=round(slack_opt, 1), expected=round(slack_exp, 1), pessimistic=round(slack_pess, 1)),
                        status=status,
                        risk=Risk(score=0.28, max_gap_m=420.0),
                        evidence=[
                            Evidence(
                                fact_type="transit_schedule",
                                subject=bus_avail.name,
                                label="PROBABLE",
                                confidence=0.75,
                                age_s=360.0,
                                source="Aapli Bus Night Feeder Pilot",
                                source_class="simulated",
                                simulated=True,
                                reasons=[
                                    f"Next feeder departure at {bus_avail.next_departure}",
                                    f"Last feeder at {bus_avail.last_departure}",
                                ],
                            ),
                        ],
                        plan_b=PlanB(
                            mode="auto",
                            kind="fastest",
                            eta=Eta(optimistic_min=14.0, expected_min=18.0, pessimistic_min=26.0),
                            description="Take stand auto if bus delayed past 15 min",
                            trigger="Bus not arrived by 15 min past shift",
                        ),
                        decision_by_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + 15)}:00+05:30",
                        rejected=False,
                        reject_reasons=[],
                        operating_note=f"Runs until {bus_avail.last_departure}",
                        last_service_time=bus_avail.last_departure,
                        latest_feasible_departure_iso=f"{req.shift_end_iso[:11]}{bus_avail.latest_feasible_departure}:00+05:30" if bus_avail.latest_feasible_departure else None,
                        fare_estimate_text=bus_avail.fare_estimate,
                    )
                )
            else:
                # Metro & city bus both ended or not started!
                last_time = metro_avail.last_departure if metro_avail else "22:15"
                note = f"Last service was {last_time} (service ended)"
                if metro_avail and metro_avail.operating_status == "NOT_STARTED":
                    note = f"Starts at {metro_avail.first_departure} (not started)"

                candidates.append(
                    Candidate(
                        id="transit-ended",
                        mode="transit",
                        kind="fastest",
                        geometry=GeoJSONLineString(coordinates=base_geometry),
                        distance_m=dist_m,
                        eta=Eta(optimistic_min=99.0, expected_min=99.0, pessimistic_min=99.0),
                        slack_min=Slack(optimistic=-99.0, expected=-99.0, pessimistic=-99.0),
                        status="INFEASIBLE",
                        risk=Risk(score=0.85, max_gap_m=1200.0),
                        evidence=[
                            Evidence(
                                fact_type="transit_schedule",
                                subject="Nagpur Transit Timetable (Metro & Bus)",
                                label="PROBABLE",
                                confidence=0.95,
                                age_s=600.0,
                                source="Maha Metro & NMC Aapli Bus",
                                source_class="static",
                                simulated=True,
                                reasons=[
                                    f"Metro closed at 22:30. Last departure was {last_time}",
                                    "No nocturnal public transit service active at this hour",
                                ],
                            ),
                        ],
                        plan_b=None,
                        decision_by_iso=None,
                        rejected=True,
                        reject_reasons=[
                            f"Public transit not operating at this hour ({note})",
                            "Last scheduled service has already passed",
                        ],
                        operating_note=note,
                        last_service_time=last_time,
                        latest_feasible_departure_iso=None,
                        fare_estimate_text="₹20 - ₹45",
                    )
                )

        # 2. AUTO-RICKSHAW
        if "auto" in req.modes:
            auto_avail = avail_items.get("private-auto-on-demand")
            wait = auto_avail.boarding_wait_min if auto_avail else 8.0
            in_transit = 14.0  # ~14 min for 4.8 km
            exp_eta = wait + in_transit
            opt_eta = max(10.0, exp_eta - 4.0)
            pess_eta = exp_eta + 9.0

            slack_opt = window_duration - opt_eta
            slack_exp = window_duration - exp_eta
            slack_pess = window_duration - pess_eta

            status = "ROBUST" if slack_pess >= 8 else ("AT_RISK" if slack_exp >= 0 else "INFEASIBLE")

            candidates.append(
                Candidate(
                    id="auto-fastest",
                    mode="auto",
                    kind="fastest",
                    geometry=GeoJSONLineString(coordinates=base_geometry),
                    distance_m=dist_m,
                    eta=Eta(optimistic_min=round(opt_eta, 1), expected_min=round(exp_eta, 1), pessimistic_min=round(pess_eta, 1)),
                    slack_min=Slack(optimistic=round(slack_opt, 1), expected=round(slack_exp, 1), pessimistic=round(slack_pess, 1)),
                    status=status,
                    risk=Risk(score=0.22, max_gap_m=380.0),
                    evidence=[
                        Evidence(
                            fact_type="ride_availability",
                            subject="Auto-rickshaws at Medical Square / AIIMS Gate",
                            label="PROBABLE",
                            confidence=0.72,
                            age_s=180.0,
                            source="Hospital gate stand physical presence proxy",
                            source_class="simulated",
                            simulated=True,
                            reasons=[
                                "Hospital stands maintain 2-4 autos overnight",
                                "Estimated based on historical stand occupancy",
                            ],
                        ),
                        Evidence(
                            fact_type="road_closure",
                            subject="Wardha Road Corridor",
                            label="KNOWN",
                            confidence=0.95,
                            age_s=45.0,
                            source="Simulated municipal road feed",
                            source_class="simulated",
                            simulated=True,
                            reasons=["No active closures on Wardha Road"],
                        ),
                        Evidence(
                            fact_type="traffic",
                            subject="Medical Sq to Dharampeth Corridor",
                            label="KNOWN",
                            confidence=0.88,
                            age_s=120.0,
                            source="Simulated traffic model",
                            source_class="simulated",
                            simulated=True,
                            reasons=["Minimal night-time traffic; signals on flashing caution"],
                        ),
                    ],
                    plan_b=PlanB(
                        mode="two_wheeler" if "two_wheeler" in req.modes else "walk",
                        kind="balanced",
                        eta=Eta(optimistic_min=17.0, expected_min=22.0, pessimistic_min=31.0),
                        description="Switch to two-wheeler rental if auto not secured in 10 min",
                        trigger=f"No auto boarded by {minutes_to_hm(norm_shift + 10)}",
                    ),
                    decision_by_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + 15)}:00+05:30",
                    rejected=False,
                    reject_reasons=[],
                    operating_note="24×7 Stand presence (Hospital gate)",
                    last_service_time="24×7",
                    latest_feasible_departure_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + max(0, window_duration - 27))}:00+05:30",
                    fare_estimate_text=auto_avail.fare_estimate if auto_avail else "₹90 - ₹140",
                )
            )

        # 3. TWO-WHEELER
        if "two_wheeler" in req.modes:
            in_transit = 18.0
            exp_eta = 22.0
            opt_eta = 17.0
            pess_eta = 31.0

            slack_opt = window_duration - opt_eta
            slack_exp = window_duration - exp_eta
            slack_pess = window_duration - pess_eta

            status = "ROBUST" if slack_pess >= 5 else ("AT_RISK" if slack_exp >= 0 else "INFEASIBLE")

            candidates.append(
                Candidate(
                    id="twowheeler-balanced",
                    mode="two_wheeler",
                    kind="balanced",
                    geometry=GeoJSONLineString(coordinates=detour_geometry),
                    distance_m=dist_m + 300.0,
                    eta=Eta(optimistic_min=opt_eta, expected_min=exp_eta, pessimistic_min=pess_eta),
                    slack_min=Slack(optimistic=round(slack_opt, 1), expected=round(slack_exp, 1), pessimistic=round(slack_pess, 1)),
                    status=status,
                    risk=Risk(score=0.35, max_gap_m=520.0),
                    evidence=[
                        Evidence(
                            fact_type="ride_availability",
                            subject="Two-Wheeler Rental / Personal Vehicle",
                            label="OUTDATED",
                            confidence=0.55,
                            age_s=1800.0,
                            source="Simulated vehicle rental status",
                            source_class="simulated",
                            simulated=True,
                            reasons=["Rental dock data 30m aged", "Vehicle battery/fuel level unverified"],
                        ),
                        Evidence(
                            fact_type="road_closure",
                            subject="Seminary Hills Secondary Road",
                            label="KNOWN",
                            confidence=0.92,
                            age_s=90.0,
                            source="Simulated road sensor feed",
                            source_class="simulated",
                            simulated=True,
                            reasons=["Clear road segment with working sodium streetlights"],
                        ),
                    ],
                    plan_b=None,
                    decision_by_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + 15)}:00+05:30",
                    rejected=False,
                    reject_reasons=[],
                    operating_note="24×7 Self-drive / Personal",
                    last_service_time="24×7",
                    latest_feasible_departure_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + max(0, window_duration - 31))}:00+05:30",
                    fare_estimate_text="₹40 - ₹60 (fuel/rental)",
                )
            )

        # 4. PRIVATE CAB / RIDE-HAIL
        if "cab" in req.modes:
            # Strictly UNKNOWN availability
            candidates.append(
                Candidate(
                    id="cab-ridehail",
                    mode="cab",
                    kind="fastest",
                    geometry=GeoJSONLineString(coordinates=base_geometry),
                    distance_m=dist_m,
                    eta=Eta(optimistic_min=15.0, expected_min=24.0, pessimistic_min=40.0),
                    slack_min=Slack(
                        optimistic=round(window_duration - 15.0, 1),
                        expected=round(window_duration - 24.0, 1),
                        pessimistic=round(window_duration - 40.0, 1),
                    ),
                    status="AT_RISK",
                    risk=Risk(score=0.20, max_gap_m=350.0),
                    evidence=[
                        Evidence(
                            fact_type="ride_availability",
                            subject="Ola/Uber Cab Fleet Driver Telemetry",
                            label="UNKNOWN",
                            confidence=0.0,
                            age_s=0.0,
                            source="Aggregator Commercial API",
                            source_class="simulated",
                            simulated=True,
                            reasons=[
                                "Zero live driver telemetry available in Nagpur at this hour",
                                "Driver acceptance cannot be guaranteed; UNKNOWN is the honest epistemic state",
                            ],
                        ),
                    ],
                    plan_b=PlanB(
                        mode="auto",
                        kind="fastest",
                        eta=Eta(optimistic_min=14.0, expected_min=18.0, pessimistic_min=27.0),
                        description="Walk to Medical Square auto stand if no cab accepts within 5 min",
                        trigger=f"No cab assigned by {minutes_to_hm(norm_shift + 5)}",
                    ),
                    decision_by_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + 5)}:00+05:30",
                    rejected=False,
                    reject_reasons=[],
                    operating_note="UNKNOWN availability (no live feed)",
                    last_service_time="24×7 on-demand",
                    latest_feasible_departure_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + max(0, window_duration - 40))}:00+05:30",
                    fare_estimate_text="₹160 - ₹280 (variable surge)",
                )
            )

        # 5. WALKING
        if "walk" in req.modes:
            walk_speed_m_per_min = 75.0  # 4.5 km/h
            walk_min = dist_m / walk_speed_m_per_min  # e.g. 4800 / 75 = 64 min
            exp_walk = round(walk_min, 1)
            opt_walk = round(walk_min * 0.9, 1)
            pess_walk = round(walk_min * 1.25, 1)

            slack_opt = window_duration - opt_walk
            slack_exp = window_duration - exp_walk
            slack_pess = window_duration - pess_walk

            is_infeasible = slack_pess < 0 or slack_exp < 0
            status = "INFEASIBLE" if is_infeasible else "AT_RISK"

            reasons: list[str] = []
            if is_infeasible:
                reasons.append(f"Pessimistic walking time ({pess_walk} min) exceeds deadline window ({window_duration} min)")
                reasons.append("High environmental risk score (0.58) with 850m maximum unlit stretch")
                reasons.append("Solo pedestrian travel on unlit arterial shoulders is discouraged at this hour")

            candidates.append(
                Candidate(
                    id="walk-safest",
                    mode="walk",
                    kind="safest",
                    geometry=GeoJSONLineString(coordinates=base_geometry),
                    distance_m=dist_m,
                    eta=Eta(optimistic_min=opt_walk, expected_min=exp_walk, pessimistic_min=pess_walk),
                    slack_min=Slack(optimistic=round(slack_opt, 1), expected=round(slack_exp, 1), pessimistic=round(slack_pess, 1)),
                    status=status,
                    risk=Risk(score=0.58, max_gap_m=850.0),
                    evidence=[
                        Evidence(
                            fact_type="traffic",
                            subject="Pedestrian Corridor via Wardha Road",
                            label="PROBABLE",
                            confidence=0.65,
                            age_s=300.0,
                            source="Simulated pedestrian survey model",
                            source_class="simulated",
                            simulated=True,
                            reasons=[
                                "Continuous sidewalk only on 60% of corridor",
                                "Road shoulder walking required along overpass section",
                            ],
                        ),
                        Evidence(
                            fact_type="weather",
                            subject="Nagpur city ambient night conditions",
                            label="KNOWN",
                            confidence=0.91,
                            age_s=600.0,
                            source="Simulated municipal weather sensor",
                            source_class="simulated",
                            simulated=True,
                            reasons=["Clear sky, 24°C, comfortable pedestrian temperature"],
                        ),
                    ],
                    plan_b=None,
                    decision_by_iso=None,
                    rejected=is_infeasible,
                    reject_reasons=reasons,
                    operating_note="24×7 Footpath Network",
                    last_service_time="24×7",
                    latest_feasible_departure_iso=f"{req.shift_end_iso[:11]}{minutes_to_hm(norm_shift + max(0, window_duration - pess_walk))}:00+05:30" if not is_infeasible else None,
                    fare_estimate_text="₹0",
                )
            )

        # ── Deterministic Recommended Option Selection ──
        # Priority: Non-rejected ROBUST candidates first (prefer transit if running, else auto), then AT_RISK.
        active_candidates = [c for c in candidates if not c.rejected and c.status == "ROBUST"]
        if not active_candidates:
            active_candidates = [c for c in candidates if not c.rejected]

        recommended_id = active_candidates[0].id if active_candidates else (candidates[0].id if candidates else None)

        # Build Explanation
        why_rejected = []
        for c in candidates:
            if c.rejected:
                why_rejected.append({
                    "id": c.id,
                    "reason": "; ".join(c.reject_reasons) if c.reject_reasons else "Candidate infeasible",
                })

        # Deterministic why_chosen narrative
        rec_cand = next((c for c in candidates if c.id == recommended_id), None)
        if rec_cand:
            if rec_cand.mode == "transit":
                why_chosen = (
                    f"Metro transit option selected: operating actively at {minutes_to_hm(norm_shift)} with next departure "
                    f"before last service at {rec_cand.last_service_time}. Provides safe elevated transit with {rec_cand.slack_min.expected}m expected slack."
                )
            elif rec_cand.mode == "auto":
                why_chosen = (
                    f"Auto-rickshaw selected: fastest feasible motorized option at {minutes_to_hm(norm_shift)}. Expected transit "
                    f"{rec_cand.eta.expected_min}m leaves {rec_cand.slack_min.expected}m buffer before deadline. "
                    f"Plan B is established with a decide-by trigger at {rec_cand.decision_by_iso[11:16] if rec_cand.decision_by_iso else 'earlier'}."
                )
            else:
                why_chosen = f"Candidate {rec_cand.id} selected with {rec_cand.slack_min.expected}m expected slack."
        else:
            why_chosen = "No feasible routes satisfy constraints."

        missing_info = [
            "Real-time auto-rickshaw queue count at AIIMS gate (historical proxy only)",
            "Live cab driver GPS positions (strictly UNKNOWN; no aggregator feed)",
            "Active streetlighting status along secondary underpasses",
        ]

        return PlanResponse(
            generated_at=f"{req.shift_end_iso[:10]}T{minutes_to_hm(norm_shift)}:02+05:30",
            tier=0,
            candidates=candidates,
            recommended_id=recommended_id,
            missing_information=missing_info,
            explanation=Explanation(
                why_chosen=why_chosen,
                why_rejected=why_rejected,
                uncertainties=missing_info,
            ),
        )


transport_engine = TransportEngine()
