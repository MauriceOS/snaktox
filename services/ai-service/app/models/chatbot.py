"""
Pydantic models for chatbot API
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class QueryType(str, Enum):
    """Query type enumeration"""
    FIRST_AID = "first_aid"
    PREVENTION = "prevention"
    SPECIES_INFO = "species_info"
    EMERGENCY = "emergency"
    GENERAL = "general"

class ChatbotRequest(BaseModel):
    """Request model for chatbot queries"""
    query: str = Field(..., min_length=1, max_length=1000, description="User query")
    query_type: Optional[QueryType] = Field(None, description="Type of query")
    user_id: Optional[str] = Field(None, description="Anonymized user identifier")
    session_id: Optional[str] = Field(None, description="Session identifier")
    language: str = Field("en", description="Preferred language")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class ChatbotResponse(BaseModel):
    """Response model for chatbot queries"""
    success: bool = Field(..., description="Whether query was processed successfully")
    response: str = Field(..., description="Chatbot response")
    query_type: QueryType = Field(..., description="Detected query type")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Response confidence")
    sources: List[str] = Field(default_factory=list, description="Information sources")
    follow_up_questions: List[str] = Field(default_factory=list, description="Suggested follow-up questions")
    emergency_contact: Optional[str] = Field(None, description="Emergency contact if applicable")
    processing_time: float = Field(..., description="Processing time in seconds")
    api_version: str = Field("1.0.0", description="API version")

class ChatbotContext(BaseModel):
    """Context for chatbot conversations"""
    user_id: str = Field(..., description="User identifier")
    session_id: str = Field(..., description="Session identifier")
    conversation_history: List[Dict[str, str]] = Field(default_factory=list, description="Conversation history")
    user_preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences")
    location_context: Optional[Dict[str, Any]] = Field(None, description="Location context")
