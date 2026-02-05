/**
 * pH Meter Animation Component
 * Display-only measurement device - does NOT alter liquid appearance
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { EQUIPMENT_Z_INDEX } from '@/lib/equipment-positioning'

interface PhMeterProps {
    pH: number // 0-14
    isActive: boolean
    tubePosition: { x: number; y: number; width: number; height: number }
}

export default function PhMeter({ pH, isActive, tubePosition }: PhMeterProps) {
    // pH 0 means empty tube, not extreme acidity
    const isExtreme = (pH > 0 && pH <= 2) || pH >= 12
    const [displayState, setDisplayState] = useState<'cal' | 'reading' | 'stable'>('cal')
    const [displayValue, setDisplayValue] = useState(pH)

    useEffect(() => {
        if (!isActive) return

        // CAL phase
        setDisplayState('cal')
        const calTimer = setTimeout(() => {
            setDisplayState('reading')

            // Jitter phase
            const jitterInterval = setInterval(() => {
                setDisplayValue(pH + (Math.random() - 0.5) * 0.3)
            }, 80)

            // Stabilize
            setTimeout(() => {
                clearInterval(jitterInterval)
                setDisplayValue(pH)
                setDisplayState('stable')
            }, 800)
        }, 200)

        return () => clearTimeout(calTimer)
    }, [isActive, pH])

    if (!isActive) return null

    return (
        <>
            {/* Probe descending from top */}
            <motion.div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: tubePosition.x + tubePosition.width / 2,
                    top: tubePosition.y - 20,
                    transform: 'translateX(-50%)',
                    zIndex: EQUIPMENT_Z_INDEX.probes,
                }}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Probe shaft */}
                <div className="w-1.5 bg-gradient-to-b from-gray-300 to-gray-500 mx-auto pointer-events-none"
                    style={{ height: tubePosition.height * 0.5 }} />

                {/* Probe tip with small LED */}
                <div className="relative mx-auto w-3 h-4 bg-gray-600 rounded-b-full pointer-events-none">
                    <motion.div
                        className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        style={{ boxShadow: '0 0 3px 1px rgba(96, 165, 250, 0.5)' }}
                    />
                </div>
            </motion.div>

            {/* Digital readout above tube */}
            <motion.div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: tubePosition.x + tubePosition.width / 2,
                    top: tubePosition.y - 70,
                    transform: 'translateX(-50%)',
                    zIndex: EQUIPMENT_Z_INDEX.phMeterDisplay,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: 0.5 }}
            >
                <div
                    className={`bg-gray-900 px-4 py-2 rounded-lg border-2 shadow-xl transition-colors duration-300 pointer-events-none ${isExtreme && displayState === 'stable'
                        ? 'border-red-500'
                        : 'border-gray-700'
                        }`}
                >
                    <AnimatePresence mode="wait">
                        {displayState === 'cal' ? (
                            <motion.div
                                key="cal"
                                className="text-yellow-400 font-mono text-sm font-bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                CAL...
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reading"
                                className={`font-mono text-lg font-bold ${pH === 0
                                        ? 'text-gray-400'
                                        : isExtreme && displayState === 'stable'
                                            ? 'text-red-400'
                                            : 'text-green-400'
                                    }`}
                                animate={displayState === 'reading' ? {
                                    opacity: [0.7, 1, 0.7],
                                } : {}}
                                transition={{ duration: 0.15, repeat: displayState === 'reading' ? Infinity : 0 }}
                            >
                                {pH === 0 ? '-- EMPTY --' : `pH ${displayValue.toFixed(1)}`}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* WARN indicator for extreme pH */}
                    {isExtreme && displayState === 'stable' && (
                        <motion.div
                            className="text-red-500 font-mono text-xs font-bold text-center mt-1"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            ⚠ WARN
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </>
    )
}
