/**
 * Thermometer Animation Component
 * Real physical mercury thermometer with proper limits and sensor lag
 */

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { EQUIPMENT_Z_INDEX } from '@/lib/equipment-positioning'

// Mercury physical constants
const MERCURY_FREEZE = -39 // °C
const MERCURY_BOIL = 357 // °C
const OVERHEAT_WARNING = 300 // °C
const THERMAL_LAG = 0.1 // Sensor lag coefficient (0-1, lower = more lag)

type SensorState = 'NORMAL' | 'FROZEN' | 'OVERHEATING' | 'FAILURE'

interface ThermometerProps {
    measuredTemp: number // Actual temperature
    isActive: boolean
    tubePosition: { x: number; y: number; width: number; height: number }
}

export default function Thermometer({ measuredTemp, isActive, tubePosition }: ThermometerProps) {
    const [displayTemp, setDisplayTemp] = useState(25) // Start at room temp
    const animationFrameRef = useRef<number>()

    // Check if tube is empty (special indicator value)
    const isEmpty = measuredTemp === -999

    // Determine sensor state based on temperature
    const getSensorState = (temp: number): SensorState => {
        if (isEmpty) return 'NORMAL' // Empty tube shows as normal state
        if (temp < MERCURY_FREEZE) return 'FROZEN'
        if (temp >= MERCURY_BOIL) return 'FAILURE'
        if (temp >= OVERHEAT_WARNING) return 'OVERHEATING'
        return 'NORMAL'
    }

    const sensorState = getSensorState(measuredTemp)

    // Thermal inertia - smooth temperature changes with lag
    useEffect(() => {
        if (!isActive) return

        // If empty, don't update temperature
        if (isEmpty) {
            setDisplayTemp(0)
            return
        }

        const updateTemperature = () => {
            setDisplayTemp(prev => {
                // Apply thermal lag (sensor doesn't jump instantly)
                const newTemp = prev + (measuredTemp - prev) * THERMAL_LAG
                return newTemp
            })
            animationFrameRef.current = requestAnimationFrame(updateTemperature)
        }

        animationFrameRef.current = requestAnimationFrame(updateTemperature)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [measuredTemp, isActive, isEmpty])

    // Mercury height calculation: map working range to 0-100%
    // Working range: -39°C to 357°C (396° total range)
    const getMercuryHeight = () => {
        if (sensorState === 'FROZEN' || sensorState === 'FAILURE') return 0
        const clampedTemp = Math.max(MERCURY_FREEZE, Math.min(MERCURY_BOIL, displayTemp))
        return ((clampedTemp - MERCURY_FREEZE) / (MERCURY_BOIL - MERCURY_FREEZE)) * 100
    }

    const mercuryHeight = getMercuryHeight()

    // Color-coded display based on temperature and state
    const getDisplayColor = () => {
        if (sensorState === 'FROZEN') return '#60a5fa' // Blue
        if (sensorState === 'FAILURE') return '#ef4444' // Red
        if (sensorState === 'OVERHEATING') return '#f97316' // Orange
        if (displayTemp < 0) return '#3b82f6' // Blue
        if (displayTemp <= 100) return '#10b981' // Green
        if (displayTemp <= 200) return '#f59e0b' // Amber
        return '#ef4444' // Red
    }

    if (!isActive) return null

    const isHot = displayTemp > 100 && sensorState === 'NORMAL'

    return (
        <>
            {/* Thermometer probe descending from top */}
            <motion.div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: tubePosition.x + tubePosition.width / 2 + 15,
                    top: tubePosition.y - 30,
                    zIndex: EQUIPMENT_Z_INDEX.probes,
                }}
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Thermometer body */}
                <div className="relative">
                    {/* Glass tube */}
                    <div className="w-4 h-32 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full relative overflow-hidden">
                        {/* Mercury column - rises from bottom (only if sensor working) */}
                        {sensorState !== 'FAILURE' && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 rounded-full transition-colors duration-500"
                                style={{
                                    height: `${Math.max(0, Math.min(100, mercuryHeight))}%`,
                                    backgroundColor: sensorState === 'FROZEN' ? '#60a5fa' :
                                        sensorState === 'OVERHEATING' ? '#f97316' : '#ef4444'
                                }}
                            />
                        )}

                        {/* Temperature scale marks */}
                        {[0, 25, 50, 75, 100].map((mark) => (
                            <div
                                key={mark}
                                className="absolute right-0 w-1 h-px bg-white/40"
                                style={{ bottom: `${mark}%` }}
                            />
                        ))}
                    </div>

                    {/* Bulb at bottom - glows only when hot */}
                    <motion.div
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white/30 transition-colors duration-500"
                        style={{
                            backgroundColor: sensorState === 'FROZEN' ? '#60a5fa' :
                                sensorState === 'FAILURE' ? '#1f2937' :
                                    sensorState === 'OVERHEATING' ? '#f97316' : '#ef4444'
                        }}
                        animate={
                            isHot
                                ? {
                                    boxShadow: [
                                        '0 0 10px 2px rgba(239, 68, 68, 0.6)',
                                        '0 0 15px 4px rgba(239, 68, 68, 0.8)',
                                        '0 0 10px 2px rgba(239, 68, 68, 0.6)',
                                    ],
                                }
                                : {}
                        }
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>
            </motion.div>

            {/* Numeric display beside tube with state warnings */}
            <motion.div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: tubePosition.x + tubePosition.width + 10,
                    top: tubePosition.y + tubePosition.height * 0.3,
                    zIndex: EQUIPMENT_Z_INDEX.thermometerDisplay,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, delay: 0.5 }}
            >
                <div className={`bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border-2 shadow-xl transition-colors duration-300 ${sensorState === 'FAILURE' ? 'border-red-500' :
                    sensorState === 'OVERHEATING' ? 'border-orange-500' :
                        sensorState === 'FROZEN' ? 'border-blue-400' :
                            'border-gray-700'
                    }`}>
                    {/* Temperature reading or error state */}
                    {isEmpty ? (
                        <div className="font-mono text-sm font-bold text-gray-400">
                            -- EMPTY --
                        </div>
                    ) : sensorState === 'FROZEN' ? (
                        <div className="font-mono text-sm font-bold text-blue-400">
                            SENSOR<br />FROZEN
                        </div>
                    ) : sensorState === 'FAILURE' ? (
                        <div className="font-mono text-sm font-bold text-red-400">
                            SENSOR<br />FAILURE
                        </div>
                    ) : (
                        <>
                            <motion.div
                                className="font-mono text-lg font-bold"
                                style={{ color: getDisplayColor() }}
                            >
                                {displayTemp.toFixed(1)}°C
                            </motion.div>
                            {sensorState === 'OVERHEATING' && (
                                <motion.div
                                    className="font-mono text-xs font-bold text-orange-400 mt-1"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                >
                                    ⚠ OVERHEAT
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </>
    )
}
