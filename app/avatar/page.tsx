'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mic, Sparkles, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ModernNavbar from '@/components/ModernNavbar'
import VoiceChatTeacher from '@/components/VoiceChatTeacher'
import { PerspectiveGrid, StaticGrid } from '@/components/GridBackground'

const AvatarTeacher = dynamic(() => import('@/components/AvatarTeacherNew'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-elixra-bunsen border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-elixra-secondary">Loading avatar...</p>
      </div>
    </div>
  )
})

export default function AvatarPage() {
  const [speaking, setSpeaking] = useState(false)
  const [lipSyncIntensity, setLipSyncIntensity] = useState(0)
  const [currentPhoneme, setCurrentPhoneme] = useState('neutral')
  const [currentEmotion, setCurrentEmotion] = useState('neutral')

  return (
    <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-500">
      {/* Background Grid */}
      <StaticGrid className="opacity-30 fixed inset-0 z-0 pointer-events-none" />
      
      <ModernNavbar />

      {/* Main Content Grid */}
      <div className="h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 relative z-10">
        
        {/* Left Panel - Avatar Display */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 glass-panel rounded-3xl overflow-hidden flex flex-col relative border border-elixra-border-subtle shadow-xl"
        >
          {/* Panel Header */}
          <div className="flex-shrink-0 p-4 border-b border-elixra-copper/10 bg-elixra-cream/30 dark:bg-white/5 flex items-center justify-between backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
              <Link 
                href="/lab" 
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors group"
                title="Back to Lab"
              >
                <ArrowLeft className="w-5 h-5 text-elixra-secondary group-hover:text-elixra-bunsen transition-colors" />
              </Link>
              <div>
                <h2 className="text-lg font-bold text-elixra-charcoal dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-elixra-bunsen" />
                  ERA AI Teacher
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${speaking ? 'bg-elixra-success animate-pulse' : 'bg-elixra-secondary'}`} />
                  <p className="text-xs text-elixra-secondary font-medium">
                    {speaking ? 'Speaking...' : 'Ready'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Viewport */}
          <div className="flex-1 relative bg-gradient-to-b from-transparent to-black/5 dark:to-black/20">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-elixra-bunsen border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-elixra-secondary">Loading...</p>
                </div>
              </div>
            }>
              <AvatarTeacher 
                speaking={speaking} 
                lipSyncIntensity={lipSyncIntensity} 
                currentPhoneme={currentPhoneme} 
                currentEmotion={currentEmotion} 
              />
            </Suspense>
            
            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4 p-4 glass-panel bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-xl border border-white/20">
               <p className="text-sm text-elixra-charcoal dark:text-white/90 text-center font-medium">
                 &quot;I am here to help you understand chemistry concepts. Ask me anything!&quot;
               </p>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Voice Chat Interface */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 glass-panel rounded-3xl overflow-hidden flex flex-col border border-elixra-border-subtle shadow-xl relative"
        >
           {/* Panel Header */}
           <div className="flex-shrink-0 p-4 border-b border-elixra-copper/10 bg-elixra-cream/30 dark:bg-white/5 flex items-center justify-between backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-elixra-bunsen/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-elixra-bunsen" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-elixra-charcoal dark:text-white">Voice Session</h2>
                <p className="text-xs text-elixra-secondary">Real-time audio interaction</p>
              </div>
            </div>
          </div>

          {/* Chat Component */}
          <div className="flex-1 overflow-hidden relative bg-white/30 dark:bg-white/5">
            <VoiceChatTeacher
              onSpeakingChange={setSpeaking}
              onLipSyncIntensityChange={setLipSyncIntensity}
              onPhonemeChange={setCurrentPhoneme}
              onEmotionChange={setCurrentEmotion}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
