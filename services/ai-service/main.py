"""
SnaKTox AI Service - FastAPI application for snake detection and chatbot
Uses external APIs for AI capabilities instead of local ML models
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import uvicorn
import structlog
import time
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1 import snake_detection, chatbot, health
from app.core.exceptions import SnaKToxAIException

# Setup structured logging
setup_logging()
logger = structlog.get_logger()

# Request logging middleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        logger.info(
            "Incoming request",
            method=method,
            url=url,
            ip=client_ip,
            user_agent=user_agent
        )
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            logger.info(
                "Request completed",
                method=method,
                url=url,
                status_code=response.status_code,
                duration_ms=round(duration * 1000, 2)
            )
            return response
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                "Request failed",
                method=method,
                url=url,
                error=str(e),
                duration_ms=round(duration * 1000, 2)
            )
            raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting SnaKTox AI Service", version=settings.VERSION)
    yield
    logger.info("Shutting down SnaKTox AI Service")

# Create FastAPI application
app = FastAPI(
    title="SnaKTox AI Service",
    description="AI-powered snake detection and emergency response chatbot",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Request logging middleware (add first to log all requests)
app.add_middleware(RequestLoggingMiddleware)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(SnaKToxAIException)
async def snaktox_exception_handler(request, exc: SnaKToxAIException):
    logger.error("SnaKTox AI Exception", error=str(exc), status_code=exc.status_code)
    return HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )

# Include API routes
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(snake_detection.router, prefix="/api/v1", tags=["snake-detection"])
app.include_router(chatbot.router, prefix="/api/v1", tags=["chatbot"])

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "SnaKTox AI Service",
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
