"""
Pydantic models for snake detection API
"""

from pydantic import BaseModel, HttpUrl, Field, validator
from typing import List, Optional, Dict, Any
from enum import Enum

class VenomType(str, Enum):
    """Venom type enumeration"""
    NEUROTOXIC = "neurotoxic"
    HEMOTOXIC = "hemotoxic"
    CYTOTOXIC = "cytotoxic"
    MIXED = "mixed"
    UNKNOWN = "unknown"

class SeverityLevel(str, Enum):
    """Severity level enumeration"""
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"

class SnakeDetectionRequest(BaseModel):
    """Request model for snake detection"""
    image_url: str = Field(..., description="URL of the snake image (HTTP/HTTPS or data URL)")
    confidence_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Minimum confidence threshold")
    user_id: Optional[str] = Field(None, description="Anonymized user identifier")
    session_id: Optional[str] = Field(None, description="Session identifier")
    
    @validator('image_url')
    def validate_image_url(cls, v):
        """Validate that image_url is either HTTP/HTTPS URL or data URL"""
        if v.startswith('data:'):
            return v
        elif v.startswith(('http://', 'https://')):
            return v
        else:
            raise ValueError('image_url must be a valid HTTP/HTTPS URL or data URL')

class SnakeSpecies(BaseModel):
    """Snake species information"""
    scientific_name: str = Field(..., description="Scientific name of the snake")
    common_name: str = Field(..., description="Common name of the snake")
    family: str = Field(..., description="Snake family")
    genus: str = Field(..., description="Snake genus")
    venom_type: VenomType = Field(..., description="Type of venom")
    severity: SeverityLevel = Field(..., description="Severity level")
    distribution: List[str] = Field(..., description="Geographic distribution")
    description: str = Field(..., description="Physical description")
    first_aid_notes: str = Field(..., description="First aid recommendations")
    antivenom_available: bool = Field(..., description="Whether antivenom is available")

class DetectionResult(BaseModel):
    """Snake detection result"""
    species: SnakeSpecies = Field(..., description="Identified snake species")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence")
    bounding_box: Optional[Dict[str, float]] = Field(None, description="Bounding box coordinates")
    alternative_species: List[SnakeSpecies] = Field(default_factory=list, description="Alternative species")
    detection_metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class SnakeDetectionResponse(BaseModel):
    """Response model for snake detection"""
    success: bool = Field(..., description="Whether detection was successful")
    result: Optional[DetectionResult] = Field(None, description="Detection result")
    error: Optional[str] = Field(None, description="Error message if detection failed")
    processing_time: float = Field(..., description="Processing time in seconds")
    api_version: str = Field("1.0.0", description="API version")
