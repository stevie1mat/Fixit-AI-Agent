'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Send, Loader2, Bot, User, Sparkles, Zap, Settings, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatBox() {
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, addMessage, setLoading, isLoading, updateLastMessage, connections, clearMessages } = useAppStore()
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSubmitting) return

    const userMessage = input.trim()
    setInput('')
    setIsSubmitting(true)
    setLoading(true)

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    })

    try {
      console.log('Sending connections to API:', connections)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          storeData: { connections },
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      let assistantMessage = ''
      
      // Add initial assistant message
      addMessage({
        role: 'assistant',
        content: '',
      })

      // Read streaming response
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        assistantMessage += chunk

        // Update the last message (assistant's message)
        updateLastMessage(assistantMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const quickPrompts = [
    "Make all discounted products show a red badge",
    "Fix my homepage SEO basics", 
    "Speed up my WordPress homepage",
    "Exclude discounted items from free shipping in Canada"
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-urbanist font-normal text-gray-900">AI Assistant</h2>
              <p className="text-sm font-urbanist font-light text-gray-600">
                {connections.length > 0 
                  ? `Connected to ${connections.length} store${connections.length > 1 ? 's' : ''}`
                  : 'No stores connected'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              <span className="font-urbanist font-light">AI Powered</span>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
                    clearMessages()
                  }
                }}
                className="text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-2xl w-full text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-urbanist font-normal text-gray-900 mb-4">
                Welcome to Fix It AI
              </h3>
              <p className="text-lg font-urbanist font-light text-gray-600 mb-8 max-w-lg mx-auto">
                I can help you optimize and fix issues in your e-commerce stores. 
                Try asking me something like:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="bg-white p-4 rounded-lg border border-gray-200 text-left hover:border-gray-300 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-gray-600 font-medium">{index + 1}</span>
                      </div>
                      <p className="font-urbanist font-light text-gray-700 text-sm group-hover:text-gray-900">
                        {prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-urbanist font-light text-gray-600">Quick Tips</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <p className="font-urbanist font-light text-gray-600">Be specific</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 text-xs">⚡</span>
                    </div>
                    <p className="font-urbanist font-light text-gray-600">Real-time fixes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 text-xs">🔒</span>
                    </div>
                    <p className="font-urbanist font-light text-gray-600">Secure & safe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start space-x-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-6 py-4 shadow-sm',
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200'
                )}
              >
                <div className="whitespace-pre-wrap font-urbanist font-light leading-relaxed">
                  {message.content}
                </div>
                <div className={cn(
                  "text-xs mt-3 font-urbanist font-light",
                  message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="font-urbanist font-light text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to fix or optimize..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-6 py-4 text-sm font-urbanist font-light placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              disabled={isSubmitting}
            />
            {input.length > 0 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400 font-urbanist font-light">
                  {input.length} chars
                </span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="bg-black hover:bg-gray-800 text-white rounded-2xl px-6 py-4 font-urbanist font-light transition-all"
            disabled={!input.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

