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
import HeroAtom3D from '@/components/HeroAtom3D'
import { useRef, useState, useEffect } from 'react'

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
    title: 'Virtual Simulation Lab',
    description: 'Perform complex experiments safely in a risk-free virtual environment. Mix chemicals, observe reactions, and master lab techniques.',
    icon: Beaker,
    gradient: 'from-blue-500 to-cyan-500',
    path: '/lab',
    svgPath: '/Assets/Cards/Virtual Lab.svg'
  },
  {
    title: 'AI Tutor',
    description: 'Get real-time guidance and explanations from our advanced AI assistant. Stuck on a concept? Our AI Tutor is available 24/7.',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
    path: '/avatar',
    svgPath: '/Assets/Cards/Ai Teacher.svg'
  },
  {
    title: 'Quizzes',
    description: 'Test your knowledge with interactive daily challenges. Earn points, track your progress, and compete with peers.',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500',
    path: '/quiz',
    svgPath: '/Assets/Cards/Quize.svg'
  },
  {
    title: 'Molecular Modeling',
    description: 'Dive into the microscopic world. Build and visualize 3D molecular structures to understand geometry and bonding.',
    icon: Atom,
    gradient: 'from-orange-500 to-red-500',
    path: '/molecules',
    svgPath: '/Assets/Cards/Molecule.svg'
  },
  {
    title: 'Spectroscopy',
    description: 'Master modern analytical techniques. Simulate UV-Vis, IR, and NMR spectroscopy to identify unknown compounds.',
    icon: Microscope,
    gradient: 'from-indigo-500 to-violet-500',
    path: '/spectroscopy',
    svgPath: '/Assets/Cards/Spectroscopy.svg'
  },
  {
    title: 'Collaborate',
    description: 'Science is better together. Join forces with classmates in real-time to conduct experiments and share data.',
    icon: Users,
    gradient: 'from-pink-500 to-rose-500',
    path: '/collaborate',
    svgPath: '/Assets/Cards/Collabrate.svg'
  }
]

const equipment = [
  {
    name: 'Analytical Balance',
    description: 'Measure mass with high precision and accuracy for quantitative analysis.',
    svgPath: '/Assets/Equipments/Analytical Balance.svg'
  },
  {
    name: 'Bunsen Burner',
    description: 'Produce a single open gas flame for heating, sterilization, and combustion.',
    svgPath: '/Assets/Equipments/Busen Burner.svg'
  },
  {
    name: 'Centrifuge',
    description: 'Separate fluids based on density using high-speed rotation.',
    svgPath: '/Assets/Equipments/Centrifuge.svg'
  },
  {
    name: 'Hot Plate',
    description: 'Heat glassware or its contents in a controlled, flameless manner.',
    svgPath: '/Assets/Equipments/Hot Plate.svg'
  },
  {
    name: 'Magnetic Stirrer',
    description: 'Mix solutions automatically using a rotating magnetic field.',
    svgPath: '/Assets/Equipments/Magnetic Stirrer.svg'
  },
  {
    name: 'pH Meter',
    description: 'Measure the acidity or alkalinity of a solution with digital precision.',
    svgPath: '/Assets/Equipments/Ph Meter.svg'
  },
  {
    name: 'Thermometer',
    description: 'Measure temperature changes during chemical reactions.',
    svgPath: '/Assets/Equipments/Thermometer.svg'
  },
  {
    name: 'Timer',
    description: 'Track reaction times and experiment durations accurately.',
    svgPath: '/Assets/Equipments/Timer.svg'
  }
]

function EquipmentSection() {
  return (
    <section className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium mb-6 border border-blue-500/20"
          >
            <Beaker className="w-4 h-4" />
            <span>Lab Inventory</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent"
          >
            State-of-the-Art Equipment
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Access a complete suite of professional-grade laboratory tools. 
            From precision measurement to reaction control, everything you need is at your fingertips.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {equipment.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] hover:border-blue-400/50 overflow-hidden"
            >
              {/* Card Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="h-48 mb-6 flex items-center justify-center p-6 bg-gradient-to-b from-white/5 to-transparent rounded-xl group-hover:from-white/10 transition-colors duration-500 relative overflow-hidden">
                  {/* Glow effect behind image */}
                  <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <motion.img 
                    src={item.svgPath} 
                    alt={item.name}
                    className="w-full h-full object-contain drop-shadow-lg filter group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] relative z-10"
                    whileHover={{ 
                      scale: 1.15,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.5 }
                    }}
                  />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors group-hover:translate-x-1 duration-300">
                  {item.name}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

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
  const [isPaused, setIsPaused] = useState(false)
  
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % chemistryFacts.length)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isPaused])

  const nextFact = () => {
    setCurrentFactIndex((prev) => (prev + 1) % chemistryFacts.length)
  }

  return (
    <section className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Glass Card */}
          <div className="relative bg-slate-900/20 backdrop-blur-md border border-white/5 rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl">
            
            {/* Animated Gradient Blob Background inside card */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
               <motion.div 
                 animate={{ 
                   scale: [1, 1.2, 1],
                   rotate: [0, 90, 0],
                 }}
                 transition={{ 
                   duration: 20, 
                   repeat: Infinity,
                   ease: "linear" 
                 }}
                 className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"
               />
               <motion.div 
                 animate={{ 
                   scale: [1, 1.5, 1],
                   rotate: [0, -90, 0],
                 }}
                 transition={{ 
                   duration: 25, 
                   repeat: Infinity,
                   ease: "linear" 
                 }}
                 className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"
               />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Badge */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium mb-10 text-blue-300 shadow-lg backdrop-blur-sm"
              >
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Did You Know?</span>
              </motion.div>
              
              {/* Fact Text */}
              <div className="min-h-[180px] md:min-h-[200px] flex items-center justify-center mb-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFactIndex}
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl"
                  >
                    <h3 className="text-2xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                      "{chemistryFacts[currentFactIndex]}"
                    </h3>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Progress Bar & Controls */}
              <div className="w-full max-w-md flex flex-col items-center gap-6">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div 
                    key={currentFactIndex}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={nextFact}
                    className="group flex items-center space-x-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-180 transition-all duration-700" />
                    <span className="text-gray-400 group-hover:text-white font-medium">Next Fact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements around the card */}
           <div className="absolute -top-12 -right-12 z-0 opacity-20 pointer-events-none">
            <Atom className="w-48 h-48 text-blue-500 animate-[spin_30s_linear_infinite]" />
          </div>
          <div className="absolute -bottom-12 -left-12 z-0 opacity-20 pointer-events-none">
            <Beaker className="w-40 h-40 text-purple-500 rotate-12" />
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

  const scale = useTransform(scrollYProgress, range, [1, targetScale])
  
  return (
    <div ref={container} className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ scale, top: `calc(4rem + ${index * 10}px)` }} 
        className="w-full h-[80vh] relative overflow-hidden shadow-2xl origin-top bg-slate-900/90 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 will-change-transform"
      >
        {/* Card Background with Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 z-0`} />
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col md:flex-row items-stretch justify-between p-8 md:p-16 gap-6 md:gap-12">
          
          {/* Left Side: Text Content */}
          <div className="flex-1 text-left flex flex-col h-full">
            {/* Heading starts after top padding of container */}
            <h3 className="text-2xl md:text-5xl font-bold text-white leading-tight mb-4 md:mb-6">
              {feature.title}
            </h3>
            
            <p className="text-base md:text-xl text-gray-300 leading-relaxed max-w-lg">
              {feature.description}
            </p>
            
            <div className="flex-grow" />
            
            {/* Button at the bottom, above the bottom padding */}
            <Link 
              href={feature.path}
              className="relative z-20 inline-flex items-center justify-center px-6 py-3 text-sm md:text-base font-medium text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20 w-fit group"
            >
              <span>Explore Feature</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Side: SVG Visual */}
          {feature.title !== 'Daily Quizzes' && (
            <div className="flex-1 flex w-full h-full relative items-center justify-center">
              <img 
                src={feature.svgPath} 
                alt={feature.title} 
                className="w-full h-full object-contain max-h-[300px] md:max-h-[500px] drop-shadow-2xl" 
              />
            </div>
          )}
        </div>

        {/* Daily Quizzes SVG - Positioned Absolutely to bypass padding */}
        {feature.title === 'Daily Quizzes' && (
          <img 
            src={feature.svgPath} 
            alt={feature.title} 
            className="absolute bottom-0 right-0 w-auto h-auto max-w-[60%] max-h-[90%] object-contain object-bottom-right pointer-events-none drop-shadow-2xl z-10"
            style={{ transformOrigin: 'bottom right', transform: 'scale(2.0)' }}
          />
        )}
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
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3], 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] top-0 left-1/4 will-change-transform" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3], 
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] top-1/3 right-1/4 will-change-transform" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3], 
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] bottom-0 left-1/2 will-change-transform" 
          />
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
      <section className="relative z-10 pt-20 pb-0 px-4 sm:px-6 lg:px-8">
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
                {/* 3D Atom Structure */}
                <div className="absolute inset-0 z-10 w-[120%] h-[120%] -top-[10%] -left-[20%] lg:-left-[10%]">
                   <HeroAtom3D />
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Preview - Stacking Cards */}
      <section className="relative z-10 pt-0 pb-0">
        <div className="text-center mb-4 px-4 pt-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Everything you need to master chemistry
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our platform combines advanced simulation technology with AI-driven learning to create the ultimate chemistry playground.
          </p>
        </div>

        <div className="relative mt-0">
          {features.map((feature, index) => {
            return (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index}
                range={[0, 1]}
                targetScale={1}
                total={features.length}
              />
            )
          })}
        </div>
      </section>

      {/* Equipment Section */}
      <EquipmentSection />

      {/* Chemistry Facts Section */}
      <ChemistryFactsSection />
    </div>
  )
}
