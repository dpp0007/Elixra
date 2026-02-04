'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Check, RefreshCw, X, Cat, Dog, Rabbit, Fish, Bird, Bug, User } from 'lucide-react'

const ANIMALS = [
  'Panda', 'Tiger', 'Lion', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Bear', 'Owl', 'Koala',
  'Penguin', 'Cheetah', 'Leopard', 'Hawk', 'Falcon', 'Shark', 'Whale', 'Octopus', 'Badger', 'Otter'
]

const ADJECTIVES = [
  'Happy', 'Swift', 'Brave', 'Clever', 'Bright', 'Calm', 'Eager', 'Fancy', 'Gentle', 'Jolly',
  'Kind', 'Lively', 'Proud', 'Silly', 'Witty', 'Lucky', 'Noble', 'Sunny', 'Wild', 'Zen'
]

export default function UsernameSetupModal() {
  const { user, updateProfile, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Show modal if user is authenticated but doesn't have a username
    if (isAuthenticated && user && !user.username && !isLoading && !success) {
      setIsOpen(true)
      generateRandomUsername()
    } else if (user?.username) {
      setIsOpen(false)
    }
  }, [isAuthenticated, user, isLoading, success])

  const generateRandomUsername = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    const num = Math.floor(Math.random() * 1000)
    setUsername(`${adj}${animal}${num}`)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Username cannot be empty')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set username')
      }

      setSuccess(true)
      
      // Update session with new username
      await updateProfile({ username })
      
      // Close modal after a brief delay
      setTimeout(() => {
        setIsOpen(false)
        window.location.href = '/' // Redirect to homepage
      }, 1500)
      
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Cat className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Identity</h2>
              <p className="text-gray-400 text-sm">
                Every scientist needs a codename. Pick a unique username to start your journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="Enter username"
                  minLength={3}
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={generateRandomUsername}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  title="Generate Random"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin h-5 w-5" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Start Exploring</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
