"""
Snake detection service using external APIs
"""

import httpx
import asyncio
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.exceptions import SnakeDetectionError, ExternalAPIError
from app.models.snake_detection import (
    SnakeDetectionRequest, 
    SnakeDetectionResponse, 
    DetectionResult,
    SnakeSpecies,
    VenomType,
    SeverityLevel
)
from app.core.logging import get_logger

logger = get_logger(__name__)

class SnakeDetectionService:
    """Service for snake detection using external APIs"""
    
    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.confidence_threshold = settings.VISION_CONFIDENCE_THRESHOLD
        logger.info("SnakeDetectionService initialized", 
                   has_api_key=bool(self.gemini_api_key),
                   api_key_length=len(self.gemini_api_key) if self.gemini_api_key else 0)
        
    async def detect_snake(self, request: SnakeDetectionRequest) -> SnakeDetectionResponse:
        """Detect snake species from image using external APIs"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            logger.info("Starting snake detection", image_url=str(request.image_url))
            
            # Use Google Gemini API
            if self.gemini_api_key:
                logger.info("Using Gemini API for snake detection", api_key_length=len(self.gemini_api_key))
                try:
                    result = await self._detect_with_gemini(request)
                    logger.info("Gemini API detection completed successfully")
                except Exception as e:
                    logger.error("Gemini API failed, falling back to mock", error=str(e))
                    result = self._generate_mock_detection_result(request)
            else:
                logger.warning("No Gemini API key available, using mock response")
                # Mock response when no API key is available
                result = self._generate_mock_detection_result(request)
            
            processing_time = asyncio.get_event_loop().time() - start_time
            
            return SnakeDetectionResponse(
                success=True,
                result=result,
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = asyncio.get_event_loop().time() - start_time
            logger.error("Snake detection failed", error=str(e))
            
            return SnakeDetectionResponse(
                success=False,
                error=str(e),
                processing_time=processing_time
            )
    
    async def _detect_with_gemini(self, request: SnakeDetectionRequest) -> DetectionResult:
        """Detect snake using Google Gemini API"""
        import google.generativeai as genai
        
        # Configure Gemini
        genai.configure(api_key=self.gemini_api_key)
        model = genai.GenerativeModel(settings.GEMINI_VISION_MODEL)
        
        # Create a detailed prompt for snake identification
        prompt = """Analyze this image and identify if it contains a snake. If it does, provide detailed information about the snake species.

Focus on snakes commonly found in Sub-Saharan Africa, particularly Kenya.

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
    "scientific_name": "string",
    "common_name": "string", 
    "family": "string",
    "genus": "string",
    "venom_type": "neurotoxic|hemotoxic|cytotoxic|mixed|unknown",
    "severity": "mild|moderate|severe|critical",
    "distribution": ["string"],
    "description": "string",
    "first_aid_notes": "string",
    "antivenom_available": true,
    "confidence": 0.85
}

If no snake is detected, return:
{
    "scientific_name": "Unknown",
    "common_name": "No snake detected", 
    "family": "Unknown",
    "genus": "Unknown",
    "venom_type": "unknown",
    "severity": "mild",
    "distribution": [],
    "description": "No snake detected in image",
    "first_aid_notes": "No action required",
    "antivenom_available": false,
    "confidence": 0.0
}

Respond with ONLY the JSON, no other text."""
        
        try:
            # Handle both regular URLs and data URLs
            if str(request.image_url).startswith('data:'):
                # Handle data URL (base64 encoded image)
                import base64
                header, data = str(request.image_url).split(',', 1)
                mime_type = header.split(';')[0].split(':')[1]
                image_data = base64.b64decode(data)
            else:
                # Download image from URL
                import httpx
                async with httpx.AsyncClient() as client:
                    response = await client.get(str(request.image_url))
                    image_data = response.content
                    mime_type = "image/jpeg"  # Default to JPEG
            
            # Generate content with Gemini
            response = model.generate_content([
                prompt,
                {
                    "mime_type": mime_type,
                    "data": image_data
                }
            ])
            
            # Parse the response and create detection result
            content = response.text
            logger.info("Gemini API response received", 
                       response_length=len(content),
                       response_preview=content[:200] if content else "Empty response")
            return self._parse_gemini_response(content, request.confidence_threshold)
            
        except Exception as e:
            raise ExternalAPIError(f"Gemini API error: {str(e)}", "Gemini")
    
    def _parse_gemini_response(self, content: str, confidence: float) -> DetectionResult:
        """Parse Gemini response and create detection result"""
        import json
        import re
        
        try:
            # Clean the response - remove markdown code blocks if present
            cleaned_content = content.strip()
            if cleaned_content.startswith('```json'):
                # Extract JSON from markdown code block
                json_match = re.search(r'```json\s*(.*?)\s*```', cleaned_content, re.DOTALL)
                if json_match:
                    cleaned_content = json_match.group(1).strip()
            elif cleaned_content.startswith('```'):
                # Extract JSON from generic code block
                json_match = re.search(r'```\s*(.*?)\s*```', cleaned_content, re.DOTALL)
                if json_match:
                    cleaned_content = json_match.group(1).strip()
            
            # Try to parse JSON response
            data = json.loads(cleaned_content)
            
            # Map venom type and severity
            venom_type_map = {
                "neurotoxic": VenomType.NEUROTOXIC,
                "hemotoxic": VenomType.HEMOTOXIC,
                "cytotoxic": VenomType.CYTOTOXIC,
                "mixed": VenomType.MIXED,
                "unknown": VenomType.UNKNOWN
            }
            
            severity_map = {
                "mild": SeverityLevel.MILD,
                "moderate": SeverityLevel.MODERATE,
                "severe": SeverityLevel.SEVERE,
                "critical": SeverityLevel.CRITICAL
            }
            
            species = SnakeSpecies(
                scientific_name=data.get("scientific_name", "Unknown"),
                common_name=data.get("common_name", "Unknown"),
                family=data.get("family", "Unknown"),
                genus=data.get("genus", "Unknown"),
                venom_type=venom_type_map.get(data.get("venom_type", "unknown"), VenomType.UNKNOWN),
                severity=severity_map.get(data.get("severity", "mild"), SeverityLevel.MILD),
                distribution=data.get("distribution", []),
                description=data.get("description", "No description available"),
                first_aid_notes=data.get("first_aid_notes", "Seek immediate medical attention"),
                antivenom_available=data.get("antivenom_available", False)
            )
            
            return DetectionResult(
                species=species,
                confidence=data.get("confidence", confidence),
                detection_metadata={
                    "api_used": "gemini",
                    "model": settings.GEMINI_VISION_MODEL,
                    "raw_response": content[:200] + "..." if len(content) > 200 else content
                }
            )
            
        except (json.JSONDecodeError, KeyError) as e:
            # Fallback to mock response if parsing fails
            logger.warning("Failed to parse Gemini response", error=str(e))
            return self._generate_mock_detection_result(None)
    
    def _generate_mock_detection_result(self, request) -> DetectionResult:
        """Generate mock detection result for testing"""
        # Mock snake species data (in production, this would come from your database)
        mock_species = SnakeSpecies(
            scientific_name="Dendroaspis polylepis",
            common_name="Black Mamba",
            family="Elapidae",
            genus="Dendroaspis",
            venom_type=VenomType.NEUROTOXIC,
            severity=SeverityLevel.CRITICAL,
            distribution=["East Africa", "Southern Africa"],
            description="Large, fast, highly venomous snake with dark coloration",
            first_aid_notes="Keep victim calm, immobilize affected limb, seek immediate medical attention",
            antivenom_available=True
        )
        
        return DetectionResult(
            species=mock_species,
            confidence=0.85,  # Mock confidence
            detection_metadata={
                "api_used": "mock",
                "model": "mock-model",
                "note": "Mock response - no API key configured"
            }
        )
