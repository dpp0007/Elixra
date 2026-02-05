'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface EquipmentVisibilityTestProps {
  tubeId: string
  tubePosition: { x: number; y: number; width: number; height: number } | null
  attachments: any[]
  isVisible?: boolean
  simulateError?: boolean
}

export default function EquipmentVisibilityTest({
  tubeId,
  tubePosition,
  attachments,
  isVisible = false,
  simulateError = false
}: EquipmentVisibilityTestProps) {
  const [renderStatus, setRenderStatus] = useState<{
    bunsenBurner: 'pending' | 'success' | 'error'
    hotPlate: 'pending' | 'success' | 'error'
    magneticStirrer: 'pending' | 'success' | 'error'
    phMeter: 'pending' | 'success' | 'error'
    thermometer: 'pending' | 'success' | 'error'
    analyticalBalance: 'pending' | 'success' | 'error'
    timer: 'pending' | 'success' | 'error'
    centrifuge: 'pending' | 'success' | 'error'
  }>({
    bunsenBurner: 'pending',
    hotPlate: 'pending',
    magneticStirrer: 'pending',
    phMeter: 'pending',
    thermometer: 'pending',
    analyticalBalance: 'pending',
    timer: 'pending',
    centrifuge: 'pending'
  })

  const tubeAttachments = attachments.filter(a => a.targetTubeId === tubeId && a.isActive)
  const hasValidPosition = tubePosition && tubePosition.width > 0 && tubePosition.height > 0

  useEffect(() => {
    if (!isVisible || !hasValidPosition) return

    // Simulate equipment rendering status
    const equipmentTypes = ['bunsenBurner', 'hotPlate', 'magneticStirrer', 'phMeter', 'thermometer', 'analyticalBalance', 'timer', 'centrifuge']
    
    equipmentTypes.forEach((type, index) => {
      setTimeout(() => {
        const attachment = tubeAttachments.find(a => {
          const typeMap: Record<string, string> = {
            bunsenBurner: 'bunsen-burner',
            hotPlate: 'hot-plate',
            magneticStirrer: 'magnetic-stirrer',
            phMeter: 'ph-meter',
            thermometer: 'thermometer',
            analyticalBalance: 'analytical-balance',
            timer: 'timer',
            centrifuge: 'centrifuge'
          }
          return a.equipmentType === typeMap[type]
        })

        if (attachment) {
          if (simulateError && index === 0) {
            setRenderStatus(prev => ({ ...prev, [type]: 'error' }))
          } else {
            setRenderStatus(prev => ({ ...prev, [type]: 'success' }))
          }
        } else {
          setRenderStatus(prev => ({ ...prev, [type]: 'pending' }))
        }
      }, index * 200)
    })
  }, [isVisible, tubeAttachments, hasValidPosition, simulateError])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getEquipmentName = (type: string) => {
    const nameMap: Record<string, string> = {
      bunsenBurner: 'Bunsen Burner',
      hotPlate: 'Hot Plate',
      magneticStirrer: 'Magnetic Stirrer',
      phMeter: 'pH Meter',
      thermometer: 'Thermometer',
      analyticalBalance: 'Analytical Balance',
      timer: 'Timer',
      centrifuge: 'Centrifuge'
    }
    return nameMap[type] || type
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed top-4 left-4 z[9999] bg-black/90 text-white p-4 rounded-lg shadow-2xl max-w-sm"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-blue-400">🔬 Equipment Visibility Test</h3>
          <div className="text-xs text-gray-400">Tube: {tubeId}</div>
        </div>

        {!hasValidPosition ? (
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">⚠️ Invalid tube position</span>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="font-mono text-green-400">
                  {Math.round(tubePosition.x)}, {Math.round(tubePosition.y)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Size:</span>
                <span className="font-mono text-green-400">
                  {Math.round(tubePosition.width)}×{Math.round(tubePosition.height)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Equipment:</span>
                <span className="font-mono text-blue-400">{tubeAttachments.length}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <h4 className="text-xs font-bold text-purple-400 mb-2">Equipment Status:</h4>
              <div className="space-y-1">
                {Object.entries(renderStatus).map(([type, status]) => {
                  const attachment = tubeAttachments.find(a => {
                    const typeMap: Record<string, string> = {
                      bunsenBurner: 'bunsen-burner',
                      hotPlate: 'hot-plate',
                      magneticStirrer: 'magnetic-stirrer',
                      phMeter: 'ph-meter',
                      thermometer: 'thermometer',
                      analyticalBalance: 'analytical-balance',
                      timer: 'timer',
                      centrifuge: 'centrifuge'
                    }
                    return a.equipmentType === typeMap[type]
                  })

                  if (!attachment) return null

                  return (
                    <div key={type} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className="text-gray-300">{getEquipmentName(type)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {type === 'bunsenBurner' && attachment.settings?.temperature && `${attachment.settings.temperature}°C`}
                        {type === 'magneticStirrer' && attachment.settings?.rpm && `${attachment.settings.rpm} RPM`}
                        {type === 'phMeter' && attachment.settings?.pH && `pH ${attachment.settings.pH}`}
                        {type === 'thermometer' && attachment.settings?.measuredTemp && `${attachment.settings.measuredTemp}°C`}
                        {type === 'analyticalBalance' && attachment.settings?.weight && `${attachment.settings.weight}g`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
              <p>💡 Equipment should render at z-index 1100+</p>
              <p>🔍 Check browser console for detailed logs</p>
              <p>⌨️ Press Ctrl+D to toggle debug overlay</p>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
