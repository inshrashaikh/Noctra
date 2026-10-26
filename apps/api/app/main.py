"""Noctra Backend API Server — Decision Engine for Night-Shift Workers."""

import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.planner.schemas import (
    PlanRequest,
    PlanResponse,
    ReplanRequest,
    ServicesRequest,
    Service,
    ServicesResponse,
    StatusResponse,
    FeedStatus,
    TransportAvailabilityResponse,
)
from app.planner.transport_engine import transport_engine
from app.planner.deadline_engine import deadline_engine
from app.services.service_finder import find_and_rank_services

app = FastAPI(
    title="Noctra Decision Engine API",
    description="Night-time decision engine for night-shift workers (CASCADE '26)",
    version="0.2.0",
)

# Enable CORS for local Vite dev server and preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
MANIFEST_FILE = DATA_DIR / "MANIFEST.json"


@app.get("/health")
def health_check():
    """Deployment readiness & engine status check."""
    return {
        "status": "healthy",
        "service": "noctra-api",
        "tier": 0,
        "engine": "shift-aware-transport-engine-v1",
    }


@app.post("/api/plan", response_model=PlanResponse)
def create_plan(req: PlanRequest):
    """Module 3: Evaluate nocturnal transport availability, deadlines, stranding and safe-havens."""
    return deadline_engine.plan(req)


@app.post("/api/replan", response_model=PlanResponse)
def replan(req: ReplanRequest):
    """Module 3: Replan journey upon disruption with previous-vs-new verdict diff."""
    return deadline_engine.replan(req)


@app.get("/api/transport/availability", response_model=TransportAvailabilityResponse)
def get_transport_availability(
    shift_time: str = "02:15",
    deadline_time: str = "03:00",
    corridor: str = "AIIMS Nagpur to Dharampeth",
):
    """Detailed mode-by-mode breakdown of operating windows, last departures, and evidence labels."""
    modes = transport_engine.evaluate_availability(shift_time, deadline_time, corridor)
    return TransportAvailabilityResponse(
        shift_time=shift_time,
        deadline_time=deadline_time,
        corridor=corridor,
        evaluated_at="2026-10-25T" + (shift_time[-5:] if ":" in shift_time else "02:15") + ":00+05:30",
        modes=modes,
    )


@app.get("/api/services", response_model=list[Service])
def get_services(
    lat: float = 21.0378,
    lon: float = 79.0345,
    kinds: Optional[str] = None,
    need: Optional[str] = None,
    radius_m: float = 5000.0,
    arrival_time_iso: Optional[str] = None,
    shift_end_iso: Optional[str] = None,
    deadline_iso: Optional[str] = None,
    origin_lat: Optional[float] = None,
    origin_lon: Optional[float] = None,
    dest_lat: Optional[float] = None,
    dest_lon: Optional[float] = None,
):
    """
    Module 2: Return evaluated essential night services near coordinates
    with arrival-time opening status, separate listing/opening evidence, and detour impact.
    """
    kind_list = [k.strip() for k in kinds.split(",")] if kinds else None
    result = find_and_rank_services(
        lat=lat,
        lon=lon,
        radius_m=radius_m,
        kinds=kind_list,
        need=need,
        arrival_time_iso=arrival_time_iso,
        shift_end_iso=shift_end_iso,
        deadline_iso=deadline_iso,
        origin_lat=origin_lat,
        origin_lon=origin_lon,
        dest_lat=dest_lat,
        dest_lon=dest_lon,
    )
    return [Service(**s) for s in result["services"]]


@app.get("/api/services/response", response_model=ServicesResponse)
def get_services_response(
    lat: float = 21.0378,
    lon: float = 79.0345,
    kinds: Optional[str] = None,
    need: Optional[str] = None,
    radius_m: float = 5000.0,
    arrival_time_iso: Optional[str] = None,
    shift_end_iso: Optional[str] = None,
    deadline_iso: Optional[str] = None,
    origin_lat: Optional[float] = None,
    origin_lon: Optional[float] = None,
    dest_lat: Optional[float] = None,
    dest_lon: Optional[float] = None,
):
    """Return full ServicesResponse with total_found, fallback_notice and closest_fallback."""
    kind_list = [k.strip() for k in kinds.split(",")] if kinds else None
    result = find_and_rank_services(
        lat=lat,
        lon=lon,
        radius_m=radius_m,
        kinds=kind_list,
        need=need,
        arrival_time_iso=arrival_time_iso,
        shift_end_iso=shift_end_iso,
        deadline_iso=deadline_iso,
        origin_lat=origin_lat,
        origin_lon=origin_lon,
        dest_lat=dest_lat,
        dest_lon=dest_lon,
    )
    return ServicesResponse(
        generated_at=result["generated_at"],
        arrival_time_iso=result["arrival_time_iso"],
        services=[Service(**s) for s in result["services"]],
        total_found=result["total_found"],
        fallback_notice=result["fallback_notice"],
        closest_fallback=Service(**result["closest_fallback"]) if result["closest_fallback"] else None,
    )


@app.get("/api/status", response_model=StatusResponse)
def get_status():
    """Return data feeds status and active provenance manifest."""
    manifest_data = None
    if MANIFEST_FILE.exists():
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            manifest_data = json.load(f)

    return StatusResponse(
        tier=0,
        feeds=[
            FeedStatus(name="Nagpur Metro Timetable Feed", healthy=True, last_ok_iso="2026-10-25T02:00:00+05:30", label="KNOWN"),
            FeedStatus(name="Aapli Bus Feeder Feed", healthy=True, last_ok_iso="2026-10-25T02:00:00+05:30", label="KNOWN"),
            FeedStatus(name="Nagpur Police Stations Feed", healthy=True, last_ok_iso="2026-10-25T02:00:00+05:30", label="KNOWN"),
            FeedStatus(name="Nagpur Cab Aggregator Telemetry", healthy=False, last_ok_iso=None, label="UNKNOWN"),
        ],
        data_manifest=manifest_data,
    )
