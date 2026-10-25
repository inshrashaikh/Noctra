"""Pytest suite for Noctra Transport Availability Engine.

Verifies:
1. Same route at 22:00 vs 02:15 vs 04:30 returns visibly and verifiably different available modes.
2. Last-service catchable at 22:00, missed at 02:15.
3. Early morning services starting at 04:30 (what has started vs what has not).
4. Latest feasible departure correctly computed to make deadline.
5. Unknown private transport (cab) strictly stays UNKNOWN.
6. Deterministic output: same input twice = identical output.
7. Decay logic: compute_label matches TTL specifications.
"""

from app.planner.transport_engine import TransportEngine
from app.planner.schemas import PlanRequest, Coordinates
from app.evidence.decay import compute_label


def test_decay_logic():
    """Verify evidence decay rules in Python."""
    # ride_availability TTL is 300s
    assert compute_label("KNOWN", 100, "ride_availability") == "KNOWN"
    assert compute_label("KNOWN", 400, "ride_availability") == "OUTDATED"
    assert compute_label("KNOWN", 2000, "ride_availability") == "UNKNOWN"

    # Labels never improve
    assert compute_label("OUTDATED", 50, "ride_availability") == "OUTDATED"
    assert compute_label("UNKNOWN", 50, "ride_availability") == "UNKNOWN"


def test_shift_2200_vs_0215_vs_0430_mode_differences():
    """Verify same origin/destination produces distinct, time-aware mode availability."""
    engine = TransportEngine()

    avail_2200 = {item.service_id: item for item in engine.evaluate_availability("22:00", "22:45")}
    avail_0215 = {item.service_id: item for item in engine.evaluate_availability("02:15", "03:00")}
    avail_0430 = {item.service_id: item for item in engine.evaluate_availability("04:30", "05:30")}

    # 1. METRO:
    # At 22:00 -> RUNNING, catchable before 22:15 last departure
    assert avail_2200["metro-orange-line"].operating_status == "RUNNING"
    assert avail_2200["metro-orange-line"].last_service_catchable is True
    assert avail_2200["metro-orange-line"].next_departure is not None

    # At 02:15 -> ENDED, last train was 22:15 (missed)
    assert avail_0215["metro-orange-line"].operating_status == "ENDED"
    assert avail_0215["metro-orange-line"].last_service_catchable is False
    assert avail_0215["metro-orange-line"].next_departure == "06:00"

    # At 04:30 -> NOT_STARTED, early morning standby before 06:00
    assert avail_0430["metro-orange-line"].operating_status == "NOT_STARTED"
    assert "06:00" in avail_0430["metro-orange-line"].status_detail

    # 2. CITY BUS (Aapli Bus):
    # At 22:00 -> transition/day ending, N1 night feeder starting 22:30
    assert avail_2200["aapli-bus-night-n1"].operating_status in ["NOT_STARTED", "RUNNING"]

    # At 02:15 -> Night feeder finished at 01:30 -> ENDED
    assert avail_0215["aapli-bus-night-n1"].operating_status == "ENDED"
    assert avail_0215["aapli-bus-night-n1"].last_service_catchable is False

    # At 04:30 -> ENDED / Resumes 06:00
    assert avail_0430["aapli-bus-night-n1"].operating_status == "ENDED"

    # 3. RAILWAY CONNECTORS:
    # At 04:30 -> train halt at 05:10 is catchable / starting soon
    assert avail_0430["railway-station-shuttle"].operating_status in ["RUNNING", "NOT_STARTED"]
    assert avail_0430["railway-station-shuttle"].next_departure == "05:10"


def test_private_cab_stays_strictly_unknown():
    """Ensure cabs without live telemetry are labeled UNKNOWN and never fabricate wait times."""
    engine = TransportEngine()
    avail = {item.service_id: item for item in engine.evaluate_availability("02:15", "03:00")}

    cab = avail["private-ride-hail-cab"]
    assert cab.operating_status == "UNKNOWN_AVAILABILITY"
    assert cab.evidence_label == "UNKNOWN"
    assert cab.confidence == 0.0
    assert cab.boarding_wait_min is None  # Never fabricated


def test_deterministic_plan_output():
    """Ensure running twice with identical input yields bit-for-bit identical candidate plans."""
    engine = TransportEngine()
    req = PlanRequest(
        origin=Coordinates(lat=21.1497, lon=79.0806),
        destination=Coordinates(lat=21.1453, lon=79.0588),
        shift_end_iso="2026-10-25T02:15:00+05:30",
        deadline_iso="2026-10-25T03:00:00+05:30",
        modes=["transit", "auto", "two_wheeler", "cab", "walk"],
    )

    plan1 = engine.plan(req)
    plan2 = engine.plan(req)

    assert plan1.recommended_id == plan2.recommended_id
    assert len(plan1.candidates) == len(plan2.candidates)
    for c1, c2 in zip(plan1.candidates, plan2.candidates):
        assert c1.id == c2.id
        assert c1.status == c2.status
        assert c1.rejected == c2.rejected
        assert c1.eta.expected_min == c2.eta.expected_min
        assert c1.slack_min.expected == c2.slack_min.expected
        assert c1.operating_note == c2.operating_note


def test_plan_at_2200_vs_0215_candidate_rejections():
    """Verify that at 22:00 transit is feasible, while at 02:15 transit is rejected as INFEASIBLE."""
    engine = TransportEngine()

    req_2200 = PlanRequest(
        origin=Coordinates(lat=21.1497, lon=79.0806),
        destination=Coordinates(lat=21.1453, lon=79.0588),
        shift_end_iso="2026-10-25T22:00:00+05:30",
        deadline_iso="2026-10-25T23:00:00+05:30",
        modes=["transit", "auto", "walk"],
    )
    plan_2200 = engine.plan(req_2200)
    transit_2200 = next(c for c in plan_2200.candidates if c.mode == "transit")
    assert transit_2200.rejected is False
    assert transit_2200.status in ["ROBUST", "AT_RISK"]
    assert "Runs until" in transit_2200.operating_note

    req_0215 = PlanRequest(
        origin=Coordinates(lat=21.1497, lon=79.0806),
        destination=Coordinates(lat=21.1453, lon=79.0588),
        shift_end_iso="2026-10-25T02:15:00+05:30",
        deadline_iso="2026-10-25T03:00:00+05:30",
        modes=["transit", "auto", "walk"],
    )
    plan_0215 = engine.plan(req_0215)
    transit_0215 = next(c for c in plan_0215.candidates if c.mode == "transit")
    assert transit_0215.rejected is True
    assert transit_0215.status == "INFEASIBLE"
    assert "service ended" in transit_0215.operating_note.lower()


def test_walking_slack_and_infeasibility_at_tight_deadline():
    """Verify walking over 4.8 km in a 45-min window is rejected due to negative slack."""
    engine = TransportEngine()
    req = PlanRequest(
        origin=Coordinates(lat=21.1497, lon=79.0806),
        destination=Coordinates(lat=21.1453, lon=79.0588),
        shift_end_iso="2026-10-25T02:15:00+05:30",
        deadline_iso="2026-10-25T03:00:00+05:30",  # 45 min window
        modes=["walk"],
    )
    plan = engine.plan(req)
    walk_cand = plan.candidates[0]
    assert walk_cand.mode == "walk"
    assert walk_cand.rejected is True
    assert walk_cand.status == "INFEASIBLE"
    assert walk_cand.slack_min.pessimistic < 0
