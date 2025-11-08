'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Plus, Atom, Sparkles } from 'lucide-react'
import LabTable from '@/components/LabTable'
import ChemicalShelf from '@/components/ChemicalShelf'
import ReactionPanel from '@/components/ReactionPanel'
import CustomCursor from '@/components/CustomCursor'
import { useDragScroll } from '@/hooks/useDragScroll'
import { useAuth } from '@/contexts/AuthContext'
import { Experiment, ReactionResult } from '@/types/chemistry'

export default function RefinedLabPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null)
    const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
    const [isReacting, setIsReacting] = useState(false)
    const [addChemicalToTestTube, setAddChemicalToTestTube] = useState<((chemical: any) => void) | null>(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [showFeatures, setShowFeatures] = useState(false)

    useDragScroll()

    useEffect(() => {
        const checkAuth = () => {
            setTimeout(() => {
                setIsCheckingAuth(false)
                if (!isAuthenticated) {
                    router.push('/auth/signin')
                }
            }, 100)
        }
        checkAuth()
    }, [isAuthenticated, router])

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-4"
                    >
                        <Atom className="w-full h-full text-primary-400" />
                    </motion.div>
                    <p className="text-gray-300">Loading laboratory...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) return null

    const handleAddChemicalToTestTube = (chemical: any) => {
        if (addChemicalToTestTube && chemical) {
            addChemicalToTestTube(chemical)
        }
    }

    const handleReaction = async (experiment: Experiment) => {
        setIsReacting(true)
        setCurrentExperiment(experiment)

        try {
            const response = await fetch('/api/react', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(experiment),
            })

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const result = await response.json()
            if (result.error) throw new Error(result.error)

            setReactionResult(result)

            await fetch('/api/experiments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...experiment, reactionDetails: result }),
            })
        } catch (error) {
            console.error('Reaction failed:', error)
        } finally {
            setIsReacting(false)
        }
    }

    return (
        <>
            <CustomCursor />

            {/* Full Page Lab Container */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                {/* Main Grid Layout */}
                <div className="relative h-full grid grid-cols-[320px_1fr_380px] gap-4 p-4">

                    {/* Left Panel - Chemical Shelf */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative h-full"
                    >
                        <div className="h-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex-shrink-0 p-4 border-b border-slate-700/50 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-500/20 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Chemical Reagents</h2>
                                        <p className="text-xs text-gray-400">Tap/drag to add</p>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content with Custom Scrollbar */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <ChemicalShelf onAddChemicalToTestTube={handleAddChemicalToTestTube} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Center Panel - Lab Bench */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative h-full"
                    >
                        <div className="h-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex-shrink-0 p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Atom className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Lab Bench</h2>
                                    </div>

                                    {/* Add Glassware Buttons */}
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/50 text-primary-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Test Tube
                                        </button>
                                        <button className="px-3 py-1.5 bg-accent-green/20 hover:bg-accent-green/30 border border-accent-green/50 text-green-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Beaker
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Lab Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <LabTable
                                    onReaction={handleReaction}
                                    reactionResult={reactionResult}
                                    isReacting={isReacting}
                                    onAddChemicalToTestTube={setAddChemicalToTestTube}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel - Reaction Analysis */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="relative h-full"
                    >
                        <div className="h-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex-shrink-0 p-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Atom className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Reaction Analysis</h2>
                                        <p className="text-xs text-gray-400">AI-powered results</p>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <ReactionPanel
                                    experiment={currentExperiment}
                                    result={reactionResult}
                                    isLoading={isReacting}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Features Button - Glassmorphism */}
                <motion.button
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                    onClick={() => setShowFeatures(!showFeatures)}
                    className="fixed bottom-8 right-8 z-50 group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                    {/* Button */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500/90 to-red-500/90 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: showFeatures ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Flame className="w-7 h-7 text-white drop-shadow-lg" />
                        </motion.div>
                    </div>

                    {/* Ripple Effect */}
                    <motion.div
                        className="absolute inset-0 border-2 border-orange-500/50 rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.button>

                {/* Features Panel */}
                <AnimatePresence>
                    {showFeatures && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="fixed bottom-28 right-8 z-40 w-64"
                        >
                            <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl p-4">
                                <h3 className="text-sm font-bold text-white mb-3">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button className="w-full px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/50 text-primary-300 rounded-lg text-sm transition-all text-left">
                                        Save Experiment
                                    </button>
                                    <button className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg text-sm transition-all text-left">
                                        Export Results
                                    </button>
                                    <button className="w-full px-3 py-2 bg-accent-green/20 hover:bg-accent-green/30 border border-accent-green/50 text-green-300 rounded-lg text-sm transition-all text-left">
                                        Share Lab
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6));
          border-radius: 4px;
          border: 2px solid rgba(30, 41, 59, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8));
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.6) rgba(30, 41, 59, 0.3);
        }
      `}</style>
        </>
    )
}
