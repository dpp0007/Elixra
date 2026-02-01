'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Zap, Target, TrendingUp, Award, X } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

interface UserProgress {
  level: number
  xp: number
  achievements: Achievement[]
  experimentsCompleted: number
  streak: number
}

export default function GamificationPanel() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  
  useEffect(() => {
    fetchProgress()
  }, [])
  
  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/gamification/progress')
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }
  
  const getXPForNextLevel = (level: number) => {
    return Math.pow(level, 2) * 100
  }
  
  const getXPProgress = () => {
    if (!progress) return 0
    const xpForNext = getXPForNextLevel(progress.level)
    const xpForCurrent = getXPForNextLevel(progress.level - 1)
    const currentLevelXP = progress.xp - xpForCurrent
    const xpNeeded = xpForNext - xpForCurrent
    return (currentLevelXP / xpNeeded) * 100
  }
  
  if (!progress) return null
  
  return (
    <>
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs opacity-90">Level</div>
              <div className="text-2xl font-bold">{progress.level}</div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAchievements(true)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Award className="h-5 w-5" />
          </button>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>{progress.xp} XP</span>
            <span>{getXPForNextLevel(progress.level)} XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getXPProgress()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Target className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs opacity-90">Experiments</div>
            <div className="font-bold">{progress.experimentsCompleted}</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Zap className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs opacity-90">Streak</div>
            <div className="font-bold">{progress.streak} days</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Star className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs opacity-90">Achievements</div>
            <div className="font-bold">{progress.achievements?.filter(a => a.unlocked).length || 0}</div>
          </div>
        </div>
      </div>
      
      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                  Achievements
                </h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progress.achievements?.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* New Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-4 shadow-2xl max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="text-4xl">{newAchievement.icon}</div>
              <div>
                <div className="text-sm font-medium opacity-90">Achievement Unlocked!</div>
                <div className="font-bold text-lg">{newAchievement.name}</div>
                <div className="text-sm opacity-90">{newAchievement.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
