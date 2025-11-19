'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface EmergencyChatbotProps {
  className?: string
}

export function EmergencyChatbot({ className }: EmergencyChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Initialize welcome message only on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your AI emergency assistant. I can help with snakebite first aid guidance, prevention tips, and emergency procedures. What would you like to know?',
        isUser: false,
        timestamp: new Date()
      }
    ])
  }, [])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Format message text with proper spacing and bullets
  const formatMessageText = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim()
      
      // Check if it's a header (starts with ** or * and ends with ** or :)
      if ((trimmedParagraph.startsWith('**') && trimmedParagraph.endsWith('**')) || 
          (trimmedParagraph.startsWith('*') && trimmedParagraph.endsWith(':')) ||
          // Also check for headers that don't have proper formatting but should be headers
          (trimmedParagraph.match(/^[A-Z][a-zA-Z\s]+$/) && trimmedParagraph.length < 50 && !trimmedParagraph.includes('.'))) {
        const headerText = trimmedParagraph.replace(/\*\*/g, '').replace(/^\*\s*/, '').replace(/:\s*$/, '').trim()
        return (
          <h3 key={index} className="font-semibold text-base mt-3 mb-2 first:mt-0">
            {headerText}
          </h3>
        )
      }
      
      // Check if it's a bulleted list (but not a header)
      if (trimmedParagraph.includes('•') || 
          (trimmedParagraph.includes('-') && !trimmedParagraph.startsWith('-')) ||
          (trimmedParagraph.includes('*') && !trimmedParagraph.startsWith('*'))) {
        const lines = trimmedParagraph.split('\n').filter(line => line.trim())
        return (
          <ul key={index} className="list-disc list-inside space-y-1 ml-2">
            {lines.map((line, lineIndex) => {
              // Clean up bullet points and remove all asterisks
              const cleanLine = line.replace(/^[•\-\*]\s*/, '').replace(/\*/g, '').trim()
              return cleanLine ? (
                <li key={lineIndex} className="text-sm">{cleanLine}</li>
              ) : null
            })}
          </ul>
        )
      }
      
      // Check if it's a numbered list
      if (/^\d+\./.test(trimmedParagraph)) {
        const lines = trimmedParagraph.split('\n').filter(line => line.trim())
        return (
          <ol key={index} className="list-decimal list-inside space-y-1 ml-2">
            {lines.map((line, lineIndex) => {
              // Clean up numbered points and remove all asterisks
              const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/\*/g, '').trim()
              return cleanLine ? (
                <li key={lineIndex} className="text-sm">{cleanLine}</li>
              ) : null
            })}
          </ol>
        )
      }
      
      // Regular paragraph - aggressively clean up all asterisks for professional look
      const cleanText = (text: string) => {
        // Remove all asterisk patterns completely
        return text
          .replace(/\*\*/g, '')           // Remove **
          .replace(/\*/g, '')             // Remove single *
          .replace(/^\*\s*/, '')          // Remove * at start
          .replace(/\s*\*$/, '')          // Remove * at end
          .replace(/\*\s*/g, '')          // Remove * followed by space
          .replace(/\s*\*/g, '')          // Remove space followed by *
          .trim()
      }
      
      return (
        <p key={index} className="text-sm leading-relaxed">
          {cleanText(trimmedParagraph)}
        </p>
      )
    })
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // Use environment variable for API URL
      // Default to port 3002 where backend is running
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'
      const baseUrl = apiUrl.replace(/\/api\/v1$/, '') || 'http://localhost:3002'
      const response = await fetch(`${baseUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputText,
          language: 'en',
          userId: 'user-001',
          sessionId: 'session-001'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Backend error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      console.log('Chatbot response:', data)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting to the AI service. Please try again or call emergency services directly.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className={`${className} h-96 flex flex-col w-full max-w-full overflow-hidden`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageCircle className="h-5 w-5" />
          AI Emergency Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="text-sm break-words space-y-2">
                  {formatMessageText(message.text)}
                </div>
                {isMounted && (
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>
              {message.isUser && (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start w-full">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[75%] bg-muted text-foreground p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about snakebite first aid..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
