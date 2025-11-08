'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    Download,
    Share2,
    RotateCcw,
    Flame,
    Plus,
    Atom,
    Sparkles
} from 'lucide-react'
import LabTable from '@/components/LabTable'
import ChemicalShelf from '@/components/ChemicalShelf'
import ReactionPanel from '@/components/ReactionPanel'
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
    const [showFeatures, setShowFeatures] = useState(false)
    const labTableRef = useRef<HTMLDivElement>(null)

    useDragScroll()

    useEffect(() => {
        const isMobile = window.innerWidth < 1024
        if (isMobile && labTableRef.current && isAuthenticated && !isCheckingAuth) {
            setTimeout(() => {
                labTableRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 500)
        }
    }, [isAuthenticated, isCheckingAuth])

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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-24 mx-auto mb-4">
                        <img
                            src="/Assets/Testube.svg"
                            alt="Loading"
                            className="w-full h-full animate-pulse"
                        />
                    </div>
                    <p className="text-gray-300">Loading laboratory...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(experiment),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.error) {
                throw new Error(result.error)
            }

            setReactionResult(result)

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

    const handleSave = async () => {
        if (!currentExperiment) return
        // Save logic here
    }

    const handleExport = async () => {
        if (!currentExperiment) return
        // Export logic here
    }

    const handleShare = async () => {
        if (!currentExperiment) return
        // Share logic here
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
            {/* Navbar - Matching Home Page Theme */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left: Back + Logo */}
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Back to home"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
                                        <Atom className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-white">ChemLab AI</span>
                            </Link>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearExperiment}
                                disabled={!currentExperiment}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Clear experiment"
                            >
                                <RotateCcw className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!currentExperiment}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Save experiment"
                            >
                                <Save className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={!currentExperiment}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Export PDF"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={!currentExperiment}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Share experiment"
                            >
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Fixed Height Grid */}
            <div className="h-[calc(100vh-4rem)] grid lg:grid-cols-[320px_1fr_380px] gap-4 p-4">
                {/* Left Panel - Chemical Shelf */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Sparkles className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Chemical Reagents</h2>
                                <p className="text-xs text-gray-400">Click or drag to add</p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <ChemicalShelf onAddChemicalToTestTube={handleAddChemicalToTestTube} />
                    </div>
                </motion.div>

                {/* Center Panel - Lab Bench */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    ref={labTableRef}
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <Atom className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Lab Bench</h2>
                            </div>
                            {/* Add Glassware Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => (window as any).__addTestTube?.()}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Test Tube
                                </button>
                                <button
                                    onClick={() => (window as any).__addBeaker?.()}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all"
                                >
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
                </motion.div>

                {/* Right Panel - Reaction Analysis */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
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
                </motion.div>
            </div>

            {/* Floating Features Button */}
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
                        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4">
                            <h3 className="text-sm font-bold text-white mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg text-sm transition-all text-left">
                                    Save Experiment
                                </button>
                                <button className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg text-sm transition-all text-left">
                                    Export Results
                                </button>
                                <button className="w-full px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 rounded-lg text-sm transition-all text-left">
                                    Share Lab
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5));
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.7), rgba(139, 92, 246, 0.7));
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.5) rgba(15, 23, 42, 0.3);
        }
      `}</style>
        </div>
    )
}
