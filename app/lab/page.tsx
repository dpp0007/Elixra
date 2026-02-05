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
import { calculatePH, formatPH } from '@/lib/ph-calculator'
import { useAuth } from '@/contexts/AuthContext'
import { EQUIPMENT_CONFIG } from '@/lib/equipment-config'
import { EquipmentAttachment } from '@/lib/equipment-animations'
import TestTubeSelectionModal from '@/components/TestTubeSelectionModal'

import { StaticGrid } from '@/components/GridBackground'

import SaveConfirmation from '@/components/SaveConfirmation'

export default function LabPage() {
    const router = useRouter()
    const { syncExperiments, experiments, saveExperiment } = useAuth()
    const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null)
    const [saveStatus, setSaveStatus] = useState<{ isVisible: boolean; message: string; type: 'success' | 'error' }>({
        isVisible: false,
        message: '',
        type: 'success'
    })
    const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
    const [isReacting, setIsReacting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [addChemicalToTestTube, setAddChemicalToTestTube] = useState<((chemical: any) => void) | null>(null)
    const [addTestTubeFunc, setAddTestTubeFunc] = useState<(() => void) | null>(null)
    const [addBeakerFunc, setAddBeakerFunc] = useState<(() => void) | null>(null)
    const [showFeatures, setShowFeatures] = useState(false)
    const [equipmentAttachments, setEquipmentAttachments] = useState<any[]>([])
    const [selectedTubeId, setSelectedTubeId] = useState('tube-1')
    const [openEquipmentPanel, setOpenEquipmentPanel] = useState(false)
    const [selectedTubeContents, setSelectedTubeContents] = useState<any[]>([])
    
    // Equipment selection state
    const [availableTestTubes, setAvailableTestTubes] = useState<Array<{ id: string; contents: any[] }>>([])
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
    const [pendingEquipmentId, setPendingEquipmentId] = useState<string | null>(null)

    // Calculate dynamic pH and temperature for selected tube
    const currentPH = selectedTubeContents.length > 0 ? formatPH(calculatePH(selectedTubeContents)) : 0

    const calculateTemperature = (): number => {
        const ROOM_TEMP = 25
        const EMPTY_TUBE_INDICATOR = -999

        if (selectedTubeContents.length === 0) return EMPTY_TUBE_INDICATOR

        let temperature = ROOM_TEMP
        const tubeAttachments = equipmentAttachments.filter(a => a.targetTubeId === selectedTubeId && a.isActive)

        const bunsenBurner = tubeAttachments.find(a => a.equipmentType === 'bunsen-burner')
        const hotPlate = tubeAttachments.find(a => a.equipmentType === 'hot-plate')
        const stirrer = tubeAttachments.find(a => a.equipmentType === 'magnetic-stirrer')

        if (bunsenBurner) {
            const burnerTemp = bunsenBurner.settings.temperature || 0
            temperature = ROOM_TEMP + (burnerTemp / 1000) * 275
        }

        if (hotPlate) {
            const plateTemp = hotPlate.settings.temperature || 0
            temperature = Math.max(temperature, plateTemp)
        }

        if (stirrer) {
            const rpm = stirrer.settings.rpm || 0
            temperature += (rpm / 1500) * 2
        }

        return Math.round(temperature * 10) / 10
    }

    const currentTemperature = calculateTemperature()

    // Calculate dynamic weight for selected tube
    const calculateWeight = (): number => {
        if (selectedTubeContents.length === 0) return 0

        let totalWeight = 0
        selectedTubeContents.forEach(content => {
            if (content.unit === 'g') {
                totalWeight += content.amount
            } else if (content.unit === 'ml') {
                totalWeight += content.amount // 1ml ≈ 1g
            } else if (content.unit === 'drops') {
                totalWeight += content.amount * 0.05 // 1 drop ≈ 0.05g
            }
        })

        return totalWeight
    }

    const currentWeight = calculateWeight()

    // Debug equipment changes
    useEffect(() => {
        console.log('Lab: Equipment attachments changed', {
            count: equipmentAttachments.length,
            attachments: equipmentAttachments
        })
    }, [equipmentAttachments])
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
        console.log('Lab: Performing reaction with equipment', {
            totalAttachments: equipmentAttachments.length,
            attachments: equipmentAttachments
        })

        const experimentWithEquipment = {
            ...experiment,
            equipment: equipmentAttachments.map(att => ({
                name: att.equipmentType,
                settings: att.settings
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
                    experimentName: experiment.name,
                    reactionDetails: result,
                    isSaved: false
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

        const experimentData = {
            ...currentExperiment,
            experimentName: currentExperiment.name,
            reactionDetails: reactionResult,
            savedAt: new Date().toISOString(),
            isSaved: true
        }

        // Check for duplicates
        const isDuplicate = experiments.some(exp => 
            exp.experimentName === experimentData.experimentName && 
            JSON.stringify(exp.chemicals) === JSON.stringify(experimentData.chemicals) &&
            JSON.stringify(exp.reactionDetails) === JSON.stringify(experimentData.reactionDetails)
        )

        if (isDuplicate) {
            setSaveStatus({
                isVisible: true,
                message: 'This experiment has already been saved!',
                type: 'error'
            })
            return
        }

        setIsSaving(true)
        try {
            await saveExperiment(experimentData)
            setSaveStatus({
                isVisible: true,
                message: 'Experiment saved successfully!',
                type: 'success'
            })
            await syncExperiments()
        } catch (error) {
            console.error('Save failed:', error)
            setSaveStatus({
                isVisible: true,
                message: 'Failed to save experiment. Please try again.',
                type: 'error'
            })
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

    // Handle equipment activation request
    const handleRequestEquipmentActivation = (equipmentId: string) => {
        setPendingEquipmentId(equipmentId)
        setIsSelectionModalOpen(true)
    }

    // Handle tube selection for equipment
    const handleEquipmentTubeSelected = (tubeId: string) => {
        if (!pendingEquipmentId) return

        setIsSelectionModalOpen(false)
        setSelectedTubeId(tubeId) // Update global selection

        // Proceed with activation logic
        const id = pendingEquipmentId
        const eq = EQUIPMENT_CONFIG.find(e => e.id === id)
        if (!eq) return

        let updatedAttachments = [...equipmentAttachments]

        // EXCLUSIVITY ENFORCEMENT: Check for conflicts
        // Heating exclusivity: Bunsen OR Hot Plate
        if (id === 'bunsen-burner' || id === 'hot-plate') {
            const conflictingHeater = updatedAttachments.find(
                a => (a.equipmentType === 'bunsen-burner' || a.equipmentType === 'hot-plate') &&
                    a.targetTubeId === tubeId
            )
            if (conflictingHeater) {
                updatedAttachments = updatedAttachments.filter(a => a.equipmentId !== conflictingHeater.equipmentId)
            }
        }

        // Motion exclusivity: Stirrer OR Centrifuge
        if (id === 'magnetic-stirrer' || id === 'centrifuge') {
            const conflictingMotion = updatedAttachments.find(
                a => (a.equipmentType === 'magnetic-stirrer' || a.equipmentType === 'centrifuge') &&
                    a.targetTubeId === tubeId
            )
            if (conflictingMotion) {
                updatedAttachments = updatedAttachments.filter(a => a.equipmentId !== conflictingMotion.equipmentId)
            }
        }

        // Turn ON - create attachment
        const newAttachment: EquipmentAttachment = {
            equipmentId: `${id}-${Date.now()}`,
            equipmentType: id,
            targetTubeId: tubeId,
            isActive: true,
            settings: {
                temperature: (id === 'bunsen-burner' || id === 'hot-plate') ? eq.value : undefined,
                rpm: (id === 'magnetic-stirrer' || id === 'centrifuge') ? eq.value : undefined,
                pH: id === 'ph-meter' ? eq.value : undefined,
                measuredTemp: id === 'thermometer' ? eq.value : undefined,
                weight: id === 'analytical-balance' ? eq.value : undefined,
                timeRemaining: id === 'timer' ? eq.value : undefined,
                timerMode: id === 'timer' ? 'countdown' : undefined,
                isTimerRunning: id === 'timer' ? false : undefined
            }
        }

        setEquipmentAttachments([...updatedAttachments, newAttachment])
        setPendingEquipmentId(null)
    }

    return (
        <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-500">
            {/* Background Grid */}
            <StaticGrid className="opacity-30 fixed inset-0 z-0 pointer-events-none" />

            {/* Modern Navbar - Same as Homepage */}
            <ModernNavbar />

            {/* Main Content - Responsive Grid */}
            <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[320px_1fr_380px] gap-3 sm:gap-4 p-2 sm:p-4 relative z-10">
                {/* Left Panel - Chemical Shelf */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-[400px] lg:h-full glass-panel rounded-3xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-elixra-copper/10 bg-elixra-cream/30 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-elixra-bunsen/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-elixra-bunsen" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-elixra-text-primary">Chemical Reagents</h2>
                                <p className="text-xs text-elixra-text-secondary">Click or drag to add</p>
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
                    className="h-[500px] lg:h-full bg-elixra-cream/80 dark:bg-white/5 backdrop-blur-xl border border-elixra-copper/10 rounded-3xl transition-all duration-300 overflow-hidden flex flex-col shadow-inner"
                    ref={labTableRef}
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-elixra-copper/10 bg-elixra-cream/30 dark:bg-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-elixra-bunsen/10 rounded-lg">
                                    <Atom className="w-5 h-5 text-elixra-bunsen" />
                                </div>
                                <h2 className="text-lg font-bold text-elixra-text-primary">Lab Bench</h2>
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
                                    className="flex items-center gap-2 px-3 py-1.5 btn-primary text-sm font-medium transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Test Tube
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
                            equipmentAttachments={equipmentAttachments}
                            onEquipmentChange={setEquipmentAttachments}
                            selectedTubeId={selectedTubeId}
                            onSelectTube={setSelectedTubeId}
                            onSelectedTubeContentsChange={setSelectedTubeContents}
                            onTestTubesChange={setAvailableTestTubes}
                        />
                    </div>
                </motion.div>

                {/* Right Panel - Reaction Analysis */}
                <motion.div
                    ref={reactionPanelRef}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`min-h-[600px] lg:h-full glass-panel rounded-3xl transition-all duration-300 overflow-hidden flex flex-col ${reactionResult ? 'border-elixra-bunsen/50 shadow-lg shadow-elixra-bunsen/20' : ''
                        }`}
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-elixra-copper/10 bg-elixra-cream/30 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-elixra-copper/10 rounded-lg">
                                <Atom className="w-5 h-5 text-elixra-copper" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-elixra-text-primary">Reaction Analysis</h2>
                                <p className="text-xs text-elixra-text-secondary">AI-powered results</p>
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

                    {/* Scrollable Content - Only internal scroll on large screens */}
                    <div className="flex-1 lg:overflow-y-auto custom-scrollbar">
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
                className="fixed bottom-8 right-4 sm:right-8 z-50 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                {/* Button */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500/90 to-red-500/90 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl flex items-center justify-center">
                    <motion.div
                        key={showFeatures ? 'active' : 'inactive'}
                        animate={{ rotate: [0, -20, 20, -10, 10, 0] }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
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
                        className="fixed bottom-28 right-4 sm:right-8 z-40 w-64"
                    >
                        <div className="glass-panel rounded-3xl transition-all duration-300 p-4 shadow-2xl border border-elixra-copper/20">
                            <h3 className="text-sm font-bold text-elixra-text-primary mb-3 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-elixra-copper" />
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={handleSave}
                                    disabled={!currentExperiment || isSaving}
                                    className="w-full px-3 py-2 bg-elixra-bunsen/10 hover:bg-elixra-bunsen/20 border border-elixra-bunsen/30 text-elixra-bunsen-dark dark:text-elixra-bunsen rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Experiment'}
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={!currentExperiment || isExporting}
                                    className="w-full px-3 py-2 bg-elixra-copper/10 hover:bg-elixra-copper/20 border border-elixra-copper/30 text-elixra-copper-dark dark:text-elixra-copper rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    {isExporting ? 'Exporting...' : 'Export PDF'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={!currentExperiment || isSharing}
                                    className="w-full px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <Share2 className="w-4 h-4" />
                                    {isSharing ? 'Sharing...' : 'Share Results'}
                                </button>
                                <button
                                    onClick={clearExperiment}
                                    disabled={!currentExperiment}
                                    className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-400 rounded-lg text-sm transition-all text-left flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                                        className="lg:hidden w-full px-3 py-2 bg-elixra-bunsen/10 hover:bg-elixra-bunsen/20 border border-elixra-bunsen/30 text-elixra-bunsen rounded-lg text-sm transition-all text-left flex items-center gap-2 font-medium"
                                    >
                                        <Atom className="w-4 h-4" />
                                        View Results
                                    </button>
                                )}

                                {/* Divider */}
                                <div className="border-t border-elixra-copper/10 my-2"></div>

                                {/* Equipment Button */}
                                <button
                                    onClick={() => {
                                        setOpenEquipmentPanel(true)
                                        setShowFeatures(false)
                                    }}
                                    className="w-full px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm transition-all text-left flex items-center gap-2 font-medium"
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
          background: rgba(46, 107, 107, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(46, 107, 107, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(46, 107, 107, 0.5);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(46, 107, 107, 0.3) rgba(46, 107, 107, 0.1);
        }
      `}</style>

            {/* Active Equipment Display - Floating on lab screen */}
            {/* <ActiveEquipmentDisplay equipment={activeEquipment} /> */}

            {/* Equipment Panel - Integrated into Features button, no separate floating button */}
            <EquipmentPanel
                onEquipmentChange={setEquipmentAttachments}
                currentAttachments={equipmentAttachments}
                selectedTubeId={selectedTubeId}
                hideFloatingButton={true}
                externalIsOpen={openEquipmentPanel}
                onClose={() => setOpenEquipmentPanel(false)}
                currentPH={currentPH}
                currentTemperature={currentTemperature}
                currentWeight={currentWeight}
                onRequestActivation={handleRequestEquipmentActivation}
            />

            <SaveConfirmation
                isVisible={saveStatus.isVisible}
                message={saveStatus.message}
                type={saveStatus.type}
                onClose={() => setSaveStatus(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Equipment Selection Modal */}
            <TestTubeSelectionModal
                isOpen={isSelectionModalOpen}
                onClose={() => {
                    setIsSelectionModalOpen(false)
                    setPendingEquipmentId(null)
                }}
                onSelect={handleEquipmentTubeSelected}
                testTubes={availableTestTubes}
                chemical={null}
                title="Select Equipment Target"
                description={`Which test tube should the ${EQUIPMENT_CONFIG.find(e => e.id === pendingEquipmentId)?.name || 'equipment'} be attached to?`}
            />
        </div>
    )
}
