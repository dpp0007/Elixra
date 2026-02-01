'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus } from 'lucide-react'
import { EQUIPMENT_CONFIG, Equipment } from '@/lib/equipment-config'
import { EquipmentAttachment, canAttachEquipment } from '@/lib/equipment-animations'
import ConflictErrorModal from './ConflictErrorModal'

interface EquipmentPanelProps {
  onEquipmentChange?: (attachments: EquipmentAttachment[]) => void
  currentAttachments?: EquipmentAttachment[]
  selectedTubeId?: string
  hideFloatingButton?: boolean
  externalIsOpen?: boolean
  onClose?: () => void
  currentPH?: number // Dynamic pH from tube contents
  currentTemperature?: number // Dynamic temperature from heating equipment
  currentWeight?: number // MEDIUM PRIORITY FIX: Dynamic weight from tube contents
  onRequestActivation?: (equipmentId: string) => void // New prop for manual activation flow
}

export default function EquipmentPanel({
  onEquipmentChange,
  currentAttachments = [],
  selectedTubeId = 'tube-1',
  hideFloatingButton = false,
  externalIsOpen,
  onClose,
  currentPH = 0,
  currentTemperature = 0,
  currentWeight = 0,
  onRequestActivation
}: EquipmentPanelProps) {
  // Initialize with all 8 equipment types from config
  const [equipment, setEquipment] = useState<Equipment[]>(
    EQUIPMENT_CONFIG.map(eq => ({ ...eq }))
  )

  const [internalIsOpen, setInternalIsOpen] = useState(false)

  const [conflictError, setConflictError] = useState<{
    isOpen: boolean
    message: string
    conflictingEquipment?: { new: string; existing: string }
  }>({ isOpen: false, message: '' })

  // Sync local equipment state with props (currentAttachments + selectedTubeId)
  useEffect(() => {
    setEquipment(prevEquipment => {
      return prevEquipment.map(eq => {
        // Find if this equipment is active for the CURRENTLY selected tube
        const activeAttachment = currentAttachments.find(
          a => a.equipmentType === eq.id && a.targetTubeId === selectedTubeId
        )
        
        // If active, sync the value from the attachment settings
        if (activeAttachment) {
          return {
            ...eq,
            active: true,
            value: activeAttachment.settings?.temperature ?? 
                   activeAttachment.settings?.rpm ?? 
                   activeAttachment.settings?.pH ?? 
                   activeAttachment.settings?.measuredTemp ??
                   activeAttachment.settings?.weight ??
                   activeAttachment.settings?.timeRemaining ??
                   eq.value
          }
        }
        
        // If not active for THIS tube, set active to false
        return {
          ...eq,
          active: false
        }
      })
    })
  }, [currentAttachments, selectedTubeId])

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen

  // Handle closing - use external handler if provided
  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  // Handle opening (for internal button)
  const handleOpen = () => {
    setInternalIsOpen(true)
  }

  const toggleEquipment = (id: string) => {
    const eq = equipment.find(e => e.id === id)
    if (!eq) return

    const existingAttachment = currentAttachments.find(
      a => a.equipmentType === id && a.targetTubeId === selectedTubeId
    )

    const isCurrentlyActive = !!existingAttachment

    if (!isCurrentlyActive) {
      // If parent requested manual activation flow, delegate to it
      if (onRequestActivation) {
        onRequestActivation(id)
        return
      }

      // EXCLUSIVITY ENFORCEMENT: Check for conflicts before turning ON
      const validation = canAttachEquipment(id, selectedTubeId, currentAttachments)

      if (!validation.allowed) {
        // Find conflicting item name for UI
        const conflictingItem = currentAttachments.find(a => 
          a.targetTubeId === selectedTubeId && a.isActive && (
             // Heuristic matching based on conflict rules
             ((id === 'bunsen-burner' || id === 'hot-plate') && (a.equipmentType === 'bunsen-burner' || a.equipmentType === 'hot-plate')) ||
             ((id === 'magnetic-stirrer' || id === 'centrifuge') && (a.equipmentType === 'magnetic-stirrer' || a.equipmentType === 'centrifuge')) ||
             ((id === 'centrifuge') && (a.equipmentType === 'bunsen-burner' || a.equipmentType === 'hot-plate')) ||
             ((id === 'analytical-balance') && (a.equipmentType === 'analytical-balance'))
          )
        )

        const conflictingName = conflictingItem ? EQUIPMENT_CONFIG.find(e => e.id === conflictingItem.equipmentType)?.name : 'Existing Equipment'
        const newName = EQUIPMENT_CONFIG.find(e => e.id === id)?.name

        setConflictError({
          isOpen: true,
          message: validation.reason || 'Equipment conflict detected.',
          conflictingEquipment: conflictingItem ? {
            new: newName || id,
            existing: conflictingName || conflictingItem.equipmentType
          } : undefined
        })
        
        console.error('Equipment Conflict:', { attempted: id, reason: validation.reason })
        return
      }

      // Turn ON - create attachment
      const updatedAttachments = [...currentAttachments]
      const newAttachment: EquipmentAttachment = {
        equipmentId: `${id}-${Date.now()}`,
        equipmentType: id,
        targetTubeId: selectedTubeId,
        isActive: true,
        settings: {
          temperature: (id === 'bunsen-burner' || id === 'hot-plate') ? eq.value : undefined,
          rpm: (id === 'magnetic-stirrer' || id === 'centrifuge') ? eq.value : undefined,
          pH: id === 'ph-meter' ? eq.value : undefined,
          measuredTemp: id === 'thermometer' ? eq.value : undefined,
          weight: id === 'analytical-balance' ? eq.value : undefined,
          timeRemaining: id === 'timer' ? eq.value : undefined,
          timerMode: id === 'timer' ? 'countdown' : undefined,
          isTimerRunning: id === 'timer' ? false : undefined
        }
      }
      console.log('EquipmentPanel: Creating attachment:', newAttachment)
      onEquipmentChange?.([...updatedAttachments, newAttachment])

      // Update local UI state to show as active
      setEquipment(prev => prev.map(e =>
        e.id === id ? { ...e, active: true } : e
      ))
    } else {
      // Turn OFF - remove attachment
      console.log('EquipmentPanel: Removing attachment:', existingAttachment.equipmentId)
      onEquipmentChange?.(
        currentAttachments.filter(a => a.equipmentId !== existingAttachment.equipmentId)
      )

      // Update local UI state to show as inactive
      setEquipment(prev => prev.map(e =>
        e.id === id ? { ...e, active: false } : e
      ))
    }
  }

  const updateValue = (id: string, change: number) => {
    // Update local state
    const updated = equipment.map(eq => {
      if (eq.id === id && eq.value !== undefined && eq.min !== undefined && eq.max !== undefined) {
        const newValue = Math.max(eq.min, Math.min(eq.max, eq.value + change))
        console.log('EquipmentPanel: updateValue button', { id, oldValue: eq.value, newValue, change })
        return { ...eq, value: newValue }
      }
      return eq
    })
    setEquipment(updated)

    // Update attachment if active
    const attachment = currentAttachments.find(
      a => a.equipmentType === id && a.targetTubeId === selectedTubeId
    )
    if (attachment) {
      const eq = updated.find(e => e.id === id)
      const updatedAttachments = currentAttachments.map(a => {
        if (a.equipmentId === attachment.equipmentId) {
          const newSettings = {
            ...a.settings,
            temperature: (id === 'bunsen-burner' || id === 'hot-plate') ? eq?.value : a.settings.temperature,
            rpm: (id === 'magnetic-stirrer' || id === 'centrifuge') ? eq?.value : a.settings.rpm,
            pH: id === 'ph-meter' ? eq?.value : a.settings.pH,
            measuredTemp: id === 'thermometer' ? eq?.value : a.settings.measuredTemp,
            weight: id === 'analytical-balance' ? eq?.value : a.settings.weight,
            timeRemaining: id === 'timer' ? eq?.value : a.settings.timeRemaining
          }
          console.log('EquipmentPanel: Updated attachment settings', { equipmentId: a.equipmentId, newSettings })
          return { ...a, settings: newSettings }
        }
        return a
      })
      onEquipmentChange?.(updatedAttachments)
    } else {
      console.log('EquipmentPanel: No active attachment found for', id)
    }
  }

  const activeEquipment = equipment.filter(eq => eq.active)

  return (
    <>
      {/* Floating Button - Hidden when integrated into Features menu */}
      {!hideFloatingButton && (
        <motion.button
          onClick={handleOpen}
          className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          {/* Use first active equipment icon or default */}
          {activeEquipment.length > 0 ? (
            (() => {
              const FirstIcon = activeEquipment[0].icon
              return <FirstIcon className="h-6 w-6" />
            })()
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
          {activeEquipment.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-elixra-bunsen rounded-full text-xs flex items-center justify-center">
              {activeEquipment.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Equipment Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] pointer-events-auto"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-elixra-cream dark:bg-elixra-charcoal shadow-2xl z-[100000] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Outside scroll container */}
              <div className="flex-shrink-0 bg-elixra-copper text-white p-4 flex items-center justify-between z-50">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <div>
                    <h2 className="text-lg font-bold">Lab Equipment</h2>
                    <p className="text-xs text-white/80">{equipment.length} devices available</p>
                  </div>
                </div>
                <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Equipment List */}
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {equipment.map((eq) => {
              const Icon = eq.icon
              return (
                <div
                  key={eq.id}
                  className={`bg-white/50 dark:bg-white/5 rounded-xl p-3 sm:p-4 border-2 transition-all flex flex-col relative z-0 ${eq.active
                    ? 'border-elixra-bunsen shadow-lg shadow-elixra-bunsen/20'
                    : 'border-elixra-copper/10'
                    }`}
                >
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                    <div className={`relative p-2 rounded-lg bg-gradient-to-br ${eq.color} ${eq.active ? 'animate-pulse' : ''}`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-white ${eq.active && (eq.id === 'magnetic-stirrer' || eq.id === 'centrifuge')
                        ? 'animate-spin'
                        : eq.active && (eq.id === 'bunsen-burner' || eq.id === 'hot-plate')
                          ? 'animate-bounce'
                          : ''
                        }`} />
                            {eq.active && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-elixra-text-primary text-sm">
                                {eq.name}
                              </h3>
                              {eq.active && (
                                <span className="px-2 py-0.5 bg-elixra-bunsen text-white text-xs font-bold rounded-full animate-pulse">
                                  ON
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-elixra-text-secondary">
                              {eq.category} • {eq.active ? '⚡ Active' : '○ Inactive'}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-elixra-text-secondary mb-3">
                          {eq.description}
                        </p>

                        {/* Controls */}
                        {eq.active && eq.value !== undefined && (
                          <div className="bg-gradient-to-r from-green-500/5 via-blue-500/5 to-green-500/5 rounded-lg p-3">
                            {/* Analytical Balance - Display Only with TARE */}
                            {eq.id === 'analytical-balance' ? (
                              <div className="text-center py-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              ⚖️ Measured Weight
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                              {currentWeight.toFixed(4)} g
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                              {currentWeight > 200 ? '⚠️ OVERLOAD' :
                                currentWeight > 100 ? '🔵 Heavy' :
                                  currentWeight > 10 ? '🟢 Normal' :
                                    currentWeight > 0 ? '🟡 Light' :
                                      '⚪ Empty'}
                            </div>
                                <button
                                  onClick={() => {
                                    // HIGH PRIORITY FIX: TARE sets current weight as offset
                                    const attachment = currentAttachments.find(
                                      a => a.equipmentType === eq.id && a.targetTubeId === selectedTubeId
                                    )
                                    if (attachment) {
                                      const updatedAttachments = currentAttachments.map(a => {
                                        if (a.equipmentId === attachment.equipmentId) {
                                          return {
                                            ...a,
                                            settings: {
                                              ...a.settings,
                                              tareOffset: currentWeight
                                            }
                                          }
                                        }
                                        return a
                                      })
                                      onEquipmentChange?.(updatedAttachments)
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono rounded-lg transition-colors"
                                >
                                  TARE (Zero)
                                </button>
                                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
                                  Weight from tube contents
                                </div>
                              </div>
                            ) : eq.id === 'ph-meter' ? (
                              /* pH Meter - Display Only (No Controls) */
                          <div className="text-center py-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              📊 Measured pH
                            </div>
                            {currentPH === 0 ? (
                              <>
                                <div className="text-xl sm:text-2xl font-bold text-gray-400 dark:text-gray-500 mb-1">
                                  -- EMPTY --
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ⚪ No solution detected
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                  {currentPH.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {currentPH <= 2 ? '🔴 Strongly Acidic' :
                                    currentPH < 6 ? '🟠 Weakly Acidic' :
                                      currentPH < 8 ? '🟢 Neutral' :
                                        currentPH < 11 ? '🔵 Weakly Basic' :
                                          '🟣 Strongly Basic'}
                                </div>
                              </>
                            )}
                                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
                                  pH is calculated from tube contents
                                </div>
                              </div>
                            ) : eq.id === 'thermometer' ? (
                              /* Thermometer - Display Only (No Controls) */
                          <div className="text-center py-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              🌡️ Measured Temperature
                            </div>
                            {currentTemperature === -999 ? (
                              <>
                                <div className="text-xl sm:text-2xl font-bold text-gray-400 dark:text-gray-500 mb-1">
                                  -- EMPTY --
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ⚪ No solution detected
                                </div>
                              </>
                            ) : (
                              <>
                                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${currentTemperature < 0 ? 'text-blue-400' :
                                  currentTemperature < 100 ? 'text-green-600 dark:text-green-400' :
                                    currentTemperature < 200 ? 'text-amber-500' :
                                      currentTemperature < 300 ? 'text-orange-500' :
                                        'text-red-500'
                                  }`}>
                                      {currentTemperature.toFixed(1)}°C
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {currentTemperature < 0 ? '❄️ Below Freezing' :
                                        currentTemperature < 25 ? '🧊 Cold' :
                                          currentTemperature < 100 ? '🌡️ Warm' :
                                            currentTemperature < 200 ? '🔥 Hot' :
                                              currentTemperature < 300 ? '🔥 Very Hot' :
                                                '⚠️ Extreme Heat'}
                                    </div>
                                  </>
                                )}
                                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
                                  Temperature from heating equipment
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Other Equipment - Normal Controls */}
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Setting:
                                  </span>
                                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {eq.value} {eq.unit}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 relative z-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      updateValue(eq.id, -(eq.step || 10))
                                    }}
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors active:scale-95"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>

                                  <div className="flex-1 px-2">
                                    <input
                                      type="range"
                                      min={eq.min}
                                      max={eq.max}
                                      step={eq.step || 1}
                                      value={eq.value}
                                      onChange={(e) => {
                                        const newValue = parseFloat(e.target.value)
                                        console.log('EquipmentPanel: Slider changed', { id: eq.id, oldValue: eq.value, newValue })

                                        // Update local state
                                        const updated = equipment.map(item =>
                                          item.id === eq.id
                                            ? { ...item, value: newValue }
                                            : item
                                        )
                                        setEquipment(updated)

                                        // Update attachment if active
                                        const attachment = currentAttachments.find(
                                          a => a.equipmentType === eq.id && a.targetTubeId === selectedTubeId
                                        )
                                        if (attachment) {
                                          const updatedAttachments = currentAttachments.map(a => {
                                            if (a.equipmentId === attachment.equipmentId) {
                                              const newSettings = {
                                                ...a.settings,
                                                temperature: (eq.id === 'bunsen-burner' || eq.id === 'hot-plate') ? newValue : a.settings.temperature,
                                                rpm: (eq.id === 'magnetic-stirrer' || eq.id === 'centrifuge') ? newValue : a.settings.rpm,
                                                pH: eq.id === 'ph-meter' ? newValue : a.settings.pH,
                                                measuredTemp: eq.id === 'thermometer' ? newValue : a.settings.measuredTemp,
                                                weight: eq.id === 'analytical-balance' ? newValue : a.settings.weight,
                                                timeRemaining: eq.id === 'timer' ? newValue : a.settings.timeRemaining
                                              }
                                              console.log('EquipmentPanel: Slider updated attachment', { equipmentId: a.equipmentId, newSettings })
                                              return { ...a, settings: newSettings }
                                            }
                                            return a
                                          })
                                          onEquipmentChange?.(updatedAttachments)
                                        } else {
                                          console.log('EquipmentPanel: Slider - no active attachment found for', eq.id)
                                        }
                                      }}
                                      className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                                      style={{
                                        WebkitAppearance: 'none',
                                      }}
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      updateValue(eq.id, (eq.step || 10))
                                    }}
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors active:scale-95"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Activity Indicator - Not for measurement devices */}
                        {eq.active && eq.value !== undefined && eq.min !== undefined && eq.max !== undefined && eq.id !== 'ph-meter' && eq.id !== 'thermometer' && eq.id !== 'analytical-balance' && (
                          <div className="mt-3 mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>Status</span>
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                {Math.round(((eq.value - eq.min) / (eq.max - eq.min)) * 100)}% Power
                              </span>
                            </div>
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${((eq.value - eq.min) / (eq.max - eq.min)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Toggle Button at Bottom */}
                        <button
                          onClick={() => toggleEquipment(eq.id)}
                          className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${eq.active
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50'
                            : 'btn-primary'
                            }`}
                        >
                          {eq.active ? '⏸ Turn Off' : '▶ Turn On'}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Active Equipment Summary */}
                {
                  activeEquipment.length > 0 && (
                    <div className="p-4 bg-elixra-bunsen/10 border-t border-elixra-bunsen/20">
                      <h3 className="font-bold text-elixra-bunsen mb-2">
                        Active Equipment ({activeEquipment.length})
                      </h3>
                      <div className="space-y-1">
                        {activeEquipment.map(eq => (
                          <div key={eq.id} className="text-sm text-elixra-bunsen-dark dark:text-elixra-bunsen-light">
                            • {eq.name}: {eq.value} {eq.unit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                {/* Info */}
                <div className="p-4 bg-elixra-copper/10 border-t border-elixra-copper/20">
                  <p className="text-sm text-elixra-copper">
                    <strong>Tip:</strong> Turn on equipment before performing reactions.
                    Active equipment will affect your experiment results!
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Conflict Error Modal */}
      <ConflictErrorModal
        isOpen={conflictError.isOpen}
        onClose={() => setConflictError({ ...conflictError, isOpen: false })}
        message={conflictError.message}
        conflictingEquipment={conflictError.conflictingEquipment}
      />
    </>
  )
}
