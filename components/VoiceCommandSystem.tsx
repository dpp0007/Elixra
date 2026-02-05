'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: any;
  }
}

interface VoiceCommand {
  command: string
  action: string
  confidence: number
  timestamp: Date
}

interface VoiceCommandSystemProps {
  onCommand: (command: VoiceCommand) => void
  isListening: boolean
  onToggleListening: () => void
  className?: string
}

// Command patterns with fuzzy matching
const COMMAND_PATTERNS = [
  {
    patterns: ['add carbon atom', 'place carbon', 'insert carbon', 'carbon atom'],
    action: 'ADD_ELEMENT',
    element: 'C'
  },
  {
    patterns: ['add hydrogen atom', 'place hydrogen', 'insert hydrogen', 'hydrogen atom'],
    action: 'ADD_ELEMENT',
    element: 'H'
  },
  {
    patterns: ['add oxygen atom', 'place oxygen', 'insert oxygen', 'oxygen atom'],
    action: 'ADD_ELEMENT',
    element: 'O'
  },
  {
    patterns: ['add nitrogen atom', 'place nitrogen', 'insert nitrogen', 'nitrogen atom'],
    action: 'ADD_ELEMENT',
    element: 'N'
  },
  {
    patterns: ['build benzene ring', 'make benzene', 'create benzene', 'benzene'],
    action: 'LOAD_TEMPLATE',
    template: 'benzene'
  },
  {
    patterns: ['build water molecule', 'make water', 'create water', 'water'],
    action: 'LOAD_TEMPLATE',
    template: 'water'
  },
  {
    patterns: ['build methane', 'make methane', 'create methane', 'methane'],
    action: 'LOAD_TEMPLATE',
    template: 'methane'
  },
  {
    patterns: ['build glucose', 'make glucose', 'create glucose', 'glucose'],
    action: 'LOAD_TEMPLATE',
    template: 'glucose'
  },
  {
    patterns: ['clear scene', 'clear all', 'remove all', 'delete everything'],
    action: 'CLEAR_SCENE'
  },
  {
    patterns: ['undo last action', 'undo', 'go back'],
    action: 'UNDO'
  },
  {
    patterns: ['redo', 'redo action', 'go forward'],
    action: 'REDO'
  },
  {
    patterns: ['analyze molecule', 'analyze this', 'analyze structure'],
    action: 'ANALYZE'
  },
  {
    patterns: ['add bond', 'create bond', 'make bond'],
    action: 'ADD_BOND'
  },
  {
    patterns: ['remove bond', 'delete bond'],
    action: 'REMOVE_BOND'
  },
  {
    patterns: ['change to single bond', 'single bond'],
    action: 'CHANGE_BOND_TYPE',
    bondType: 'single'
  },
  {
    patterns: ['change to double bond', 'double bond'],
    action: 'CHANGE_BOND_TYPE',
    bondType: 'double'
  },
  {
    patterns: ['change to triple bond', 'triple bond'],
    action: 'CHANGE_BOND_TYPE',
    bondType: 'triple'
  },
  {
    patterns: ['rotate view', 'rotate molecule', 'spin'],
    action: 'ROTATE_VIEW'
  },
  {
    patterns: ['reset view', 'reset camera', 'center view'],
    action: 'RESET_VIEW'
  },
  {
    patterns: ['zoom in', 'closer'],
    action: 'ZOOM_IN'
  },
  {
    patterns: ['zoom out', 'further'],
    action: 'ZOOM_OUT'
  },
  {
    patterns: ['stop listening', 'stop', 'pause'],
    action: 'STOP_LISTENING'
  }
]

// Fuzzy string matching function
function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  // Exact match
  if (s1 === s2) return 1.0
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8
  
  // Word overlap
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  const overlap = words1.filter(word => words2.some(w2 => w2.includes(word) || word.includes(w2))).length
  const totalWords = Math.max(words1.length, words2.length)
  
  return overlap / totalWords
}

// Command recognition function
function recognizeCommand(transcript: string): { action: string; confidence: number; data?: any } | null {
  let bestMatch = null
  let bestConfidence = 0.7 // Minimum confidence threshold
  
  for (const pattern of COMMAND_PATTERNS) {
    for (const patternText of pattern.patterns) {
      const confidence = fuzzyMatch(transcript, patternText)
      if (confidence > bestConfidence) {
        bestConfidence = confidence
        bestMatch = {
          action: pattern.action,
          confidence,
          data: { element: pattern.element, template: pattern.template, bondType: pattern.bondType }
        }
      }
    }
  }
  
  return bestMatch
}

export default function VoiceCommandSystem({ 
  onCommand, 
  isListening, 
  onToggleListening, 
  className 
}: VoiceCommandSystemProps) {
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([])
  
  const recognitionRef = useRef<typeof window.SpeechRecognition | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1
        const transcript = event.results[last][0].transcript
        const confidence = event.results[last][0].confidence
        
        setTranscript(transcript)
        
        // Recognize command
        const command = recognizeCommand(transcript)
        if (command && command.confidence > 0.8) {
          const voiceCommand: VoiceCommand = {
            command: transcript,
            action: command.action,
            confidence: command.confidence,
            timestamp: new Date()
          }
          
          onCommand(voiceCommand)
          setRecentCommands(prev => [voiceCommand, ...prev.slice(0, 4)])
          
          // Provide audio feedback
          speak(`Executing: ${command.action.replace('_', ' ')}`)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          speak('I didn\'t hear anything. Please try again.')
        } else if (event.error === 'audio-capture') {
          speak('Microphone not available.')
        }
      }
      
      recognition.onend = () => {
        if (isListening) {
          // Restart recognition if still supposed to be listening
          setTimeout(() => {
            try {
              recognition.start()
            } catch (e) {
              console.error('Failed to restart recognition:', e)
            }
          }, 100)
        }
      }
      
      recognitionRef.current = recognition
      setIsSupported(true)
    } else {
      setIsSupported(false)
    }
  }, [])

  // Audio level monitoring
  useEffect(() => {
    if (isListening) {
      // Create audio context for monitoring
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = audioContext.createMediaStreamSource(stream)
          source.connect(analyser)
          
          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          dataArrayRef.current = dataArray
          analyserRef.current = analyser
          audioContextRef.current = audioContext
          
          // Monitor audio levels
          const monitorAudio = () => {
            if (analyser && dataArray) {
              analyser.getByteFrequencyData(dataArray)
              const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
              setAudioLevel(average / 255) // Normalize to 0-1
            }
            
            if (isListening) {
              requestAnimationFrame(monitorAudio)
            }
          }
          
          monitorAudio()
        })
        .catch(error => {
          console.error('Microphone access denied:', error)
          speak('Microphone access denied. Voice commands disabled.')
        })
    } else {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      setAudioLevel(0)
    }
  }, [isListening])

  // Handle listening state changes
  useEffect(() => {
    if (!recognitionRef.current || !isSupported) return
    
    if (isListening) {
      try {
        recognitionRef.current.start()
        speak('Voice commands activated.')
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
      }
    } else {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Failed to stop speech recognition:', error)
      }
    }
  }, [isListening, isSupported])

  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.7
      speechSynthesis.speak(utterance)
    }
  }

  // Audio level visualization
  const AudioWaveform = () => {
    const bars = Array.from({ length: 20 }, (_, i) => {
      const height = Math.min(1, audioLevel * (1 + Math.sin(Date.now() / 200 + i) * 0.3))
      return (
        <div
          key={i}
          className="w-1 bg-elixra-bunsen transition-all duration-75"
          style={{
            height: `${height * 20}px`,
            opacity: isListening ? 1 : 0.3
          }}
        />
      )
    })
    
    return (
      <div className="flex items-end justify-center space-x-1 h-8">
        {bars}
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className={`glass-panel bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <VolumeX className="h-5 w-5 text-elixra-secondary" />
          <div className="text-sm text-elixra-secondary">
            Voice commands not supported in this browser
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Control Button */}
      <motion.button
        onClick={onToggleListening}
        className={`
          relative w-full glass-panel rounded-xl border transition-all duration-300
          ${isListening 
            ? 'bg-elixra-bunsen/20 border-elixra-bunsen/40 shadow-lg shadow-elixra-bunsen/20' 
            : 'bg-white/40 dark:bg-white/10 border-elixra-border-subtle hover:border-elixra-bunsen/30'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {isListening ? (
                  <Mic className="h-6 w-6 text-elixra-bunsen" />
                ) : (
                  <MicOff className="h-6 w-6 text-elixra-secondary" />
                )}
                {isListening && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-elixra-bunsen/20"
                  />
                )}
              </div>
              <div>
                <div className="font-semibold text-elixra-charcoal dark:text-white">
                  {isListening ? 'Listening...' : 'Voice Commands'}
                </div>
                <div className="text-xs text-elixra-secondary">
                  {isListening ? 'Say a command' : 'Click to activate'}
                </div>
              </div>
            </div>
            
            {isListening && <AudioWaveform />}
          </div>
        </div>
      </motion.button>

      {/* Current Transcript */}
      <AnimatePresence>
        {transcript && isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-3"
          >
            <div className="text-sm text-elixra-secondary mb-1">Heard:</div>
            <div className="text-elixra-charcoal dark:text-white font-medium">
              &quot;{transcript}&quot;
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Commands */}
      <AnimatePresence>
        {recentCommands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="text-sm font-semibold text-elixra-charcoal dark:text-white">
              Recent Commands
            </div>
            
            {recentCommands.map((command, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-elixra-border-subtle rounded-lg p-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="text-elixra-charcoal dark:text-white truncate">
                    {command.command}
                  </div>
                  <div className="text-elixra-secondary">
                    {Math.round(command.confidence * 100)}%
                  </div>
                </div>
                <div className="text-xs text-elixra-secondary/70">
                  {command.action.replace('_', ' ')}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Examples */}
      {!isListening && (
        <div className="glass-panel bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-3">
          <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-2">
            Try saying:
          </div>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="text-elixra-secondary">• &quot;Add carbon atom&quot;</div>
            <div className="text-elixra-secondary">• &quot;Build benzene ring&quot;</div>
            <div className="text-elixra-secondary">• &quot;Analyze this molecule&quot;</div>
            <div className="text-elixra-secondary">• &quot;Undo last action&quot;</div>
            <div className="text-elixra-secondary">• &quot;Clear scene&quot;</div>
          </div>
        </div>
      )}
    </div>
  )
}