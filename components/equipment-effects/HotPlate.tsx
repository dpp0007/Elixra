/**
 * Hot Plate Animation Component - GEOMETRY-BASED POSITIONING
 * Anchored to tube bottom center, scales with tube width
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getIntensityScale } from '@/lib/equipment-animations'
import {
    getEquipmentPosition,
    getPlatformWidth,
    EQUIPMENT_Z_INDEX
} from '@/lib/equipment-positioning'

interface HotPlateProps {
    temperature: number // 25-400°C
    isActive: boolean
    tubePosition: { x: number; y: number; width: number; height: number }
}

export default function HotPlate({ temperature, isActive, tubePosition }: HotPlateProps) {
    const [bubbles, setBubbles] = useState<number[]>([])
    const { level, percentage } = getIntensityScale('hot-plate', temperature)
    
    // Generate unique ID for gradients based on position to avoid conflicts
    const uniqueId = `hp-${Math.round(tubePosition.x)}-${Math.round(tubePosition.y)}`

    // Platform width scales with tube (tube width + 20% margin)
    const plateDiameter = getPlatformWidth(tubePosition.width, 1.2)

    // Position anchored to tube bottom center - plate sits below tube
    const position = getEquipmentPosition(tubePosition, 'bottom-center', { y: 5 })

    useEffect(() => {
        console.log(`🔥 HotPlate Render:`, {
            isActive,
            temperature,
            tubePosition,
            plateDiameter,
            position
        })
    }, [isActive, temperature, tubePosition])

    // Bubble spawning at 100°C+
    useEffect(() => {
        if (!isActive || temperature < 100) {
            setBubbles([])
            return
        }

        const spawnRate = Math.max(1500 - ((temperature - 100) / 300) * 1200, 300)
        const interval = setInterval(() => {
            setBubbles(prev => {
                const newBubbles = [...prev, Date.now()]
                return newBubbles.slice(-8) // Max 8 bubbles
            })
        }, spawnRate)

        return () => clearInterval(interval)
    }, [isActive, temperature])

    if (!isActive) return null

    // Glow intensity based on temperature
    const glowOpacity = 0.5 + (percentage / 100) * 0.5
    const glowColor =
        temperature < 200
            ? 'rgba(255, 150, 0, '
            : temperature < 300
                ? 'rgba(255, 100, 0, '
                : 'rgba(255, 50, 0, '

    return (
        <div
            className="pointer-events-none"
            style={{
                position: 'fixed',
                left: position.left,
                top: position.top,
                transform: position.transform,
                zIndex: EQUIPMENT_Z_INDEX.hotPlate,
            }}
        >
            {/* Hot Plate SVG */}
            <motion.svg
                width={plateDiameter}
                height="20"
                viewBox={`0 0 ${plateDiameter} 20`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 1 }}
            >
                {/* Plate base */}
                <ellipse
                    cx={plateDiameter / 2}
                    cy="10"
                    rx={plateDiameter / 2}
                    ry="8"
                    fill={`url(#plateGradient-${uniqueId})`}
                    stroke="#6b7280"
                    strokeWidth="0.5"
                />

                {/* Glow edge */}
                <motion.ellipse
                    cx={plateDiameter / 2}
                    cy="10"
                    rx={plateDiameter / 2 - 2}
                    ry="6"
                    fill="none"
                    stroke={glowColor + glowOpacity + ')'}
                    strokeWidth="3"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Heat lines radiating upward */}
                {[...Array(5)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M ${plateDiameter / 2 + (i - 2) * 8} 5 Q ${plateDiameter / 2 + (i - 2) * 8 + 2} -5, ${plateDiameter / 2 + (i - 2) * 8} -15`}
                        stroke={glowColor + (glowOpacity * 0.6) + ')'}
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="4 2"
                        animate={{
                            strokeDashoffset: [0, -20],
                            opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}

                <defs>
                    <radialGradient id={`plateGradient-${uniqueId}`}>
                        <stop offset="0%" stopColor="#4a5568" />
                        <stop offset="70%" stopColor="#2d3748" />
                        <stop offset="100%" stopColor="#1a202c" />
                    </radialGradient>
                </defs>
            </motion.svg>

            {/* Heat glow matching tube's rounded bottom shape */}
            <div
                className="absolute pointer-events-none"
                style={{
                    left: '50%',
                    bottom: 15,
                    transform: 'translateX(-50%)',
                    width: tubePosition.width,
                    height: tubePosition.height * 0.35,
                    background: `radial-gradient(ellipse at bottom, ${glowColor}${glowOpacity * 0.7}) 0%, ${glowColor}${glowOpacity * 0.3}) 50%, transparent 80%)`,
                    borderRadius: '0 0 24px 24px',
                }}
            />

            {/* Intense contact glow ring at tube base */}
            <div
                className="absolute pointer-events-none"
                style={{
                    left: '50%',
                    bottom: 15,
                    transform: 'translateX(-50%)',
                    width: tubePosition.width * 0.9,
                    height: 12,
                    background: `radial-gradient(ellipse, ${glowColor}${glowOpacity * 0.9}) 0%, ${glowColor}${glowOpacity * 0.5}) 50%, transparent 80%)`,
                    filter: 'blur(3px)',
                }}
            />

            {/* Convection flow lines inside liquid */}
            {isActive && (
                <svg
                    className="absolute"
                    style={{
                        left: '50%',
                        bottom: 20,
                        transform: 'translateX(-50%)',
                        width: tubePosition.width - 10,
                        height: tubePosition.height * 0.7,
                        pointerEvents: 'none',
                    }}
                    viewBox={`0 0 ${tubePosition.width - 10} ${tubePosition.height * 0.7}`}
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.path
                            key={i}
                            d={`M ${(tubePosition.width - 10) * (0.25 + i * 0.25)} ${tubePosition.height * 0.7} Q ${(tubePosition.width - 10) * (0.3 + i * 0.25)} ${tubePosition.height * 0.4}, ${(tubePosition.width - 10) * (0.25 + i * 0.25)} 0`}
                            stroke="rgba(255, 255, 255, 0.15)"
                            strokeWidth="1"
                            fill="none"
                            strokeDasharray="3 3"
                            animate={{
                                strokeDashoffset: [0, -20],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2 + i * 0.3,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    ))}
                </svg>
            )}

            {/* Bubbles (100°C+) - constrained to tube width */}
            <AnimatePresence>
                {bubbles.map(id => {
                    const xOffset = (Math.random() - 0.5) * (tubePosition.width * 0.6)
                    return (
                        <motion.div
                            key={id}
                            className="absolute rounded-full border border-white/40"
                            style={{
                                left: `calc(50% + ${xOffset}px)`,
                                bottom: 20 + tubePosition.height * 0.1,
                                width: 3 + Math.random() * 3,
                                height: 3 + Math.random() * 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            }}
                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                            animate={{
                                opacity: [0, 0.7, 0],
                                y: [0, -tubePosition.height * 0.6, -tubePosition.height * 0.8],
                                scale: [0.5, 1, 0.8],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2.5 + Math.random(), ease: 'easeOut' }}
                            onAnimationComplete={() => {
                                setBubbles(prev => prev.filter(b => b !== id))
                            }}
                        />
                    )
                })}
            </AnimatePresence>

            {/* Heat distortion on lower tube */}
            <motion.div
                className="absolute"
                style={{
                    left: '50%',
                    bottom: 20,
                    transform: 'translateX(-50%)',
                    width: tubePosition.width,
                    height: tubePosition.height * 0.3,
                    backdropFilter: `blur(${level === 'high' ? 1.5 : level === 'medium' ? 1 : 0.5}px)`,
                    pointerEvents: 'none',
                }}
            />
        </div>
    )
}
