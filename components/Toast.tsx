
'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react'

// Types
export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Icons
const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-elixra-success" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case 'error':
      return <AlertOctagon className="h-5 w-5 text-elixra-error" />
    case 'info':
    default:
      return <Info className="h-5 w-5 text-elixra-bunsen" />
  }
}

// Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full"
            >
              <div className="glass-panel bg-white/90 dark:bg-black/80 backdrop-blur-md border border-elixra-border-subtle p-4 rounded-xl shadow-lg relative overflow-hidden group">
                {/* Progress Bar (Optional) */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
                   toast.type === 'success' ? 'from-elixra-success to-emerald-400' :
                   toast.type === 'error' ? 'from-elixra-error to-rose-400' :
                   toast.type === 'warning' ? 'from-amber-500 to-yellow-400' :
                   'from-elixra-bunsen to-cyan-400'
                } w-full opacity-30`} />
                
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-lg bg-opacity-10 shrink-0 ${
                     toast.type === 'success' ? 'bg-elixra-success' :
                     toast.type === 'error' ? 'bg-elixra-error' :
                     toast.type === 'warning' ? 'bg-amber-500' :
                     'bg-elixra-bunsen'
                  }`}>
                    <ToastIcon type={toast.type} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    {toast.title && (
                      <h4 className="font-bold text-sm text-elixra-charcoal dark:text-white mb-0.5">
                        {toast.title}
                      </h4>
                    )}
                    <p className="text-sm text-elixra-secondary leading-relaxed">
                      {toast.message}
                    </p>
                  </div>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors text-elixra-secondary -mr-1 -mt-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
