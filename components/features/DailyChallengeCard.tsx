'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Clock, Award, CheckCircle } from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  expiresAt: Date
  completedBy?: string[]
}

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  
  useEffect(() => {
    fetchChallenge()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [])
  
  const fetchChallenge = async () => {
    try {
      const response = await fetch('/api/challenges/daily')
      const data = await response.json()
      setChallenge(data)
      // Check if user completed it
      // This would need user ID check
    } catch (error) {
      console.error('Failed to fetch challenge:', error)
    }
  }
  
  const updateTimeLeft = () => {
    if (!challenge) return
    
    const now = new Date().getTime()
    const expires = new Date(challenge.expiresAt).getTime()
    const diff = expires - now
    
    if (diff <= 0) {
      setTimeLeft('Expired')
      return
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    setTimeLeft(`${hours}h ${minutes}m`)
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  if (!challenge) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Daily Challenge
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {challenge.title}
            </div>
          </div>
        </div>
        
        {isCompleted && (
          <CheckCircle className="h-5 w-5 text-green-500" />
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {challenge.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          <span className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Award className="h-3 w-3 mr-1" />
            {challenge.points} XP
          </span>
        </div>
        
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          {timeLeft}
        </div>
      </div>
    </motion.div>
  )
}
