'use client'
 
 import { useState, useEffect } from 'react'
 import { motion } from 'framer-motion'
 import Image from 'next/image'

export default function LoadingAnimation() {
    const [particles, setParticles] = useState<Array<{ left: string; top: string; duration: number; delay: number }>>([])

    useEffect(() => {
        const newParticles = [...Array(20)].map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
        }))
        setParticles(newParticles)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {particles.map((particle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                        style={{
                            left: particle.left,
                            top: particle.top,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            {/* Main loading content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo with pulse animation */}
                <motion.div
                    className="relative mb-8"
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="relative h-20 w-40">
                        <Image
                            src="/Assets/Main Logo.svg"
                            alt="Elixra"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Glow effect */}
                    <motion.div
                        className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    />
                </motion.div>

                {/* Chemistry beaker animation */}
                <div className="relative w-32 h-32 mb-6">
                    {/* Beaker */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                            </linearGradient>
                        </defs>

                        {/* Beaker outline */}
                        <path
                            d="M 30 20 L 30 70 Q 30 85 50 85 Q 70 85 70 70 L 70 20 Z"
                            fill="none"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="2"
                        />

                        {/* Animated liquid */}
                        <motion.path
                            d="M 30 70 Q 30 85 50 85 Q 70 85 70 70 L 70 50 L 30 50 Z"
                            fill="url(#liquidGradient)"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0.6, 1, 0.6],
                                d: [
                                    "M 30 70 Q 30 85 50 85 Q 70 85 70 70 L 70 60 L 30 60 Z",
                                    "M 30 70 Q 30 85 50 85 Q 70 85 70 70 L 70 40 L 30 40 Z",
                                    "M 30 70 Q 30 85 50 85 Q 70 85 70 70 L 70 60 L 30 60 Z",
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />

                        {/* Bubbles */}
                        {[...Array(5)].map((_, i) => (
                            <motion.circle
                                key={i}
                                cx={40 + i * 5}
                                cy={70}
                                r="2"
                                fill="rgba(255,255,255,0.6)"
                                initial={{ cy: 70, opacity: 0 }}
                                animate={{
                                    cy: [70, 30, 30],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </svg>
                </div>

                {/* Loading text */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Preparing Your Lab
                    </h2>
                    <div className="flex items-center justify-center space-x-2">
                        <motion.span
                            className="text-blue-400"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        >
                            •
                        </motion.span>
                        <motion.span
                            className="text-blue-400"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        >
                            •
                        </motion.span>
                        <motion.span
                            className="text-blue-400"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        >
                            •
                        </motion.span>
                    </div>
                </motion.div>

                {/* Progress bar */}
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-6">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
