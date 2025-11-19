"""
Configuration settings for SnaKTox AI Service
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Service Configuration
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "snaktox-ai-secret-key-change-in-production"
    ALLOWED_HOSTS: List[str] = ["*"]
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]
    
    # External API Keys
    GEMINI_API_KEY: Optional[str] = None
    
    # API Configuration
    GEMINI_MODEL: str = "gemini-1.5-pro"
    GEMINI_VISION_MODEL: str = "gemini-1.5-pro"
    VISION_CONFIDENCE_THRESHOLD: float = 0.7
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Validate required API keys
if not settings.GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. AI features will be limited.")
