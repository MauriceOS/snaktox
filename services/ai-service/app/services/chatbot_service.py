"""
Chatbot service using OpenAI API with WHO/CDC knowledge base
"""

import asyncio
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.core.exceptions import ChatbotError, ExternalAPIError
from app.models.chatbot import (
    ChatbotRequest, 
    ChatbotResponse, 
    QueryType,
    ChatbotContext
)
from app.core.logging import get_logger

logger = get_logger(__name__)

class ChatbotService:
    """Service for AI chatbot using OpenAI API with medical knowledge"""
    
    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.chat_model = settings.GEMINI_MODEL
        
        # WHO/CDC knowledge base context
        self.knowledge_base = """
        You are a medical AI assistant specializing in snakebite emergency response and prevention.
        Your knowledge is based on verified medical sources including:
        - World Health Organization (WHO) Guidelines for Snakebite Prevention and Treatment
        - Centers for Disease Control and Prevention (CDC) Snakebite Information
        - Kenya Medical Research Institute (KEMRI) Research Data
        
        Key principles:
        1. Always prioritize immediate medical attention for snakebites
        2. Provide evidence-based first aid guidance
        3. Never provide specific medical diagnoses or treatments
        4. Always recommend contacting emergency services
        5. Focus on prevention and awareness
        
        Emergency contacts for Kenya:
        - Emergency Services: 999
        - Ambulance: 112
        - Police: 911
        """
    
    async def process_query(self, request: ChatbotRequest) -> ChatbotResponse:
        """Process chatbot query using OpenAI API"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            logger.info("Processing chatbot query", query_type=request.query_type)
            
            # Determine query type if not provided
            query_type = request.query_type or self._classify_query(request.query)
            
            # Generate response based on query type
            if self.gemini_api_key:
                response = self._generate_response(request, query_type)
            else:
                # Mock response when no API key is available
                response = self._generate_mock_response(request, query_type)
            
            processing_time = asyncio.get_event_loop().time() - start_time
            
            return ChatbotResponse(
                success=True,
                response=response["content"],
                query_type=query_type,
                confidence=response["confidence"],
                sources=response["sources"],
                follow_up_questions=response["follow_up_questions"],
                emergency_contact=response.get("emergency_contact"),
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = asyncio.get_event_loop().time() - start_time
            logger.error("Chatbot query failed", error=str(e))
            
            return ChatbotResponse(
                success=False,
                response=f"I apologize, but I encountered an error processing your query: {str(e)}",
                query_type=QueryType.GENERAL,
                confidence=0.0,
                processing_time=processing_time
            )
    
    def _classify_query(self, query: str) -> QueryType:
        """Classify the type of query using Gemini"""
        import google.generativeai as genai
        
        genai.configure(api_key=self.gemini_api_key)
        model = genai.GenerativeModel(self.chat_model)
        
        classification_prompt = f"""
        Classify this snakebite-related query into one of these categories:
        - first_aid: Questions about immediate first aid for snakebites
        - prevention: Questions about preventing snakebites
        - species_info: Questions about specific snake species
        - emergency: Urgent medical questions requiring immediate attention
        - general: General questions about snakes or snakebites
        
        Query: "{query}"
        
        Return only the category name.
        """
        
        try:
            response = model.generate_content(classification_prompt)
            category = response.text.strip().lower()
            return QueryType(category) if category in [e.value for e in QueryType] else QueryType.GENERAL
            
        except Exception as e:
            logger.warning("Query classification failed", error=str(e))
            return QueryType.GENERAL
    
    def _generate_response(self, request: ChatbotRequest, query_type: QueryType) -> Dict[str, Any]:
        """Generate response based on query type"""
        import google.generativeai as genai
        
        genai.configure(api_key=self.gemini_api_key)
        model = genai.GenerativeModel(self.chat_model)
        
        # Create context-specific prompt
        prompt = self._create_prompt(request, query_type)
        
        try:
            response = model.generate_content([
                self.knowledge_base,
                prompt
            ])
            
            content = response.text
            
            return {
                "content": content,
                "confidence": 0.85,  # Mock confidence score
                "sources": ["WHO Guidelines", "CDC Information", "KEMRI Research"],
                "follow_up_questions": self._generate_follow_up_questions(query_type),
                "emergency_contact": self._get_emergency_contact(query_type)
            }
            
        except Exception as e:
            raise ExternalAPIError(f"Gemini API error: {str(e)}", "Gemini")
    
    def _create_prompt(self, request: ChatbotRequest, query_type: QueryType) -> str:
        """Create context-specific prompt based on query type"""
        base_prompt = f"User query: {request.query}\nLanguage: {request.language}"
        
        if query_type == QueryType.EMERGENCY:
            return f"""
            {base_prompt}
            
            This is an EMERGENCY query about snakebites. Provide immediate first aid guidance
            and strongly emphasize calling emergency services (999 in Kenya).
            
            IMPORTANT: Format your response with clean, professional structure:
            - Use clear section headers without any special characters (e.g., "General Characteristics", "Venom Types", "Prevention")
            - Use bullet points (•) for lists
            - Use numbered lists (1., 2., 3.) for step-by-step instructions
            - Separate different topics with double line breaks
            - Keep paragraphs concise and readable
            - NEVER use asterisks (*) or any markdown formatting symbols
            - Write in a professional, medical tone
            - Examples of clean headers: "General Characteristics", "Venom Types", "Emergency Response"
            - Do not use any formatting symbols like *, **, or other special characters
            """
        elif query_type == QueryType.FIRST_AID:
            return f"""
            {base_prompt}
            
            Provide detailed first aid guidance for snakebites based on WHO guidelines.
            Include step-by-step instructions and what NOT to do.
            
            IMPORTANT: Format your response with clean, professional structure:
            - Use clear section headers without any special characters (e.g., "General Characteristics", "Venom Types", "Prevention")
            - Use bullet points (•) for lists
            - Use numbered lists (1., 2., 3.) for step-by-step instructions
            - Separate different topics with double line breaks
            - Keep paragraphs concise and readable
            - NEVER use asterisks (*) or any markdown formatting symbols
            - Write in a professional, medical tone
            - Examples of clean headers: "General Characteristics", "Venom Types", "Emergency Response"
            - Do not use any formatting symbols like *, **, or other special characters
            """
        elif query_type == QueryType.PREVENTION:
            return f"""
            {base_prompt}
            
            Provide prevention tips and awareness information about snakebites.
            Focus on practical advice for avoiding snake encounters.
            
            IMPORTANT: Format your response with clean, professional structure:
            - Use clear section headers without any special characters (e.g., "General Characteristics", "Venom Types", "Prevention")
            - Use bullet points (•) for lists
            - Use numbered lists (1., 2., 3.) for step-by-step instructions
            - Separate different topics with double line breaks
            - Keep paragraphs concise and readable
            - NEVER use asterisks (*) or any markdown formatting symbols
            - Write in a professional, medical tone
            - Examples of clean headers: "General Characteristics", "Venom Types", "Emergency Response"
            - Do not use any formatting symbols like *, **, or other special characters
            """
        elif query_type == QueryType.SPECIES_INFO:
            return f"""
            {base_prompt}
            
            Provide information about specific snake species, their characteristics,
            venom types, and geographic distribution in Africa.
            
            IMPORTANT: Format your response with clean, professional structure:
            - Use clear section headers without any special characters (e.g., "General Characteristics", "Venom Types", "Prevention")
            - Use bullet points (•) for lists
            - Use numbered lists (1., 2., 3.) for step-by-step instructions
            - Separate different topics with double line breaks
            - Keep paragraphs concise and readable
            - NEVER use asterisks (*) or any markdown formatting symbols
            - Write in a professional, medical tone
            - Examples of clean headers: "General Characteristics", "Venom Types", "Emergency Response"
            - Do not use any formatting symbols like *, **, or other special characters
            """
        else:
            return f"""
            {base_prompt}
            
            Provide helpful information about snakebites, safety, and emergency response.
            
            IMPORTANT: Format your response with clean, professional structure:
            - Use clear section headers without any special characters (e.g., "General Characteristics", "Venom Types", "Prevention")
            - Use bullet points (•) for lists
            - Use numbered lists (1., 2., 3.) for step-by-step instructions
            - Separate different topics with double line breaks
            - Keep paragraphs concise and readable
            - NEVER use asterisks (*) or any markdown formatting symbols
            - Write in a professional, medical tone
            - Examples of clean headers: "General Characteristics", "Venom Types", "Emergency Response"
            - Do not use any formatting symbols like *, **, or other special characters
            """
    
    def _generate_follow_up_questions(self, query_type: QueryType) -> List[str]:
        """Generate relevant follow-up questions based on query type"""
        follow_ups = {
            QueryType.EMERGENCY: [
                "What should I do if I can't reach emergency services?",
                "How long do I have to get medical help?",
                "What are the signs of a serious snakebite?"
            ],
            QueryType.FIRST_AID: [
                "Should I try to suck out the venom?",
                "How do I keep the victim calm?",
                "What if the bite is on the face or neck?"
            ],
            QueryType.PREVENTION: [
                "What should I wear in snake-prone areas?",
                "How can I make my home snake-proof?",
                "What time of day are snakes most active?"
            ],
            QueryType.SPECIES_INFO: [
                "Which snakes are most dangerous in Kenya?",
                "How can I identify venomous vs non-venomous snakes?",
                "What snakes are found in urban areas?"
            ]
        }
        
        return follow_ups.get(query_type, [
            "How can I learn more about snakebite prevention?",
            "What should I do if I see a snake?",
            "Where can I find more resources?"
        ])
    
    def _get_emergency_contact(self, query_type: QueryType) -> Optional[str]:
        """Get emergency contact information if needed"""
        if query_type == QueryType.EMERGENCY:
            return "Emergency Services: 999 (Kenya) | Ambulance: 112 | Police: 911"
        return None
    
    def _generate_mock_response(self, request: ChatbotRequest, query_type: QueryType) -> Dict[str, Any]:
        """Generate mock response when no API key is available"""
        mock_responses = {
            QueryType.EMERGENCY: {
                "content": "🚨 EMERGENCY: If you've been bitten by a snake, call 999 immediately! Keep the victim calm, immobilize the affected limb, and get to the nearest hospital with antivenom. Do NOT apply a tourniquet or try to suck out the venom.",
                "confidence": 0.9
            },
            QueryType.FIRST_AID: {
                "content": "First Aid for Snakebites:\n1. Keep the victim calm and still\n2. Remove jewelry or tight clothing near the bite\n3. Immobilize the affected limb\n4. Call emergency services (999)\n5. Do NOT apply ice, cut the wound, or use a tourniquet\n6. Seek immediate medical attention",
                "confidence": 0.85
            },
            QueryType.PREVENTION: {
                "content": "Snakebite Prevention Tips:\n1. Wear boots and long pants when walking in snake-prone areas\n2. Use a flashlight at night\n3. Avoid tall grass and rocky areas\n4. Keep your yard clean and free of debris\n5. Be cautious when moving rocks or logs\n6. Learn to identify local venomous snakes",
                "confidence": 0.8
            },
            QueryType.SPECIES_INFO: {
                "content": "Common venomous snakes in Kenya include the Black Mamba, Puff Adder, and Egyptian Cobra. Each has different venom types and requires specific antivenom. For detailed species information, consult with local wildlife experts or medical professionals.",
                "confidence": 0.75
            },
            QueryType.GENERAL: {
                "content": "I'm here to help with snakebite-related questions. I can provide information about prevention, first aid, emergency response, and snake species. What would you like to know?",
                "confidence": 0.7
            }
        }
        
        response_data = mock_responses.get(query_type, mock_responses[QueryType.GENERAL])
        
        return {
            "content": response_data["content"],
            "confidence": response_data["confidence"],
            "sources": ["WHO Guidelines", "CDC Information", "KEMRI Research"],
            "follow_up_questions": self._generate_follow_up_questions(query_type),
            "emergency_contact": self._get_emergency_contact(query_type)
        }
