import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, ShieldAlert } from 'lucide-react'

interface ConflictErrorModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  conflictingEquipment?: {
    new: string
    existing: string
  }
}

export default function ConflictErrorModal({
  isOpen,
  onClose,
  message,
  conflictingEquipment
}: ConflictErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110000] flex items-center justify-center p-4"
          onClick={onClose}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="error-title"
          aria-describedby="error-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[#1a1f2e] border-l-4 border-red-500 rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-500/10 p-6 flex items-start gap-4 border-b border-red-500/20">
              <div className="p-3 bg-red-500/20 rounded-full flex-shrink-0">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 id="error-title" className="text-xl font-bold text-white mb-1">
                  Equipment Conflict
                </h3>
                <p className="text-red-400 text-sm font-medium">
                  Operation Blocked
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close error"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-white">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span id="error-desc" className="font-medium text-lg">
                  These two equipment cannot be used together
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {message}
              </p>

              {conflictingEquipment && (
                <div className="bg-black/30 rounded-lg p-4 mb-6 border border-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-green-400 font-bold mb-1">Active</span>
                      <span className="text-gray-300 bg-white/5 px-3 py-1 rounded">
                        {conflictingEquipment.existing}
                      </span>
                    </div>
                    <div className="text-red-500 font-bold px-2">VS</div>
                    <div className="flex flex-col items-center">
                      <span className="text-red-400 font-bold mb-1">Requested</span>
                      <span className="text-gray-300 bg-white/5 px-3 py-1 rounded">
                        {conflictingEquipment.new}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
