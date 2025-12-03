'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import ExperimentControls from '@/components/ExperimentControls'
import EquipmentPanel from '@/components/EquipmentPanel'
import ActiveEquipmentDisplay from '@/components/ActiveEquipmentDisplay'
import ModernNavbar from '@/components/ModernNavbar'
import { useDragScroll } from '@/hooks/useDragScroll'
import { Experiment, ReactionResult } from '@/types/chemistry'

export default function LabPage() {
    const router = useRouter()
    const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null)
    const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
    const [isReacting, setIsReacting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [addChemicalToTestTube, setAddChemicalToTestTube] = useState<((chemical: any) => void) | null>(null)
    const [addTestTubeFunc, setAddTestTubeFunc] = useState<(() => void) | null>(null)
    const [addBeakerFunc, setAddBeakerFunc] = useState<(() => void) | null>(null)
    const [showFeatures, setShowFeatures] = useState(false)
    const [activeEquipment, setActiveEquipment] = useState<any[]>([])
    const [openEquipmentPanel, setOpenEquipmentPanel] = useState(false)
    
    // Debug equipment changes
    useEffect(() => {
        console.log('Lab: Active equipment changed', {
            count: activeEquipment.length,
            active: activeEquipment.filter(eq => eq.active),
            all: activeEquipment
        })
    }, [activeEquipment])
    const labTableRef = useRef<HTMLDivElement>(null)
    const reactionPanelRef = useRef<HTMLDivElement>(null)

    useDragScroll()

    useEffect(() => {
        const isMobile = window.innerWidth < 1024
        if (isMobile && labTableRef.current) {
            setTimeout(() => {
                labTableRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 500)
        }
    }, [])

    // Scroll to reaction results on mobile when reaction completes
    useEffect(() => {
        const isMobile = window.innerWidth < 1024
        if (isMobile && reactionResult && reactionPanelRef.current) {
            setTimeout(() => {
                reactionPanelRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 500)
        }
    }, [reactionResult])

    const handleAddChemicalToTestTube = (chemical: any) => {
        if (addChemicalToTestTube && chemical) {
            addChemicalToTestTube(chemical)
        }
    }

    const handleReaction = async (experiment: Experiment) => {
        setIsReacting(true)
        setCurrentExperiment(experiment)

        // Add equipment info to experiment
        const activeEq = activeEquipment.filter(eq => eq.active)
        console.log('Lab: Performing reaction with equipment', {
            totalEquipment: activeEquipment.length,
            activeCount: activeEq.length,
            activeEquipment: activeEq
        })
        
        const experimentWithEquipment = {
            ...experiment,
            equipment: activeEq.map(eq => ({
                name: eq.name,
                value: eq.value,
                unit: eq.unit
            }))
        }
        
        console.log('Lab: Experiment with equipment', experimentWithEquipment)

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
        if (!currentExperiment || !reactionResult) {
            alert('Please perform an experiment first!')
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch('/api/experiments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...currentExperiment,
                    reactionDetails: reactionResult,
                    savedAt: new Date().toISOString()
                }),
            })

            if (response.ok) {
                alert('✅ Experiment saved successfully!')
            } else {
                throw new Error('Failed to save experiment')
            }
        } catch (error) {
            console.error('Save failed:', error)
            alert('❌ Failed to save experiment. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleExport = async () => {
        if (!currentExperiment || !reactionResult) {
            alert('Please perform an experiment first!')
            return
        }

        setIsExporting(true)
        try {
            // Dynamic import to avoid SSR issues
            const { generateExperimentPDF } = await import('@/lib/pdfExport')

            generateExperimentPDF({
                experiment: currentExperiment,
                result: reactionResult,
                date: new Date(),
                author: 'Lab User'
            })

            // Small delay to show the loading state
            await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
            console.error('Export failed:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            alert(`❌ Failed to export PDF: ${errorMessage}\n\nPlease try again or check the console for details.`)
        } finally {
            setIsExporting(false)
        }
    }

    const handleShare = async () => {
        if (!currentExperiment || !reactionResult) {
            alert('Please perform an experiment first!')
            return
        }

        setIsSharing(true)
        const shareData = {
            title: 'Chemistry Experiment Results',
            text: `Chemical Reaction: ${reactionResult.balancedEquation || 'View my experiment results'}`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                // Use Web Share API if available
                await navigator.share(shareData)
            } else {
                // Fallback: Copy to clipboard
                const shareText = `Chemistry Experiment Results\n\nChemicals Used:\n${currentExperiment.chemicals.map(c =>
                    `- ${c.chemical.name} (${c.chemical.formula}): ${c.amount} ${c.unit}`
                ).join('\n')
                    }\n\nReaction: ${reactionResult.balancedEquation || 'N/A'}\n\nObservations:\n${reactionResult.observations?.join('\n- ') || 'None'
                    }\n\nGenerated by ChemLab AI`

                await navigator.clipboard.writeText(shareText)
                alert('✅ Experiment details copied to clipboard!')
            }
        } catch (error) {
            console.error('Share failed:', error)
            alert('❌ Failed to share experiment. Please try again.')
        } finally {
            setIsSharing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
            {/* Animated Background - Matching Features Page */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
                <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
            </div>

            {/* Modern Navbar - Same as Homepage */}
            <ModernNavbar />

            {/* Main Content - Responsive Grid */}
            <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[320px_1fr_380px] gap-4 p-4">
                {/* Left Panel - Chemical Shelf */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-[400px] lg:h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl hover:border-white/40 transition-all duration-300 overflow-hidden flex flex-col"
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
                    className="h-[500px] lg:h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl hover:border-white/40 transition-all duration-300 overflow-hidden flex flex-col"
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
                                    onClick={() => {
                                        if (addTestTubeFunc) {
                                            addTestTubeFunc()
                                        } else {
                                            (window as any).__addTestTube?.()
                                        }
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Test Tube
                                </button>
                                <button
                                    onClick={() => {
                                        if (addBeakerFunc) {
                                            addBeakerFunc()
                                        } else {
                                            (window as any).__addBeaker?.()
                                        }
                                    }}
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
                            onAddTestTube={setAddTestTubeFunc}
                            onAddBeaker={setAddBeakerFunc}
                        />
                    </div>
                </motion.div>

                {/* Right Panel - Reaction Analysis */}
                <motion.div
                    ref={reactionPanelRef}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`min-h-[600px] lg:h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 rounded-3xl transition-all duration-300 overflow-hidden flex flex-col ${reactionResult ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-white/20 hover:border-white/40'
                        }`}
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Atom className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-white">Reaction Analysis</h2>
                                <p className="text-xs text-gray-400">AI-powered results</p>
                            </div>
                            {reactionResult && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="lg:hidden px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full"
                                >
                                    <span className="text-xs text-green-300 font-semibold">New Results!</span>
                                </motion.div>
                            )}
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

            {/* Mobile: View Results Button */}


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
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl hover:border-white/40 transition-all duration-300 p-4">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-400" />
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={handleSave}
                                    disabled={!currentExperiment || isSaving}
                                    className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Experiment'}
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={!currentExperiment || isExporting}
                                    className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4" />
                                    {isExporting ? 'Exporting...' : 'Export PDF'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={!currentExperiment || isSharing}
                                    className="w-full px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Share2 className="w-4 h-4" />
                                    {isSharing ? 'Sharing...' : 'Share Results'}
                                </button>
                                <button
                                    onClick={clearExperiment}
                                    disabled={!currentExperiment}
                                    className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Clear Lab
                                </button>
                                {reactionResult && (
                                    <button
                                        onClick={() => {
                                            reactionPanelRef.current?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            })
                                            setShowFeatures(false)
                                        }}
                                        className="lg:hidden w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 rounded-lg text-sm transition-all text-left flex items-center gap-2"
                                    >
                                        <Atom className="w-4 h-4" />
                                        View Results
                                    </button>
                                )}

                                {/* Divider */}
                                <div className="border-t border-white/10 my-2"></div>

                                {/* Equipment Button */}
                                <button
                                    onClick={() => {
                                        setOpenEquipmentPanel(true)
                                        setShowFeatures(false)
                                    }}
                                    className="w-full px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 rounded-lg text-sm transition-all text-left flex items-center gap-2"
                                >
                                    <Flame className="w-4 h-4" />
                                    Lab Equipment
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

            {/* Active Equipment Display - Floating on lab screen */}
            <ActiveEquipmentDisplay equipment={activeEquipment} />

            {/* Equipment Panel - Integrated into Features button, no separate floating button */}
            <EquipmentPanel
                onEquipmentChange={setActiveEquipment}
                hideFloatingButton={true}
                externalIsOpen={openEquipmentPanel}
                onClose={() => setOpenEquipmentPanel(false)}
            />
        </div>
    )
}
