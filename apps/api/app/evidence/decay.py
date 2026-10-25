"""Decay logic for evidence freshness in Python.

Matches packages/contracts/src/decay.ts:
- Each fact type has a TTL in seconds.
- age <= TTL -> keeps original label.
- TTL < age <= 6*TTL -> OUTDATED.
- age > 6*TTL -> UNKNOWN.
- Labels never improve without a new observation.
"""

from typing import Literal

FactType = Literal[
    "ride_availability",
    "transit_schedule",
    "road_closure",
    "weather",
    "facility_hours",
    "traffic",
]

EvidenceLabel = Literal["KNOWN", "PROBABLE", "OUTDATED", "UNKNOWN"]

FACT_TTL: dict[FactType, int] = {
    "ride_availability": 300,
    "transit_schedule": 600,
    "road_closure": 1800,
    "weather": 3600,
    "facility_hours": 30 * 24 * 3600,
    "traffic": 300,
}

LABEL_RANK: dict[EvidenceLabel, int] = {
    "KNOWN": 0,
    "PROBABLE": 1,
    "OUTDATED": 2,
    "UNKNOWN": 3,
}


def compute_label(
    original_label: EvidenceLabel,
    age_s: float,
    fact_type: FactType,
) -> EvidenceLabel:
    """Compute the effective decayed label given age in seconds."""
    ttl_s = FACT_TTL.get(fact_type, 600)

    if age_s <= ttl_s:
        decayed = original_label
    elif age_s <= ttl_s * 6:
        decayed = "OUTDATED"
    else:
        decayed = "UNKNOWN"

    # Labels never improve without a fresh observation
    if LABEL_RANK[decayed] < LABEL_RANK[original_label]:
        return original_label

    return decayed
