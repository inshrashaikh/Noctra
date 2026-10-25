"""
Deterministic Essential Services Finder and Ranking Engine for Noctra.
Evaluates spatial proximity, arrival-time opening status, detour cost,
deadline feasibility impact, and epistemic evidence decay.
"""

from __future__ import annotations
import math
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional, Any, Tuple

from app.evidence.decay import compute_label
from app.services.opening_hours import evaluate_opening_status

def get_data_dir() -> Path:
    """Resolve data directory robustly across parent directories."""
    p = Path(__file__).resolve()
    for parent in p.parents:
        data_dir = parent / "data"
        if data_dir.exists() and (data_dir / "MANIFEST.json").exists():
            return data_dir
    return Path("data")


SERVICES_SEED_PATH = get_data_dir() / "nagpur_services_seed.json"

NEED_KIND_MAP: Dict[str, List[str]] = {
    "medicine": ["pharmacy", "hospital"],
    "food": ["restaurant", "dhaba", "chai_stall", "canteen_24h"],
    "fuel": ["fuel"],
    "emergency": ["hospital", "police"],
    "cash": ["atm"],
    "rest_shelter": ["shelter", "canteen_24h", "fuel", "water"],
    "water": ["water", "canteen_24h", "fuel", "dhaba"],
}

STATUS_RANK = {
    "OPEN_AT_ARRIVAL": 0,
    "CLOSING_SOON": 1,
    "OPENS_LATER": 2,
    "UNKNOWN": 3,
    "CLOSED_AT_ARRIVAL": 4,
}

EVIDENCE_RANK = {
    "KNOWN": 0,
    "PROBABLE": 1,
    "OUTDATED": 2,
    "UNKNOWN": 3,
}


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def load_services_seed() -> List[Dict[str, Any]]:
    """Load verified/simulated services seed records from disk."""
    if not SERVICES_SEED_PATH.exists():
        return []
    with open(SERVICES_SEED_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def find_and_rank_services(
    lat: float,
    lon: float,
    radius_m: float = 5000.0,
    kinds: Optional[List[str]] = None,
    need: Optional[str] = None,
    arrival_time_iso: Optional[str] = None,
    shift_end_iso: Optional[str] = None,
    deadline_iso: Optional[str] = None,
    origin_lat: Optional[float] = None,
    origin_lon: Optional[float] = None,
    dest_lat: Optional[float] = None,
    dest_lon: Optional[float] = None,
    closing_soon_margin_min: int = 30,
) -> Dict[str, Any]:
    """
    Core deterministic query function for Essential Services.
    Returns evaluated, ranked services with separate listing and opening evidence.
    """
    raw_services = load_services_seed()
    now_dt = datetime.now(timezone(timedelta(hours=5, minutes=30)))

    # Parse target arrival time or reference time
    ref_dt = now_dt
    if arrival_time_iso:
        try:
            ref_dt = datetime.fromisoformat(arrival_time_iso.replace("Z", "+00:00"))
        except Exception:
            pass
    elif shift_end_iso:
        try:
            ref_dt = datetime.fromisoformat(shift_end_iso.replace("Z", "+00:00"))
        except Exception:
            pass

    # Determine allowed kinds
    target_kinds = set()
    if need and need in NEED_KIND_MAP:
        target_kinds.update(NEED_KIND_MAP[need])
    if kinds:
        if target_kinds:
            target_kinds.intersection_update(kinds)
        else:
            target_kinds.update(kinds)

    # Calculate direct origin -> dest distance if corridor is supplied
    direct_corridor_m = 0.0
    if origin_lat is not None and origin_lon is not None and dest_lat is not None and dest_lon is not None:
        direct_corridor_m = haversine_distance_m(origin_lat, origin_lon, dest_lat, dest_lon)

    # Reference departure minutes and deadline minutes
    ref_min = ref_dt.hour * 60 + ref_dt.minute
    day_of_week = ref_dt.weekday()

    deadline_min = None
    if deadline_iso:
        try:
            dl_dt = datetime.fromisoformat(deadline_iso.replace("Z", "+00:00"))
            dl_val = dl_dt.hour * 60 + dl_dt.minute
            if dl_val < ref_min:
                dl_val += 1440
            deadline_min = dl_val
        except Exception:
            pass

    processed_services: List[Dict[str, Any]] = []

    for item in raw_services:
        s_kind = item.get("kind", "")
        if target_kinds and s_kind not in target_kinds:
            continue

        s_lat = float(item["lat"])
        s_lon = float(item["lon"])
        dist_m = haversine_distance_m(lat, lon, s_lat, s_lon)

        # Radius filter
        if dist_m > radius_m:
            continue

        # Travel time from reference point (assumes 75 m/min = 4.5 km/h pedestrian walk)
        walk_min_to_service = max(1, round(dist_m / 75.0))
        effective_arrival_min = (ref_min + walk_min_to_service) % 1440

        # Detour cost calculation
        if direct_corridor_m > 0 and origin_lat is not None and origin_lon is not None and dest_lat is not None and dest_lon is not None:
            leg1_m = haversine_distance_m(origin_lat, origin_lon, s_lat, s_lon)
            leg2_m = haversine_distance_m(s_lat, s_lon, dest_lat, dest_lon)
            detour_dist_m = max(0.0, (leg1_m + leg2_m) - direct_corridor_m)
            detour_min = max(0, round(detour_dist_m / 75.0))
        else:
            # Local visit detour
            detour_min = round((dist_m * 2) / 75.0)

        # Opening hours evaluation at effective arrival time
        eval_result = evaluate_opening_status(
            hours_raw=item.get("hours_raw"),
            arrival_time_min=effective_arrival_min,
            day_of_week=day_of_week,
            closing_soon_margin_min=closing_soon_margin_min,
            verified_hours=bool(item.get("verified_hours", False)),
            verification_source=item.get("verification_source"),
            source_class=item.get("source_class", "static"),
            has_conflict=False,
        )

        # Deadline feasibility & slack impact
        dwell_min = 10  # standard service transaction dwell
        slack_impact_min = None
        deadline_feasible = True

        if deadline_min is not None:
            # Minutes remaining to deadline from start
            total_slack = deadline_min - ref_min
            slack_impact_min = total_slack - (detour_min + dwell_min)
            deadline_feasible = slack_impact_min >= 0

        # Listing evidence (existence & location)
        osm_ts = item.get("osm_timestamp")
        listing_age_s = 86400.0 * 14  # default 14 days
        if osm_ts:
            try:
                parsed_ts = datetime.fromisoformat(osm_ts.replace("Z", "+00:00"))
                listing_age_s = max(0.0, (now_dt - parsed_ts).total_seconds())
            except Exception:
                pass

        orig_label = "KNOWN" if item.get("verified_hours") else "PROBABLE"
        listing_label = compute_label(orig_label, listing_age_s, "facility_hours")
        listing_evidence = {
            "fact_type": "facility_hours",
            "subject": f"listing:{item['id']}",
            "label": listing_label,
            "confidence": 0.90 if listing_label == "KNOWN" else 0.70,
            "age_s": listing_age_s,
            "source": item.get("source", "OpenStreetMap / Municipal Directory"),
            "source_class": item.get("source_class", "static"),
            "simulated": item.get("source_class") == "simulated",
            "reasons": [
                f"Facility existence listed in {item.get('source', 'directory')}",
                f"Source age: {int(listing_age_s / 86400)} days (TTL: 30 days)"
            ],
        }

        # Build explainability reasons
        status = eval_result["opening_status"]
        why_ranked = (
            f"{status.replace('_', ' ').title()} at expected arrival ({walk_min_to_service}m walk). "
            f"Adds {detour_min}m detour. "
            + (f"Slack remaining: {slack_impact_min}m." if slack_impact_min is not None else "")
        )

        uncertainties = []
        if eval_result["opening_evidence"]["label"] in ["PROBABLE", "OUTDATED", "UNKNOWN"]:
            uncertainties.append(
                f"Opening status is {eval_result['opening_evidence']['label']}: not confirmed by live telemetry."
            )
        if not item.get("verified_hours"):
            uncertainties.append("Operating hours derived from published schedule; night availability may vary.")
        if not deadline_feasible:
            uncertainties.append(f"Visiting this service will cause you to miss your deadline by {abs(slack_impact_min)}m.")

        service_entry = {
            "id": item["id"],
            "name": item["name"],
            "kind": s_kind,
            "lat": s_lat,
            "lon": s_lon,
            "distance_m": round(dist_m, 1),
            "hours_raw": item.get("hours_raw"),
            "hours_label": item.get("hours_label", "Unknown hours"),
            "label": listing_label,
            "source": item.get("source", "Directory"),
            "source_class": item.get("source_class", "static"),
            "osm_timestamp": osm_ts,
            # Module 2 extended fields
            "opening_status": status,
            "open_until": eval_result["open_until"],
            "opens_at": eval_result["opens_at"],
            "opening_note": eval_result["opening_note"],
            "verified_hours": bool(item.get("verified_hours", False)),
            "listing_evidence": listing_evidence,
            "opening_evidence": eval_result["opening_evidence"],
            "detour_min": detour_min,
            "slack_impact_min": slack_impact_min,
            "deadline_feasible": deadline_feasible,
            "why_ranked": why_ranked,
            "uncertainties": uncertainties,
        }
        processed_services.append(service_entry)

    # Deterministic ranking
    def sort_key(s: Dict[str, Any]) -> Tuple[int, int, int, int, float]:
        # 1. Feasibility (0 = feasible, 1 = infeasible)
        feas_penalty = 0 if s["deadline_feasible"] else 1
        # 2. Status rank
        s_rank = STATUS_RANK.get(s["opening_status"], 3)
        # 3. Opening evidence rank
        ev_rank = EVIDENCE_RANK.get(s["opening_evidence"]["label"], 2)
        # 4. Verified hours bonus
        verif_rank = 0 if s["verified_hours"] else 1
        # 5. Detour / distance
        return (feas_penalty, s_rank, ev_rank, verif_rank, s["detour_min"], s["distance_m"])

    processed_services.sort(key=sort_key)

    # Check if any supported option is available
    has_supported_option = any(
        s["deadline_feasible"] and s["opening_status"] in ["OPEN_AT_ARRIVAL", "CLOSING_SOON"]
        for s in processed_services
    )

    fallback_notice = None
    closest_fallback = None

    if not has_supported_option:
        fallback_notice = "no sufficiently supported option"
        if processed_services:
            closest_fallback = processed_services[0]

    return {
        "generated_at": now_dt.isoformat(),
        "arrival_time_iso": ref_dt.isoformat(),
        "services": processed_services,
        "total_found": len(processed_services),
        "fallback_notice": fallback_notice,
        "closest_fallback": closest_fallback,
    }
