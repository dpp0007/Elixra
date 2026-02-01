'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Atom, Beaker, TestTube, Zap, Users, Sparkles, 
  ArrowRight, Play, Check, Brain, Target, Microscope, 
  Lightbulb, RefreshCw
} from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import dynamic from 'next/dynamic'
import { useRef, useState, useEffect } from 'react'
import { PerspectiveGrid, StaticGrid } from '@/components/GridBackground'

const HeroAtom3D = dynamic(() => import('@/components/HeroAtom3D'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100/10 animate-pulse rounded-lg" />
})

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
            className="inline-flex items-center space-x-2 px-4 py-2 bg-elixra-bunsen/10 text-elixra-bunsen rounded-full text-sm font-medium mb-6 border border-elixra-bunsen/20"
          >
            <Beaker className="w-4 h-4" />
            <span>Lab Inventory</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-elixra-text-primary"
          >
            State-of-the-Art Equipment
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-elixra-secondary max-w-2xl mx-auto text-lg leading-relaxed"
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
              className="card group relative overflow-hidden"
            >
              <StaticGrid className="opacity-30" />
              
              <div className="relative z-10">
                <div className="h-48 mb-6 flex items-center justify-center p-6 bg-elixra-warm-gray/30 rounded-xl group-hover:bg-elixra-warm-gray/50 transition-colors duration-500 relative overflow-hidden">
                  <motion.img 
                    src={item.svgPath} 
                    alt={item.name}
                    className="w-full h-full object-contain drop-shadow-lg relative z-10"
                    whileHover={{ 
                      scale: 1.15,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.5 }
                    }}
                  />
                </div>
                
                <h3 className="text-xl font-bold text-elixra-text-primary mb-3 group-hover:text-elixra-bunsen transition-colors duration-300">
                  {item.name}
                </h3>
                
                <p className="text-elixra-secondary text-sm leading-relaxed">
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
          <div className="glass-panel relative rounded-[3rem] p-8 md:p-16 overflow-hidden">
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Badge */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-elixra-cream/10 border border-elixra-bunsen/20 rounded-full text-sm font-medium mb-10 text-elixra-bunsen shadow-lg backdrop-blur-sm"
              >
                <Lightbulb className="w-4 h-4 text-elixra-copper" />
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
                    <h3 className="text-2xl md:text-5xl font-bold text-elixra-text-primary leading-tight tracking-tight">
                      &quot;{chemistryFacts[currentFactIndex]}&quot;
                    </h3>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Progress Bar & Controls */}
              <div className="w-full max-w-md flex flex-col items-center gap-6">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-elixra-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div 
                    key={currentFactIndex}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="h-full bg-elixra-bunsen rounded-full"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={nextFact}
                    className="btn-ghost group flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5 text-elixra-secondary group-hover:text-elixra-charcoal dark:group-hover:text-white group-hover:rotate-180 transition-all duration-700" />
                    <span className="text-elixra-secondary group-hover:text-elixra-charcoal dark:group-hover:text-white font-medium">Next Fact</span>
                  </button>
                </div>
              </div>
            </div>
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
    <div ref={container} className="h-screen sticky top-0 flex items-center justify-center">
      <motion.div 
        style={{ scale, top: `calc(4rem + ${index * 10}px)` }} 
        className="w-full h-[80vh] relative overflow-hidden shadow-2xl origin-top bg-elixra-cream dark:bg-elixra-warm-gray rounded-[1.5rem] md:rounded-[2.5rem] border border-elixra-border-subtle will-change-transform"
      >
        <StaticGrid className="opacity-40" />
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col md:flex-row items-stretch justify-between p-8 md:p-16 gap-6 md:gap-12">
          
          {/* Left Side: Text Content */}
          <div className="flex-1 text-left flex flex-col h-full">
            {/* Heading starts after top padding of container */}
            <h3 className="text-2xl md:text-5xl font-bold text-elixra-text-primary leading-tight mb-4 md:mb-6 drop-shadow-sm">
              {feature.title}
            </h3>
            
            <p className="text-base md:text-xl text-elixra-text-secondary leading-relaxed max-w-lg">
              {feature.description}
            </p>
            
            <div className="flex-grow" />
            
            {/* Button at the bottom, above the bottom padding */}
            <Link 
              href={feature.path}
              className="relative z-20 btn-primary w-fit group !rounded-full !px-8 !py-4 !text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-white font-bold">Explore Feature</span>
              <ArrowRight className="ml-2 h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
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
  
  return (
    <div className="min-h-screen relative bg-elixra-cream dark:bg-elixra-charcoal transition-colors duration-300">
      {/* Background Grid */}
      <PerspectiveGrid />

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
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-elixra-bunsen/20 rounded-full mb-8">
                <Sparkles className="h-4 w-4 text-elixra-copper" />
                <span className="text-sm font-medium text-elixra-text-primary">New: AI-Powered Analysis</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-elixra-charcoal dark:text-white">
                <span className="text-elixra-bunsen">
                  Chemistry Lab
                </span>
                <br />
                <span className="text-elixra-copper">
                  Reimagined
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl text-elixra-secondary mb-10 max-w-2xl leading-relaxed">
                Experience the future of chemistry education. Conduct dangerous experiments safely, visualize molecules in 3D, and learn with an AI tutor—all in your browser.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center space-x-2 rounded-full px-8 py-4 bg-elixra-bunsen text-white font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-elixra-bunsen-dark transition-all duration-300 group"
                >
                  <span>Start Experimenting</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/lab"
                  className="flex items-center justify-center space-x-2 rounded-full px-8 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-elixra-bunsen/20 text-elixra-text-primary font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>Watch Demo</span>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12 flex items-center space-x-8 text-sm text-elixra-secondary">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-elixra-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-elixra-success" />
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
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-elixra-text-primary">
            Everything you need to master chemistry
          </h2>
          <p className="text-elixra-secondary max-w-2xl mx-auto text-lg">
            Our platform combines advanced simulation technology with AI-driven learning to create the ultimate chemistry playground.
          </p>
        </div>

        <div className="relative mt-0">
          {features.map((feature, index) => {
            const targetScale = 1 - ( (features.length - index) * 0.05 );
            return (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index}
                range={[index * 0.25, 1]}
                targetScale={targetScale}
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
