"""
Chatbot API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from app.models.chatbot import ChatbotRequest, ChatbotResponse, ChatbotContext
from app.services.chatbot_service import ChatbotService
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

# Dependency injection
def get_chatbot_service() -> ChatbotService:
    """Get chatbot service instance"""
    return ChatbotService()

@router.post("/chat", response_model=ChatbotResponse)
async def chat_with_bot(
    request: ChatbotRequest,
    service: ChatbotService = Depends(get_chatbot_service)
):
    """
    Chat with the AI assistant about snakebite prevention and emergency response
    
    This endpoint provides AI-powered responses to questions about:
    - First aid for snakebites
    - Prevention strategies
    - Snake species information
    - Emergency procedures
    
    All responses are based on verified medical sources including WHO, CDC, and KEMRI.
    """
    try:
        logger.info("Chatbot query received", query_type=request.query_type)
        
        result = await service.process_query(request)
        
        if not result.success:
            raise HTTPException(status_code=400, detail="Failed to process query")
        
        logger.info("Chatbot response generated successfully", 
                   query_type=result.query_type,
                   confidence=result.confidence)
        
        return result
        
    except Exception as e:
        logger.error("Chatbot endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/context")
async def update_context(context: ChatbotContext):
    """
    Update chatbot conversation context
    
    This endpoint allows updating the conversation context for more personalized
    responses based on previous interactions.
    """
    try:
        logger.info("Chatbot context updated", user_id=context.user_id)
        
        # In a real implementation, you'd store this context in a database
        # For now, just return success
        
        return {
            "success": True,
            "message": "Context updated successfully",
            "user_id": context.user_id,
            "session_id": context.session_id
        }
        
    except Exception as e:
        logger.error("Context update error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/topics")
async def get_available_topics():
    """
    Get available conversation topics
    
    Returns a list of topics the chatbot can help with, organized by category.
    """
    topics = {
        "emergency_response": [
            "First aid for snakebites",
            "Emergency contact information",
            "What to do immediately after a bite",
            "Signs of serious envenomation"
        ],
        "prevention": [
            "How to avoid snake encounters",
            "Protective clothing and gear",
            "Snake-proofing your home",
            "Safe hiking and camping practices"
        ],
        "species_information": [
            "Common snakes in Kenya",
            "Venomous vs non-venomous snakes",
            "Snake identification tips",
            "Geographic distribution"
        ],
        "general": [
            "Snake behavior and habits",
            "Myths and misconceptions",
            "Research and statistics",
            "Educational resources"
        ]
    }
    
    return {
        "topics": topics,
        "total_categories": len(topics),
        "supported_languages": ["en", "sw", "fr"]  # English, Swahili, French
    }
