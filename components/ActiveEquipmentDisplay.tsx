'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Equipment } from '@/lib/equipment-config'

interface ActiveEquipmentDisplayProps {
  equipment: Equipment[]
}

export default function ActiveEquipmentDisplay({ equipment }: ActiveEquipmentDisplayProps) {
  const activeEquipment = equipment.filter(eq => eq.active)

  if (activeEquipment.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 right-4 z-30 max-w-sm"
    >
      <div className="bg-elixra-copper/90 dark:bg-elixra-copper-dark/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-black/10 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-elixra-bunsen rounded-full animate-pulse"></div>
              <span className="absolute inset-0 w-3 h-3 bg-elixra-bunsen rounded-full animate-ping"></span>
            </div>
            <h3 className="text-white font-bold text-sm">
              Active Equipment ({activeEquipment.length})
            </h3>
          </div>
        </div>

        {/* Equipment List */}
        <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {activeEquipment.map((eq, index) => {
              const Icon = eq.icon
              return (
                <motion.div
                  key={eq.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white/95 dark:bg-elixra-charcoal/95 rounded-xl p-3 shadow-lg overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-elixra-copper/10 via-elixra-bunsen/10 to-elixra-copper/10 animate-pulse"></div>
                  
                  <div className="relative flex items-center gap-3">
                    {/* Icon with animation */}
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${eq.color} relative`}>
                      <Icon className={`h-5 w-5 text-white ${
                        eq.id === 'magnetic-stirrer' || eq.id === 'centrifuge'
                          ? 'animate-spin'
                          : eq.id === 'bunsen-burner' || eq.id === 'hot-plate'
                          ? 'animate-bounce'
                          : 'animate-pulse'
                      }`} />
                      {/* Ping indicator */}
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-elixra-bunsen opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-elixra-bunsen"></span>
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-elixra-text-primary text-sm truncate">
                          {eq.name}
                        </h4>
                        <span className="px-2 py-0.5 bg-elixra-bunsen text-white text-xs font-bold rounded-full animate-pulse flex-shrink-0">
                          ON
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block w-2 h-2 bg-elixra-bunsen rounded-full animate-pulse"></span>
                        <span className="text-xs text-elixra-text-secondary">
                          {eq.value} {eq.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity bar */}
                  <div className="relative mt-2 h-1 bg-elixra-copper/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-elixra-copper to-elixra-bunsen rounded-full"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-black/10 border-t border-white/10">
          <p className="text-xs text-white/90 text-center">
            ⚡ Equipment affecting reactions
          </p>
        </div>
      </div>
    </motion.div>
  )
}
