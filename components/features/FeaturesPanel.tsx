'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ChevronRight } from 'lucide-react'
import GamificationPanel from './GamificationPanel'
import DailyChallengeCard from './DailyChallengeCard'

export default function FeaturesPanel() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>
      
      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Features</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Gamification */}
                <GamificationPanel />
                
                {/* Daily Challenge */}
                <DailyChallengeCard />
                
                {/* Quick Links */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    Quick Access
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="/features"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        All Features
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </a>
                    
                    <a
                      href="/notebook"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Lab Notebook
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </a>
                    
                    <a
                      href="/marketplace"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Marketplace
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </a>
                    
                    <a
                      href="/analytics"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Analytics
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </a>
                    
                    <a
                      href="/safety"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Safety Training
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </a>
                    
                    <a
                      href="/curriculum"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Curriculum
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </a>
                    
                    <a
                      href="/collaborate"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Collaborate
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </a>
                  </div>
                </div>
                
                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>New!</strong> We&apos;ve added 19 advanced features to enhance your chemistry learning experience. Explore them all!
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
