'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Users, Target, Atom, Beaker, Microscope, Sparkles, 
  ArrowLeft, Menu, X, Zap, Flame, Droplets, Wind
} from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

const features = [
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration',
    description: 'Work together with other users in shared lab sessions. See reactions in real-time and collaborate on experiments.',
    icon: Users,
    status: 'active',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    path: '/collaborate',
    particles: '🔴🟠🟡'
  },
  {
    id: 'challenges',
    title: 'Daily Reaction Quiz',
    description: 'Predict chemical reactions and earn points. New challenges every day to test your chemistry knowledge.',
    icon: Target,
    status: 'active',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    path: '/quiz',
    particles: '🔵🟦💙'
  },
  {
    id: 'molecular',
    title: 'Molecular Modeling',
    description: 'Visualize molecular reactions in 3D. Build molecules and see how they interact at the atomic level.',
    icon: Atom,
    status: 'active',
    gradient: 'from-fuchsia-500 via-purple-500 to-pink-500',
    path: '/molecules',
    particles: '🟣🟪💜'
  },
  {
    id: 'equipment',
    title: 'Advanced Equipment',
    description: 'Access professional lab equipment including Bunsen burners, centrifuges, pH meters, and more.',
    icon: Beaker,
    status: 'active',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    path: '/equipment',
    particles: '🔷🔹💠'
  },
  {
    id: 'spectroscopy',
    title: 'Spectroscopy Tools',
    description: 'Analyze substances using UV-Vis, IR, NMR, and mass spectrometry simulations.',
    icon: Microscope,
    status: 'active',
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    path: '/spectroscopy',
    particles: '🟣🔮✨'
  }
]

export default function FeaturesPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
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
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920, 
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080 
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
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

      {/* Modern Navbar */}
      <ModernNavbar />

      {/* Hero Section with crazy animations */}
      <section className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <motion.h1 
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                backgroundImage: 'linear-gradient(90deg, #fff, #a78bfa, #ec4899, #fff)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Supercharged
              <br />
              Features
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Experience chemistry with cutting-edge AI technology
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid with crazy animations */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 100
                }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredCard(feature.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group relative"
              >
                <Link href={feature.path}>
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500`}
                    animate={hoveredCard === feature.id ? {
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Card */}
                  <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all duration-300 overflow-hidden">
                    {/* Animated particles */}
                    {hoveredCard === feature.id && (
                      <div className="absolute inset-0 overflow-hidden">
                        {[...Array(10)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-2xl"
                            initial={{ 
                              x: Math.random() * 100 + '%',
                              y: '100%',
                              opacity: 0
                            }}
                            animate={{
                              y: '-100%',
                              opacity: [0, 1, 0]
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.1,
                              repeat: Infinity
                            }}
                          >
                            {feature.particles[i % 3]}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Icon with crazy animation */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 relative z-10`}
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1.2, 1.1, 1]
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {feature.description}
                      </p>
                    </div>

                    {/* Status badge */}
                    <motion.div
                      className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-xs font-semibold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ACTIVE
                    </motion.div>

                    {/* Hover arrow */}
                    <motion.div
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={hoveredCard === feature.id ? { x: [0, 5, 0] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <ArrowLeft className="h-5 w-5 text-white rotate-180" />
                      </div>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Action Elements */}
      <div className="fixed bottom-8 right-8 z-50 space-y-4">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Link
            href="/lab"
            className="block w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Beaker className="h-8 w-8 text-white" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
