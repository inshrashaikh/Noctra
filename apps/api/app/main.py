"""Noctra Backend API Server Stub."""

from fastapi import FastAPI

app = FastAPI(
    title="Noctra Decision Engine API",
    description="Night-time decision engine for night-shift workers (CASCADE '26)",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    """Trivial health route for deployment readiness check."""
    return {
        "status": "healthy",
        "service": "noctra-api",
        "tier": 0,
        "engine": "stub",
    }
