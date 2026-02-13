'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getBackendUrl, getWebSocketUrl } from '@/lib/api-config'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface StreamingChatProps {
  onSpeakingChange?: (speaking: boolean) => void
  onLipSyncIntensityChange?: (intensity: number) => void
  onPhonemeChange?: (phoneme: string) => void
  onEmotionChange?: (emotion: string) => void
  currentChemicals?: string[]
  currentEquipment?: string[]
  experimentContext?: string
}

export default function StreamingChat({ 
  onSpeakingChange,
  onLipSyncIntensityChange,
  onPhonemeChange,
  onEmotionChange,
  currentChemicals = [],
  currentEquipment = [],
  experimentContext = ''
}: StreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm ERA - your AI Chemistry Assistant. I'm here to help you understand chemical reactions and concepts. What would you like to explore?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const currentResponseRef = useRef('')
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentResponse])

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket()
    
    return () => {
      wsRef.current?.close()
    }
  }, [])

  const connectWebSocket = () => {
    setConnectionStatus('connecting')
    
    try {
      const wsUrl = `${getWebSocketUrl()}/ws`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.done) {
            setStreaming(false)
            
            const finalContent = currentResponseRef.current
            if (finalContent) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: finalContent,
                timestamp: new Date()
              }])
            }
            
            currentResponseRef.current = ''
            setCurrentResponse('')
          } else if (data.token) {
            currentResponseRef.current += data.token
            setCurrentResponse(currentResponseRef.current)
            onSpeakingChange?.(true)
          }
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('disconnected')
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnectionStatus('disconnected')
        
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket()
          }
        }, 3000)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setConnectionStatus('disconnected')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming || connectionStatus !== 'connected') return
    
    const userMessage = input.trim()
    setInput('')
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    
    setStreaming(true)
    setCurrentResponse('')
    currentResponseRef.current = ''
    onSpeakingChange?.(true)
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: userMessage,
        context: experimentContext,
        chemicals: currentChemicals,
        equipment: currentEquipment,
        history: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-elixra-bunsen/20 to-elixra-copper/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-elixra-bunsen to-elixra-copper rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-elixra-charcoal dark:text-white">ERA Assistant</h3>
              <p className="text-xs text-elixra-secondary">
                {connectionStatus === 'connected' ? '🟢 Online' : connectionStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-elixra-bunsen text-white rounded-br-none'
                    : 'bg-white dark:bg-elixra-warm-gray text-elixra-charcoal dark:text-white rounded-bl-none border border-elixra-border-subtle'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-white dark:bg-elixra-warm-gray text-elixra-charcoal dark:text-white rounded-bl-none border border-elixra-border-subtle">
              <p className="text-sm leading-relaxed">{currentResponse}</p>
              <Loader2 className="w-4 h-4 animate-spin mt-2" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-elixra-border-subtle bg-white/50 dark:bg-elixra-charcoal/50 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about chemistry..."
            disabled={streaming || connectionStatus !== 'connected'}
            className="flex-1 px-4 py-2 rounded-lg border border-elixra-border-subtle bg-white dark:bg-elixra-charcoal text-elixra-charcoal dark:text-white placeholder-elixra-secondary focus:outline-none focus:ring-2 focus:ring-elixra-bunsen disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim() || connectionStatus !== 'connected'}
            className="px-4 py-2 bg-elixra-bunsen hover:bg-elixra-bunsen-dark disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            {streaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
