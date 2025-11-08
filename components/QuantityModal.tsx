'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Chemical } from '@/types/chemistry'
import { X, Plus, Minus, Beaker, Droplets, Package } from 'lucide-react'

interface QuantityModalProps {
  chemical: Chemical | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (chemical: Chemical, amount: number, unit: string) => void
}

export default function QuantityModal({ chemical, isOpen, onClose, onConfirm }: QuantityModalProps) {
  const [amount, setAmount] = useState(1)
  const [unit, setUnit] = useState('ml')

  useEffect(() => {
    if (chemical) {
      setUnit(chemical.state === 'liquid' ? 'ml' : 'g')
      setAmount(chemical.state === 'liquid' ? 5 : 0.5)
    }
  }, [chemical])

  if (!chemical || !isOpen) {
    return null
  }

  const handleConfirm = () => {
    onConfirm(chemical, amount, unit)
    setAmount(1)
    setUnit('ml')
    onClose()
  }

  const incrementAmount = () => {
    setAmount(prev => Math.min(prev + (unit === 'ml' || unit === 'g' ? 0.1 : 1), 50))
  }

  const decrementAmount = () => {
    setAmount(prev => Math.max(prev - (unit === 'ml' || unit === 'g' ? 0.1 : 1), 0.1))
  }

  const presetAmounts = unit === 'ml' || unit === 'g' ? [0.1, 0.5, 1, 2, 5] : [10, 50, 100, 200, 500]

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
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold text-white">
                  Add {chemical.name}
                </h3>
                <p className="text-sm text-blue-300 font-medium">
                  {chemical.formula}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Specify the amount to add
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

            {/* Amount Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Amount
              </label>

              {/* Amount Input */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={decrementAmount}
                  className="w-12 h-12 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all border border-white/10 flex items-center justify-center"
                >
                  <Minus className="h-5 w-5 text-gray-300" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full px-4 py-3 text-center text-2xl font-bold bg-slate-800/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 transition-all"
                    step={unit === 'ml' || unit === 'g' ? 0.1 : 1}
                    min="0.1"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-base">
                    {unit}
                  </span>
                </div>

                <button
                  onClick={incrementAmount}
                  className="w-12 h-12 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all border border-white/10 flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 text-gray-300" />
                </button>
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`px-2 py-2.5 rounded-lg text-sm font-medium transition-all ${amount === preset
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-gray-300 border border-white/5'
                      }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Unit
              </label>
              <div className="grid grid-cols-2 gap-3">
                {chemical.state === 'liquid' ? (
                  <>
                    <button
                      onClick={() => setUnit('ml')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${unit === 'ml'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-gray-300 border border-white/5'
                        }`}
                    >
                      Milliliters (ml)
                    </button>
                    <button
                      onClick={() => setUnit('drops')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${unit === 'drops'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-gray-300 border border-white/5'
                        }`}
                    >
                      Drops
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setUnit('g')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${unit === 'g'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-gray-300 border border-white/5'
                        }`}
                    >
                      Grams (g)
                    </button>
                    <button
                      onClick={() => setUnit('mg')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${unit === 'mg'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-gray-300 border border-white/5'
                        }`}
                    >
                      Milligrams (mg)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3.5 bg-slate-800/30 hover:bg-slate-700/40 text-gray-300 hover:text-white rounded-xl font-medium transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Beaker className="h-5 w-5" />
                <span>Add</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
