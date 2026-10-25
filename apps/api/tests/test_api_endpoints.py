"""Integration and schema tests for FastAPI application endpoints."""

from app.main import (
    health_check,
    create_plan,
    get_transport_availability,
    get_services,
    get_status,
)
from app.planner.schemas import PlanRequest, Coordinates


def test_health():
    res = health_check()
    assert res["status"] == "healthy"
    assert res["engine"] == "shift-aware-transport-engine-v1"


def test_api_plan_endpoint():
    req = PlanRequest(
        origin=Coordinates(lat=21.1497, lon=79.0806),
        destination=Coordinates(lat=21.1453, lon=79.0588),
        shift_end_iso="2026-10-25T02:15:00+05:30",
        deadline_iso="2026-10-25T03:00:00+05:30",
        modes=["transit", "auto", "walk"],
    )
    plan = create_plan(req)
    assert plan.recommended_id == "auto-fastest"
    assert len(plan.candidates) == 3

    # Transit should be rejected at 02:15
    transit_cand = next(c for c in plan.candidates if c.mode == "transit")
    assert transit_cand.rejected is True
    assert transit_cand.status == "INFEASIBLE"

    # Auto is ROBUST
    auto_cand = next(c for c in plan.candidates if c.mode == "auto")
    assert auto_cand.rejected is False
    assert auto_cand.status == "ROBUST"
    assert auto_cand.plan_b is not None


def test_api_transport_availability_endpoint():
    res = get_transport_availability("02:15", "03:00")
    assert res.shift_time == "02:15"
    assert res.deadline_time == "03:00"
    modes = {m.service_id: m for m in res.modes}
    assert modes["metro-orange-line"].operating_status == "ENDED"
    assert modes["private-ride-hail-cab"].evidence_label == "UNKNOWN"
    assert modes["pedestrian-walk"].evidence_label == "KNOWN"


def test_api_services_endpoint():
    services = get_services(21.1497, 79.0806, None, 5000.0)
    assert len(services) >= 3
    assert any(s.kind == "hospital" for s in services)
    assert any(s.kind == "police" for s in services)


def test_api_status_endpoint():
    status = get_status()
    assert status.tier == 0
    assert len(status.feeds) >= 3
    assert status.data_manifest is not None
    assert "transport_seed" in status.data_manifest
