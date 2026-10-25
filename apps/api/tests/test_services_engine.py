"""
Unit test suite for Module 2: Essential Services Finder & Opening Hours Engine.
Validates opening hours parsing, overnight midnight boundaries, separate evidence records,
arrival-time status at 22:00 vs 02:30 vs 04:45, detour & deadline math, and deterministic ranking.
"""

import pytest
from app.services.opening_hours import (
    parse_opening_hours,
    evaluate_opening_status,
    parse_time_minutes,
)
from app.services.service_finder import (
    haversine_distance_m,
    find_and_rank_services,
)


def test_opening_hours_parser_varieties():
    # 24x7 variants
    s1 = parse_opening_hours("24/7")
    assert s1.is_24x7 is True

    s2 = parse_opening_hours("00:00-24:00")
    assert s2.is_24x7 is True

    # Simple range
    s3 = parse_opening_hours("09:00-22:00")
    assert s3.is_24x7 is False
    assert len(s3.day_intervals[0]) == 1
    assert s3.day_intervals[0][0].start_min == 540
    assert s3.day_intervals[0][0].end_min == 1320
    assert s3.day_intervals[0][0].is_overnight is False

    # Overnight range
    s4 = parse_opening_hours("19:00-03:30")
    assert len(s4.day_intervals[0]) == 1
    assert s4.day_intervals[0][0].start_min == 1140
    assert s4.day_intervals[0][0].end_min == 210
    assert s4.day_intervals[0][0].is_overnight is True

    # Multi-range per day
    s5 = parse_opening_hours("08:00-14:00, 18:00-23:00")
    assert len(s5.day_intervals[0]) == 2

    # Weekday vs weekend
    s6 = parse_opening_hours("Mo-Fr 08:00-20:00; Sa-Su 10:00-18:00")
    assert s6.day_intervals[0][0].start_min == 480  # Monday 08:00
    assert s6.day_intervals[5][0].start_min == 600  # Saturday 10:00

    # Missing / unparseable
    s7 = parse_opening_hours(None)
    assert s7.is_valid is False
    s8 = parse_opening_hours("Hours unverified / variable")
    assert s8.is_valid is False


def test_status_at_2200_vs_0230_vs_0445():
    # Haldiram's: 08:00 - 22:30
    h_2200 = evaluate_opening_status("08:00-22:30", arrival_time_min=1320, closing_soon_margin_min=30)
    assert h_2200["opening_status"] == "CLOSING_SOON"  # 1320 = 22:00, closes in 30m at 22:30

    h_0230 = evaluate_opening_status("08:00-22:30", arrival_time_min=150)
    assert h_0230["opening_status"] == "CLOSED_AT_ARRIVAL"

    # Poojari Night Dhaba: 19:00 - 03:30
    d_2200 = evaluate_opening_status("19:00-03:30", arrival_time_min=1320)
    assert d_2200["opening_status"] == "OPEN_AT_ARRIVAL"

    d_0230 = evaluate_opening_status("19:00-03:30", arrival_time_min=150)  # 02:30 AM
    assert d_0230["opening_status"] == "OPEN_AT_ARRIVAL"
    assert d_0230["open_until"] == "03:30"

    d_0445 = evaluate_opening_status("19:00-03:30", arrival_time_min=285)  # 04:45 AM
    assert d_0445["opening_status"] == "CLOSED_AT_ARRIVAL"

    # Shankar Early Morning Chai: 04:00 - 23:00
    c_0230 = evaluate_opening_status("04:00-23:00", arrival_time_min=150)
    assert c_0230["opening_status"] == "OPENS_LATER"  # opens at 04:00, within dawn window

    c_0445 = evaluate_opening_status("04:00-23:00", arrival_time_min=285)  # 04:45 AM
    assert c_0445["opening_status"] == "OPEN_AT_ARRIVAL"
    assert c_0445["open_until"] == "23:00"


def test_midnight_boundary_overnight_interval():
    # 20:00 to 04:00 overnight range
    # 23:45 arrival (1425 min)
    res_before_midnight = evaluate_opening_status("20:00-04:00", arrival_time_min=1425)
    assert res_before_midnight["opening_status"] == "OPEN_AT_ARRIVAL"

    # 00:05 arrival (5 min after midnight)
    res_after_midnight = evaluate_opening_status("20:00-04:00", arrival_time_min=5)
    assert res_after_midnight["opening_status"] == "OPEN_AT_ARRIVAL"

    # 03:45 arrival (15m before 04:00 close)
    res_closing_soon = evaluate_opening_status("20:00-04:00", arrival_time_min=225, closing_soon_margin_min=30)
    assert res_closing_soon["opening_status"] == "CLOSING_SOON"
    assert "Closing soon in 15 min" in res_closing_soon["opening_note"]

    # 04:15 arrival (closed)
    res_closed = evaluate_opening_status("20:00-04:00", arrival_time_min=255)
    assert res_closed["opening_status"] == "CLOSED_AT_ARRIVAL"


def test_separate_listing_and_opening_evidence():
    res = find_and_rank_services(
        lat=21.0378,
        lon=79.0345,
        radius_m=1000.0,
        arrival_time_iso="2026-10-26T02:30:00+05:30",
    )
    assert res["total_found"] >= 1
    svc = res["services"][0]

    # Two separate evidence records present
    assert "listing_evidence" in svc
    assert "opening_evidence" in svc
    assert svc["listing_evidence"] is not None
    assert svc["opening_evidence"] is not None

    # Listing evidence reflects directory metadata
    assert svc["listing_evidence"]["fact_type"] == "facility_hours"
    assert "listing:" in svc["listing_evidence"]["subject"]

    # Opening evidence reflects arrival time evaluation
    assert svc["opening_evidence"]["subject"] == "opening_status"


def test_missing_hours_strictly_unknown():
    res = evaluate_opening_status(
        hours_raw=None,
        arrival_time_min=150,
        source_class="simulated",
    )
    assert res["opening_status"] == "UNKNOWN"
    assert res["opening_evidence"]["label"] == "UNKNOWN"
    assert res["opening_evidence"]["confidence"] == 0.0


def test_static_hours_never_known_without_verified_source():
    # Static unverified 24/7 schedule
    res_unverified = evaluate_opening_status(
        hours_raw="24/7",
        arrival_time_min=150,
        verified_hours=False,
        verification_source=None,
    )
    assert res_unverified["opening_evidence"]["label"] == "PROBABLE"

    # Verified 24/7 schedule
    res_verified = evaluate_opening_status(
        hours_raw="24/7",
        arrival_time_min=150,
        verified_hours=True,
        verification_source="Hospital Administration Directory",
    )
    assert res_verified["opening_evidence"]["label"] == "KNOWN"


def test_detour_and_deadline_slack_impact():
    # Worker at AIIMS (21.0378, 79.0345) heading to Dharampeth (21.1458, 79.0605)
    # Shift ends at 02:15, deadline at 02:40 (tight 25 min window)
    res = find_and_rank_services(
        lat=21.0378,
        lon=79.0345,
        radius_m=15000.0,
        shift_end_iso="2026-10-26T02:15:00+05:30",
        deadline_iso="2026-10-26T02:40:00+05:30",
        origin_lat=21.0378,
        origin_lon=79.0345,
        dest_lat=21.1458,
        dest_lon=79.0605,
    )
    assert res["total_found"] > 0
    # Far-away services with big detours will be flagged infeasible
    infeasible = [s for s in res["services"] if not s["deadline_feasible"]]
    assert len(infeasible) > 0
    assert any(s["slack_impact_min"] < 0 for s in infeasible)


def test_need_filter_and_deterministic_ranking():
    # Query for 'medicine'
    res_med = find_and_rank_services(
        lat=21.1466,
        lon=79.0833,
        radius_m=3000.0,
        need="medicine",
        arrival_time_iso="2026-10-26T02:30:00+05:30",
    )
    for s in res_med["services"]:
        assert s["kind"] in ["pharmacy", "hospital"]

    # Determinism: same call twice returns identical order and ids
    res_med_2 = find_and_rank_services(
        lat=21.1466,
        lon=79.0833,
        radius_m=3000.0,
        need="medicine",
        arrival_time_iso="2026-10-26T02:30:00+05:30",
    )
    assert [s["id"] for s in res_med["services"]] == [s["id"] for s in res_med_2["services"]]


def test_haversine_distance():
    # Sitabuldi (21.1466, 79.0833) to Dharampeth (21.1458, 79.0605)
    # Expected distance ~2.3 - 2.4 km
    d = haversine_distance_m(21.1466, 79.0833, 21.1458, 79.0605)
    assert 2200.0 <= d <= 2500.0
