/**
 * Magnetic Stirrer Animation Component - GEOMETRY-BASED POSITIONING
 * Anchored to tube bottom center, vortex masked to tube shape
 */

'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { getIntensityScale } from '@/lib/equipment-animations'
import {
    getEquipmentPosition,
    getPlatformWidth,
    getVortexDepth,
    EQUIPMENT_Z_INDEX
} from '@/lib/equipment-positioning'

interface MagneticStirrerProps {
    rpm: number // 0-1500
    isActive: boolean
    tubePosition: { x: number; y: number; width: number; height: number }
}

export default function MagneticStirrer({ rpm, isActive, tubePosition }: MagneticStirrerProps) {
    const { level, percentage } = getIntensityScale('magnetic-stirrer', rpm)
    
    // Generate unique ID for gradients
    const uniqueId = `ms-${Math.round(tubePosition.x)}-${Math.round(tubePosition.y)}`

    useEffect(() => {
        console.log(`🌀 MagneticStirrer Render:`, {
            isActive,
            rpm,
            tubePosition,
            uniqueId
        })
    }, [isActive, rpm, tubePosition, uniqueId])

    // Rotation speed: Higher RPM = faster rotation (more realistic)
    // At 100 RPM: 0.6s per rotation, At 1500 RPM: 0.04s per rotation
    const rotationDuration = rpm > 0 ? Math.max(0.04, 60 / rpm) : 10

    // Vortex depth scales with RPM and tube height
    const vortexDepth = getVortexDepth(rpm, 1500, tubePosition.height)

    // Vortex intensity increases with RPM
    const vortexIntensity = Math.min(rpm / 1500, 1)

    // Platform width scales with tube (tube width + 30% margin)
    const platformWidth = getPlatformWidth(tubePosition.width, 1.3)

    // Position anchored to tube bottom center
    const position = getEquipmentPosition(tubePosition, 'bottom-center', { y: 0 })

    if (!isActive) return null

    return (
        <>
            {/* Stirrer base plate beneath tube */}
            <div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: position.left,
                    top: position.top,
                    transform: position.transform,
                    zIndex: EQUIPMENT_Z_INDEX.stirrerBase,
                }}
            >
                <motion.svg
                    width={platformWidth}
                    height="25"
                    viewBox={`0 0 ${platformWidth} 25`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 2, ease: 'easeOut' } }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Base plate with depth */}
                    <ellipse
                        cx={platformWidth / 2}
                        cy="14"
                        rx={platformWidth / 2}
                        ry="11"
                        fill="#1f2937"
                        opacity="0.3"
                    />
                    <ellipse
                        cx={platformWidth / 2}
                        cy="12"
                        rx={platformWidth / 2}
                        ry="10"
                        fill={`url(#stirrerGradient-${uniqueId})`}
                        stroke="#4b5563"
                        strokeWidth="0.5"
                    />

                    {/* Top surface highlight */}
                    <ellipse
                        cx={platformWidth / 2}
                        cy="10"
                        rx={platformWidth / 2 - 5}
                        ry="6"
                        fill={`url(#stirrerHighlight-${uniqueId})`}
                        opacity="0.3"
                    />

                    {/* Power indicator LED - pulses faster with higher RPM */}
                    <motion.circle
                        cx={platformWidth / 2 + 20}
                        cy="12"
                        r="4"
                        fill="#10b981"
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                            duration: Math.max(0.3, 1 - vortexIntensity * 0.7),
                            repeat: Infinity
                        }}
                    />
                    <circle
                        cx={platformWidth / 2 + 20}
                        cy="12"
                        r="6"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1"
                        opacity="0.3"
                    />

                    {/* Rotating magnetic field indicator */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: rotationDuration * 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ transformOrigin: `${platformWidth / 2}px 12px` }}
                    >
                        <path
                            d={`M ${platformWidth / 2} 6 L ${platformWidth / 2 + 10} 12 L ${platformWidth / 2} 18`}
                            stroke="#10b981"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.6 + vortexIntensity * 0.4}
                        />
                        <path
                            d={`M ${platformWidth / 2} 6 L ${platformWidth / 2 - 10} 12 L ${platformWidth / 2} 18`}
                            stroke="#10b981"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.6 + vortexIntensity * 0.4}
                        />
                    </motion.g>

                    {/* Speed indicator lines */}
                    {rpm > 300 && [...Array(3)].map((_, i) => (
                        <motion.line
                            key={i}
                            x1={platformWidth / 2 - 25}
                            y1={12}
                            x2={platformWidth / 2 - 30}
                            y2={12}
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            opacity={rpm > 300 + i * 400 ? 0.8 : 0.2}
                            animate={{
                                x1: [platformWidth / 2 - 25, platformWidth / 2 - 30],
                                x2: [platformWidth / 2 - 30, platformWidth / 2 - 35],
                                opacity: rpm > 300 + i * 400 ? [0.8, 0.3, 0.8] : 0.2
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.15
                            }}
                        />
                    ))}

                    <defs>
                        <radialGradient id={`stirrerGradient-${uniqueId}`}>
                            <stop offset="0%" stopColor="#4b5563" />
                            <stop offset="50%" stopColor="#374151" />
                            <stop offset="100%" stopColor="#1f2937" />
                        </radialGradient>
                        <radialGradient id={`stirrerHighlight-${uniqueId}`}>
                            <stop offset="0%" stopColor="#9ca3af" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                </motion.svg>
            </div>

            {/* Stir bar inside liquid - spins faster with higher RPM */}
            <div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: position.left,
                    top: tubePosition.y + tubePosition.height - 25,
                    transform: position.transform,
                    zIndex: EQUIPMENT_Z_INDEX.stirBar,
                }}
            >
                <motion.div
                    className="rounded-full shadow-lg"
                    style={{
                        width: 18,
                        height: 5,
                        background: 'linear-gradient(90deg, #f3f4f6 0%, #ffffff 50%, #f3f4f6 100%)',
                        boxShadow: `0 0 ${4 + vortexIntensity * 8}px rgba(16, 185, 129, ${0.3 + vortexIntensity * 0.5})`
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 0.9,
                        scale: 1,
                        rotate: 360,
                    }}
                    exit={{
                        opacity: 0,
                        rotate: 0,
                        transition: { duration: 2, ease: 'easeOut' },
                    }}
                    transition={{
                        scale: { duration: 0.3 },
                        rotate: {
                            duration: rotationDuration,
                            repeat: Infinity,
                            ease: 'linear',
                        },
                    }}
                />
            </div>

            {/* Liquid vortex */}
            <div
                className="pointer-events-none"
                style={{
                    position: 'fixed',
                    left: tubePosition.x,
                    top: tubePosition.y + tubePosition.height * 0.2,
                    width: tubePosition.width,
                    height: tubePosition.height * 0.6,
                    zIndex: EQUIPMENT_Z_INDEX.vortex,
                }}
            >
                <svg
                    width={tubePosition.width}
                    height={tubePosition.height * 0.6}
                    viewBox={`0 0 ${tubePosition.width} ${tubePosition.height * 0.6}`}
                    style={{ overflow: 'visible' }}
                >
                    {/* Vortex spiral - spins faster with higher RPM */}
                    <motion.path
                        d={`
              M ${tubePosition.width / 2} ${vortexDepth}
              Q ${tubePosition.width * 0.7} ${(tubePosition.height * 0.6) * 0.3}, ${tubePosition.width * 0.6} ${(tubePosition.height * 0.6) * 0.5}
              Q ${tubePosition.width * 0.5} ${(tubePosition.height * 0.6) * 0.6}, ${tubePosition.width * 0.4} ${(tubePosition.height * 0.6) * 0.5}
              Q ${tubePosition.width * 0.3} ${(tubePosition.height * 0.6) * 0.3}, ${tubePosition.width / 2} ${vortexDepth}
            `}
                        stroke={`rgba(255, 255, 255, ${0.15 + vortexIntensity * 0.25})`}
                        strokeWidth={2 + vortexIntensity * 2}
                        fill="none"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: rotationDuration * 1.5,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ transformOrigin: `${tubePosition.width / 2}px ${(tubePosition.height * 0.6) / 2}px` }}
                    />

                    {/* Additional spiral layers for high RPM */}
                    {rpm > 500 && (
                        <motion.path
                            d={`
                  M ${tubePosition.width / 2} ${vortexDepth * 0.8}
                  Q ${tubePosition.width * 0.65} ${(tubePosition.height * 0.6) * 0.35}, ${tubePosition.width * 0.55} ${(tubePosition.height * 0.6) * 0.5}
                  Q ${tubePosition.width * 0.5} ${(tubePosition.height * 0.6) * 0.55}, ${tubePosition.width * 0.45} ${(tubePosition.height * 0.6) * 0.5}
                  Q ${tubePosition.width * 0.35} ${(tubePosition.height * 0.6) * 0.35}, ${tubePosition.width / 2} ${vortexDepth * 0.8}
                `}
                            stroke={`rgba(16, 185, 129, ${0.2 + vortexIntensity * 0.3})`}
                            strokeWidth={1.5 + vortexIntensity}
                            fill="none"
                            animate={{ rotate: -360 }}
                            transition={{
                                duration: rotationDuration * 1.2,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ transformOrigin: `${tubePosition.width / 2}px ${(tubePosition.height * 0.6) / 2}px` }}
                        />
                    )}

                    {/* Surface ripples - faster with higher RPM */}
                    {[...Array(rpm > 800 ? 5 : 3)].map((_, i) => (
                        <motion.ellipse
                            key={i}
                            cx={tubePosition.width / 2}
                            cy={(tubePosition.height * 0.6) * (vortexDepth / 100)}
                            rx={8 + i * 6}
                            ry={2 + i * 1.5}
                            stroke={`rgba(255, 255, 255, ${0.1 + vortexIntensity * 0.15})`}
                            strokeWidth="1.5"
                            fill="none"
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.6, 0.1, 0.6],
                            }}
                            transition={{
                                duration: Math.max(0.8, 1.5 - vortexIntensity * 0.7),
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            style={{ transformOrigin: `${tubePosition.width / 2}px ${(tubePosition.height * 0.6) * (vortexDepth / 100)}px` }}
                        />
                    ))}
                </svg>
            </div>

            {/* Liquid swirl motion blur - intensity increases with RPM */}
            <motion.div
                className="pointer-events-none rounded-full"
                style={{
                    position: 'fixed',
                    left: position.left,
                    top: tubePosition.y + tubePosition.height * 0.4,
                    width: tubePosition.width * 0.8,
                    height: tubePosition.width * 0.8,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, transparent 40%, rgba(16, 185, 129, ${0.03 + vortexIntensity * 0.08}) 70%, transparent 100%)`,
                    zIndex: EQUIPMENT_Z_INDEX.liquidOverlay,
                }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: rotationDuration * 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* High-speed turbulence particles */}
            {rpm > 1000 && [...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="pointer-events-none rounded-full"
                    style={{
                        position: 'fixed',
                        left: position.left,
                        top: tubePosition.y + tubePosition.height * 0.5,
                        width: 3,
                        height: 3,
                        background: 'rgba(16, 185, 129, 0.6)',
                        zIndex: EQUIPMENT_Z_INDEX.liquidOverlay,
                    }}
                    animate={{
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 20, 0],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 20, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{
                        duration: rotationDuration * 3,
                        repeat: Infinity,
                        delay: i * rotationDuration * 0.5,
                        ease: 'easeInOut'
                    }}
                />
            ))}
        </>
    )
}
