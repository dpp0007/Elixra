'use client'

import { useDrop } from 'react-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { Chemical, ChemicalContent, ReactionResult } from '@/types/chemistry'
import { X, Droplets } from 'lucide-react'

interface BeakerProps {
  id: string
  contents: ChemicalContent[]
  onAddChemical: (chemical: Chemical, glasswareId: string) => void
  onClear: () => void
  reactionResult: ReactionResult | null
  isReacting: boolean
}

export default function Beaker({
  id,
  contents,
  onAddChemical,
  onClear,
  reactionResult,
  isReacting
}: BeakerProps) {
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
      {/* Clear button - aligned with trash button */}
      {contents.length > 0 && (
        <button
          onClick={onClear}
          className="absolute top-0 left-0 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-50"
          title="Clear contents"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <motion.div
        ref={drop as any}
        className={`beaker relative w-24 h-40 z-25 transition-all duration-300 ${isOver && canDrop
          ? 'ring-4 ring-green-400 ring-opacity-50 shadow-xl shadow-green-400/30 scale-105'
          : canDrop
            ? 'ring-2 ring-green-300 ring-opacity-30'
            : ''
          } ${isReacting ? 'reaction-glow' : ''}`}
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
        {/* Beaker spout */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-transparent border-l-2 border-r-2 border-gray-300 rounded-t-lg"></div>

        {/* Beaker liquid - with proper rounded bottom */}
        <AnimatePresence>
          {contents.length > 0 && (
            <motion.div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${isReacting ? 'animate-color-change' : ''}`}
              style={{
                backgroundColor: getLiquidColor(),
                height: `${getLiquidHeight()}%`,
                borderRadius: '0 0 24px 24px',
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
              {/* Liquid shimmer effect */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '0 0 24px 24px' }}>
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
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

        {/* Measurement marks */}
        <div className="absolute left-0 top-1/4 w-2 h-px bg-gray-400"></div>
        <div className="absolute left-0 top-1/2 w-2 h-px bg-gray-400"></div>
        <div className="absolute left-0 top-3/4 w-2 h-px bg-gray-400"></div>

      </motion.div>

      {/* Contents list */}
      <div className="text-center min-h-[120px] w-full flex flex-col items-center">
        {reactionResult ? (
          <div className="space-y-2 w-full max-w-[160px]">
            {/* Products in single box - matching test tube style */}
            {reactionResult.products && reactionResult.products.length > 0 && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Products:</span>
                  <span className="text-xs text-gray-900 dark:text-white font-medium">
                    {reactionResult.products.join(' + ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : contents.length === 0 ? (
          <div className="text-xs text-gray-400 flex flex-col items-center space-y-2 p-4 bg-slate-800/30 rounded-xl border-2 border-dashed border-gray-600 hover:border-green-400 transition-colors">
            <Droplets className="h-6 w-6" />
            <span className="font-medium">Drop chemicals here</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-300 mb-2">
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
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/10 hover:shadow-md hover:border-green-400/50 transition-all">
                  {/* Chemical Color Indicator */}
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: content.chemical.color }}
                    />
                    <div className="font-bold text-white text-xs">
                      {content.chemical.formula}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-xs text-gray-300 font-medium">
                    {content.amount < 1 ? content.amount.toFixed(2) : content.amount} {content.unit}
                  </div>

                  {/* Chemical Name (on hover) */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {content.chemical.name}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Total Volume/Mass */}
            <div className="mt-3 pt-2 border-t border-white/10">
              <div className="text-xs font-semibold text-blue-400">
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