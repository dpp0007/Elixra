'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Users, Plus, LogIn, Copy, CheckCircle, Lock } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import { PerspectiveGrid } from '@/components/GridBackground'

export default function CollaboratePage() {
  const [roomCode, setRoomCode] = useState('')
  const [createdRoom, setCreatedRoom] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const isAuthenticated = status === 'authenticated'

  const createSession = async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const response = await fetch('/api/collaboration/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: session?.user?.email || 'unknown',
            name: session?.user?.name || 'Host'
        })
      })
      const data = await response.json()
      if (data.success) {
        setCreatedRoom(data.roomCode)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('Failed to create collaboration session')
    } finally {
      setLoading(false)
    }
  }
  
  const joinSession = async () => {
    if (!isAuthenticated) return
    if (!roomCode.trim()) {
      alert('Please enter a room code')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/collaboration/session?roomCode=${roomCode}`)
      const data = await response.json()
      
      if (data.roomCode) {
        // Redirect to collaborative lab
        window.location.href = `/lab/collaborative?room=${roomCode}`
      } else {
        alert('Room not found')
      }
    } catch (error) {
      console.error('Failed to join session:', error)
      alert('Failed to join collaboration session')
    } finally {
      setLoading(false)
    }
  }
  
  const copyRoomCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-300">
      <PerspectiveGrid />

      {/* Modern Navbar */}
      <ModernNavbar />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-elixra-text-primary mb-4">Collaboration Hub</h1>
            {!isAuthenticated && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full border border-amber-200 dark:border-amber-700">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Please sign in to access collaboration features</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-elixra-border-subtle rounded-2xl p-8 shadow-lg relative ${!isAuthenticated ? 'opacity-75' : ''}`}
          >
            {!isAuthenticated && (
                <div className="absolute inset-0 z-20 bg-gray-100/50 dark:bg-black/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                    <Link href="/auth/signin" className="btn-primary px-6 py-2 shadow-lg">Sign In to Create</Link>
                </div>
            )}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-elixra-bunsen/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-elixra-bunsen/20">
                <Plus className="h-8 w-8 text-elixra-bunsen" />
              </div>
              <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-2">
                Create Session
              </h2>
              <p className="text-elixra-secondary">
                Start a new collaboration session and invite others
              </p>
            </div>
            
            {createdRoom ? (
              <div className="space-y-4">
                <div className="bg-elixra-success/10 border border-elixra-success/20 rounded-xl p-4">
                  <p className="text-sm text-elixra-success mb-2 font-medium">
                    Session created successfully!
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3 font-mono text-2xl text-center text-elixra-charcoal dark:text-white tracking-widest border border-elixra-border-subtle">
                      {createdRoom}
                    </div>
                    <button
                      onClick={copyRoomCode}
                      className="p-3 bg-elixra-bunsen hover:bg-elixra-bunsen-dark text-white rounded-lg transition-colors shadow-md"
                    >
                      {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Link
                  href={`/lab/collaborative?room=${createdRoom}`}
                  className="block w-full px-6 py-3 btn-primary text-center"
                >
                  Enter Lab
                </Link>
                
                <button
                  onClick={() => setCreatedRoom(null)}
                  className="w-full px-6 py-3 bg-white/50 dark:bg-white/5 text-elixra-charcoal dark:text-white rounded-lg hover:bg-white/80 dark:hover:bg-white/10 transition-colors border border-elixra-border-subtle"
                >
                  Create Another
                </button>
              </div>
            ) : (
              <button
                onClick={createSession}
                disabled={loading || !isAuthenticated}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            )}
          </motion.div>
          
          {/* Join Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-elixra-border-subtle rounded-2xl p-8 shadow-lg relative ${!isAuthenticated ? 'opacity-75' : ''}`}
          >
            {!isAuthenticated && (
                <div className="absolute inset-0 z-20 bg-gray-100/50 dark:bg-black/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                    <Link href="/auth/signin" className="btn-secondary px-6 py-2 shadow-lg">Sign In to Join</Link>
                </div>
            )}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-elixra-copper/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-elixra-copper/20">
                <LogIn className="h-8 w-8 text-elixra-copper" />
              </div>
              <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-2">
                Join Session
              </h2>
              <p className="text-elixra-secondary">
                Enter a room code to join an existing session
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-elixra-secondary mb-2 ml-1">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={!isAuthenticated}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-elixra-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-elixra-copper/50 focus:border-elixra-copper/50 text-elixra-charcoal dark:text-white font-mono text-center text-2xl uppercase tracking-widest placeholder-elixra-secondary/50"
                />
              </div>
              
              <button
                onClick={joinSession}
                disabled={loading || !roomCode.trim() || !isAuthenticated}
                className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Session'}
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-elixra-bunsen/5 backdrop-blur-xl border border-elixra-bunsen/20 rounded-xl p-6"
        >
          <h3 className="font-bold text-elixra-bunsen-dark dark:text-elixra-bunsen-light mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            How Collaboration Works
          </h3>
          <ul className="space-y-2 text-sm text-elixra-secondary">
            <li className="flex items-start">
              <span className="mr-2 font-bold text-elixra-bunsen">1.</span>
              <span>Create a session or join with a room code</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold text-elixra-bunsen">2.</span>
              <span>Share the room code with your lab partners</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold text-elixra-bunsen">3.</span>
              <span>Work together on experiments in real-time</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold text-elixra-bunsen">4.</span>
              <span>See each other&apos;s actions and results instantly</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
