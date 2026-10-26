"""Unit tests for Module 3: Deadline Planner, Stranding Prediction & Safe-Haven Fallback."""

import pytest
from app.planner.schemas import PlanRequest, ReplanRequest, Coordinates
from app.planner.deadline_engine import deadline_engine


@pytest.fixture
def nurse_request():
    return PlanRequest(
        origin=Coordinates(lat=21.0378, lon=79.0345),
        destination=Coordinates(lat=21.1458, lon=79.0882),
        shift_end_iso="2026-10-25T02:15:00+05:30",
        deadline_iso="2026-10-25T03:00:00+05:30",
        modes=["transit", "auto", "cab", "two_wheeler", "walk"],
    )


def test_multileg_itinerary_structure(nurse_request):
    """Each candidate journey must have physical ordered legs with depart/arrive and evidence."""
    plan = deadline_engine.plan(nurse_request)
    assert len(plan.candidates) >= 4

    auto_cand = next(c for c in plan.candidates if c.mode == "auto")
    assert auto_cand.legs is not None
    assert len(auto_cand.legs) >= 3

    # Check leg indexing and order
    for idx, leg in enumerate(auto_cand.legs):
        assert leg.leg_index == idx
        assert leg.depart_time_hm is not None
        assert leg.arrive_time_hm is not None
        assert leg.distance_m >= 0

    # Auto ride leg must be marked critical
    critical_legs = [leg for leg in auto_cand.legs if leg.is_critical]
    assert len(critical_legs) == 1
    assert critical_legs[0].mode == "auto"


def test_slack_and_status_derivation_thresholds(nurse_request):
    """Test deterministic status assignment based on slack thresholds and evidence labels."""
    plan = deadline_engine.plan(nurse_request)

    # Metro at 02:15 is ended -> INFEASIBLE & rejected
    transit_cand = next(c for c in plan.candidates if c.mode == "transit")
    assert transit_cand.status == "INFEASIBLE"
    assert transit_cand.rejected is True

    # Cab has UNKNOWN driver telemetry -> AT_RISK
    cab_cand = next(c for c in plan.candidates if c.mode == "cab")
    assert cab_cand.status == "AT_RISK"

    # Walk at 02:15 (45 min window) requires ~64-80m -> INFEASIBLE (slack < 0)
    walk_cand = next(c for c in plan.candidates if c.mode == "walk")
    assert walk_cand.status == "INFEASIBLE"
    assert walk_cand.slack_min.expected < 0
    assert walk_cand.rejected is True


def test_stranding_prediction_at_0215(nurse_request):
    """Engine must flag stranding points with node, trigger, and missed deadline slack."""
    plan = deadline_engine.plan(nurse_request)

    # Transit stranding point
    transit_cand = next(c for c in plan.candidates if c.mode == "transit")
    assert transit_cand.stranding_points is not None
    assert len(transit_cand.stranding_points) >= 1
    sp_transit = transit_cand.stranding_points[0]
    assert "Sitabuldi" in sp_transit.node_name
    assert sp_transit.stranded_arrival_hm == "06:22"
    assert sp_transit.missed_deadline_min > 180 # Next service arrives hours past deadline

    # Auto stranding point
    auto_cand = next(c for c in plan.candidates if c.mode == "auto")
    assert auto_cand.stranding_points is not None
    assert len(auto_cand.stranding_points) >= 1
    sp_auto = auto_cand.stranding_points[0]
    assert "Hospital Gate" in sp_auto.node_name
    assert "02:25" in sp_auto.trigger_condition # 10m wait trigger
    assert sp_auto.missed_deadline_min > 0 # Walking alternative arrives past deadline


def test_decide_by_and_recovery_options(nurse_request):
    """Engine must provide a decide-by time and viable recovery options."""
    plan = deadline_engine.plan(nurse_request)
    auto_cand = next(c for c in plan.candidates if c.mode == "auto")

    assert auto_cand.decision_by_iso is not None
    assert auto_cand.decision_by_iso.endswith(":00+05:30")
    assert "02:25" in auto_cand.decision_by_iso
    assert auto_cand.decide_by_rationale is not None
    assert "Decide by 02:25" in auto_cand.decide_by_rationale

    # Recovery options
    assert auto_cand.recovery_options is not None
    assert len(auto_cand.recovery_options) >= 2
    tw_rec = next(r for r in auto_cand.recovery_options if r.mode == "two_wheeler")
    assert tw_rec.meets_deadline is True
    assert tw_rec.extra_cost_inr > 0
    assert tw_rec.trigger_time_hm == "02:25"


def test_safe_haven_fallback(nurse_request):
    """Engine must return verified staffed 24x7 hospital/police safe-haven."""
    plan = deadline_engine.plan(nurse_request)
    assert plan.safe_haven_handoff is not None
    haven = plan.safe_haven_handoff

    assert haven.primary.kind in ["hospital", "police"]
    assert haven.primary.opening_status == "OPEN_AT_ARRIVAL"
    assert haven.walk_time_min > 0
    assert haven.verified_staffed is True
    assert haven.phone_or_contact is not None


def test_scenario_resilience_matrix(nurse_request):
    """Each candidate must evaluate stress scenarios with slack and verdict."""
    plan = deadline_engine.plan(nurse_request)
    auto_cand = next(c for c in plan.candidates if c.mode == "auto")

    assert auto_cand.scenario_matrix is not None
    assert len(auto_cand.scenario_matrix) == 4
    scenarios = {s.scenario_id: s for s in auto_cand.scenario_matrix}

    assert "delay_15m" in scenarios
    assert "corridor_closure" in scenarios
    assert "feed_outage" in scenarios
    assert "midnight_surge" in scenarios

    # Delay of 15m compresses slack
    assert scenarios["delay_15m"].slack_min < auto_cand.slack_min.pessimistic


def test_disruption_replan_previous_vs_new_comparison(nurse_request):
    """Replan upon closure must recompute slack and include previous-vs-new diff."""
    initial_plan = deadline_engine.plan(nurse_request)

    replan_req = ReplanRequest(
        origin=nurse_request.origin,
        destination=nurse_request.destination,
        shift_end_iso=nurse_request.shift_end_iso,
        deadline_iso=nurse_request.deadline_iso,
        modes=nurse_request.modes,
        previous_plan_id="plan-1",
        reason="Road closure detected near Ramdaspeth",
        previous_plan=initial_plan,
    )

    replanned = deadline_engine.replan(replan_req)
    assert replanned.verdict is not None
    assert replanned.verdict.replan_diff is not None
    diff = replanned.verdict.replan_diff

    assert diff.slack_delta_min == -6.0
    assert diff.decide_by_delta_min == -6.0
    assert "detour adds 6m" in diff.explanation.lower()

    # Auto candidate must reflect increased ETA
    replanned_auto = next(c for c in replanned.candidates if c.mode == "auto")
    initial_auto = next(c for c in initial_plan.candidates if c.mode == "auto")
    assert replanned_auto.eta.expected_min == initial_auto.eta.expected_min + 6.0


def test_honest_infeasible_verdict_when_all_fail():
    """Tight 10 min window (02:15 to 02:25) leaves no feasible option -> Safe haven handoff."""
    impossible_req = PlanRequest(
        origin=Coordinates(lat=21.0378, lon=79.0345),
        destination=Coordinates(lat=21.1458, lon=79.0882),
        shift_end_iso="2026-10-25T02:15:00+05:30",
        deadline_iso="2026-10-25T02:25:00+05:30", # Only 10m window for 4.8km
        modes=["transit", "walk"],
    )

    plan = deadline_engine.plan(impossible_req)
    assert plan.verdict is not None
    assert plan.verdict.status == "INFEASIBLE"
    assert plan.verdict.meets_deadline_supported is False
    assert "No sufficiently supported plan meets the deadline" in plan.verdict.summary
    assert plan.safe_haven_handoff is not None


def test_deterministic_output(nurse_request):
    """Calling deadline engine twice with identical input yields identical output."""
    plan1 = deadline_engine.plan(nurse_request)
    plan2 = deadline_engine.plan(nurse_request)

    assert plan1.recommended_id == plan2.recommended_id
    assert plan1.verdict == plan2.verdict
    assert len(plan1.candidates) == len(plan2.candidates)
    for c1, c2 in zip(plan1.candidates, plan2.candidates):
        assert c1.id == c2.id
        assert c1.status == c2.status
        assert c1.slack_min == c2.slack_min
        assert c1.decision_by_iso == c2.decision_by_iso
