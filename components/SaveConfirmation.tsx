'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface SaveConfirmationProps {
  isVisible: boolean
  message?: string
  onClose: () => void
  type?: 'success' | 'error'
}

export default function SaveConfirmation({
  isVisible,
  message = 'Experiment saved successfully!',
  onClose,
  type = 'success'
}: SaveConfirmationProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isVisible) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        onClose()
      }, 2500)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100]"
          role="alert"
          aria-live="polite"
        >
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border
            ${type === 'success' 
              ? 'bg-white/90 dark:bg-gray-900/90 border-green-500/30 text-green-700 dark:text-green-400' 
              : 'bg-white/90 dark:bg-gray-900/90 border-red-500/30 text-red-700 dark:text-red-400'
            }
          `}>
            <div className={`
              p-2 rounded-full shrink-0
              ${type === 'success' 
                ? 'bg-green-500/10' 
                : 'bg-red-500/10'
              }
            `}>
              {type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </div>
            
            <p className="font-medium text-sm sm:text-base pr-2">
              {message}
            </p>

            <button 
              onClick={onClose}
              className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
