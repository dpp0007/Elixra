/**
 * Centrifuge Animation Component
 * Implements canonical spec: chamber enclosure with rotation and phase separation
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    getEquipmentPosition,
    EQUIPMENT_Z_INDEX
} from '@/lib/equipment-positioning'
import { getIntensityScale } from '@/lib/equipment-animations'

interface CentrifugeProps {
    rpm: number // 0-5000
    isActive: boolean
    tubePosition: { x: number; y: number; width: number; height: number }
    liquidLayers?: { color: string; density: number }[] // For phase separation
}

export default function Centrifuge({ rpm, isActive, tubePosition, liquidLayers = [] }: CentrifugeProps) {
    const [isChamberClosed, setIsChamberClosed] = useState(false)
    const [separationProgress, setSeparationProgress] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)

    const { level, percentage } = getIntensityScale('centrifuge', rpm)

    useEffect(() => {
        console.log(`🌀 Centrifuge Render:`, {
            isActive,
            rpm,
            tubePosition,
            zIndex: EQUIPMENT_Z_INDEX.centrifugeChamber
        })
    }, [isActive, rpm, tubePosition])

    // Rotation speed: RPM / 10
    const rotationDuration = rpm > 0 ? 60 / (rpm / 10) : 10

    // Separation speed tied to RPM: 1000 RPM = 5s, 5000 RPM = 1s
    const separationDuration = rpm > 0 ? Math.max(1, 5 - (rpm / 1250)) : 5

    // Chamber door animation sequence
    useEffect(() => {
        if (isActive) {
            // Close door
            const closeTimeout = setTimeout(() => {
                setIsChamberClosed(true)
                setIsSpinning(true)
            }, 500)

            return () => clearTimeout(closeTimeout)
        } else {
            // Stop spinning and open door
            setIsSpinning(false)
            const openTimeout = setTimeout(() => {
                setIsChamberClosed(false)
            }, 3000) // 3s deceleration

            return () => clearTimeout(openTimeout)
        }
    }, [isActive])

    // Phase separation animation
    useEffect(() => {
        if (!isActive || !isSpinning) {
            setSeparationProgress(0)
            return
        }

        const interval = setInterval(() => {
            setSeparationProgress((prev) => Math.min(100, prev + (100 / (separationDuration * 10))))
        }, 100)

        return () => clearInterval(interval)
    }, [isActive, isSpinning, separationDuration])

    if (!isActive && !isChamberClosed) return null

    // Motion blur intensity
    const blurAmount = level === 'high' ? 4 : level === 'medium' ? 2 : level === 'low' ? 1 : 0

    // Sort layers by density for separation
    const sortedLayers = [...liquidLayers].sort((a, b) => b.density - a.density)

    return (
        <>
            {/* Centrifuge chamber */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    left: tubePosition.x + tubePosition.width / 2,
                    top: tubePosition.y + tubePosition.height / 2,
                    transform: 'translate(-50%, -50%)',
                    zIndex: EQUIPMENT_Z_INDEX.centrifugeChamber,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
            >
                {/* Chamber body */}
                <motion.div
                    className="relative bg-gradient-to-b from-gray-700 to-gray-800 rounded-2xl border-2 border-gray-600 shadow-2xl overflow-hidden"
                    style={{
                        width: tubePosition.width + 60,
                        height: tubePosition.height + 80,
                    }}
                    animate={
                        isSpinning
                            ? { rotate: 360 }
                            : { rotate: 0 }
                    }
                    transition={
                        isSpinning
                            ? { duration: rotationDuration, repeat: Infinity, ease: 'linear' }
                            : { duration: 3, ease: 'easeOut' }
                    }
                >
                    {/* Chamber window */}
                    <div
                        className="absolute inset-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-500 overflow-hidden"
                        style={{ filter: isSpinning ? `blur(${blurAmount}px)` : 'none' }}
                    >
                        {/* Tube visible through window (counter-rotates to stay upright) */}
                        <motion.div
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            animate={
                                isSpinning
                                    ? { rotate: -360 }
                                    : { rotate: 0 }
                            }
                            transition={
                                isSpinning
                                    ? { duration: rotationDuration, repeat: Infinity, ease: 'linear' }
                                    : { duration: 3, ease: 'easeOut' }
                            }
                        >
                            {/* Mini tube representation */}
                            <div
                                className="bg-white/10 border border-white/20 rounded-b-lg"
                                style={{
                                    width: tubePosition.width * 0.6,
                                    height: tubePosition.height * 0.7,
                                }}
                            >
                                {/* Phase separation layers */}
                                <AnimatePresence>
                                    {isChamberClosed && sortedLayers.length > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0">
                                            {sortedLayers.map((layer, index) => {
                                                const layerHeight = (100 / sortedLayers.length) * (separationProgress / 100)
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        className="absolute left-0 right-0"
                                                        style={{
                                                            backgroundColor: layer.color,
                                                            bottom: `${index * layerHeight}%`,
                                                            height: `${layerHeight}%`,
                                                            opacity: 0.7,
                                                        }}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${layerHeight}%` }}
                                                        transition={{ duration: separationDuration, ease: 'easeOut' }}
                                                    />
                                                )
                                            })}

                                            {/* Pellet at bottom (dense particles) */}
                                            <motion.div
                                                className="absolute bottom-0 left-0 right-0 bg-gray-600 rounded-b-lg"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${10 * (separationProgress / 100)}%` }}
                                                transition={{ duration: separationDuration, ease: 'easeOut' }}
                                            />

                                            {/* Supernatant (clear liquid on top) */}
                                            <motion.div
                                                className="absolute top-0 left-0 right-0 bg-blue-200/20"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(100 - sortedLayers.length * 20) * (separationProgress / 100)}%` }}
                                                transition={{ duration: separationDuration, ease: 'easeOut' }}
                                            />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Rotation indicator lines */}
                        {isSpinning && (
                            <>
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute bg-white/10"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            width: 2,
                                            height: '40%',
                                            transformOrigin: 'top center',
                                            transform: `rotate(${i * 45}deg)`,
                                        }}
                                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            delay: i * 0.1,
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </div>

                    {/* Chamber control panel */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: isSpinning ? '#10b981' : '#6b7280' }}
                            animate={isSpinning ? { opacity: [1, 0.5, 1] } : {}}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-blue-500"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* Chamber door (slides closed) */}
                <AnimatePresence>
                    {!isChamberClosed && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 border-2 border-gray-500 rounded-2xl"
                            initial={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                            {/* Door handle */}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-gray-800 rounded-full" />

                            {/* Door label */}
                            <div className="absolute top-4 left-4 text-xs text-gray-400 font-mono">
                                CENTRIFUGE
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* RPM display */}
            {isChamberClosed && (
                <motion.div
                    className="absolute pointer-events-none"
                    style={{
                        left: tubePosition.x + tubePosition.width / 2,
                        top: tubePosition.y - 40,
                        transform: 'translateX(-50%)',
                        zIndex: EQUIPMENT_Z_INDEX.centrifugeDisplay,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                >
                    <div className="bg-gray-900 px-3 py-1 rounded border border-gray-700 shadow-lg">
                        <div className="text-green-400 font-mono text-sm font-bold">
                            {rpm} RPM
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Motion blur overlay for extreme speeds */}
            {isSpinning && blurAmount > 2 && (
                <motion.div
                    className="absolute pointer-events-none"
                    style={{
                        left: tubePosition.x + tubePosition.width / 2,
                        top: tubePosition.y + tubePosition.height / 2,
                        transform: 'translate(-50%, -50%)',
                        width: tubePosition.width + 80,
                        height: tubePosition.height + 100,
                        background: 'radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 0.3) 70%)',
                        zIndex: EQUIPMENT_Z_INDEX.centrifugeBlur,
                    }}
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}

            {/* Vibration effect at high RPM */}
            {isSpinning && rpm > 3000 && (
                <motion.div
                    className="absolute pointer-events-none"
                    style={{
                        left: tubePosition.x + tubePosition.width / 2,
                        top: tubePosition.y + tubePosition.height / 2,
                        transform: 'translate(-50%, -50%)',
                        width: tubePosition.width + 60,
                        height: tubePosition.height + 80,
                        zIndex: EQUIPMENT_Z_INDEX.centrifugeVibration,
                    }}
                    animate={{
                        x: [0, 1, -1, 1, 0],
                        y: [0, -1, 1, -1, 0],
                    }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                />
            )}
        </>
    )
}
