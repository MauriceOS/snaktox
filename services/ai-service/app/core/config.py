"""
Configuration settings for SnaKTox AI Service
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import List, Optional, Union, Any
import os
import json

class Settings(BaseSettings):
    """Application settings"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        # Don't parse JSON automatically for list fields
        json_schema_extra={
            "ALLOWED_HOSTS": {"json_encoders": {list: lambda v: v}},
            "CORS_ORIGINS": {"json_encoders": {list: lambda v: v}},
        }
    )
    
    # Service Configuration
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "snaktox-ai-secret-key-change-in-production"
    ALLOWED_HOSTS: Union[str, List[str]] = ["*"]
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]
    
    @model_validator(mode='before')
    @classmethod
    def parse_list_fields(cls, data: Any) -> Any:
        """Parse list fields from environment variables before validation"""
        if isinstance(data, dict):
            # Handle ALLOWED_HOSTS
            if 'ALLOWED_HOSTS' in data:
                v = data['ALLOWED_HOSTS']
                if isinstance(v, str):
                    v = v.strip()
                    if not v:
                        data['ALLOWED_HOSTS'] = ["*"]
                    else:
                        try:
                            parsed = json.loads(v)
                            data['ALLOWED_HOSTS'] = parsed if isinstance(parsed, list) else [str(parsed)]
                        except (json.JSONDecodeError, ValueError):
                            if v == "*":
                                data['ALLOWED_HOSTS'] = ["*"]
                            else:
                                data['ALLOWED_HOSTS'] = [host.strip() for host in v.split(",") if host.strip()]
            
            # Handle CORS_ORIGINS
            if 'CORS_ORIGINS' in data:
                v = data['CORS_ORIGINS']
                if isinstance(v, str):
                    v = v.strip()
                    if not v:
                        data['CORS_ORIGINS'] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]
                    else:
                        try:
                            parsed = json.loads(v)
                            data['CORS_ORIGINS'] = parsed if isinstance(parsed, list) else [str(parsed)]
                        except (json.JSONDecodeError, ValueError):
                            data['CORS_ORIGINS'] = [origin.strip() for origin in v.split(",") if origin.strip()]
        
        return data
    
    @field_validator('ALLOWED_HOSTS', mode='after')
    @classmethod
    def ensure_allowed_hosts_list(cls, v: Any) -> List[str]:
        """Ensure ALLOWED_HOSTS is a list"""
        if isinstance(v, str):
            return [v] if v else ["*"]
        if isinstance(v, list):
            return v
        return ["*"]
    
    @field_validator('CORS_ORIGINS', mode='after')
    @classmethod
    def ensure_cors_origins_list(cls, v: Any) -> List[str]:
        """Ensure CORS_ORIGINS is a list"""
        if isinstance(v, str):
            return [v] if v else ["http://localhost:3000"]
        if isinstance(v, list):
            return v
        return ["http://localhost:3000"]
    
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
    

# Create settings instance
settings = Settings()

# Validate required API keys
if not settings.GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. AI features will be limited.")
