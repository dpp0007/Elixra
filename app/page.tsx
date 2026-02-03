'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Atom, Beaker, TestTube, Zap, Users, Sparkles, 
  ArrowRight, Play, Check, Brain, Target, Microscope, 
  Lightbulb, RefreshCw
} from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import AuthButton from '@/components/AuthButton'
import { useRef, useState } from 'react'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const features = [
  {
    title: 'Virtual Lab',
    description: 'Perform complex experiments safely in a risk-free virtual environment. Mix chemicals, observe reactions, and master lab techniques.',
    icon: Beaker,
    gradient: 'from-blue-500 to-cyan-500',
    path: '/lab'
  },
  {
    title: 'AI Tutor',
    description: 'Get real-time guidance and explanations from our advanced AI assistant. Stuck on a concept? Our AI Tutor is available 24/7.',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
    path: '/avatar'
  },
  {
    title: 'Daily Quizzes',
    description: 'Test your knowledge with interactive daily challenges. Earn points, track your progress, and compete with peers.',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500',
    path: '/quiz'
  },
  {
    title: 'Molecular Modeling',
    description: 'Dive into the microscopic world. Build and visualize 3D molecular structures to understand geometry and bonding.',
    icon: Atom,
    gradient: 'from-orange-500 to-red-500',
    path: '/molecules'
  },
  {
    title: 'Spectroscopy',
    description: 'Master modern analytical techniques. Simulate UV-Vis, IR, and NMR spectroscopy to identify unknown compounds.',
    icon: Microscope,
    gradient: 'from-indigo-500 to-violet-500',
    path: '/spectroscopy'
  },
  {
    title: 'Collaborate',
    description: 'Science is better together. Join forces with classmates in real-time to conduct experiments and share data.',
    icon: Users,
    gradient: 'from-pink-500 to-rose-500',
    path: '/collaborate'
  }
]

const chemistryFacts = [
  "Hot water freezes faster than cold water, known as the Mpemba effect.",
  "Glass is actually a liquid, just a very slow-flowing one.",
  "Oxygen is colorless as a gas, but pale blue as a liquid.",
  "The only letter that doesn't appear on the periodic table is J.",
  "If you pour a handful of salt into a full glass of water, the water level will go down.",
  "A rubber tire is actually one single giant polymerized molecule.",
  "Water expands when it freezes, unlike most substances.",
  "Helium is lighter than air because it's less dense.",
  "Diamond and graphite are both made entirely of carbon."
]

function ChemistryFactsSection() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  
  const nextFact = () => {
    setCurrentFactIndex((prev) => (prev + 1) % chemistryFacts.length)
  }

  return (
    <section className="relative z-10 py-12 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Atom className="w-24 h-24 md:w-32 md:h-32 text-blue-500 animate-[spin_20s_linear_infinite]" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-8">
              <Lightbulb className="w-4 h-4" />
              <span>Did You Know?</span>
            </div>
            
            <div className="h-48 md:h-32 flex items-center justify-center mb-8">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentFactIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-xl md:text-4xl font-bold text-white leading-tight"
                >
                  "{chemistryFacts[currentFactIndex]}"
                </motion.p>
              </AnimatePresence>
            </div>
            
            <button
              onClick={nextFact}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Next Fact</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index, range, targetScale, total }: { 
  feature: typeof features[0], 
  index: number, 
  range: [number, number], 
  targetScale: number,
  total: number
}) {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1])
  const scale = useTransform(scrollYProgress, range, [1, targetScale])
  
  return (
    <div ref={container} className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ scale, top: `calc(4rem + ${index * 10}px)` }} 
        className="w-full h-[75vh] md:h-[80vh] relative overflow-hidden shadow-2xl origin-top bg-slate-900/90 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10"
      >
        {/* Card Background with Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 z-0`} />
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-center p-6 md:p-16 gap-8 md:gap-12">
          
          {/* Left Side: Text Content */}
          <div className="flex-1 text-left space-y-6 md:space-y-8 pb-8 md:pb-0">
            <div className={`inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
              <feature.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {feature.title}
            </h3>
            
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
              {feature.description}
            </p>
            
            <Link 
              href={feature.path}
              className={`inline-flex items-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold text-white rounded-xl bg-gradient-to-r ${feature.gradient} hover:scale-105 transition-transform shadow-xl`}
            >
              Explore {feature.title}
              <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
            </Link>
          </div>

          {/* Right Side: Visual/Icon (Large) */}
          <div className="flex-1 flex items-center justify-center">
             <div className={`relative w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl animate-pulse`} />
             <feature.icon className={`absolute w-32 h-32 md:w-64 md:h-64 text-white opacity-10`} />
             <feature.icon className={`relative w-24 h-24 md:w-40 md:h-40 text-white drop-shadow-2xl`} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  // Parallax transforms for Hero Visual
  const yFloating1 = useTransform(scrollYProgress, [0, 0.5], [0, -100])
  const yFloating2 = useTransform(scrollYProgress, [0, 0.5], [0, 100])
  const rotateScroll = useTransform(scrollYProgress, [0, 0.5], [0, 45])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ y, opacity }} className="absolute w-full h-full">
          <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] top-0 left-1/4 animate-pulse" />
          <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] top-1/3 right-1/4 animate-pulse delay-1000" />
          <div className="absolute w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] bottom-0 left-1/2 animate-pulse delay-2000" />
        </motion.div>
        
        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, 
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0 
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

      <ModernNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-8">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-200">New: AI-Powered Analysis</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Chemistry Lab
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
                Experience the future of chemistry education. Conduct dangerous experiments safely, visualize molecules in 3D, and learn with an AI tutor—all in your browser.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Start Experimenting</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/lab"
                  className="group px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>Watch Demo</span>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12 flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Free for students</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto perspective-1000">
                {/* Central Core with Rings */}
                <motion.div 
                  style={{ rotate: rotateScroll }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                    {/* Outer Rings */}
                    <div className="absolute w-[500px] h-[500px] rounded-full border border-white/5 border-dashed animate-[spin_60s_linear_infinite]" />
                    <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10 animate-[spin_40s_linear_infinite_reverse]" />
                    <div className="absolute w-[300px] h-[300px] rounded-full border border-white/5 border-dashed animate-[spin_30s_linear_infinite]" />
                    
                    {/* Main Gradient Sphere */}
                    <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 blur-[80px] opacity-60 animate-pulse" />
                    
                    {/* Glass Center */}
                    <div className="relative w-48 h-48 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 shadow-[0_0_50px_rgba(139,92,246,0.2)] flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Atom className="w-20 h-20 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-[spin_10s_linear_infinite]" />
                    </div>
                </motion.div>

                {/* Floating Card 1 - Top Right */}
                <motion.div 
                  style={{ y: yFloating1 }}
                  className="absolute top-10 right-10 z-20"
                >
                    <motion.div 
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div className="mt-2 text-xs font-medium text-white/80 text-center">AI Tutor</div>
                    </motion.div>
                </motion.div>

                {/* Floating Card 2 - Bottom Left */}
                <motion.div 
                  style={{ y: yFloating2 }}
                  className="absolute bottom-20 left-10 z-20"
                >
                    <motion.div 
                      animate={{ y: [0, 15, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <Beaker className="h-6 w-6 text-white" />
                        </div>
                        <div className="mt-2 text-xs font-medium text-white/80 text-center">Virtual Lab</div>
                    </motion.div>
                </motion.div>

                 {/* Floating Card 3 - Small decoration */}
                <motion.div 
                  style={{ y: yFloating1, x: -20 }}
                  className="absolute top-1/2 -right-0 z-10"
                >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl"
                    >
                         <Sparkles className="h-5 w-5 text-yellow-400" />
                    </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Preview - Stacking Cards */}
      <section className="relative z-10 pt-0 pb-0">
        <div className="text-center mb-10 px-4 pt-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Everything you need to master chemistry
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our platform combines advanced simulation technology with AI-driven learning to create the ultimate chemistry playground.
          </p>
        </div>

        <div className="relative mt-0">
          {features.map((feature, index) => {
            const targetScale = 1 - ( (features.length - 1 - index) * 0.05);
            return (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index}
                range={[0, 1]}
                targetScale={targetScale}
                total={features.length}
              />
            )
          })}
        </div>
      </section>

      {/* Chemistry Facts Section */}
      <ChemistryFactsSection />
    </div>
  )
}
