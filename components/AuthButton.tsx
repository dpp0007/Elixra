'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogIn, LogOut, Settings, BarChart3, UserPlus, UserCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthButton() {
  const { isAuthenticated, user, experiments, syncExperiments, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 h-10 my-auto">
        <button
          onClick={() => router.push('/auth/signin')}
          className="relative group flex items-center justify-center px-6 h-full text-gray-700 hover:text-black dark:text-white/90 dark:hover:text-white rounded-full font-medium transition-all duration-300 text-sm sm:text-base touch-manipulation overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors duration-300" />
          <div className="absolute inset-0 rounded-full border border-black/10 dark:border-white/10 group-hover:border-black/20 dark:group-hover:border-white/20 transition-colors duration-300" />
          <span className="relative z-10">Sign In</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative z-50 h-10 my-auto">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="group relative flex items-center space-x-2.5 pl-2.5 pr-5 h-full rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 transition-all duration-500 shadow-lg hover:shadow-blue-500/20 overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated Gradient Border Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] z-0 pointer-events-none" />
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-md" />

        <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full border border-black/10 dark:border-white/20 shadow-inner overflow-hidden bg-white/20 dark:bg-black/20">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
        
        <div className="relative z-10 hidden sm:flex flex-col items-start justify-center h-full py-0.5">
          <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-0.5 drop-shadow-sm dark:drop-shadow-md">
            {user?.name || 'User'}
          </span>
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-300 leading-none opacity-80 group-hover:opacity-100 transition-opacity">
            @{user?.username || 'user'}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-3 w-72 sm:w-80 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 z-[9999] overflow-hidden"
          >
            <div className="p-5 border-b border-black/5 dark:border-white/10 bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 dark:to-white/0">
              <p className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              {user?.username && (
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate mb-1">
                  @{user.username}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>

            <div className="p-3">
              <div className="px-4 py-3 mb-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-1.5">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Your Statistics</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                  {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'} saved
                </p>
              </div>

              <button
                onClick={() => {
                  setShowMenu(false)
                  router.push('/profile')
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
              >
                <UserCircle className="h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  syncExperiments()
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-3"
              >
                <Settings className="h-5 w-5 flex-shrink-0 text-gray-500" />
                <span>Sync Experiments</span>
              </button>

              <button
                onClick={() => {
                  logout()
                  setShowMenu(false)
                  router.push('/')
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center space-x-3 mt-1"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
