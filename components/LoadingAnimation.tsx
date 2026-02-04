'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LoadingAnimation() {
    // Static bubbles configuration for performance
    const bubbles = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        r: 1.5 + (i % 3),
        delay: i * 0.3,
        duration: 2 + (i % 3) * 0.3,
        xStart: 80 + (i % 5) * 10, // Distributed across width
        xEnd: 80 + (i % 5) * 10 + ((i % 2 === 0 ? 1 : -1) * 20) // Slight drift
    }))

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div 
                    className="absolute inset-0" 
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Chemistry Animation Container */}
                <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                    
                    {/* Orbiting Rings (Electrons) */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Ring 1 - Path hidden, only electron visible */}
                        <motion.div 
                            className="absolute top-1/2 left-1/2 w-56 h-16 rounded-full"
                            style={{ x: '-50%', y: '-50%' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="absolute top-1/2 right-0 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa] -translate-y-1/2 translate-x-1/2" />
                        </motion.div>
                        
                        {/* Ring 2 - Path hidden, only electron visible */}
                        <motion.div 
                            className="absolute top-1/2 left-1/2 w-56 h-16 rounded-full"
                            style={{ x: '-50%', y: '-50%' }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="absolute top-1/2 left-0 w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_15px_#a78bfa] -translate-y-1/2 -translate-x-1/2" />
                        </motion.div>
                    </div>

                    {/* Flask SVG */}
                    <svg viewBox="0 0 200 200" className="w-32 h-32 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                        <defs>
                            <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
                            </linearGradient>
                            
                            <clipPath id="flask-inner">
                                <path d="M75,60 L75,30 C75,25 79,20 85,20 L115,20 C121,20 125,25 125,30 L125,60 L160,150 C165,160 160,180 145,180 L55,180 C40,180 35,160 40,150 Z" />
                            </clipPath>
                        </defs>

                        {/* Flask Body (Glass) */}
                        <path 
                            d="M75,60 L75,30 C75,25 79,20 85,20 L115,20 C121,20 125,25 125,30 L125,60 L160,150 C165,160 160,180 145,180 L55,180 C40,180 35,160 40,150 Z"
                            fill="rgba(255, 255, 255, 0.03)"
                            stroke="rgba(255, 255, 255, 0.5)"
                            strokeWidth="2"
                        />

                        {/* Liquid with Wave Animation */}
                        <g clipPath="url(#flask-inner)">
                            <motion.path
                                d="M0,180 L200,180 L200,110 Q150,100 100,110 Q50,120 0,110 Z"
                                fill="url(#liquid-gradient)"
                                animate={{
                                    d: [
                                        "M0,180 L200,180 L200,110 Q150,100 100,110 Q50,120 0,110 Z",
                                        "M0,180 L200,180 L200,110 Q150,120 100,110 Q50,100 0,110 Z",
                                        "M0,180 L200,180 L200,110 Q150,100 100,110 Q50,120 0,110 Z"
                                    ]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            
                            {/* Bubbles - Optimized with CSS-based infinite animation */}
                            {bubbles.map((bubble) => (
                                <motion.circle
                                    key={bubble.id}
                                    r={bubble.r}
                                    fill="rgba(255,255,255,0.7)"
                                    initial={{ cy: 160, opacity: 0, cx: bubble.xStart }}
                                    animate={{ 
                                        cy: 90,
                                        opacity: [0, 1, 0],
                                        cx: [bubble.xStart, bubble.xEnd]
                                    }}
                                    transition={{ 
                                        duration: bubble.duration,
                                        repeat: Infinity,
                                        delay: bubble.delay,
                                        ease: "easeOut"
                                    }}
                                />
                            ))}
                        </g>

                        {/* Glass Highlights */}
                        <path 
                            d="M50,150 Q45,160 55,160 L65,160"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path 
                            d="M150,150 Q155,160 145,160 L135,160"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                {/* Logo and Text */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center space-y-4"
                >
                    <div className="relative w-40 h-10">
                        <Image
                            src="/Assets/Main Logo.svg"
                            alt="Elixra"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/20 backdrop-blur-sm">
                        <span className="text-blue-200 font-medium text-sm tracking-wider uppercase">Initializing Lab</span>
                        <div className="flex gap-1">
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
