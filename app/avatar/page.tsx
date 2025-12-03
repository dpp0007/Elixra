'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, Zap, BookOpen, Beaker, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ModernNavbar from '@/components/ModernNavbar'
import StreamingChat from '@/components/StreamingChat'

// Dynamically import 3D avatar to avoid SSR issues
const AvatarTeacher = dynamic(() => import('@/components/AvatarTeacherNew'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading avatar...</p>
      </div>
    </div>
  )
})

export default function AvatarPage() {
  const [speaking, setSpeaking] = useState(false)
  const [currentChemicals, setCurrentChemicals] = useState<string[]>([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute w-full h-full">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
        </motion.div>
      </div>

      {/* Navbar */}
      <ModernNavbar />

      {/* Main Content */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link
              href="/lab"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Lab</span>
            </Link>
            
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-200">Powered by Ollama • Fully Offline</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                AI Chemistry Teacher
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ask questions, learn mechanisms, and get instant explanations from your personal AI chemistry tutor
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-300px)] min-h-[600px]">
            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative w-full overflow-hidden"
            >
              <div className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden">
                {/* Avatar Container */}
                <div className="h-full relative">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading avatar...</p>
                      </div>
                    </div>
                  }>
                    <AvatarTeacher speaking={speaking} />
                  </Suspense>
                  
                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${speaking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="text-sm text-white">
                        {speaking ? 'Speaking...' : 'Listening'}
                      </span>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                    <div className="bg-black/50 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                      <Bot className="h-5 w-5 text-purple-400 mb-1" />
                      <p className="text-xs text-gray-300">AI Powered</p>
                    </div>
                    <div className="bg-black/50 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                      <Zap className="h-5 w-5 text-yellow-400 mb-1" />
                      <p className="text-xs text-gray-300">Real-time</p>
                    </div>
                    <div className="bg-black/50 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                      <BookOpen className="h-5 w-5 text-blue-400 mb-1" />
                      <p className="text-xs text-gray-300">RAG Enhanced</p>
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
                currentChemicals={currentChemicals}
                experimentContext="Learning chemistry concepts"
              />
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Beaker, text: 'Explain SN2 mechanism', color: 'from-purple-500 to-pink-500' },
              { icon: Sparkles, text: 'What is a Grignard reaction?', color: 'from-blue-500 to-cyan-500' },
              { icon: Zap, text: 'How does combustion work?', color: 'from-orange-500 to-red-500' },
              { icon: BookOpen, text: 'Teach me acid-base reactions', color: 'from-green-500 to-emerald-500' }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  // This would trigger the chat with the preset question
                  console.log('Quick action:', action.text)
                }}
                className="group relative p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl hover:border-white/40 transition-all duration-300"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors text-left">
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
