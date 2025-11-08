'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import LabTable from '@/components/LabTable'
import ChemicalShelf from '@/components/ChemicalShelf'
import ReactionPanel from '@/components/ReactionPanel'
import ExperimentControls from '@/components/ExperimentControls'
import EquipmentPanel from '@/components/EquipmentPanel'
import ModernNavbar from '@/components/ModernNavbar'
import { useDragScroll } from '@/hooks/useDragScroll'
import { useAuth } from '@/contexts/AuthContext'
import { Experiment, ReactionResult } from '@/types/chemistry'

export default function LabPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null)
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [addChemicalToTestTube, setAddChemicalToTestTube] = useState<((chemical: any) => void) | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [activeEquipment, setActiveEquipment] = useState<any[]>([])
  const labTableRef = useRef<HTMLDivElement>(null)
  
  // Prevent auto-scrolling during drag operations
  useDragScroll()
  
  // Auto-scroll to lab table on mobile devices
  useEffect(() => {
    const isMobile = window.innerWidth < 1024 // lg breakpoint
    if (isMobile && labTableRef.current && isAuthenticated && !isCheckingAuth) {
      // Small delay to ensure page is fully rendered
      setTimeout(() => {
        labTableRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 500)
    }
  }, [isAuthenticated, isCheckingAuth])
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      // Allow some time for auth context to initialize
      setTimeout(() => {
        setIsCheckingAuth(false)
        if (!isAuthenticated) {
          router.push('/auth/signin')
        }
      }, 100)
    }
    
    checkAuth()
  }, [isAuthenticated, router])
  
  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Don't render lab if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleAddChemicalToTestTube = (chemical: any) => {
    console.log('=== LAB PAGE: handleAddChemicalToTestTube called ===')
    console.log('Chemical:', chemical)
    console.log('addChemicalToTestTube function:', addChemicalToTestTube)
    
    if (addChemicalToTestTube && chemical) {
      console.log('Calling addChemicalToTestTube')
      addChemicalToTestTube(chemical)
    } else {
      console.error('Cannot add chemical to test tube:', { addChemicalToTestTube, chemical })
    }
  }

  const handleReaction = async (experiment: Experiment) => {
    setIsReacting(true)
    setCurrentExperiment(experiment)
    
    // Add equipment info to experiment
    const experimentWithEquipment = {
      ...experiment,
      equipment: activeEquipment.filter(eq => eq.active).map(eq => ({
        name: eq.name,
        value: eq.value,
        unit: eq.unit
      }))
    }
    
    try {
      const response = await fetch('/api/react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experimentWithEquipment),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Check if result has error
      if (result.error) {
        throw new Error(result.error)
      }
      
      setReactionResult(result)
      
      // Save experiment to database
      await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...experiment,
          reactionDetails: result,
        }),
      })
    } catch (error) {
      console.error('Reaction failed:', error)
    } finally {
      setIsReacting(false)
    }
  }

  const clearExperiment = () => {
    setCurrentExperiment(null)
    setReactionResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-1/2 right-0 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse delay-2000"></div>
      </div>

      {/* Modern Navbar */}
      <ModernNavbar />

      <div className="relative z-10 max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-6">
        {/* Mobile Scroll Hint - Only visible on mobile */}
        <div className="lg:hidden mb-3 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-full text-xs sm:text-sm text-blue-700 dark:text-blue-300"
          >
            <motion.span
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↓
            </motion.span>
            Scroll to see Lab Bench below
          </motion.div>
        </div>

        {/* Mobile: Vertical Stack | Desktop: Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 min-h-screen items-start">
          
          {/* Lab Table - Priority on mobile (top), center on desktop */}
          <div ref={labTableRef} className="w-full lg:flex-1 lg:max-w-2xl order-1 lg:order-2 scroll-mt-20">
            <LabTable 
              onReaction={handleReaction}
              reactionResult={reactionResult}
              isReacting={isReacting}
              onAddChemicalToTestTube={setAddChemicalToTestTube}
            />
          </div>
          
          {/* Chemical Shelf - Full width on mobile, sidebar on desktop */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
            <ChemicalShelf onAddChemicalToTestTube={handleAddChemicalToTestTube} />
          </div>

          {/* Reaction Panel - Full width on mobile, sidebar on desktop */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 order-3">
            <ReactionPanel 
              experiment={currentExperiment}
              result={reactionResult}
              isLoading={isReacting}
            />
          </div>
        </div>
      </div>
      
      {/* Equipment Panel */}
      <EquipmentPanel onEquipmentChange={setActiveEquipment} />
    </div>
  )
}