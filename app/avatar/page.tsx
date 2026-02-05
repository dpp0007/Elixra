'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, Zap, BookOpen, Beaker, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ModernNavbar from '@/components/ModernNavbar'
import StreamingChat from '@/components/StreamingChat'
import { PerspectiveGrid, StaticGrid } from '@/components/GridBackground'

// Dynamically import 3D avatar to avoid SSR issues
const AvatarTeacher = dynamic(() => import('@/components/AvatarTeacherNew'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-elixra-bunsen border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-elixra-secondary">Loading avatar...</p>
      </div>
    </div>
  )
})

export default function AvatarPage() {
  const [speaking, setSpeaking] = useState(false)
  const [lipSyncIntensity, setLipSyncIntensity] = useState(0)
  const [currentPhoneme, setCurrentPhoneme] = useState('neutral')
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [currentChemicals, setCurrentChemicals] = useState<string[]>([])

  return (
    <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-300">
      {/* Background Grid */}
      <PerspectiveGrid />

      {/* Navbar */}
      <ModernNavbar />

      {/* Main Content */}
      <div className="relative z-10 pt-8 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link
              href="/lab"
              className="inline-flex items-center space-x-2 text-elixra-secondary hover:text-elixra-bunsen transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Lab</span>
            </Link>
            
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-elixra-bunsen/10 backdrop-blur-xl border border-elixra-bunsen/20 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-elixra-copper" />
              <span className="text-sm text-elixra-bunsen-dark dark:text-elixra-bunsen-light font-medium">Powered by Ollama • Fully Offline</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 text-elixra-charcoal dark:text-white">
              ERA - <span className="text-elixra-bunsen">ELIXRA</span> Reaction Avatar
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-elixra-secondary max-w-2xl mx-auto px-4 leading-relaxed">
              Your intelligent chemistry teaching assistant. Ask questions, learn mechanisms, and get instant explanations with interactive guidance.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-300px)] min-h-[600px]">
            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative w-full h-full"
            >
              <div className="h-full glass-panel bg-white/40 dark:bg-elixra-warm-gray/60 backdrop-blur-2xl rounded-3xl overflow-hidden border border-elixra-border-subtle shadow-xl relative group">
                 <StaticGrid className="opacity-30" />
                 
                {/* Avatar Container */}
                <div className="h-full relative z-10">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-elixra-bunsen border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-elixra-secondary">Loading avatar...</p>
                      </div>
                    </div>
                  }>
                    <AvatarTeacher speaking={speaking} lipSyncIntensity={lipSyncIntensity} currentPhoneme={currentPhoneme} currentEmotion={currentEmotion} />
                  </Suspense>
                  
                  {/* Status Indicator - Responsive */}
                  <div className="absolute top-4 left-4 px-4 py-2 bg-elixra-cream/80 dark:bg-elixra-charcoal/80 backdrop-blur-xl rounded-full border border-elixra-border-subtle shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${speaking ? 'bg-elixra-success animate-pulse' : 'bg-elixra-secondary'}`} />
                      <span className="text-sm font-medium text-elixra-charcoal dark:text-white">
                        {speaking ? 'Speaking...' : 'Listening'}
                      </span>
                    </div>
                  </div>

                  {/* Info Cards - Hidden on mobile, visible on tablet+ */}
                  <div className="hidden sm:grid absolute bottom-4 left-4 right-4 grid-cols-3 gap-2">
                    <div className="bg-elixra-cream/80 dark:bg-elixra-charcoal/80 backdrop-blur-xl rounded-xl p-3 border border-elixra-border-subtle shadow-sm">
                      <Bot className="h-5 w-5 text-elixra-bunsen mb-1" />
                      <p className="text-xs text-elixra-secondary font-medium">AI Powered</p>
                    </div>
                    <div className="bg-elixra-cream/80 dark:bg-elixra-charcoal/80 backdrop-blur-xl rounded-xl p-3 border border-elixra-border-subtle shadow-sm">
                      <Zap className="h-5 w-5 text-elixra-copper mb-1" />
                      <p className="text-xs text-elixra-secondary font-medium">Real-time</p>
                    </div>
                    <div className="bg-elixra-cream/80 dark:bg-elixra-charcoal/80 backdrop-blur-xl rounded-xl p-3 border border-elixra-border-subtle shadow-sm">
                      <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
                      <p className="text-xs text-elixra-secondary font-medium">RAG Enhanced</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chat Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="h-full w-full overflow-hidden"
            >
              <StreamingChat
                onSpeakingChange={setSpeaking}
                onLipSyncIntensityChange={setLipSyncIntensity}
                onPhonemeChange={setCurrentPhoneme}
                onEmotionChange={setCurrentEmotion}
                currentChemicals={currentChemicals}
                experimentContext="Learning chemistry concepts"
              />
            </motion.div>
          </div>

          {/* Quick Actions - Responsive grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Beaker, text: 'Explain SN2 mechanism', color: 'text-elixra-bunsen', bg: 'bg-elixra-bunsen/10' },
              { icon: Sparkles, text: 'What is a Grignard reaction?', color: 'text-elixra-copper', bg: 'bg-elixra-copper/10' },
              { icon: Zap, text: 'How does combustion work?', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { icon: BookOpen, text: 'Teach me acid-base reactions', color: 'text-elixra-success', bg: 'bg-elixra-success/10' }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  // This would trigger the chat with the preset question
                  console.log('Quick action:', action.text)
                }}
                className="group relative p-4 bg-white/95 dark:bg-elixra-charcoal/90 backdrop-blur-xl border border-elixra-border-subtle rounded-2xl hover:border-elixra-bunsen/30 hover:shadow-lg transition-all duration-300 text-left shadow-sm"
              >
                <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-elixra-bunsen transition-colors">
                  {action.text}
                </p>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
