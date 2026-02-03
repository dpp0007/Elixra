'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles, Bot, User, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getBackendUrl, getWebSocketUrl, getBackendInfo } from '@/lib/api-config'

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
  currentEquipment?: string[]  // Equipment being used in the lab
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
      content: "Hello! I'm ERA - ELIXRA Reaction Avatar, your intelligent chemistry teaching assistant. I'm here to help you understand chemical reactions, mechanisms, and guide you through your experiments. What would you like to explore today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const currentResponseRef = useRef('')  // Use ref to track current response
  const spokenTextRef = useRef('')  // Track what's already been spoken
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const isListeningRef = useRef(false)  // Track listening state with ref
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const speechQueueRef = useRef<string[]>([])  // Queue of sentences to speak
  const isSpeakingRef = useRef(false)  // Track if currently speaking
  const spokenSentencesRef = useRef<Set<string>>(new Set())  // Track sentences already spoken
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true)
  const [browserInfo, setBrowserInfo] = useState('')

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentResponse])

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Detect browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()
      let browser = 'Unknown'
      
      if (userAgent.includes('edg')) {
        browser = 'Edge'
      } else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        browser = 'Chrome'
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        browser = 'Safari'
      } else if (userAgent.includes('brave')) {
        browser = 'Brave'
      } else if (userAgent.includes('firefox')) {
        browser = 'Firefox'
      }
      
      setBrowserInfo(browser)
      console.log('🌐 Detected browser:', browser)
    }
  }, [])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        console.error('❌ Speech Recognition not supported in this browser')
        setSpeechRecognitionSupported(false)
        return
      }
      
      setSpeechRecognitionSupported(true)
      console.log('✅ Initializing Speech Recognition...')
      const recognition = new SpeechRecognition()
      recognition.continuous = true  // Keep listening
      recognition.interimResults = true  // Show partial results
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      let lastFinalIndex = 0  // Track which results we've already processed
      let finalTranscript = ''  // Accumulate final transcripts
      let silenceTimer: NodeJS.Timeout | null = null

      recognition.onstart = () => {
        console.log('✓ Speech recognition started')
        lastFinalIndex = 0  // Reset index
        finalTranscript = ''  // Reset transcript
      }

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result, resultIndex:', event.resultIndex, 'results.length:', event.results.length)
        
        // Process only NEW final results to avoid duplicates
        let newFinalTranscript = ''
        let interimTranscript = ''
        
        for (let i = lastFinalIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            newFinalTranscript += transcript + ' '
            lastFinalIndex = i + 1  // Update index to skip this result next time
          }
        }
        
        // Get interim results from the last result only
        if (event.results.length > 0) {
          const lastResult = event.results[event.results.length - 1]
          if (!lastResult.isFinal) {
            interimTranscript = lastResult[0].transcript
          }
        }
        
        // Add new final transcript to accumulator
        if (newFinalTranscript) {
          finalTranscript += newFinalTranscript
        }
        
        // Update input: show accumulated final + current interim
        const fullText = (finalTranscript + interimTranscript).trim()
        setInput(fullText)
        
        console.log('Final so far:', finalTranscript, 'New interim:', interimTranscript)
        
        // Auto-send after 2 seconds of silence (when we get a final result)
        if (newFinalTranscript) {
          if (silenceTimer) clearTimeout(silenceTimer)
          
          silenceTimer = setTimeout(() => {
            if (finalTranscript.trim() && isListeningRef.current) {
              console.log('🚀 Auto-sending after silence...')
              const messageToSend = finalTranscript.trim()
              
              // Stop AI speech if it's speaking (user is interrupting)
              if (isSpeakingRef.current) {
                console.log('🛑 User interrupting AI - stopping speech')
                if (synthRef.current) {
                  synthRef.current.cancel()
                  speechQueueRef.current = []
                  spokenSentencesRef.current.clear()
                  isSpeakingRef.current = false
                  setIsSpeaking(false)
                }
              }
              
              // Send the message first
              setInput(messageToSend)
              setTimeout(() => {
                const sendBtn = document.querySelector('[title="Send message"]') as HTMLButtonElement
                if (sendBtn) {
                  sendBtn.click()
                  
                  // Stop and restart mic to completely reset
                  if (recognitionRef.current && isListeningRef.current) {
                    console.log('🔄 Restarting mic to reset...')
                    try {
                      recognitionRef.current.stop()
                      // Will auto-restart in onend handler with fresh state
                    } catch (e) {
                      console.log('Error stopping recognition:', e)
                    }
                  }
                }
              }, 100)
            }
          }, 2000)  // 2 seconds of silence triggers send
        }
      }

      recognition.onerror = (event: any) => {
        console.error('✗ Speech recognition error:', event.error)
        
        // Don't stop on these errors - just continue
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          console.log('Continuing despite error:', event.error)
          return
        }
        
        // Network error - speech recognition service unavailable
        if (event.error === 'network') {
          console.error('Network error - speech recognition service unavailable')
          alert('❌ Speech recognition service unavailable!\n\nThis might be because:\n1. No internet connection (Chrome\'s speech recognition needs internet)\n2. Google speech service is blocked\n3. Firewall/proxy blocking the service\n\nTry:\n- Check your internet connection\n- Use Chrome or Edge browser\n- Type your question instead')
          isListeningRef.current = false
          setIsListening(false)
          return
        }
        
        // For other errors, stop listening
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('❌ Microphone access denied!\n\nPlease:\n1. Click the 🔒 lock icon in the address bar\n2. Allow microphone access\n3. Refresh the page')
        }
        
        isListeningRef.current = false
        setIsListening(false)
      }

      recognition.onend = () => {
        console.log('Speech recognition ended, isListening:', isListeningRef.current)
        
        // IMPORTANT: Reset transcript accumulator when recognition ends
        finalTranscript = ''
        lastFinalIndex = 0
        console.log('🔄 Reset transcript accumulator')
        
        // Always restart if we're supposed to be listening
        if (isListeningRef.current) {
          try {
            console.log('Restarting recognition...')
            recognition.start()
          } catch (e) {
            console.error('Recognition restart failed:', e)
            setIsListening(false)
            isListeningRef.current = false
          }
        } else {
          setIsListening(false)
          isListeningRef.current = false
        }
      }

      recognitionRef.current = recognition
      console.log('✓ Speech Recognition initialized')
    }
  }, [])

  // Detect emotion from word/sentence context
  const detectEmotion = (word: string, sentence: string): string => {
    const lowerWord = word.toLowerCase()
    const lowerSentence = sentence.toLowerCase()
    
    // Positive/Happy words
    const happyWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'beautiful', 'awesome', 'brilliant', 'success', 'congratulations', 'yes', 'correct', 'right']
    if (happyWords.some(w => lowerWord.includes(w))) return 'happy'
    
    // Excited words
    const excitedWords = ['wow', 'incredible', 'extraordinary', 'fascinating', 'remarkable', 'spectacular', 'outstanding', 'phenomenal', 'exciting']
    if (excitedWords.some(w => lowerWord.includes(w))) return 'excited'
    
    // Curious/Interested words
    const curiousWords = ['interesting', 'curious', 'wonder', 'question', 'why', 'how', 'what', 'explore', 'discover', 'investigate']
    if (curiousWords.some(w => lowerWord.includes(w)) || lowerSentence.includes('?')) return 'curious'
    
    // Concerned/Serious words
    const concernedWords = ['careful', 'caution', 'warning', 'danger', 'important', 'critical', 'serious', 'attention', 'safety', 'toxic', 'hazard']
    if (concernedWords.some(w => lowerWord.includes(w))) return 'concerned'
    
    // Surprised words
    const surprisedWords = ['surprise', 'unexpected', 'shocking', 'unbelievable', 'astonishing', 'whoa', 'oh']
    if (surprisedWords.some(w => lowerWord.includes(w)) || lowerSentence.includes('!')) return 'surprised'
    
    // Thinking words
    const thinkingWords = ['think', 'consider', 'analyze', 'examine', 'study', 'understand', 'complex', 'difficult', 'hmm', 'let']
    if (thinkingWords.some(w => lowerWord.includes(w))) return 'thinking'
    
    return 'neutral'
  }

  // Detect phoneme type from word/character
  const detectPhoneme = (word: string): string => {
    if (!word) return 'neutral'
    
    const firstChar = word[0].toUpperCase()
    const firstTwo = word.substring(0, 2).toUpperCase()
    
    // Check for specific phoneme patterns
    if (firstChar === 'F' || firstChar === 'V') return 'F'
    if (firstTwo === 'TH') return 'TH'
    if (firstChar === 'S' || firstChar === 'Z') return 'S'
    if (firstChar === 'T' || firstChar === 'D' || firstChar === 'N') return 'T'
    if (firstChar === 'M' || firstChar === 'B' || firstChar === 'P') return 'M'
    
    // Check for vowel sounds
    if (/^[AEIOU]/.test(firstChar)) {
      if (firstChar === 'E' || firstChar === 'I') return 'EE'
      if (firstChar === 'O' || firstChar === 'U') return 'O'
      return 'A'
    }
    
    return 'neutral'
  }

  // Clean markdown formatting from text for speech
  const cleanMarkdownForSpeech = (text: string): string => {
    let cleaned = text
    
    // Step 1: Remove markdown headers (# ## ###)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '')
    
    // Step 2: Remove bold markers (** __)
    cleaned = cleaned.replace(/\*\*/g, '')
    cleaned = cleaned.replace(/__/g, '')
    
    // Step 3: Remove ALL asterisks (for bullets and emphasis)
    cleaned = cleaned.replace(/\*/g, '')
    
    // Step 4: Remove underscores
    cleaned = cleaned.replace(/_/g, ' ')
    
    // Step 5: Remove bullet points at start of lines (- * •)
    cleaned = cleaned.replace(/^[\s]*[-•]\s+/gm, '')
    
    // Step 6: Remove numbered lists (1. 2. 3.)
    cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '')
    
    // Step 7: Remove code blocks and backticks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '')
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1')
    cleaned = cleaned.replace(/`/g, '')
    
    // Step 8: Remove links [text](url) -> text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    
    // Step 9: Remove any remaining special markdown characters
    cleaned = cleaned.replace(/[#~>|[\]{}]/g, '')
    
    // Step 10: Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.trim()
    
    return cleaned
  }

  // Speak text progressively as it arrives
  const speakTextProgressive = (text: string) => {
    if (!synthRef.current || !text) return

    // Extract complete sentences from the text
    const sentences = text.match(/[^.!?]+[.!?]+/g) || []
    
    // Add new sentences to queue (only if not already spoken)
    sentences.forEach(sentence => {
      const trimmed = sentence.trim()
      if (trimmed && !spokenSentencesRef.current.has(trimmed) && !speechQueueRef.current.includes(trimmed)) {
        console.log('🔊 Adding to speech queue:', trimmed)
        speechQueueRef.current.push(trimmed)
      } else if (trimmed) {
        console.log('⏭️ Skipping (already spoken/queued):', trimmed)
      }
    })

    // Start speaking if not already speaking
    if (!isSpeakingRef.current && speechQueueRef.current.length > 0) {
      console.log('🎤 Starting speech, queue length:', speechQueueRef.current.length)
      speakNextInQueue()
    }
  }

  // Speak the next sentence in queue
  const speakNextInQueue = () => {
    if (!synthRef.current || speechQueueRef.current.length === 0) {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      onSpeakingChange?.(false)
      onLipSyncIntensityChange?.(0)  // Close mouth when queue is empty
      console.log('✅ Speech queue empty, stopping')
      // Mic stays running - no need to restart
      return
    }

    const sentence = speechQueueRef.current.shift()
    if (!sentence) return

    // Check if already spoken (double safety check)
    if (spokenSentencesRef.current.has(sentence)) {
      console.log('⚠️ Sentence already spoken, skipping:', sentence)
      speakNextInQueue()  // Move to next
      return
    }

    // Mark this sentence as spoken
    spokenSentencesRef.current.add(sentence)
    
    // Clean markdown formatting before speaking
    const cleanedSentence = cleanMarkdownForSpeech(sentence)
    console.log('�  Original sentence:', sentence)
    console.log('🗣️ Cleaned sentence:', cleanedSentence)
    console.log('✨ Asterisks removed:', (sentence.match(/\*/g) || []).length)

    isSpeakingRef.current = true
    setIsSpeaking(true)
    onSpeakingChange?.(true)
    // Don't set intensity here - wait for first word boundary event

    const utterance = new SpeechSynthesisUtterance(cleanedSentence)
    utterance.rate = 1.1  // Slightly faster for better flow
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    // Try to use a female voice for the chemistry teacher
    const voices = synthRef.current.getVoices()
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Victoria') ||
      voice.name.includes('Zira')
    )
    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    // Track current character position for punctuation detection
    // Use cleaned text for boundary events
    let currentText = cleanedSentence
    let lastCharIndex = 0
    
    // Start event - only open mouth when speech actually starts
    utterance.onstart = () => {
      console.log('🎤 Speech audio started')
      // Start with varied opening for natural start
      const startIntensity = 0.55 + Math.random() * 0.2  // 0.55-0.75
      onLipSyncIntensityChange?.(startIntensity)
    }
    
    // Add boundary event for word-level lip sync
    utterance.onboundary = (event) => {
      if (event.name === 'word' && event.charIndex !== undefined) {
        // Get the character at this position
        const char = currentText[event.charIndex]
        const prevChar = event.charIndex > 0 ? currentText[event.charIndex - 1] : ''
        
        // Check for punctuation before this word
        const isPunctuation = /[.!?,;:]/.test(prevChar)
        
        if (isPunctuation) {
          // Pause at punctuation - close mouth completely
          console.log('🤐 Punctuation detected:', prevChar, '- closing mouth')
          onLipSyncIntensityChange?.(0)
          
          // Brief pause, then resume with varied intensity
          setTimeout(() => {
            const resumeIntensity = 0.55 + Math.random() * 0.2  // 0.55-0.75
            onLipSyncIntensityChange?.(resumeIntensity)
          }, prevChar === '.' || prevChar === '!' || prevChar === '?' ? 200 : 100)
        } else {
          // Extract current word for phoneme and emotion detection
          const nextSpace = currentText.indexOf(' ', event.charIndex)
          const wordEnd = nextSpace > 0 ? nextSpace : currentText.length
          const currentWord = currentText.substring(event.charIndex, wordEnd).trim()
          const wordLength = currentWord.length
          
          // DETECT PHONEME from current word
          const phoneme = detectPhoneme(currentWord)
          console.log('🔤 Word:', currentWord, '- Phoneme:', phoneme)
          onPhonemeChange?.(phoneme)
          
          // DETECT EMOTION from current word and sentence context
          const emotion = detectEmotion(currentWord, currentText)
          console.log('😊 Emotion:', emotion)
          onEmotionChange?.(emotion)
          
          // Longer words = slightly more mouth opening
          const lengthFactor = Math.min(wordLength / 10, 0.15)
          
          // High variation for ultra-realistic speech (0.6-0.95)
          const baseIntensity = 0.6 + Math.random() * 0.35
          const intensity = Math.min(0.95, baseIntensity + lengthFactor)
          
          console.log('🗣️ Word at', event.charIndex, '- intensity:', intensity.toFixed(2))
          onLipSyncIntensityChange?.(intensity)
          
          // Add micro-pauses between words for realism
          setTimeout(() => {
            onLipSyncIntensityChange?.(intensity * 0.7)  // Slight close between syllables
            onPhonemeChange?.('neutral')  // Reset to neutral between words
          }, 50)
          
          // Hold emotion for longer (500ms) for natural expression
          setTimeout(() => {
            onEmotionChange?.('neutral')  // Reset to neutral after expression
          }, 500)
        }
        
        lastCharIndex = event.charIndex
      }
    }

    utterance.onend = () => {
      console.log('🤐 Sentence ended - closing mouth')
      onLipSyncIntensityChange?.(0)  // Close mouth at end of sentence
      
      // Small pause between sentences for natural speech
      setTimeout(() => {
        speakNextInQueue()
      }, 300)  // 300ms pause between sentences
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      // Try next sentence
      speakNextInQueue()
    }

    synthRef.current.speak(utterance)
  }

  // Stop all speech
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      speechQueueRef.current = []
      spokenSentencesRef.current.clear()  // Clear spoken sentences tracker
      isSpeakingRef.current = false
      setIsSpeaking(false)
      onSpeakingChange?.(false)
      onLipSyncIntensityChange?.(0)  // Close mouth when stopping
    }
  }

  // Start voice input
  const startListening = () => {
    console.log('🎤 Start listening clicked')
    
    if (!speechRecognitionSupported) {
      alert(`❌ Voice Input Not Supported in ${browserInfo}\n\n` +
        `Speech recognition only works in:\n` +
        `✅ Google Chrome\n` +
        `✅ Microsoft Edge\n\n` +
        `Currently not supported in:\n` +
        `❌ Safari\n` +
        `❌ Brave\n` +
        `❌ Firefox\n\n` +
        `Please switch to Chrome or Edge to use voice input, or type your questions instead.`)
      return
    }
    
    if (!recognitionRef.current) {
      console.error('❌ Speech recognition not initialized')
      alert('Speech recognition is not available in your browser. Please use Chrome or Edge.')
      return
    }
    
    if (isListeningRef.current) {
      console.log('Already listening, ignoring')
      return
    }
    
    // Stop any ongoing speech
    stopSpeaking()
    
    // Send greeting message to ask for user's name
    const greetingMessage = "Hello! Welcome to the chemistry lab. Before we start, could you please tell me your name so I can personalize our learning session?"
    
    // Add greeting to messages
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: greetingMessage,
      timestamp: new Date()
    }])
    
    // Speak the greeting
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(greetingMessage)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      const voices = synthRef.current.getVoices()
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Zira')
      )
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }
      
      utterance.onend = () => {
        console.log('🎤 Greeting finished, ready for user input')
        // Start listening after greeting is done
        try {
          isListeningRef.current = true
          setIsListening(true)
          setInput('')
          console.log('Starting recognition...')
          recognitionRef.current.start()
        } catch (e) {
          console.error('❌ Failed to start recognition:', e)
          isListeningRef.current = false
          setIsListening(false)
        }
      }
      
      synthRef.current.speak(utterance)
    } else {
      // Fallback if speech synthesis not available
      try {
        isListeningRef.current = true
        setIsListening(true)
        setInput('')
        console.log('Starting recognition...')
        recognitionRef.current.start()
      } catch (e) {
        console.error('❌ Failed to start recognition:', e)
        isListeningRef.current = false
        setIsListening(false)
        alert('Failed to start microphone. Please check your microphone permissions.')
      }
    }
  }

  // Stop voice input
  const stopListening = () => {
    console.log('🛑 Stop listening clicked')
    
    if (!recognitionRef.current) {
      console.error('❌ Speech recognition not initialized')
      return
    }
    
    if (!isListeningRef.current) {
      console.log('Not listening, ignoring')
      return
    }
    
    isListeningRef.current = false
    setIsListening(false)
    
    try {
      console.log('Stopping recognition...')
      recognitionRef.current.stop()
    } catch (e) {
      console.error('❌ Failed to stop recognition:', e)
    }
  }

  // Initialize WebSocket connection
  useEffect(() => {
    // Log backend configuration on mount
    console.log('🌐 Backend Configuration:', getBackendInfo())
    connectWebSocket()
    
    return () => {
      wsRef.current?.close()
    }
  }, [])

  const connectWebSocket = () => {
    setConnectionStatus('connecting')
    
    try {
      const wsUrl = `${getWebSocketUrl()}/ws`
      console.log('🔌 Connecting to WebSocket:', wsUrl)
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.done) {
            // Streaming complete
            setStreaming(false)
            
            // Save the final message
            const finalContent = currentResponseRef.current
            if (finalContent) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: finalContent,
                timestamp: new Date()
              }])
            }
            
            // Clear current response
            currentResponseRef.current = ''
            setCurrentResponse('')
            
            // Mic stays running continuously - no need to restart
          } else if (data.token) {
            // Append token to current response
            currentResponseRef.current += data.token
            setCurrentResponse(currentResponseRef.current)
            
            // Speak progressively as sentences complete
            speakTextProgressive(currentResponseRef.current)
          }
        } catch (e) {
          console.error('Error parsing message:', e, 'Raw data:', event.data)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('disconnected')
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnectionStatus('disconnected')
        
        // Attempt to reconnect after 3 seconds
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
    
    // Keep mic running but we'll filter out results while AI speaks
    
    // Stop any ongoing AI speech before starting new response
    stopSpeaking()
    
    // Clear spoken sentences tracker for new response
    spokenSentencesRef.current.clear()
    
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    
    setStreaming(true)
    setCurrentResponse('')
    currentResponseRef.current = ''  // Clear previous response
    onSpeakingChange?.(true)
    
    // Send via WebSocket with full chat history
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: userMessage,
        context: experimentContext,
        chemicals: currentChemicals,
        equipment: currentEquipment,  // Include equipment in the request
        history: messages.map(m => ({
          role: m.role,
          content: m.content
        }))  // Include full chat history for context
      }))
    } else {
      // Fallback to HTTP if WebSocket not available
      try {
        const backendUrl = `${getBackendUrl()}/chat`
        console.log('📡 Using HTTP fallback:', backendUrl)
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: experimentContext,
            chemicals: currentChemicals,
            equipment: currentEquipment,  // Include equipment in the request
            history: messages.map(m => ({
              role: m.role,
              content: m.content
            }))  // Include full chat history for context
          })
        })
        
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim())
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line)
                if (data.token) {
                  setCurrentResponse(prev => prev + data.token)
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
        
        setStreaming(false)
        onSpeakingChange?.(false)
        
        if (currentResponse) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: currentResponse,
            timestamp: new Date()
          }])
          setCurrentResponse('')
        }
      } catch (error) {
        console.error('HTTP fallback error:', error)
        setStreaming(false)
        onSpeakingChange?.(false)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I could not connect to the AI service. Please make sure the backend is running.',
          timestamp: new Date()
        }])
      }
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ${
              isSpeaking ? 'animate-pulse' : ''
            }`}>
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">CHEM Assistant</h3>
              <p className="text-xs text-gray-400">
                {isListening && '🎤 Listening...'}
                {!isListening && isSpeaking && '🔊 Speaking...'}
                {!isListening && !isSpeaking && connectionStatus === 'connected' && '🟢 Online'}
                {!isListening && !isSpeaking && connectionStatus === 'connecting' && '🟡 Connecting...'}
                {!isListening && !isSpeaking && connectionStatus === 'disconnected' && '🔴 Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isListening && <Mic className="h-5 w-5 text-red-400 animate-pulse" />}
            {isSpeaking && <Volume2 className="h-5 w-5 text-orange-400 animate-pulse" />}
            <Sparkles className="h-5 w-5 text-yellow-400" />
          </div>
        </div>
        
        {/* Browser Compatibility Notice */}
        {!speechRecognitionSupported && (
          <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-xs text-yellow-200">
              ⚠️ <strong>{browserInfo}</strong> doesn't support voice input. 
              Switch to <strong>Chrome</strong> or <strong>Edge</strong> for voice features, or type your questions.
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth chat-messages" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139, 92, 246, 0.5) transparent' }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[85%] w-fit ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`p-3 rounded-2xl break-words ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/10 text-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming response */}
        {streaming && currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-2 max-w-[85%] w-fit">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="p-3 rounded-2xl bg-white/10 text-gray-100 break-words">
                <p className="text-sm whitespace-pre-wrap break-words">{currentResponse}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        {currentChemicals.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400">Current chemicals:</span>
            {currentChemicals.map((chem, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-300">
                {chem}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={streaming || connectionStatus !== 'connected' || !speechRecognitionSupported}
            className={`px-4 py-3 rounded-xl transition-all font-medium flex items-center space-x-2 ${
              !speechRecognitionSupported
                ? 'bg-gray-500/50 text-gray-400 border border-gray-500/50 cursor-not-allowed'
                : isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
            title={
              !speechRecognitionSupported 
                ? `Voice input not supported in ${browserInfo}. Use Chrome or Edge.`
                : isListening ? 'Stop listening' : 'Start voice input'
            }
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isListening ? "🎤 Listening... (click mic to stop)" : "Ask about chemistry reactions..."}
            className={`flex-1 px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isListening ? 'border-red-400 border-2' : 'border-white/20'
            }`}
            disabled={streaming || connectionStatus !== 'connected'}
            readOnly={isListening}
          />
          
          <button
            onClick={stopSpeaking}
            disabled={!isSpeaking}
            className={`px-4 py-3 rounded-xl transition-all font-medium flex items-center space-x-2 ${
              isSpeaking
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-white/10 text-gray-500 border border-white/20 opacity-50'
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Not speaking'}
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim() || connectionStatus !== 'connected'}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
            title="Send message"
          >
            {streaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
