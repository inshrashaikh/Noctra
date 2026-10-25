"""Pydantic schemas mirroring @noctra/contracts."""

from typing import Literal, Optional, Any
from pydantic import BaseModel, Field

TransportMode = Literal["walk", "two_wheeler", "cab", "auto", "transit"]
RouteKind = Literal["fastest", "balanced", "safest"]
CandidateStatus = Literal["ROBUST", "AT_RISK", "INFEASIBLE"]
EvidenceLabel = Literal["KNOWN", "PROBABLE", "OUTDATED", "UNKNOWN"]
SourceClass = Literal["live", "cached", "static", "simulated"]
Tier = Literal[0, 1, 2]
ServiceKind = Literal[
    "hospital",
    "pharmacy",
    "police",
    "fuel",
    "atm",
    "shelter",
    "restaurant",
    "dhaba",
    "chai_stall",
    "canteen_24h",
    "water",
]
NeedType = Literal[
    "medicine",
    "food",
    "fuel",
    "emergency",
    "cash",
    "rest_shelter",
    "water",
]
OpeningStatus = Literal[
    "OPEN_AT_ARRIVAL",
    "CLOSING_SOON",
    "CLOSED_AT_ARRIVAL",
    "OPENS_LATER",
    "UNKNOWN",
]
FactType = Literal[
    "ride_availability",
    "transit_schedule",
    "road_closure",
    "weather",
    "facility_hours",
    "traffic",
]


class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


class Evidence(BaseModel):
    fact_type: FactType
    subject: str
    label: EvidenceLabel
    confidence: float = Field(..., ge=0.0, le=1.0)
    age_s: float = Field(..., ge=0.0)
    source: str
    source_class: SourceClass
    simulated: bool = True
    reasons: list[str] = Field(default_factory=list)


class Eta(BaseModel):
    optimistic_min: float = Field(..., ge=0.0)
    expected_min: float = Field(..., ge=0.0)
    pessimistic_min: float = Field(..., ge=0.0)


class Slack(BaseModel):
    optimistic: float
    expected: float
    pessimistic: float


class Risk(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0)
    max_gap_m: float = Field(..., ge=0.0)
    basis: Literal["environmental_proxy"] = "environmental_proxy"


class PlanB(BaseModel):
    mode: TransportMode
    kind: RouteKind
    eta: Eta
    description: str
    trigger: str


class GeoJSONLineString(BaseModel):
    type: Literal["LineString"] = "LineString"
    coordinates: list[list[float]]


class Candidate(BaseModel):
    id: str
    mode: TransportMode
    kind: RouteKind
    geometry: GeoJSONLineString
    distance_m: float = Field(..., ge=0.0)
    eta: Eta
    slack_min: Slack
    status: CandidateStatus
    risk: Risk
    evidence: list[Evidence] = Field(default_factory=list)
    plan_b: Optional[PlanB] = None
    decision_by_iso: Optional[str] = None
    rejected: bool = False
    reject_reasons: list[str] = Field(default_factory=list)
    # Transport availability metadata extensions
    operating_note: Optional[str] = None
    last_service_time: Optional[str] = None
    latest_feasible_departure_iso: Optional[str] = None
    fare_estimate_text: Optional[str] = None


class Explanation(BaseModel):
    why_chosen: str
    why_rejected: list[dict[str, str]] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)


class PlanRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    shift_end_iso: str
    deadline_iso: str
    modes: list[TransportMode] = Field(..., min_length=1)
    now_iso: Optional[str] = None


class PlanResponse(BaseModel):
    generated_at: str
    tier: Tier = 0
    candidates: list[Candidate] = Field(default_factory=list)
    recommended_id: Optional[str] = None
    missing_information: list[str] = Field(default_factory=list)
    explanation: Explanation


class ReplanRequest(PlanRequest):
    previous_plan_id: Optional[str] = None
    reason: Optional[str] = None


class ServicesRequest(BaseModel):
    lat: float
    lon: float
    kinds: Optional[list[ServiceKind]] = None
    radius_m: Optional[float] = None
    need: Optional[NeedType] = None
    arrival_time_iso: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lon: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lon: Optional[float] = None
    deadline_iso: Optional[str] = None


class Service(BaseModel):
    id: str
    name: str
    kind: ServiceKind
    lat: float
    lon: float
    distance_m: float = Field(..., ge=0.0)
    hours_raw: Optional[str] = None
    hours_label: str
    label: EvidenceLabel
    source: str
    source_class: SourceClass
    osm_timestamp: Optional[str] = None
    opening_status: Optional[OpeningStatus] = None
    open_until: Optional[str] = None
    opens_at: Optional[str] = None
    opening_note: Optional[str] = None
    verified_hours: Optional[bool] = None
    listing_evidence: Optional[Evidence] = None
    opening_evidence: Optional[Evidence] = None
    detour_min: Optional[int] = None
    slack_impact_min: Optional[int] = None
    deadline_feasible: Optional[bool] = None
    why_ranked: Optional[str] = None
    uncertainties: Optional[list[str]] = None


class ServicesResponse(BaseModel):
    generated_at: str
    arrival_time_iso: str
    services: list[Service]
    total_found: int
    fallback_notice: Optional[str] = None
    closest_fallback: Optional[Service] = None


class FeedStatus(BaseModel):
    name: str
    healthy: bool
    last_ok_iso: Optional[str] = None
    label: EvidenceLabel


class StatusResponse(BaseModel):
    tier: Tier = 0
    feeds: list[FeedStatus] = Field(default_factory=list)
    data_manifest: Optional[dict[str, Any]] = None


# Detailed availability breakdown item for GET /api/transport/availability
class ModeAvailabilityItem(BaseModel):
    service_id: str
    mode: TransportMode
    transit_type: str
    name: str
    operating_status: Literal["RUNNING", "ENDED", "NOT_STARTED", "UNKNOWN_AVAILABILITY"]
    status_detail: str
    first_departure: Optional[str] = None
    last_departure: Optional[str] = None
    next_departure: Optional[str] = None
    boarding_wait_min: Optional[float] = None
    last_service_catchable: Optional[bool] = None
    latest_feasible_departure: Optional[str] = None
    evidence_label: EvidenceLabel
    confidence: float
    fare_estimate: Optional[str] = None
    verify_against_official: bool = True
    reasons: list[str] = Field(default_factory=list)


class TransportAvailabilityResponse(BaseModel):
    shift_time: str
    deadline_time: str
    corridor: str
    evaluated_at: str
    modes: list[ModeAvailabilityItem]
