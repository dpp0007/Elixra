/**
 * Analytical Balance Component
 * Scientifically accurate digital balance with proper stabilization
 */

'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { EQUIPMENT_Z_INDEX } from '@/lib/equipment-positioning'

type BalanceState = 'CAL' | 'READING' | 'OVERLOAD'

interface AnalyticalBalanceProps {
    weight: number // 0-200g (actual weight)
    tareOffset?: number // HIGH PRIORITY FIX: Tare offset from settings
    isActive: boolean
    tubePosition: { x: number; y: number; width: number; height: number }
}

const MAX_WEIGHT = 200 // grams
const DAMPING = 0.15 // Stabilization damping coefficient (0-1, lower = slower)

export default function AnalyticalBalance({ weight, tareOffset = 0, isActive, tubePosition }: AnalyticalBalanceProps) {
    const [displayWeight, setDisplayWeight] = useState(0)
    const [balanceState, setBalanceState] = useState<BalanceState>('CAL')
    const animationFrameRef = useRef<number>()

    // HIGH PRIORITY FIX: Use tareOffset from props
    const actualWeight = weight - tareOffset
    const isOverload = weight > MAX_WEIGHT

    // CAL routine on startup
    useEffect(() => {
        if (!isActive) return

        setBalanceState('CAL')
        setDisplayWeight(0)

        const calTimer = setTimeout(() => {
            setBalanceState(isOverload ? 'OVERLOAD' : 'READING')
        }, 1200)

        return () => clearTimeout(calTimer)
    }, [isActive, isOverload])

    // Update state when weight changes
    useEffect(() => {
        if (balanceState === 'CAL') return
        setBalanceState(isOverload ? 'OVERLOAD' : 'READING')
    }, [isOverload, balanceState])

    // Damped stabilization - smooth approach to target weight
    useEffect(() => {
        if (!isActive || balanceState !== 'READING') return

        const updateDisplay = () => {
            setDisplayWeight(prev => {
                // First-order lag: display approaches actual weight smoothly
                const newDisplay = prev + (actualWeight - prev) * DAMPING
                return newDisplay
            })
            animationFrameRef.current = requestAnimationFrame(updateDisplay)
        }

        animationFrameRef.current = requestAnimationFrame(updateDisplay)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [isActive, actualWeight, balanceState])

    // Check if reading is stable (within 0.001g of target)
    const isStable = Math.abs(displayWeight - actualWeight) < 0.001

    if (!isActive) return null

    // Calculate center position - tube bottom should be at platform center
    const platformWidth = tubePosition.width + 40
    const platformHeight = 10
    const displayWidth = 160

    // Tube center coordinates
    const tubeCenterX = tubePosition.x + tubePosition.width / 2
    const tubeCenterY = tubePosition.y + tubePosition.height

    // Calculate left positions by subtracting half width (manual centering without transform)
    const platformLeft = tubeCenterX - platformWidth / 2
    const displayLeft = tubeCenterX - displayWidth / 2

    // Platform top is offset up by half its height so tube bottom sits at center
    const platformTop = tubeCenterY - platformHeight / 2

    // Display sits below platform with small gap
    const displayTop = tubeCenterY + platformHeight / 2 + 8

    return (
        <>
            {/* Balance platform - tube bottom sits at platform center */}
            <motion.div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: `${platformLeft}px`,
                    top: `${platformTop}px`,
                    zIndex: EQUIPMENT_Z_INDEX.balancePlatform,
                    pointerEvents: 'none',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
            >
                <div
                    className="pointer-events-none"
                    style={{
                        width: `${platformWidth}px`,
                        height: `${platformHeight}px`,
                        background: 'linear-gradient(to bottom, #e5e7eb, #9ca3af)',
                        border: '1px solid #6b7280',
                        borderRadius: '3px',
                        position: 'relative',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    <div
                        className="pointer-events-none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '3px 3px 0 0',
                        }}
                    />
                </div>
            </motion.div>

            {/* Digital display */}
            <motion.div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: `${displayLeft}px`,
                    top: `${displayTop}px`,
                    width: `${displayWidth}px`,
                    zIndex: EQUIPMENT_Z_INDEX.balanceDisplay,
                    pointerEvents: 'none',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-black px-3 py-2 rounded-lg border-2 border-gray-700 shadow-2xl pointer-events-none">
                    {/* State-based display */}
                    {balanceState === 'CAL' ? (
                        <motion.div
                            className="text-yellow-400 font-mono text-sm font-bold text-center"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            CAL...
                        </motion.div>
                    ) : balanceState === 'OVERLOAD' ? (
                        <motion.div
                            className="text-red-500 font-mono text-lg font-bold text-center"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                        >
                            OVERLOAD
                        </motion.div>
                    ) : (
                        <>
                            {/* Weight reading */}
                            <div className="font-mono text-xl font-bold text-center text-green-400">
                                {displayWeight.toFixed(4)}
                            </div>

                            {/* Unit and Stability on same line */}
                            <div className="flex justify-center items-center space-x-2 mt-1">
                                <div className="text-green-400/60 font-mono text-xs">
                                    g
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isStable ? 'bg-green-400' : 'bg-yellow-400'
                                        }`} />
                                    <div className="text-xs font-mono text-gray-500">
                                        {isStable ? 'STABLE' : 'WAIT'}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* TARE instruction */}
                {balanceState === 'READING' && (
                    <div className="mt-1 text-[10px] font-mono text-gray-600 text-center">
                        Use panel to TARE
                    </div>
                )}
            </motion.div>
        </>
    )
}
