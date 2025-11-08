'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Zap, Wind, Droplet, Thermometer, Scale, Timer, X, Plus, Minus } from 'lucide-react'

interface Equipment {
  id: string
  name: string
  icon: any
  active: boolean
  value?: number
  unit?: string
  min?: number
  max?: number
}

interface EquipmentPanelProps {
  onEquipmentChange?: (equipment: Equipment[]) => void
}

export default function EquipmentPanel({ onEquipmentChange }: EquipmentPanelProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: 'burner', name: 'Bunsen Burner', icon: Flame, active: false, value: 0, unit: '°C', min: 0, max: 1500 },
    { id: 'hotplate', name: 'Hot Plate', icon: Zap, active: false, value: 25, unit: '°C', min: 25, max: 400 },
    { id: 'stirrer', name: 'Magnetic Stirrer', icon: Wind, active: false, value: 0, unit: 'RPM', min: 0, max: 1500 },
    { id: 'timer', name: 'Timer', icon: Timer, active: false, value: 0, unit: 'min', min: 0, max: 60 },
  ])

  const [isOpen, setIsOpen] = useState(false)

  const toggleEquipment = (id: string) => {
    const updated = equipment.map(eq =>
      eq.id === id ? { ...eq, active: !eq.active } : eq
    )
    setEquipment(updated)
    onEquipmentChange?.(updated)
  }

  const updateValue = (id: string, change: number) => {
    const updated = equipment.map(eq => {
      if (eq.id === id && eq.value !== undefined && eq.min !== undefined && eq.max !== undefined) {
        const newValue = Math.max(eq.min, Math.min(eq.max, eq.value + change))
        return { ...eq, value: newValue }
      }
      return eq
    })
    setEquipment(updated)
    onEquipmentChange?.(updated)
  }

  const activeEquipment = equipment.filter(eq => eq.active)

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Flame className="h-6 w-6" />
        {activeEquipment.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center">
            {activeEquipment.length}
          </span>
        )}
      </motion.button>

      {/* Equipment Panel */}
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
              <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Lab Equipment</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Equipment List */}
              <div className="p-4 space-y-4">
                {equipment.map((eq) => {
                  const Icon = eq.icon
                  return (
                    <div
                      key={eq.id}
                      className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 transition-all flex flex-col ${eq.active
                        ? 'border-green-500 shadow-lg shadow-green-500/20'
                        : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${eq.active
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                          <Icon className={`h-5 w-5 ${eq.active
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                            }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            {eq.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {eq.active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      {eq.active && eq.value !== undefined && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Setting:
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {eq.value} {eq.unit}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateValue(eq.id, -10)}
                              className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Minus className="h-4 w-4 mx-auto" />
                            </button>

                            <div className="flex-1">
                              <input
                                type="range"
                                min={eq.min}
                                max={eq.max}
                                value={eq.value}
                                onChange={(e) => {
                                  const updated = equipment.map(item =>
                                    item.id === eq.id
                                      ? { ...item, value: parseInt(e.target.value) }
                                      : item
                                  )
                                  setEquipment(updated)
                                  onEquipmentChange?.(updated)
                                }}
                                className="w-full"
                              />
                            </div>

                            <button
                              onClick={() => updateValue(eq.id, 10)}
                              className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Plus className="h-4 w-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Toggle Button at Bottom */}
                      <button
                        onClick={() => toggleEquipment(eq.id)}
                        className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${eq.active
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                      >
                        {eq.active ? 'Turn Off' : 'Turn On'}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Active Equipment Summary */}
              {activeEquipment.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
                    Active Equipment ({activeEquipment.length})
                  </h3>
                  <div className="space-y-1">
                    {activeEquipment.map(eq => (
                      <div key={eq.id} className="text-sm text-green-800 dark:text-green-200">
                        • {eq.name}: {eq.value} {eq.unit}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Turn on equipment before performing reactions.
                  Active equipment will affect your experiment results!
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
