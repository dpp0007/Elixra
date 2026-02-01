'use client'

import { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ModernNavbar from './ModernNavbar'

interface ModernPageWrapperProps {
  children: ReactNode
  showParticles?: boolean
}

export default function ModernPageWrapper({ children, showParticles = true }: ModernPageWrapperProps) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y, opacity }}
          className="absolute w-full h-full"
        >
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%` 
              }}
              animate={{
                y: [null, -100 - Math.random() * 50],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}

      {/* Navbar */}
      <ModernNavbar />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
