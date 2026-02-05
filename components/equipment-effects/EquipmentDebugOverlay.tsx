'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface EquipmentDebugOverlayProps {
  tubeId: string
  tubePosition: { x: number; y: number; width: number; height: number } | null
  attachments: any[]
  isVisible?: boolean
}

export default function EquipmentDebugOverlay({
  tubeId,
  tubePosition,
  attachments,
  isVisible = false
}: EquipmentDebugOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible) return null

  const tubeAttachments = attachments.filter(a => a.targetTubeId === tubeId && a.isActive)
  const hasPosition = tubePosition && tubePosition.width > 0 && tubePosition.height > 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 right-4 z-[9999] bg-black/90 text-white p-4 rounded-lg shadow-2xl max-w-sm"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-green-400">🔧 Equipment Debug</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Tube ID:</span>
              <span className="font-mono">{tubeId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className={`font-mono ${hasPosition ? 'text-green-400' : 'text-red-400'}`}>
                {hasPosition 
                  ? `${Math.round(tubePosition.x)}, ${Math.round(tubePosition.y)}`
                  : 'NOT SET'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Size:</span>
              <span className={`font-mono ${hasPosition ? 'text-green-400' : 'text-red-400'}`}>
                {hasPosition 
                  ? `${Math.round(tubePosition.width)}×${Math.round(tubePosition.height)}`
                  : 'NOT SET'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Active Equipment:</span>
              <span className={`font-mono ${tubeAttachments.length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {tubeAttachments.length}
              </span>
            </div>

            {isExpanded && (
              <>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <h4 className="text-xs font-bold text-blue-400 mb-2">Active Attachments:</h4>
                  {tubeAttachments.length === 0 ? (
                    <p className="text-gray-500 italic">No active equipment</p>
                  ) : (
                    <div className="space-y-1">
                      {tubeAttachments.map((attachment, index) => (
                        <div key={index} className="bg-gray-800 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="text-cyan-400">{attachment.equipmentType}</span>
                            <span className={`text-xs ${attachment.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              {attachment.isActive ? 'ON' : 'OFF'}
                            </span>
                          </div>
                          {attachment.settings && (
                            <div className="mt-1 text-xs text-gray-400 font-mono">
                              {Object.entries(attachment.settings).map(([key, value]) => (
                                <div key={key}>{key}: {String(value)}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <h4 className="text-xs font-bold text-purple-400 mb-2">All Attachments:</h4>
                  {attachments.length === 0 ? (
                    <p className="text-gray-500 italic">No attachments</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="bg-gray-800 p-2 rounded opacity-75">
                          <div className="flex justify-between">
                            <span className="text-gray-300">{attachment.equipmentType}</span>
                            <span className={`text-xs ${attachment.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                              {attachment.isActive ? 'ON' : 'OFF'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">Target: {attachment.targetTubeId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
            <p>💡 Check browser console for detailed logs</p>
            <p>🔍 Equipment should render at z-index 1100+</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
