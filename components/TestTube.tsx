'use client'

import { useDrop } from 'react-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { Chemical, ChemicalContent, ReactionResult } from '@/types/chemistry'
import { X, Droplets } from 'lucide-react'

interface TestTubeProps {
  id: string
  contents: ChemicalContent[]
  onAddChemical: (chemical: Chemical, glasswareId: string) => void
  onClear: () => void
  reactionResult: ReactionResult | null
  isReacting: boolean
}

export default function TestTube({
  id,
  contents,
  onAddChemical,
  onClear,
  reactionResult,
  isReacting
}: TestTubeProps) {
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
      // If there's a precipitate, show a very light solution color
      if (reactionResult.precipitate) {
        return 'rgba(200, 220, 255, 0.2)' // Very light, almost transparent
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
    return Math.min((totalVolume / 10) * 100, 90) // Max 90% height
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

  const shouldShowBubbles = () => {
    return isReacting || (reactionResult?.gasEvolution)
  }

  const shouldShowPrecipitate = () => {
    // Don't show precipitate in test tubes - only in beakers for reactions
    return false
  }

  const getPrecipitateColor = () => {
    if (!reactionResult?.precipitateColor) return '#ffffff'

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
        className={`test-tube relative w-20 h-40 z-25 transition-all duration-300 ${isOver && canDrop
          ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-xl shadow-blue-400/30 scale-105'
          : canDrop
            ? 'ring-2 ring-blue-300 ring-opacity-30'
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
        aria-label={`Test tube ${id}. Contains ${contents.length} chemical${contents.length !== 1 ? 's' : ''}.`}
      >
        {/* Test tube liquid - fills from BOTTOM with proper rounded shape */}
        <AnimatePresence>
          {contents.length > 0 && (
            <motion.div
              className={`absolute bottom-0 left-0 right-0 ${isReacting ? 'animate-color-change' : ''}`}
              style={{
                backgroundColor: getLiquidColor(),
                height: `${getLiquidHeight()}%`,
                borderRadius: '0 0 50% 50% / 0 0 50% 50%',
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
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '0 0 50% 50% / 0 0 50% 50%' }}>
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
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bubble"
                  style={{
                    left: `${20 + i * 15}%`,
                    bottom: `${10 + i * 10}%`,
                    width: '4px',
                    height: '4px',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 0], y: [-10, -30, -50] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Smell visualization */}
        <AnimatePresence>
          {shouldShowSmell() && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-full">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`smell-${i}`}
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{
                    width: `${20 + i * 10}px`,
                    height: `${20 + i * 10}px`,
                    borderRadius: '50%',
                    background: getSmellColor(),
                    filter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    y: [-10, -40, -70],
                    scale: [0.5, 1.2, 1.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
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
              className="absolute bottom-0 left-0 right-0 rounded-b-full z-10"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: '20px' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              {/* Main precipitate layer */}
              <div
                className="absolute inset-0 rounded-b-full"
                style={{
                  backgroundColor: getPrecipitateColor(),
                  height: '20px',
                  border: '1px solid rgba(0,0,0,0.15)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 -1px 2px rgba(0,0,0,0.1)'
                }}
              />
              {/* Precipitate settling effect */}
              <div
                className="absolute inset-0 rounded-b-full overflow-hidden"
                style={{ height: '20px' }}
              >
                {/* Cloudy precipitate particles */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(ellipse at 25% 40%, rgba(255,255,255,0.6) 1px, transparent 2px),
                      radial-gradient(ellipse at 75% 30%, rgba(255,255,255,0.4) 1px, transparent 2px),
                      radial-gradient(ellipse at 50% 70%, rgba(255,255,255,0.5) 1px, transparent 2px),
                      radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.3) 1px, transparent 2px),
                      radial-gradient(ellipse at 80% 85%, rgba(255,255,255,0.4) 1px, transparent 2px)
                    `,
                    backgroundSize: '6px 6px, 8px 8px, 5px 5px, 7px 7px, 6px 6px',
                    opacity: 0.8
                  }}
                />
                {/* Dense bottom layer */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-2 rounded-b-full"
                  style={{
                    backgroundColor: getPrecipitateColor(),
                    opacity: 0.9,
                    filter: 'brightness(0.9)'
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Contents list */}
      <div className="text-center min-h-[120px] w-full">
        {contents.length === 0 ? (
          <div className="text-xs text-gray-400 flex flex-col items-center space-y-2 p-4 bg-slate-800/30 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-400 transition-colors">
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
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                  {/* Chemical Color Indicator */}
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: content.chemical.color }}
                    />
                    <div className="font-bold text-gray-900 dark:text-white text-xs">
                      {content.chemical.formula}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {content.amount < 1 ? content.amount.toFixed(2) : content.amount} {content.unit}
                  </div>

                  {/* Chemical Name (on hover) */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {content.chemical.name}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Total Volume/Mass */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
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