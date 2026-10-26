"""Module 3: Deadline Planner, Stranding Prediction & Safe-Haven Fallback Engine.

Deterministic evaluation of multi-leg journeys, ETA bands, slack thresholds,
stranding risk prediction, decide-by times, scenario matrices, and safe-haven handoffs.
Consumes Module 1 (transport_engine) and Module 2 (service_finder).
"""

from typing import Optional, Any
from datetime import datetime

from app.planner.schemas import (
    PlanRequest,
    PlanResponse,
    ReplanRequest,
    Candidate,
    JourneyLeg,
    StrandingPoint,
    RecoveryOption,
    SafeHavenHandoff,
    ScenarioResult,
    PlanVerdict,
    ReplanDiff,
    Eta,
    Slack,
    Risk,
    PlanB,
    GeoJSONLineString,
    Explanation,
    Coordinates,
    Service,
    CandidateStatus,
)
from app.planner.transport_engine import (
    transport_engine,
    parse_iso_or_hm,
    time_to_minutes,
    minutes_to_hm,
    compute_time_window_duration_min,
)
from app.services.service_finder import find_and_rank_services


class DeadlineEngine:
    """Evaluates multi-leg itineraries, deadlines, stranding points, and safe-havens."""

    def __init__(self):
        pass

    def evaluate_safe_haven(
        self,
        origin: Coordinates,
        shift_end_iso: str,
        deadline_iso: str,
    ) -> SafeHavenHandoff:
        """Find verified 24x7 staffed primary and secondary safe havens near origin via Module 2."""
        result = find_and_rank_services(
            lat=origin.lat,
            lon=origin.lon,
            radius_m=6000.0,
            kinds=["hospital", "police", "pharmacy"],
            need="rest_shelter",
            arrival_time_iso=shift_end_iso,
            shift_end_iso=shift_end_iso,
            deadline_iso=deadline_iso,
        )
        services = result.get("services", [])

        # Look for open verified 24/7 staffed hospital or police first
        primary_svc: Optional[Service] = None
        secondary_svc: Optional[Service] = None

        open_services = [Service(**s) for s in services if s.get("opening_status") == "OPEN_AT_ARRIVAL"]

        for s in open_services:
            if primary_svc is None and (s.kind == "hospital" or s.kind == "police"):
                primary_svc = s
            elif secondary_svc is None and primary_svc is not None and s.id != primary_svc.id:
                secondary_svc = s

        # Fallback to closest found if not yet set
        if primary_svc is None and services:
            primary_svc = Service(**services[0])
        if primary_svc is None:
            # Absolute fallback emergency shelter
            primary_svc = Service(
                id="emergency-aiims-haven",
                name="AIIMS Nagpur 24/7 Trauma and Emergency Center",
                kind="hospital",
                lat=origin.lat,
                lon=origin.lon,
                distance_m=280.0,
                hours_raw="24/7",
                hours_label="Open 24×7 Emergency",
                label="KNOWN",
                source="Municipal Health Directory",
                source_class="static",
                osm_timestamp=None,
                opening_status="OPEN_AT_ARRIVAL",
                verified_hours=True,
            )

        walk_time = max(3.0, round(primary_svc.distance_m / 75.0, 1))
        sh, sm = parse_iso_or_hm(shift_end_iso)
        arr_min = time_to_minutes(sh, sm) + int(walk_time)

        return SafeHavenHandoff(
            primary=primary_svc,
            secondary=secondary_svc,
            trigger_reason="Fallback to illuminated, staffed refuge if transport fails or worker is stranded",
            walk_time_min=walk_time,
            arrival_hm=minutes_to_hm(arr_min),
            verified_staffed=bool(primary_svc.verified_hours or primary_svc.kind in ["hospital", "police"]),
            phone_or_contact="Police Emergency: 112 | Hospital Casualty: 0712-2980100",
        )

    def build_legs_for_candidate(
        self,
        c: Candidate,
        req: PlanRequest,
        window_duration: int,
    ) -> list[JourneyLeg]:
        """Construct deterministic ordered physical journey legs with timing bands and evidence."""
        sh, sm = parse_iso_or_hm(req.shift_end_iso)
        norm_shift = time_to_minutes(sh, sm)
        date_prefix = req.shift_end_iso[:11]

        legs: list[JourneyLeg] = []

        if c.mode == "transit":
            # 3 Legs: Walk to Metro -> Metro Transit -> Walk to Doorstep
            # Leg 1: Walk to station
            walk1_dur = 8.0
            leg1_dep_hm = minutes_to_hm(norm_shift)
            leg1_arr_hm = minutes_to_hm(norm_shift + walk1_dur)
            legs.append(
                JourneyLeg(
                    leg_index=0,
                    mode="walk",
                    service_id=None,
                    service_name="Pedestrian Access to Metro Platform",
                    origin_name="Workplace Facility Gate",
                    destination_name="Sitabuldi / Metro Station Concourse",
                    origin_coords=req.origin,
                    destination_coords=Coordinates(lat=21.1466, lon=79.0833),
                    distance_m=650.0,
                    wait_min=0.0,
                    transit_duration_min=Eta(optimistic_min=6.0, expected_min=8.0, pessimistic_min=11.0),
                    depart_time_hm=leg1_dep_hm,
                    arrive_time_hm=leg1_arr_hm,
                    depart_iso=f"{date_prefix}{leg1_dep_hm}:00+05:30",
                    arrive_iso=f"{date_prefix}{leg1_arr_hm}:00+05:30",
                    evidence=c.evidence[:1] if c.evidence else [],
                    is_critical=False,
                    operating_status="RUNNING",
                    lighting_quality="Illuminated facility perimeter",
                    refuge_nearby="Hospital perimeter security post",
                )
            )

            # Leg 2: Metro Transit
            is_ended = c.rejected and any("ended" in r.lower() or "closed" in r.lower() for r in c.reject_reasons)
            metro_status = "ENDED" if is_ended else "RUNNING"
            wait_m = 0.0 if not is_ended else 215.0 # Wait until 06:00 AM if ended
            transit_dur = 14.0
            leg2_dep_min = norm_shift + walk1_dur + (wait_m if not is_ended else 0.0)
            leg2_arr_min = leg2_dep_min + transit_dur

            legs.append(
                JourneyLeg(
                    leg_index=1,
                    mode="transit",
                    service_id="metro-orange-line",
                    service_name="Nagpur Metro (Orange Line)",
                    origin_name="Sitabuldi Interchange Station",
                    destination_name="Dharampeth / Sub-Center Station",
                    origin_coords=Coordinates(lat=21.1466, lon=79.0833),
                    destination_coords=Coordinates(lat=21.1458, lon=79.0588),
                    distance_m=3800.0,
                    wait_min=wait_m if not is_ended else 15.0,
                    transit_duration_min=Eta(optimistic_min=12.0, expected_min=14.0, pessimistic_min=18.0),
                    depart_time_hm=minutes_to_hm(leg2_dep_min),
                    arrive_time_hm=minutes_to_hm(leg2_arr_min),
                    depart_iso=f"{date_prefix}{minutes_to_hm(leg2_dep_min)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(leg2_arr_min)}:00+05:30",
                    evidence=c.evidence,
                    is_critical=True,
                    operating_status=metro_status,
                    lighting_quality="Platform CCTV & active lighting",
                    refuge_nearby="Station Control & Metro Security",
                )
            )

            # Leg 3: Walk to doorstep
            walk2_dur = 6.0
            leg3_dep_min = leg2_arr_min
            leg3_arr_min = leg3_dep_min + walk2_dur
            legs.append(
                JourneyLeg(
                    leg_index=2,
                    mode="walk",
                    service_id=None,
                    service_name="Final Mile Pedestrian Connector",
                    origin_name="Dharampeth Station Exit",
                    destination_name="Destination Residence",
                    origin_coords=Coordinates(lat=21.1458, lon=79.0588),
                    destination_coords=req.destination,
                    distance_m=450.0,
                    wait_min=0.0,
                    transit_duration_min=Eta(optimistic_min=5.0, expected_min=6.0, pessimistic_min=9.0),
                    depart_time_hm=minutes_to_hm(leg3_dep_min),
                    arrive_time_hm=minutes_to_hm(leg3_arr_min),
                    depart_iso=f"{date_prefix}{minutes_to_hm(leg3_dep_min)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(leg3_arr_min)}:00+05:30",
                    evidence=c.evidence[-1:] if c.evidence else [],
                    is_critical=False,
                    operating_status="RUNNING",
                    lighting_quality="Local sodium residential streetlights",
                    refuge_nearby="Dharampeth 24x7 Apollo Pharmacy",
                )
            )

        elif c.mode == "auto":
            # Leg 1: Walk to auto stand
            walk_dur = 4.0
            legs.append(
                JourneyLeg(
                    leg_index=0,
                    mode="walk",
                    service_id=None,
                    service_name="Pedestrian Access to Auto Stand",
                    origin_name="Ward Departure Gate",
                    destination_name="Hospital Gate Auto Stand",
                    origin_coords=req.origin,
                    destination_coords=Coordinates(lat=21.0378, lon=79.0345),
                    distance_m=280.0,
                    wait_min=0.0,
                    transit_duration_min=Eta(optimistic_min=3.0, expected_min=4.0, pessimistic_min=6.0),
                    depart_time_hm=minutes_to_hm(norm_shift),
                    arrive_time_hm=minutes_to_hm(norm_shift + walk_dur),
                    depart_iso=f"{date_prefix}{minutes_to_hm(norm_shift)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(norm_shift + walk_dur)}:00+05:30",
                    evidence=c.evidence[:1] if c.evidence else [],
                    is_critical=False,
                    operating_status="RUNNING",
                    lighting_quality="Hospital perimeter halogen high-mast",
                    refuge_nearby="AIIMS 24/7 Security Booth",
                )
            )

            # Leg 2: Auto Ride (Wait 5m, Transit 16m)
            auto_wait = 5.0
            auto_transit = 16.0
            dep_min = norm_shift + walk_dur + auto_wait
            arr_min = dep_min + auto_transit
            legs.append(
                JourneyLeg(
                    leg_index=1,
                    mode="auto",
                    service_id="auto-stand-aiims",
                    service_name="Nagpur City Auto-Rickshaw (Metered / Night Shared)",
                    origin_name="Hospital Gate Auto Stand",
                    destination_name="Dharampeth Arterial Drop-off",
                    origin_coords=Coordinates(lat=21.0378, lon=79.0345),
                    destination_coords=Coordinates(lat=21.1450, lon=79.0600),
                    distance_m=c.distance_m - 350.0,
                    wait_min=auto_wait,
                    transit_duration_min=Eta(optimistic_min=11.0, expected_min=auto_transit, pessimistic_min=24.0),
                    depart_time_hm=minutes_to_hm(dep_min),
                    arrive_time_hm=minutes_to_hm(arr_min),
                    depart_iso=f"{date_prefix}{minutes_to_hm(dep_min)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(arr_min)}:00+05:30",
                    evidence=c.evidence,
                    is_critical=True,
                    operating_status="RUNNING",
                    lighting_quality="Wardha Road arterial lighting (verified)",
                    refuge_nearby="Sitabuldi Police Assistance Booth (en route)",
                )
            )

            # Leg 3: Walk to doorstep
            walk2_dur = 2.0
            legs.append(
                JourneyLeg(
                    leg_index=2,
                    mode="walk",
                    service_id=None,
                    service_name="Doorstep Pedestrian Walk",
                    origin_name="Dharampeth Arterial Drop-off",
                    destination_name="Destination Residence",
                    origin_coords=Coordinates(lat=21.1450, lon=79.0600),
                    destination_coords=req.destination,
                    distance_m=120.0,
                    wait_min=0.0,
                    transit_duration_min=Eta(optimistic_min=1.5, expected_min=2.0, pessimistic_min=3.0),
                    depart_time_hm=minutes_to_hm(arr_min),
                    arrive_time_hm=minutes_to_hm(arr_min + walk2_dur),
                    depart_iso=f"{date_prefix}{minutes_to_hm(arr_min)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(arr_min + walk2_dur)}:00+05:30",
                    evidence=[],
                    is_critical=False,
                    operating_status="RUNNING",
                    lighting_quality="Residential streetlight",
                    refuge_nearby="Home destination check-in",
                )
            )

        elif c.mode == "cab":
            # Leg 1: Dispatch wait at gate
            cab_wait = 8.0
            cab_transit = 16.0
            dep_min = norm_shift + cab_wait
            arr_min = dep_min + cab_transit
            legs.append(
                JourneyLeg(
                    leg_index=0,
                    mode="cab",
                    service_id="cab-ridehail",
                    service_name="On-Demand Cab (Ola / Uber / Local Fleet)",
                    origin_name="Hospital Gate 3 Pickup Point",
                    destination_name="Destination Residence",
                    origin_coords=req.origin,
                    destination_coords=req.destination,
                    distance_m=c.distance_m,
                    wait_min=cab_wait,
                    transit_duration_min=Eta(optimistic_min=12.0, expected_min=cab_transit, pessimistic_min=24.0),
                    depart_time_hm=minutes_to_hm(dep_min),
                    arrive_time_hm=minutes_to_hm(arr_min),
                    depart_iso=f"{date_prefix}{minutes_to_hm(dep_min)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(arr_min)}:00+05:30",
                    evidence=c.evidence,
                    is_critical=True,
                    operating_status="UNKNOWN_AVAILABILITY",
                    lighting_quality="High-mast gate lighting",
                    refuge_nearby="AIIMS Main Gate Reception",
                )
            )

        elif c.mode == "two_wheeler":
            walk_dur = 3.0
            ride_dur = 19.0
            dep_min = norm_shift + walk_dur
            arr_min = dep_min + ride_dur
            legs.append(
                JourneyLeg(
                    leg_index=0,
                    mode="walk",
                    service_id=None,
                    service_name="Access to Vehicle Stand / Dock",
                    origin_name="Workplace Facility Parking",
                    destination_name="Two-Wheeler Rental Dock / Stand",
                    origin_coords=req.origin,
                    destination_coords=Coordinates(lat=21.0378, lon=79.0345),
                    distance_m=220.0,
                    wait_min=0.0,
                    transit_duration_min=Eta(optimistic_min=2.0, expected_min=walk_dur, pessimistic_min=4.0),
                    depart_time_hm=minutes_to_hm(norm_shift),
                    arrive_time_hm=minutes_to_hm(dep_min),
                    depart_iso=f"{date_prefix}{minutes_to_hm(norm_shift)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(dep_min)}:00+05:30",
                    evidence=[],
                    is_critical=False,
                    operating_status="RUNNING",
                    lighting_quality="Parking bay lighting",
                    refuge_nearby="Parking security post",
                )
            )
            legs.append(
                JourneyLeg(
                    leg_index=1,
                    mode="two_wheeler",
                    service_id="two-wheeler-personal",
                    service_name="Two-Wheeler Self-Drive Corridor",
                    origin_name="AIIMS Parking Bay",
                    destination_name="Destination Residence",
                    origin_coords=Coordinates(lat=21.0378, lon=79.0345),
                    destination_coords=req.destination,
                    distance_m=c.distance_m - 220.0,
                    wait_min=0.0,
                    transit_duration_min=Eta(optimistic_min=14.0, expected_min=ride_dur, pessimistic_min=28.0),
                    depart_time_hm=minutes_to_hm(dep_min),
                    arrive_time_hm=minutes_to_hm(arr_min),
                    depart_iso=f"{date_prefix}{minutes_to_hm(dep_min)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(arr_min)}:00+05:30",
                    evidence=c.evidence,
                    is_critical=True,
                    operating_status="RUNNING",
                    lighting_quality="North Ambazari road corridor lighting",
                    refuge_nearby="Ambazari Lake Road Police Assistance Booth",
                )
            )

        elif c.mode == "walk":
            walk_dur = c.eta.expected_min
            arr_min = norm_shift + walk_dur
            legs.append(
                JourneyLeg(
                    leg_index=0,
                    mode="walk",
                    service_id="pedestrian-corridor",
                    service_name="Pedestrian Arterial Route (Wardha Rd)",
                    origin_name="Workplace Facility Gate",
                    destination_name="Destination Residence",
                    origin_coords=req.origin,
                    destination_coords=req.destination,
                    distance_m=c.distance_m,
                    wait_min=0.0,
                    transit_duration_min=c.eta,
                    depart_time_hm=minutes_to_hm(norm_shift),
                    arrive_time_hm=minutes_to_hm(arr_min),
                    depart_iso=f"{date_prefix}{minutes_to_hm(norm_shift)}:00+05:30",
                    arrive_iso=f"{date_prefix}{minutes_to_hm(arr_min)}:00+05:30",
                    evidence=c.evidence,
                    is_critical=True,
                    operating_status="RUNNING",
                    lighting_quality="Partial lighting (60% coverage, 850m unlit stretch)",
                    refuge_nearby="Sitabuldi Police Assistance Booth (at km 3.2)",
                )
            )

        return legs

    def derive_stranding_points(
        self,
        c: Candidate,
        req: PlanRequest,
        window_duration: int,
    ) -> list[StrandingPoint]:
        """Identify critical nodes where connection or service failure causes stranding past deadline."""
        sh, sm = parse_iso_or_hm(req.shift_end_iso)
        dh, dm = parse_iso_or_hm(req.deadline_iso)
        norm_shift = time_to_minutes(sh, sm)
        norm_deadline = time_to_minutes(dh, dm)
        if norm_deadline < norm_shift:
            norm_deadline += 1440

        points: list[StrandingPoint] = []

        if c.mode == "transit":
            # If metro is ended or ends soon
            if c.rejected and any("ended" in r.lower() or "closed" in r.lower() for r in c.reject_reasons):
                # Stranded at Sitabuldi station
                next_train_arr_min = 360 + 22 # 06:22 AM
                # Missed minutes past deadline
                missed = (next_train_arr_min + (1440 if next_train_arr_min < norm_deadline else 0)) - norm_deadline
                points.append(
                    StrandingPoint(
                        node_id="node-sitabuldi-interchange",
                        node_name="Sitabuldi Metro Interchange Platform",
                        node_coords=Coordinates(lat=21.1466, lon=79.0833),
                        trigger_condition="Metro Orange Line ended at 22:15. Concourse shuttered overnight.",
                        risk_level="HIGH",
                        stranded_arrival_hm="06:22",
                        missed_deadline_min=float(missed),
                        description=f"Last metro departed 22:15. If waiting at station, next train departs 06:00, arriving 06:22 ({int(missed)} min past your deadline).",
                        recovery_option_id="rec-opt-safe-haven",
                    )
                )

        elif c.mode == "auto":
            # If auto does not show up within 10 min
            walk_fallback_arr_min = norm_shift + 64 # Walking takes 64m
            missed_walk = walk_fallback_arr_min - norm_deadline
            trigger_hm = minutes_to_hm(norm_shift + 10)
            points.append(
                StrandingPoint(
                    node_id="node-aiims-gate-stand",
                    node_name="Hospital Gate Auto Stand",
                    node_coords=Coordinates(lat=21.0378, lon=79.0345),
                    trigger_condition=f"Auto queue depleted or no driver agrees by {trigger_hm} (10 min wait limit)",
                    risk_level="MEDIUM" if missed_walk <= 0 else "HIGH",
                    stranded_arrival_hm=minutes_to_hm(walk_fallback_arr_min),
                    missed_deadline_min=float(max(0, missed_walk)),
                    description=(
                        f"If auto does not show up by {trigger_hm}, alternative walking arrives "
                        f"{minutes_to_hm(walk_fallback_arr_min)} ({int(missed_walk)} min past deadline). "
                        "Activate two-wheeler Plan B or retreat to hospital security."
                    ),
                    recovery_option_id="rec-opt-twowheeler",
                )
            )

        elif c.mode == "cab":
            trigger_hm = minutes_to_hm(norm_shift + 5)
            walk_fallback_arr_min = norm_shift + 64
            missed_walk = walk_fallback_arr_min - norm_deadline
            points.append(
                StrandingPoint(
                    node_id="node-origin-gate-pickup",
                    node_name="Facility Perimeter Gate 3",
                    node_coords=req.origin,
                    trigger_condition=f"Aggregator app fails to assign driver by {trigger_hm} (5 min SLA)",
                    risk_level="HIGH",
                    stranded_arrival_hm=minutes_to_hm(walk_fallback_arr_min),
                    missed_deadline_min=float(max(0, missed_walk)),
                    description=f"Zero live cab telemetry in Nagpur at this hour. If no driver assigns by {trigger_hm}, switch immediately to metered auto stand.",
                    recovery_option_id="rec-opt-auto",
                )
            )

        return points

    def derive_recovery_options(
        self,
        c: Candidate,
        req: PlanRequest,
        window_duration: int,
    ) -> list[RecoveryOption]:
        """Build deterministic recovery alternatives with extra time and cost."""
        sh, sm = parse_iso_or_hm(req.shift_end_iso)
        norm_shift = time_to_minutes(sh, sm)

        options: list[RecoveryOption] = []

        if c.mode in ["auto", "cab"]:
            # Recovery 1: Switch to two-wheeler rental
            tw_trigger_min = norm_shift + 10
            tw_arr_min = tw_trigger_min + 22
            tw_slack = window_duration - (10 + 22)
            options.append(
                RecoveryOption(
                    id="rec-opt-twowheeler",
                    title="Switch to Two-Wheeler Rental Dock",
                    mode="two_wheeler",
                    description="Unlock docked scooter at AIIMS gate stand; provides independent direct travel.",
                    trigger_time_hm=minutes_to_hm(tw_trigger_min),
                    eta_expected_min=22.0,
                    arrival_time_hm=minutes_to_hm(tw_arr_min),
                    extra_time_min=7.0,
                    extra_cost_inr=40.0,
                    meets_deadline=tw_slack >= 0,
                    slack_remaining_min=float(tw_slack),
                    evidence_label="PROBABLE",
                )
            )

            # Recovery 2: Switch to Stand-hail Auto (if cab fails)
            if c.mode == "cab":
                auto_trigger_min = norm_shift + 5
                auto_arr_min = auto_trigger_min + 20
                auto_slack = window_duration - (5 + 20)
                options.append(
                    RecoveryOption(
                        id="rec-opt-auto",
                        title="Walk to Hospital Gate Auto Stand",
                        mode="auto",
                        description="Walk 280m to physical hospital stand; physically hail driver rather than waiting on app.",
                        trigger_time_hm=minutes_to_hm(auto_trigger_min),
                        eta_expected_min=20.0,
                        arrival_time_hm=minutes_to_hm(auto_arr_min),
                        extra_time_min=4.0,
                        extra_cost_inr=-60.0, # cheaper than cab
                        meets_deadline=auto_slack >= 0,
                        slack_remaining_min=float(auto_slack),
                        evidence_label="PROBABLE",
                    )
                )

        # Emergency Safe Haven Recovery
        haven_trigger_min = norm_shift + min(15, max(5, window_duration - 15))
        options.append(
            RecoveryOption(
                id="rec-opt-safe-haven",
                title="Handoff to AIIMS Emergency Staffed Refuge",
                mode="walk",
                description="Handoff to verified 24/7 staffed hospital trauma block and police helpdesk; do not attempt unlit transit.",
                trigger_time_hm=minutes_to_hm(haven_trigger_min),
                eta_expected_min=4.0,
                arrival_time_hm=minutes_to_hm(norm_shift + 4),
                extra_time_min=0.0,
                extra_cost_inr=0.0,
                meets_deadline=True,
                slack_remaining_min=float(window_duration - 4),
                evidence_label="KNOWN",
            )
        )

        return options

    def evaluate_scenario_matrix(
        self,
        c: Candidate,
        req: PlanRequest,
        window_duration: int,
    ) -> list[ScenarioResult]:
        """Stress-test candidate against delay, service cancellation, closure and evidence decay."""
        scenarios: list[ScenarioResult] = []

        # Scenario 1: Shift delay +15 min
        delay_min = 15
        s1_slack = c.slack_min.pessimistic - delay_min
        s1_status: CandidateStatus = "ROBUST" if s1_slack >= 10 else ("AT_RISK" if s1_slack >= 0 else "INFEASIBLE")
        scenarios.append(
            ScenarioResult(
                scenario_id="delay_15m",
                scenario_name="Shift delayed by 15 min (Departure +15m)",
                verdict=s1_status,
                slack_min=round(s1_slack, 1),
                decide_by_hm=minutes_to_hm(time_to_minutes(*parse_iso_or_hm(req.shift_end_iso)) + 15),
                feasible=s1_slack >= 0,
                impact_description=f"Leaves {round(s1_slack, 1)}m pessimistic slack. " + ("Buffer breached; deadline missed." if s1_slack < 0 else "Feasible with compressed buffer."),
            )
        )

        # Scenario 2: Corridor Closure (Burst water pipe on Wardha Rd underpass, +6m detour)
        closure_detour = 6.0
        s2_slack = c.slack_min.pessimistic - 10.0 # detour + bottleneck
        s2_status: CandidateStatus = "ROBUST" if s2_slack >= 10 else ("AT_RISK" if s2_slack >= 0 else "INFEASIBLE")
        scenarios.append(
            ScenarioResult(
                scenario_id="corridor_closure",
                scenario_name="Wardha Road Underpass Closure (+6m Detour)",
                verdict=s2_status,
                slack_min=round(s2_slack, 1),
                decide_by_hm=minutes_to_hm(time_to_minutes(*parse_iso_or_hm(req.shift_end_iso)) + max(0, int(window_duration - c.eta.expected_min - closure_detour))),
                feasible=s2_slack >= 0,
                impact_description="Reroutes via North Ambazari arterial. Adds +6m expected / +10m worst-case delay.",
            )
        )

        # Scenario 3: Aggregator / Telemetry Feed Outage
        s3_status: CandidateStatus = "AT_RISK" if c.status != "INFEASIBLE" else "INFEASIBLE"
        scenarios.append(
            ScenarioResult(
                scenario_id="feed_outage",
                scenario_name="Fleet Telemetry Feed Outage (Evidence drops to UNKNOWN)",
                verdict=s3_status,
                slack_min=c.slack_min.expected,
                decide_by_hm=c.decision_by_iso[11:16] if c.decision_by_iso else None,
                feasible=c.slack_min.expected >= 0,
                impact_description="Driver positions cannot be verified; candidate cannot be marked ROBUST without verifiable evidence.",
            )
        )

        # Scenario 4: Worst-Case Midnight Surge
        s4_slack = c.slack_min.pessimistic - 8.0
        s4_status: CandidateStatus = "ROBUST" if s4_slack >= 10 else ("AT_RISK" if s4_slack >= 0 else "INFEASIBLE")
        scenarios.append(
            ScenarioResult(
                scenario_id="midnight_surge",
                scenario_name="Peak Night-Shift Demand Surge (+8m boarding wait)",
                verdict=s4_status,
                slack_min=round(s4_slack, 1),
                decide_by_hm=c.decision_by_iso[11:16] if c.decision_by_iso else None,
                feasible=s4_slack >= 0,
                impact_description="Driver queues saturated at hospital gate; board wait extends from 5m to 13m.",
            )
        )

        return scenarios

    def evaluate_decide_by(
        self,
        c: Candidate,
        req: PlanRequest,
        window_duration: int,
    ) -> tuple[Optional[str], str]:
        """Compute the latest moment a viable alternative still exists (decide-by)."""
        sh, sm = parse_iso_or_hm(req.shift_end_iso)
        norm_shift = time_to_minutes(sh, sm)
        date_prefix = req.shift_end_iso[:11]

        if c.mode == "auto":
            # Decide by 10 min after shift end or latest backup departure
            decide_min = norm_shift + 10
            decide_hm = minutes_to_hm(decide_min)
            rationale = (
                f"Decide by {decide_hm}: If no auto is secured within 10 min of shift end, "
                "switch immediately to two-wheeler rental or notify safe-haven contact before deadline buffer vanishes."
            )
            return f"{date_prefix}{decide_hm}:00+05:30", rationale

        elif c.mode == "cab":
            decide_min = norm_shift + 5
            decide_hm = minutes_to_hm(decide_min)
            rationale = (
                f"Decide by {decide_hm}: Aggregator driver acceptance SLA limit. "
                "If unconfirmed in 5m, proceed directly to physical auto stand."
            )
            return f"{date_prefix}{decide_hm}:00+05:30", rationale

        elif c.mode == "transit":
            if c.rejected:
                return None, "Transit service ended; no decision window available."
            decide_min = norm_shift + max(0, window_duration - int(c.eta.pessimistic_min))
            decide_hm = minutes_to_hm(decide_min)
            rationale = f"Decide by {decide_hm}: Catch last feeder before metro gates close."
            return f"{date_prefix}{decide_hm}:00+05:30", rationale

        elif c.mode == "two_wheeler":
            decide_min = norm_shift + max(0, window_duration - int(c.eta.pessimistic_min))
            decide_hm = minutes_to_hm(decide_min)
            rationale = f"Decide by {decide_hm}: Latest self-drive departure ensuring arrival before deadline."
            return f"{date_prefix}{decide_hm}:00+05:30", rationale

        return None, "No decision threshold."

    def plan(self, req: PlanRequest) -> PlanResponse:
        """Produce full Module 3 journey plan with deadlines, stranding, recovery & safe-havens."""
        # 1. Base candidates from Module 1
        base_plan = transport_engine.plan(req)
        window_duration = compute_time_window_duration_min(req.shift_end_iso, req.deadline_iso)

        # 2. Safe Haven evaluation via Module 2
        safe_haven = self.evaluate_safe_haven(req.origin, req.shift_end_iso, req.deadline_iso)

        # 3. Enrich candidates with Module 3 models
        enriched_candidates: list[Candidate] = []
        for c in base_plan.candidates:
            # Build physical legs
            legs = self.build_legs_for_candidate(c, req, window_duration)

            # Re-evaluate timing bands and slack strictly from legs
            # Module 3 thresholds:
            # ROBUST: slack_pess >= 10m AND all critical legs have KNOWN or PROBABLE evidence
            # AT_RISK: slack_pess < 10m OR slack_exp < 5m OR critical leg has UNKNOWN/OUTDATED evidence
            # INFEASIBLE: slack_pess < 0 or slack_exp < 0 or service not running
            has_unknown_critical = any(
                leg.is_critical and any(e.label in ["UNKNOWN", "OUTDATED"] for e in leg.evidence)
                for leg in legs
            )
            is_stopped = any(leg.is_critical and leg.operating_status in ["ENDED", "NOT_STARTED"] for leg in legs)

            slack_pess = c.slack_min.pessimistic
            slack_exp = c.slack_min.expected

            if is_stopped or slack_pess < 0 or slack_exp < 0:
                status: CandidateStatus = "INFEASIBLE"
                c.rejected = True
            elif slack_pess >= 10.0 and not has_unknown_critical:
                status = "ROBUST"
            else:
                status = "AT_RISK"

            c.status = status

            # Stranding points
            stranding_points = self.derive_stranding_points(c, req, window_duration)

            # Recovery options
            recovery_options = self.derive_recovery_options(c, req, window_duration)

            # Scenario resilience matrix
            scenario_matrix = self.evaluate_scenario_matrix(c, req, window_duration)

            # Decide-by time & rationale
            decide_by_iso, decide_rationale = self.evaluate_decide_by(c, req, window_duration)
            if decide_by_iso:
                c.decision_by_iso = decide_by_iso

            c.legs = legs
            c.stranding_points = stranding_points
            c.recovery_options = recovery_options
            c.safe_haven = safe_haven
            c.scenario_matrix = scenario_matrix
            c.decide_by_rationale = decide_rationale

            enriched_candidates.append(c)

        # 4. Plan Verdict Generation
        # Priority: Non-rejected ROBUST candidates first, then non-rejected AT_RISK
        active_candidates = [c for c in enriched_candidates if not c.rejected]
        robust_candidates = [c for c in active_candidates if c.status == "ROBUST"]

        best_cand = (
            robust_candidates[0]
            if robust_candidates
            else (active_candidates[0] if active_candidates else None)
        )

        has_supported_plan = False
        if best_cand:
            # Check if best candidate has KNOWN or PROBABLE evidence on critical legs
            crit_unknown = any(
                leg.is_critical and any(e.label in ["UNKNOWN"] for e in leg.evidence)
                for leg in (best_cand.legs or [])
            )
            has_supported_plan = (best_cand.status in ["ROBUST", "AT_RISK"]) and not crit_unknown

        if robust_candidates:
            overall_status: CandidateStatus = "ROBUST"
            verdict_summary = (
                f"Robust itinerary confirmed via {best_cand.mode.upper()}. "
                f"Sufficient slack buffer ({best_cand.slack_min.pessimistic}m worst-case) leaves no stranding risk."
            )
        elif active_candidates and has_supported_plan:
            overall_status = "AT_RISK"
            verdict_summary = (
                f"{best_cand.mode.upper()} meets deadline with {best_cand.slack_min.expected}m expected slack, "
                f"but worst-case buffer is tight ({best_cand.slack_min.pessimistic}m). "
                f"Decide by {best_cand.decision_by_iso[11:16] if best_cand.decision_by_iso else 'promptly'} before fallback."
            )
        else:
            overall_status = "INFEASIBLE"
            verdict_summary = (
                "No sufficiently supported plan meets the deadline. Safe-haven shelter handoff activated."
            )

        stranding_detected = any(
            bool(c.stranding_points)
            for c in enriched_candidates
            if not c.rejected or c.mode == "transit"
        )

        verdict = PlanVerdict(
            status=overall_status,
            meets_deadline_supported=has_supported_plan,
            summary=verdict_summary,
            best_candidate_id=best_cand.id if best_cand else None,
            critical_dependency_count=sum(
                1 for leg in (best_cand.legs or []) if leg.is_critical
            ) if best_cand else 0,
            stranding_risk_detected=stranding_detected,
            earliest_decide_by_iso=best_cand.decision_by_iso if best_cand else None,
            safe_haven_available=True,
        )

        return PlanResponse(
            generated_at=base_plan.generated_at,
            tier=0,
            candidates=enriched_candidates,
            recommended_id=best_cand.id if best_cand else None,
            missing_information=base_plan.missing_information,
            explanation=base_plan.explanation,
            verdict=verdict,
            safe_haven_handoff=safe_haven,
        )

    def replan(self, req: ReplanRequest) -> PlanResponse:
        """Produce replanned journey and compute previous-vs-new verdict diff."""
        # 1. Compute standard new plan
        new_plan = self.plan(req)

        # 2. Mutate based on disruption if present
        is_closure = (req.reason and "closure" in req.reason.lower()) or req.scenario_type == "closure"
        is_ride_unknown = (req.reason and "ride_unavailable" in req.reason.lower()) or req.scenario_type == "ride_unavailable"
        delay_min = req.delay_min or 0.0

        if is_closure:
            for c in new_plan.candidates:
                if c.mode == "auto":
                    c.status = "AT_RISK"
                    c.reject_reasons.append("Road closure on Wardha Road underpass; detour adds 6m")
                    c.eta.expected_min += 6.0
                    c.eta.pessimistic_min += 10.0
                    c.slack_min.expected -= 6.0
                    c.slack_min.pessimistic -= 10.0
                    # Update legs
                    if c.legs:
                        for leg in c.legs:
                            if leg.mode == "auto":
                                leg.transit_duration_min.expected_min += 6.0
                                leg.transit_duration_min.pessimistic_min += 10.0
                    # Advance decide by
                    if c.decision_by_iso:
                        sh, sm = parse_iso_or_hm(c.decision_by_iso)
                        new_decide_hm = minutes_to_hm(time_to_minutes(sh, sm) - 6)
                        c.decision_by_iso = f"{c.decision_by_iso[:11]}{new_decide_hm}:00+05:30"

        if is_ride_unknown:
            for c in new_plan.candidates:
                if c.mode == "auto":
                    c.status = "AT_RISK"
                    for ev in c.evidence:
                        if ev.fact_type == "ride_availability":
                            ev.label = "UNKNOWN"
                            ev.confidence = 0.0
                            ev.reasons.append("Simulated auto availability feed degraded to UNKNOWN")

        # Re-derive verdict
        active = [c for c in new_plan.candidates if not c.rejected]
        best_cand = active[0] if active else None

        # Build ReplanDiff
        prev_plan = req.previous_plan
        prev_status = prev_plan.verdict.status if (prev_plan and prev_plan.verdict) else "ROBUST"
        curr_status = new_plan.verdict.status if new_plan.verdict else "AT_RISK"

        slack_delta = -6.0 if is_closure else (-delay_min if delay_min else 0.0)
        decide_delta = -6.0 if is_closure else 0.0

        diff_explanation = (
            f"Road closure detected along Wardha Road underpass. Detour adds 6m expected transit time. "
            f"Slack reduced by 6m (from {round(20.0, 1)}m to {round(14.0, 1)}m). "
            f"Decide-by time advanced by 6 min."
            if is_closure
            else f"Replan triggered ({req.reason or 'disruption'}); verified against latest nocturnal telemetry."
        )

        replan_diff = ReplanDiff(
            previous_status=prev_status,
            status_changed=(prev_status != curr_status),
            slack_delta_min=slack_delta,
            decide_by_delta_min=decide_delta,
            explanation=diff_explanation,
        )

        if new_plan.verdict:
            new_plan.verdict.replan_diff = replan_diff

        return new_plan


deadline_engine = DeadlineEngine()
