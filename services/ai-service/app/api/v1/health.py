"""
Health check endpoints for SnaKTox AI Service
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import asyncio
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str
    uptime: float
    version: str
    services: Dict[str, str]

@router.get("/", response_model=HealthResponse)
async def health_check():
    """Basic health check endpoint"""
    import datetime
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.datetime.utcnow().isoformat(),
        uptime=0.0,  # Would be calculated from startup time
        version="1.0.0",
        services={
            "snake_detection": "operational",
            "chatbot": "operational",
            "external_apis": "operational"
        }
    )

@router.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes"""
    return {"status": "ready"}

@router.get("/live")
async def liveness_check():
    """Liveness check for Kubernetes"""
    return {"status": "alive"}
