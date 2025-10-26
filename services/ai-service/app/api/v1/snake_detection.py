"""
Snake detection API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.models.snake_detection import SnakeDetectionRequest, SnakeDetectionResponse
from app.services.snake_detection_service import SnakeDetectionService
from app.core.logging import get_logger
import base64

logger = get_logger(__name__)

router = APIRouter()

# Dependency injection
def get_snake_detection_service() -> SnakeDetectionService:
    """Get snake detection service instance"""
    return SnakeDetectionService()

@router.post("/predict", response_model=SnakeDetectionResponse)
async def detect_snake(
    request: SnakeDetectionRequest,
    service: SnakeDetectionService = Depends(get_snake_detection_service)
):
    """
    Detect snake species from image URL
    
    This endpoint uses external AI APIs (OpenAI Vision or Google Vision) to identify
    snake species from uploaded images. It provides detailed information about the
    identified snake including venom type, severity, and first aid recommendations.
    """
    try:
        logger.info("Snake detection request received", image_url=str(request.image_url))
        
        result = await service.detect_snake(request)
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        
        logger.info("Snake detection completed successfully", 
                   species=result.result.species.scientific_name if result.result else None)
        
        return result
        
    except Exception as e:
        logger.error("Snake detection endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/upload-and-detect", response_model=SnakeDetectionResponse)
async def upload_and_detect_snake(
    image: UploadFile = File(...),
    userId: str = Form(...),
    sessionId: str = Form(...),
    location: str = Form(None),
    service: SnakeDetectionService = Depends(get_snake_detection_service)
):
    """
    Upload image file and detect snake species
    
    This endpoint accepts a file upload and converts it to a data URL
    for processing by the snake detection service.
    """
    try:
        logger.info("Snake detection upload request received", 
                   filename=image.filename, user_id=userId)
        
        # Read the uploaded file
        image_data = await image.read()
        
        # Convert to base64 data URL
        mime_type = image.content_type or "image/jpeg"
        base64_data = base64.b64encode(image_data).decode('utf-8')
        data_url = f"data:{mime_type};base64,{base64_data}"
        
        # Create detection request
        request = SnakeDetectionRequest(
            image_url=data_url,
            confidence_threshold=0.7
        )
        
        # Process the detection
        result = await service.detect_snake(request)
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        
        logger.info("Snake detection upload completed successfully", 
                   species=result.result.species.scientific_name if result.result else None)
        
        return result
        
    except Exception as e:
        logger.error("Snake detection upload endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/species")
async def get_supported_species():
    """
    Get list of supported snake species
    
    Returns a list of snake species that can be identified by the AI service,
    along with their basic information.
    """
    # This would typically come from a database
    # For now, return a mock list of common African snakes
    species_list = [
        {
            "scientific_name": "Dendroaspis polylepis",
            "common_name": "Black Mamba",
            "family": "Elapidae",
            "venom_type": "neurotoxic",
            "severity": "critical"
        },
        {
            "scientific_name": "Bitis arietans",
            "common_name": "Puff Adder",
            "family": "Viperidae",
            "venom_type": "cytotoxic",
            "severity": "severe"
        },
        {
            "scientific_name": "Naja haje",
            "common_name": "Egyptian Cobra",
            "family": "Elapidae",
            "venom_type": "neurotoxic",
            "severity": "severe"
        }
    ]
    
    return {
        "species": species_list,
        "total_count": len(species_list),
        "supported_regions": ["East Africa", "Southern Africa", "West Africa"]
    }
