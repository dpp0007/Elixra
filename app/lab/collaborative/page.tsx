'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Users, Wifi, WifiOff, Copy, CheckCircle } from 'lucide-react'
import LabTable from '@/components/LabTable'
import ChemicalShelf from '@/components/ChemicalShelf'
import ReactionPanel from '@/components/ReactionPanel'
import CollaborationNotifications from '@/components/features/CollaborationNotifications'
import { useCollaboration } from '@/hooks/useCollaboration'
import { Experiment, ReactionResult } from '@/types/chemistry'

function CollaborativeLabContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = searchParams.get('room')
  
  const {
    session,
    isConnected,
    error,
    userId,
    joinSession,
    updateExperiment,
    updateCursor
  } = useCollaboration(roomCode)
  
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null)
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [userName, setUserName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addChemicalCallback, setAddChemicalCallback] = useState<((chemical: any) => void) | null>(null)
  
  useEffect(() => {
    if (!roomCode) {
      router.push('/collaborate')
    }
  }, [roomCode, router])
  
  useEffect(() => {
    if (session?.experiment) {
      setCurrentExperiment(session.experiment)
      if (session.experiment.reactionResult) {
        setReactionResult(session.experiment.reactionResult)
      }
    }
  }, [session?.experiment])
  
  const handleJoin = async () => {
    if (userName.trim()) {
      await joinSession(userName)
      setHasJoined(true)
    }
  }
  
  const handleReaction = async (experiment: Experiment) => {
    setIsReacting(true)
    setCurrentExperiment(experiment)
    
    try {
      const response = await fetch('/api/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experiment)
      })
      
      if (response.ok) {
        const result = await response.json()
        setReactionResult(result)
        
        // Update shared experiment with reaction result
        await updateExperiment({
          ...experiment,
          reactionResult: result
        })
      }
    } catch (error) {
      console.error('Reaction failed:', error)
    } finally {
      setIsReacting(false)
    }
  }
  
  // Sync experiment state changes
  const handleExperimentChange = useCallback(async (experiment: Experiment) => {
    setCurrentExperiment(experiment)
    // Sync to all participants
    await updateExperiment(experiment)
  }, [updateExperiment])
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100
    const y = (e.clientY / window.innerHeight) * 100
    updateCursor(x, y)
  }
  
  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join Collaboration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Room: <span className="font-mono font-bold">{roomCode}</span>
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
            
            <button
              onClick={handleJoin}
              disabled={!userName.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Lab
            </button>
            
            <Link
              href="/collaborate"
              className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
            >
              Back to Collaboration Hub
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900"
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/collaborate"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Leave Session</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${
                isConnected 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Room Code */}
              <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Room: <span className="font-mono">{roomCode}</span>
                </span>
                <button
                  onClick={copyRoomCode}
                  className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-blue-600" />}
                </button>
              </div>
              
              {/* Participants */}
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {session?.participants.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Participants Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-x-auto">
              {session?.participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border-2 shadow-sm flex-shrink-0"
                  style={{ borderColor: participant.color }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {participant.name}
                    {participant.userId === userId && ' (You)'}
                  </span>
                </div>
              ))}
            </div>
            
            {session?.experiment && (
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Synced</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                Collaborative Mode Active
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                When you perform a reaction, it will be shared with all participants. Everyone will see the same results in real-time!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lab Content */}
      <div className="max-w-[1600px] mx-auto px-6 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80">
            <ChemicalShelf 
              onAddChemicalToTestTube={(chemical) => {
                if (addChemicalCallback) {
                  addChemicalCallback(chemical)
                }
              }}
            />
          </div>
          
          <div className="flex-1">
            <LabTable 
              onReaction={handleReaction}
              reactionResult={reactionResult}
              isReacting={isReacting}
              onAddChemicalToTestTube={setAddChemicalCallback}
            />
          </div>
          
          <div className="w-full lg:w-80">
            <ReactionPanel 
              experiment={currentExperiment}
              result={reactionResult}
              isLoading={isReacting}
            />
          </div>
        </div>
      </div>
      
      {/* Collaboration Notifications */}
      <CollaborationNotifications session={session} userId={userId} />
      
      {/* Other Users' Cursors */}
      <AnimatePresence>
        {session?.participants
          .filter(p => p.userId !== userId && p.cursor)
          .map((participant) => (
            <motion.div
              key={participant.userId}
              className="fixed pointer-events-none z-50"
              style={{
                left: `${participant.cursor!.x}%`,
                top: `${participant.cursor!.y}%`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className="relative">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5.65376 12.3673L13.1844 4.83666L15.2653 6.91751L7.73469 14.4481L5.65376 12.3673Z"
                    fill={participant.color}
                  />
                  <path
                    d="M13.1844 4.83666L19.2653 10.9176L12.9653 17.2176L6.88439 11.1367L13.1844 4.83666Z"
                    fill={participant.color}
                  />
                </svg>
                <div
                  className="absolute top-6 left-6 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.name}
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}

export default function CollaborativeLabPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading collaboration...</p>
        </div>
      </div>
    }>
      <CollaborativeLabContent />
    </Suspense>
  )
}
