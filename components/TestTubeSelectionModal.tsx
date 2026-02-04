'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X, TestTube2 } from 'lucide-react'
import { Chemical } from '@/types/chemistry'

interface TestTubeSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (tubeId: string) => void
  testTubes: Array<{ id: string; contents: any[] }>
  chemical: Chemical | null
}

export default function TestTubeSelectionModal({
  isOpen,
  onClose,
  onSelect,
  testTubes,
  chemical
}: TestTubeSelectionModalProps) {
  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-[#0f172a] rounded-2xl p-6 shadow-2xl max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold text-white">
                  Select Container
                </h3>
                <p className="text-sm text-blue-400 font-medium">
                  Adding {chemical?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Where would you like to add this chemical?
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 -mt-1"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>

            {/* Container List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {testTubes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No containers available. Please add a test tube first.
                </div>
              )}

              {/* Test Tubes */}
              {testTubes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Test Tubes</h4>
                  <div className="grid gap-2">
                    {testTubes.map((tube, index) => (
                      <button
                        key={tube.id}
                        onClick={() => onSelect(tube.id)}
                        className="flex items-center p-3 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-white/5 hover:border-blue-500/50 transition-all group w-full text-left"
                      >
                        <div className="p-2 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors">
                          <TestTube2 className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                            Test Tube {index + 1}
                          </div>
                          <div className="text-xs text-gray-400">
                            {tube.contents.length === 0 
                              ? 'Empty' 
                              : `${tube.contents.length} chemical${tube.contents.length !== 1 ? 's' : ''}`
                            }
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
