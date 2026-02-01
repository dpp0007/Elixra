'use client'

import { useDrop } from 'react-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { Chemical, ChemicalContent, ReactionResult } from '@/types/chemistry'
import { X, Droplets } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import EquipmentEffectsOrchestrator from '@/components/equipment-effects/EquipmentEffectsOrchestrator'
import { EquipmentAttachment } from '@/lib/equipment-animations'

interface BeakerProps {
  id: string
  contents: ChemicalContent[]
  onAddChemical: (chemical: Chemical, glasswareId: string) => void
  onClear: () => void
  reactionResult: ReactionResult | null
  isReacting: boolean
  equipmentAttachments?: EquipmentAttachment[]
  onEquipmentChange?: (attachments: EquipmentAttachment[]) => void
}

export default function Beaker({
  id,
  contents,
  onAddChemical,
  onClear,
  reactionResult,
  isReacting,
  equipmentAttachments = [],
  onEquipmentChange
}: BeakerProps) {
  const tubeRef = useRef<HTMLDivElement>(null)
  const [tubePosition, setTubePosition] = useState<{
    x: number; y: number; width: number; height: number
  } | null>(null)

  // Calculate tube position for equipment animations - REAL-TIME BINDING
  const updateTubePosition = () => {
    if (tubeRef.current) {
      const rect = tubeRef.current.getBoundingClientRect()
      setTubePosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      })
    }
  }

  useEffect(() => {
    // Initial position
    updateTubePosition()

    // Update on scroll (tube moves in viewport)
    const handleScroll = () => updateTubePosition()

    // Update on resize (window size changes)
    const handleResize = () => updateTubePosition()

    // Observe tube element for size/position changes
    const observer = new ResizeObserver(() => updateTubePosition())
    if (tubeRef.current) {
      observer.observe(tubeRef.current)
    }

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    // Optimized RAF-based position tracking with throttle
    let rafId: number
    let lastUpdate = 0
    const THROTTLE_MS = 100

    const rafUpdate = () => {
      const now = Date.now()
      if (now - lastUpdate >= THROTTLE_MS) {
        updateTubePosition()
        lastUpdate = now
      }
      rafId = requestAnimationFrame(rafUpdate)
    }

    rafId = requestAnimationFrame(rafUpdate)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [])

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'chemical',
    drop: (item: Chemical) => {
      onAddChemical(item, id)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  const getLiquidColor = () => {
    if (reactionResult && contents.length > 1) {
      // If there's a precipitate, show a very light solution color above it
      if (reactionResult.precipitate) {
        return 'rgba(240, 248, 255, 0.4)' // Very light blue, almost transparent
      }
      // For non-precipitate reactions, use a light version of the result color
      const colorDescription = reactionResult.color.toLowerCase()
      if (colorDescription.includes('blue')) return 'rgba(59, 130, 246, 0.6)'
      if (colorDescription.includes('green')) return 'rgba(16, 185, 129, 0.6)'
      if (colorDescription.includes('red')) return 'rgba(239, 68, 68, 0.6)'
      if (colorDescription.includes('yellow')) return 'rgba(245, 158, 11, 0.6)'
      if (colorDescription.includes('purple')) return 'rgba(139, 92, 246, 0.6)'
      return 'rgba(59, 130, 246, 0.4)' // Default light blue
    }
    if (contents.length > 0) {
      // Make individual chemical colors more transparent
      const color = contents[0].chemical.color
      if (color === 'blue') return 'rgba(59, 130, 246, 0.7)'
      if (color === 'green') return 'rgba(16, 185, 129, 0.7)'
      if (color === 'red') return 'rgba(239, 68, 68, 0.7)'
      if (color === 'yellow') return 'rgba(245, 158, 11, 0.7)'
      return color
    }
    return 'transparent'
  }

  const getLiquidHeight = () => {
    const totalVolume = contents.reduce((sum, content) => {
      return sum + (content.unit === 'ml' ? content.amount : content.amount * 10)
    }, 0)
    const baseHeight = Math.min((totalVolume / 50) * 100, 85) // Max 85% height for beaker

    // If there's a precipitate, reduce liquid height to make room for it
    if (shouldShowPrecipitate()) {
      return Math.max(baseHeight - 15, 20) // Leave space for precipitate, minimum 20% liquid
    }

    return baseHeight
  }

  const shouldShowBubbles = () => {
    return isReacting || (reactionResult?.gasEvolution)
  }

  const shouldShowSmell = () => {
    return reactionResult && reactionResult.smell && reactionResult.smell.toLowerCase() !== 'none'
  }

  const getSmellColor = () => {
    if (!reactionResult?.smell) return 'rgba(200, 200, 200, 0.3)'
    const smell = reactionResult.smell.toLowerCase()
    if (smell.includes('pungent') || smell.includes('ammonia')) return 'rgba(34, 197, 94, 0.4)'
    if (smell.includes('sulfur') || smell.includes('rotten')) return 'rgba(234, 179, 8, 0.4)'
    if (smell.includes('sweet')) return 'rgba(236, 72, 153, 0.4)'
    if (smell.includes('vinegar') || smell.includes('acidic')) return 'rgba(239, 68, 68, 0.4)'
    return 'rgba(148, 163, 184, 0.4)'
  }

  const shouldShowPrecipitate = () => {
    return reactionResult?.precipitate
  }

  const getPrecipitateColor = () => {
    if (!reactionResult?.precipitateColor) return '#f8fafc'

    const color = reactionResult.precipitateColor.toLowerCase()
    if (color === 'white') return '#f8fafc'
    if (color === 'blue') return '#3b82f6'
    if (color === 'green') return '#10b981'
    if (color === 'red') return '#ef4444'
    if (color === 'yellow') return '#f59e0b'
    if (color === 'brown') return '#92400e'
    if (color === 'black') return '#1f2937'

    return reactionResult.precipitateColor
  }

  return (
    <div className="flex flex-col items-center space-y-3 w-full relative">
      {/* Tube clip path for masking liquid effects */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id={`tube-clip-${id}`} clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 1,0 L 1,0.85 Q 1,1 0.5,1 Q 0,1 0,0.85 Z" />
          </clipPath>
        </defs>
      </svg>



      <motion.div
        ref={(node) => {
          drop(node)
          if (node) (tubeRef as any).current = node
        }}
        className={`beaker relative w-28 h-40 transition-all duration-300 ${isOver && canDrop
          ? 'shadow-xl shadow-green-400/30 scale-105'
          : canDrop
            ? ''
            : ''
          } ${isReacting ? 'reaction-glow' : ''}`}
        style={{ zIndex: 120, position: 'relative' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isOver && canDrop ? 1.08 : 1,
          y: isOver && canDrop ? -4 : 0,
        }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
        role="region"
        aria-label={`Beaker ${id}. Contains ${contents.length} chemical${contents.length !== 1 ? 's' : ''}.`}
      >
        {/* Glass Container Body */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-b-3xl border-l-2 border-r-2 border-b-2 border-elixra-copper/20 dark:border-white/20 bg-gradient-to-br from-white/40 to-white/5 dark:from-white/10 dark:to-transparent backdrop-blur-[2px] shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]">
            {/* Left Highlight */}
            <div className="absolute top-2 bottom-4 left-2 w-1.5 bg-gradient-to-b from-white/60 to-transparent dark:from-white/40 rounded-full opacity-60 blur-[1px]"></div>
            {/* Right Highlight */}
            <div className="absolute top-2 bottom-4 right-2 w-0.5 bg-gradient-to-b from-white/40 to-transparent dark:from-white/30 rounded-full opacity-40 blur-[0.5px]"></div>
            
            {/* Rim Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 dark:bg-white/30 rounded-full blur-[1px]"></div>
        </div>

        {/* Beaker liquid - with proper rounded bottom */}
        <AnimatePresence>
          {contents.length > 0 && (
            <motion.div
              className={`absolute bottom-[2px] left-[2px] right-[2px] transition-all duration-1000 ease-out ${isReacting ? 'animate-color-change' : ''}`}
              style={{
                backgroundColor: getLiquidColor(),
                height: `${getLiquidHeight()}%`,
                borderRadius: '0 0 22px 22px',
                zIndex: 10
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: `${getLiquidHeight()}%`,
                opacity: 1
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.8, ease: 'easeOut' },
                opacity: { duration: 0.4 }
              }}
            >
              {/* Liquid Surface Meniscus */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-[100%] scale-x-110 opacity-50 blur-[1px]"></div>

              {/* Liquid shimmer effect */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '0 0 22px 22px' }}>
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bubbles animation */}
        <AnimatePresence>
          {shouldShowBubbles() && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bubble"
                  style={{
                    left: `${15 + i * 12}%`,
                    bottom: `${10 + (i % 2) * 15}%`,
                    width: '5px',
                    height: '5px',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 0], y: [-10, -25, -40] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Smell visualization */}
        <AnimatePresence>
          {shouldShowSmell() && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-full">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`smell-${i}`}
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{
                    width: `${25 + i * 12}px`,
                    height: `${25 + i * 12}px`,
                    borderRadius: '50%',
                    background: getSmellColor(),
                    filter: 'blur(10px)',
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    y: [-15, -50, -85],
                    scale: [0.5, 1.3, 1.6]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Precipitate */}
        <AnimatePresence>
          {shouldShowPrecipitate() && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-5 animate-precipitate"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '20px' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
            >
              {/* Main precipitate base */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b-lg"
                style={{
                  backgroundColor: getPrecipitateColor(),
                  height: '20px',
                  opacity: 0.95,
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                }}
              />

              {/* Precipitate particles floating in solution */}
              <div className="absolute bottom-5 left-0 right-0 h-8 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full shadow-sm"
                    style={{
                      backgroundColor: getPrecipitateColor(),
                      width: `${2 + Math.random() * 3}px`,
                      height: `${2 + Math.random() * 3}px`,
                      left: `${10 + i * 10 + Math.random() * 5}%`,
                      opacity: 0.6
                    }}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{
                      y: [0, 5, 10, 15, 20, 25],
                      opacity: [0.6, 0.8, 0.6, 0.4, 0.2, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3 + Math.random() * 0.5,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>

              {/* Swirling effect in precipitate */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-4 rounded-b-lg overflow-hidden"
                style={{
                  backgroundColor: getPrecipitateColor(),
                  opacity: 0.5,
                }}
                animate={{
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Dense settled layer */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2 rounded-b-lg"
                style={{
                  backgroundColor: getPrecipitateColor(),
                  opacity: 1,
                  filter: 'brightness(0.85)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Measurement Marks */}
        <div className="absolute left-0 top-[20%] bottom-[15%] w-full pointer-events-none z-30 opacity-70">
            {[0, 1, 2, 3, 4].map((i) => (
                <div 
                    key={i} 
                    className="absolute left-0 w-3 h-[1px] bg-white/50 shadow-[0_0_2px_rgba(255,255,255,0.5)]"
                    style={{ top: `${i * 20}%` }}
                />
            ))}
            {[0, 1, 2, 3].map((i) => (
                <div 
                    key={`small-${i}`} 
                    className="absolute left-0 w-1.5 h-[1px] bg-white/30"
                    style={{ top: `${10 + i * 20}%` }}
                />
            ))}
        </div>

      </motion.div>

      {/* Equipment Effects Overlay - Rendered via Portal */}
      {tubePosition && typeof document !== 'undefined' && createPortal(
        <EquipmentEffectsOrchestrator
          tubeId={id}
          tubePosition={tubePosition}
          attachments={equipmentAttachments}
          contents={contents}
          onEquipmentChange={onEquipmentChange}
        />,
        document.body
      )}

      {/* Contents list - with dynamic spacing for equipment */}
      <div
        className="text-center w-full flex flex-col items-center"
        style={{
          marginTop: equipmentAttachments.some(a => a.equipmentType === 'analytical-balance' && a.isActive)
            ? '140px'
            : equipmentAttachments.length > 0
              ? '80px'
              : '20px', // Add 20px gap when no equipment
          minHeight: '120px'
        }}
      >
        {reactionResult ? (
          <div className="space-y-2 w-full max-w-[160px]">
            {/* Products in single box - matching test tube style */}
            {reactionResult.products && reactionResult.products.length > 0 && (
              <div className="bg-white/60 dark:bg-white/10 rounded-lg p-3 shadow-sm border border-elixra-copper/10 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-elixra-text-secondary">Products:</span>
                  <span className="text-xs text-elixra-text-primary font-medium">
                    {reactionResult.products.join(' + ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-elixra-text-secondary mb-2">
              Contents ({contents.length})
            </div>
            {contents.map((content, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-elixra-copper/10 hover:shadow-md hover:border-elixra-bunsen transition-all">
                  {/* Chemical Color Indicator */}
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full border border-elixra-copper/20"
                      style={{ backgroundColor: content.chemical.color }}
                    />
                    <div className="font-bold text-elixra-text-primary text-xs">
                      {content.chemical.formula}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-xs text-elixra-text-secondary font-medium">
                    {content.amount < 1 ? content.amount.toFixed(2) : content.amount} {content.unit}
                  </div>

                  {/* Chemical Name (on hover) */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-elixra-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {content.chemical.name}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Total Volume/Mass */}
            <div className="mt-3 pt-2 border-t border-elixra-copper/10">
              <div className="text-xs font-semibold text-elixra-bunsen">
                Total: {(() => {
                  const total = contents.reduce((sum, content) => {
                    if (content.unit === 'ml' || content.unit === 'drops') {
                      return sum + (content.unit === 'drops' ? content.amount * 0.05 : content.amount)
                    }
                    return sum + content.amount
                  }, 0)
                  return total < 1 ? total.toFixed(2) : total.toFixed(1)
                })()} {contents[0]?.unit === 'drops' ? 'ml' : contents[0]?.unit || 'ml'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}