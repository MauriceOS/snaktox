"""
Custom exceptions for SnaKTox AI Service
"""

class SnaKToxAIException(Exception):
    """Base exception for SnaKTox AI Service"""
    
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        self.detail = message
        super().__init__(self.message)

class ExternalAPIError(SnaKToxAIException):
    """Exception for external API errors"""
    
    def __init__(self, message: str, api_name: str, status_code: int = 502):
        self.api_name = api_name
        super().__init__(f"External API error ({api_name}): {message}", status_code)

class SnakeDetectionError(SnaKToxAIException):
    """Exception for snake detection errors"""
    
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(f"Snake detection error: {message}", status_code)

class ChatbotError(SnaKToxAIException):
    """Exception for chatbot errors"""
    
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(f"Chatbot error: {message}", status_code)

class ValidationError(SnaKToxAIException):
    """Exception for validation errors"""
    
    def __init__(self, message: str, status_code: int = 422):
        super().__init__(f"Validation error: {message}", status_code)
