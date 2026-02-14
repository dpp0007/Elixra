'use client'

import { motion } from 'framer-motion'
import { X, FlaskConical, Atom, AlertTriangle, FileText, Activity, Beaker, Flame, Download } from 'lucide-react'
import { ExperimentLog } from '@/types/chemistry'
import { useEffect, useState } from 'react'
import { generateExperimentPDF } from '@/lib/pdfExport'

interface ExperimentDetailsModalProps {
    experiment: ExperimentLog | null
    onClose: () => void
}

export default function ExperimentDetailsModal({ experiment, onClose }: ExperimentDetailsModalProps) {
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        if (experiment) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [experiment])

    if (!experiment) return null

    const handleExport = async () => {
        if (!experiment) return
        setIsExporting(true)
        try {
            await generateExperimentPDF({
                experiment: {
                    name: experiment.experimentName,
                    chemicals: experiment.chemicals,
                    glassware: [], // Mock or empty for saved logs
                },
                result: experiment.reactionDetails,
                date: new Date(experiment.timestamp),
                author: experiment.userId || 'User'
            })
        } catch (error) {
            console.error('Export failed:', error)
        } finally {
            setIsExporting(false)
        }
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const { reactionDetails } = experiment

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0f172a] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 bg-white/5 flex items-start justify-between relative z-10">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <FlaskConical className="h-6 w-6 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">{experiment.experimentName}</h2>
                            </div>
                            <p className="text-gray-400 text-sm ml-1">
                                {formatDate(experiment.timestamp)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-colors"
                                title="Export PDF"
                            >
                                {isExporting ? (
                                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Download className="h-6 w-6" />
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        
                        {/* 1. Reaction Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Equation */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                <div className="flex items-center space-x-2 mb-4 text-blue-300">
                                    <Activity className="h-5 w-5" />
                                    <h3 className="font-semibold">Chemical Equation</h3>
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-sm md:text-base text-center text-white overflow-x-auto">
                                    {reactionDetails.balancedEquation}
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/20">
                                        {reactionDetails.reactionType}
                                    </span>
                                </div>
                            </div>

                            {/* Reactants */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                <div className="flex items-center space-x-2 mb-4 text-purple-300">
                                    <Beaker className="h-5 w-5" />
                                    <h3 className="font-semibold">Reactants</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {experiment.chemicals.map((c, i) => (
                                        <div key={i} className="flex items-center space-x-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                                            <div 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: c.chemical.color }}
                                            />
                                            <span className="text-sm text-gray-200">{c.chemical.name}</span>
                                            {c.amount > 0 && (
                                                <span className="text-xs text-gray-500 border-l border-white/10 pl-2 ml-1">
                                                    {c.amount} {c.unit}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Key Observations */}
                        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center space-x-2 mb-4 text-indigo-300">
                                <Flame className="h-5 w-5" />
                                <h3 className="font-semibold">Visual Observations</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {reactionDetails.visualObservation}
                            </p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block mb-1">Color Change</span>
                                    <span className="text-sm text-white font-medium">{reactionDetails.color}</span>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block mb-1">Temperature</span>
                                    <span className={`text-sm font-medium ${
                                        reactionDetails.temperatureChange === 'exothermic' ? 'text-orange-400' :
                                        reactionDetails.temperatureChange === 'endothermic' ? 'text-blue-400' : 'text-gray-300'
                                    }`}>
                                        {reactionDetails.temperatureChange.charAt(0).toUpperCase() + reactionDetails.temperatureChange.slice(1)}
                                    </span>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block mb-1">State</span>
                                    <span className="text-sm text-white font-medium">{reactionDetails.stateChange || 'No Change'}</span>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 block mb-1">Gas Evolution</span>
                                    <span className="text-sm text-white font-medium">{reactionDetails.gasEvolution || 'None'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Scientific Explanation */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-teal-300">
                                <Atom className="h-5 w-5" />
                                <h3 className="font-semibold">Scientific Explanation</h3>
                            </div>
                            
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Mechanism</h4>
                                    <p className="text-gray-300">{reactionDetails.explanation.mechanism}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Bond Breaking/Forming</h4>
                                        <p className="text-sm text-gray-400">{reactionDetails.explanation.bondBreaking}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Key Concept</h4>
                                        <p className="text-sm text-gray-400">{reactionDetails.explanation.keyConcept}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Products & Safety */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Products */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                <div className="flex items-center space-x-2 mb-4 text-green-300">
                                    <FileText className="h-5 w-5" />
                                    <h3 className="font-semibold">Products Formed</h3>
                                </div>
                                <div className="space-y-3">
                                    {reactionDetails.productsInfo.map((product, i) => (
                                        <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-white">{product.name}</span>
                                                <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400">{product.state}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{product.characteristics}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Safety */}
                            <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/10">
                                <div className="flex items-center space-x-2 mb-4 text-red-300">
                                    <AlertTriangle className="h-5 w-5" />
                                    <h3 className="font-semibold">Safety Profile</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-red-500/10 px-3 py-2 rounded-lg">
                                        <span className="text-sm text-red-200">Risk Level</span>
                                        <span className="text-sm font-bold text-red-400 uppercase">{reactionDetails.safety.riskLevel}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-red-300/70 uppercase tracking-wider font-semibold">Precautions</span>
                                        <p className="text-sm text-red-200/80 mt-1">{reactionDetails.safety.precautions}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-red-300/70 uppercase tracking-wider font-semibold">First Aid</span>
                                        <p className="text-sm text-red-200/80 mt-1">{reactionDetails.safety.firstAid}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
            </motion.div>
        </div>
    )
}
