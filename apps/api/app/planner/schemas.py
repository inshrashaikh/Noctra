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
OperatingStatusMode = Literal[
    "RUNNING",
    "ENDED",
    "NOT_STARTED",
    "UNKNOWN_AVAILABILITY",
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


# ── Services (Module 2) ────────────────────────────────────────────

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


class ServicesResponse(BaseModel):
    generated_at: str
    arrival_time_iso: str
    services: list[Service]
    total_found: int
    fallback_notice: Optional[str] = None
    closest_fallback: Optional[Service] = None


# ── Module 3: Multi-Leg, Stranding, Recovery & Safe-Haven ──────────

class JourneyLeg(BaseModel):
    leg_index: int = Field(..., ge=0)
    mode: TransportMode
    service_id: Optional[str] = None
    service_name: str
    origin_name: str
    destination_name: str
    origin_coords: Coordinates
    destination_coords: Coordinates
    geometry: Optional[GeoJSONLineString] = None
    distance_m: float = Field(..., ge=0.0)
    wait_min: float = Field(..., ge=0.0)
    transit_duration_min: Eta
    depart_time_hm: str
    arrive_time_hm: str
    depart_iso: str
    arrive_iso: str
    evidence: list[Evidence] = Field(default_factory=list)
    is_critical: bool
    operating_status: Optional[OperatingStatusMode] = None
    lighting_quality: Optional[str] = None
    refuge_nearby: Optional[str] = None


class StrandingPoint(BaseModel):
    node_id: str
    node_name: str
    node_coords: Coordinates
    trigger_condition: str
    risk_level: Literal["HIGH", "MEDIUM", "LOW"]
    stranded_arrival_hm: Optional[str] = None
    missed_deadline_min: float
    description: str
    recovery_option_id: Optional[str] = None


class RecoveryOption(BaseModel):
    id: str
    title: str
    mode: TransportMode
    description: str
    trigger_time_hm: str
    eta_expected_min: float = Field(..., ge=0.0)
    arrival_time_hm: str
    extra_time_min: float
    extra_cost_inr: float
    meets_deadline: bool
    slack_remaining_min: float
    evidence_label: EvidenceLabel


class SafeHavenHandoff(BaseModel):
    primary: Service
    secondary: Optional[Service] = None
    trigger_reason: str
    walk_time_min: float = Field(..., ge=0.0)
    arrival_hm: str
    verified_staffed: bool = True
    phone_or_contact: Optional[str] = None


class ScenarioResult(BaseModel):
    scenario_id: str
    scenario_name: str
    verdict: CandidateStatus
    slack_min: float
    decide_by_hm: Optional[str] = None
    feasible: bool
    impact_description: str


class ReplanDiff(BaseModel):
    previous_status: Optional[CandidateStatus] = None
    status_changed: bool
    slack_delta_min: Optional[float] = None
    decide_by_delta_min: Optional[float] = None
    explanation: str


class PlanVerdict(BaseModel):
    status: CandidateStatus
    meets_deadline_supported: bool
    summary: str
    best_candidate_id: Optional[str] = None
    critical_dependency_count: int = 0
    stranding_risk_detected: bool = False
    earliest_decide_by_iso: Optional[str] = None
    safe_haven_available: bool = True
    replan_diff: Optional[ReplanDiff] = None


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
    # Module 3 additions
    legs: Optional[list[JourneyLeg]] = None
    stranding_points: Optional[list[StrandingPoint]] = None
    recovery_options: Optional[list[RecoveryOption]] = None
    safe_haven: Optional[SafeHavenHandoff] = None
    scenario_matrix: Optional[list[ScenarioResult]] = None
    decide_by_rationale: Optional[str] = None


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
    # Module 3 additions
    verdict: Optional[PlanVerdict] = None
    safe_haven_handoff: Optional[SafeHavenHandoff] = None


class ReplanRequest(PlanRequest):
    previous_plan_id: Optional[str] = None
    reason: Optional[str] = None
    scenario_type: Optional[str] = None
    delay_min: Optional[float] = None
    cancelled_mode: Optional[str] = None
    previous_plan: Optional[PlanResponse] = None


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
    operating_status: OperatingStatusMode
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
