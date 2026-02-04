'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Experiment, ReactionResult } from '@/types/chemistry'
import {
  Atom,
  Eye,
  Wind as SmellIcon,
  Thermometer,
  AlertTriangle,
  Beaker,
  Zap,
  Wind,
  Info,
  BookOpen,
  Shield,
  Activity,
  Flame,
  Droplets,
  Volume2,
  Lightbulb,
  FlaskConical,
  Microscope,
  Scale
} from 'lucide-react'

interface ReactionPanelProps {
  experiment: Experiment | null
  result: ReactionResult | null
  isLoading: boolean
}

export default function ReactionPanel({ experiment, result, isLoading }: ReactionPanelProps) {
  if (!experiment && !result && !isLoading) {
    return (
      <div className="p-4 sm:p-6 h-full flex items-center justify-center" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#475569 #1e293b'
      }}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Atom className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
          <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Active Experiment</p>
          <p className="text-xs sm:text-sm px-4">
            Add chemicals to glassware and perform a reaction to see results here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#475569 #1e293b'
    }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
              AI is analyzing the reaction...
            </p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Instrument Analysis */}
            {result.instrumentAnalysis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1e1b4b] dark:bg-[#1e1b4b] rounded-xl p-4 sm:p-6 border border-indigo-500/30 shadow-lg group"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg animate-pulse">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-indigo-100">
                    Instrument Analysis: {result.instrumentAnalysis.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
                    <p className="text-[10px] sm:text-xs text-indigo-300 uppercase font-bold mb-1">Setting / Intensity</p>
                    <p className="text-sm sm:text-base text-indigo-100 font-medium">{result.instrumentAnalysis.intensity}</p>
                  </div>
                  <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
                    <p className="text-[10px] sm:text-xs text-indigo-300 uppercase font-bold mb-1">Effect & Change</p>
                    <p className="text-sm sm:text-base text-indigo-100 font-medium">{result.instrumentAnalysis.change}</p>
                  </div>
                  <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
                    <p className="text-[10px] sm:text-xs text-indigo-300 uppercase font-bold mb-1">Outcome Difference</p>
                    <p className="text-sm sm:text-base text-indigo-100 font-medium">{result.instrumentAnalysis.outcomeDifference}</p>
                  </div>
                  <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
                    <p className="text-[10px] sm:text-xs text-indigo-300 uppercase font-bold mb-1">Counterfactual (Without Instrument)</p>
                    <p className="text-sm sm:text-base text-indigo-100 font-medium italic">{result.instrumentAnalysis.counterfactual}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Core Details & Equation */}
            <div className="relative overflow-hidden bg-indigo-950/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl text-white border border-indigo-500/30 group transition-all duration-300 hover:bg-indigo-950/50">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                <Atom className="h-24 w-24 sm:h-32 sm:w-32 text-indigo-400" />
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500/20 backdrop-blur-md rounded-lg shadow-sm border border-indigo-500/10">
                      <Atom className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-indigo-100 text-base sm:text-lg tracking-tight">Reaction Analysis</h3>
                      <p className="text-xs sm:text-sm text-indigo-300 font-medium opacity-90">{result.reactionType}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-950/30 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-indigo-500/20 shadow-inner">
                  <p className="text-[10px] sm:text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Balanced Equation</p>
                  <p className={`text-lg sm:text-xl font-medium text-indigo-50 leading-relaxed font-mono ${result.balancedEquation.length > 50 ? 'break-words' : 'break-all'}`}>
                    {result.balancedEquation}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Observation Card */}
            <div className="bg-indigo-950/40 backdrop-blur-md rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-lg border border-indigo-500/30 text-white relative overflow-hidden group transition-all duration-300 hover:bg-indigo-950/50">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Eye className="h-16 w-16 sm:h-24 sm:w-24 text-indigo-400" />
              </div>
              <div className="p-2 sm:p-2.5 bg-indigo-500/20 rounded-lg backdrop-blur-sm shrink-0">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Primary Observation</p>
                <p className="text-base sm:text-lg font-bold text-indigo-100 leading-snug">{result.visualObservation}</p>
              </div>
            </div>

            {/* Observable Properties Block */}
            <div className="bg-[#1e1b4b] dark:bg-[#1e1b4b] rounded-xl border border-indigo-500/30 overflow-hidden shadow-lg">
              <div className="divide-y divide-indigo-500/20">
                {/* Color */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 hover:bg-indigo-500/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-indigo-400/50`} style={{ backgroundColor: result.color === 'colorless' ? 'transparent' : result.color }}></div>
                    <p className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider">Color</p>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-indigo-100 text-left sm:text-right leading-tight w-full sm:max-w-[60%]">
                    {(result.visualObservation && (result.visualObservation.includes('Precipitate') || result.visualObservation.includes('Solution')))
                      ? result.visualObservation 
                      : (result.color ? `${result.color.charAt(0).toUpperCase() + result.color.slice(1)}` : 'Unknown')}
                  </p>
                </div>

                {/* Smell */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 hover:bg-indigo-500/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <SmellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                    <p className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider">Smell</p>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-indigo-100 capitalize text-left sm:text-right">{result.smell || 'None'}</p>
                </div>

                {/* Temperature */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 hover:bg-indigo-500/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                    <p className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider">Temp</p>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-indigo-100 capitalize text-left sm:text-right">{result.temperatureChange || 'No Change'}</p>
                </div>

                {/* pH Change */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 hover:bg-indigo-500/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                    <p className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider">pH Change</p>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-indigo-100 text-left sm:text-right">{result.phChange || 'None'}</p>
                </div>

                {/* Gas Evolution */}
                {result.gasEvolution && result.gasEvolution !== 'None' && (
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 hover:bg-indigo-500/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                      <p className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider">Gas</p>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-indigo-100 text-left sm:text-right">{result.gasEvolution}</p>
                  </div>
                )}

                {/* Emission */}
                {result.emission && result.emission !== 'None' && (
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 hover:bg-indigo-500/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                      <p className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider">Emission</p>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-indigo-100 text-left sm:text-right">{result.emission}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Explanation Section */}
            {result.explanation && (
              <div className="space-y-4">
                <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                  </div>
                  Reaction Explanation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-[#1e1b4b] dark:bg-[#1e1b4b] p-3 sm:p-4 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/50 transition-colors shadow-lg group">
                    <h4 className="font-bold text-indigo-100 text-base sm:text-lg leading-tight mb-3 sm:mb-4">Mechanism<br /><span className="text-indigo-300">& Energy</span></h4>
                    <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Mechanism</span>
                        <p className="text-indigo-100/90 font-medium leading-relaxed">{result.explanation.mechanism}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Bond Breaking</span>
                        <p className="text-indigo-100/90 font-medium leading-relaxed">{result.explanation.bondBreaking}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Energy Profile</span>
                        <p className="text-indigo-100/90 font-medium leading-relaxed">{result.explanation.energyProfile}</p>
                      </div>
                      {result.explanation.electronTransfer && (
                         <div className="space-y-1">
                           <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Electron Transfer</span>
                           <p className="text-indigo-100/90 font-medium leading-relaxed">{result.explanation.electronTransfer}</p>
                         </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-[#1e1b4b] dark:bg-[#1e1b4b] p-3 sm:p-4 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/50 transition-colors shadow-lg group">
                    <h4 className="font-bold text-indigo-100 text-base sm:text-lg leading-tight mb-3 sm:mb-4">Atomic<br /><span className="text-indigo-300">Insight</span></h4>
                    <div className="flex flex-col h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)]">
                      <div className="flex-1 text-xs sm:text-sm text-indigo-100/90 leading-relaxed space-y-3 sm:space-y-4">
                        <p>{result.explanation.atomicLevel}</p>
                      </div>
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-indigo-500/30">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-2">Key Concept</span>
                        <div className="bg-indigo-950/50 rounded-xl p-2 sm:p-3 border border-indigo-500/20">
                          <span className="text-xs sm:text-sm font-medium text-white italic leading-relaxed block">
                            {result.explanation.keyConcept}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Info */}
            {result.productsInfo && result.productsInfo.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                  </div>
                  Products Formed
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {result.productsInfo.map((product, idx) => (
                    <div key={idx} className="bg-[#1e1b4b] dark:bg-[#1e1b4b] p-4 sm:p-5 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/50 transition-colors shadow-lg group">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div>
                          <h4 className="font-bold text-indigo-100 text-lg sm:text-xl">{product.name}</h4>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] sm:text-xs font-semibold bg-indigo-500/20 text-indigo-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-indigo-500/30">
                              {product.state}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold bg-blue-500/20 text-blue-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-blue-500/30">
                              {product.color}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-indigo-100/90 mb-4 sm:mb-5 leading-relaxed font-medium">{product.characteristics}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="bg-emerald-950/30 p-3 sm:p-4 rounded-xl border border-emerald-500/20 hover:bg-emerald-950/40 transition-colors">
                          <span className="font-bold text-emerald-400 block mb-2 uppercase text-[10px] sm:text-xs tracking-wider">Common Uses</span>
                          <p className="text-emerald-100/90 leading-relaxed">{product.commonUses}</p>
                        </div>
                        <div className="bg-rose-950/30 p-3 sm:p-4 rounded-xl border border-rose-500/20 hover:bg-rose-950/40 transition-colors">
                          <span className="font-bold text-rose-400 block mb-2 uppercase text-[10px] sm:text-xs tracking-wider">Hazards</span>
                          <p className="text-rose-100/90 leading-relaxed">{product.safetyHazards}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Section */}
            {result.safety && (
              <div className="bg-[#1e1b4b] dark:bg-[#1e1b4b] p-4 sm:p-5 rounded-2xl border border-red-500/30 hover:border-red-500/50 transition-colors shadow-lg group">
                <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2 mb-4 sm:mb-5">
                  <div className="p-1.5 bg-red-500/20 rounded-lg">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                  </div>
                  Safety Information
                </h3>
                
                <div className="space-y-4 sm:space-y-5">
                  <div className="bg-red-950/30 p-3 sm:p-4 rounded-xl border border-red-500/20 flex items-start gap-3 sm:gap-4">
                    <div className="p-1.5 sm:p-2 bg-red-500/10 rounded-lg shrink-0 mt-0.5">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-red-100 text-base sm:text-lg mb-1">Risk Level: {result.safety.riskLevel}</p>
                      <p className="text-xs sm:text-sm text-red-200/80 leading-relaxed">{result.safety.generalHazards}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-wider block mb-2">Precautions</span>
                      <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed font-medium">{result.safety.precautions}</p>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-wider block mb-2">First Aid</span>
                      <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed font-medium">{result.safety.firstAid}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2 pt-3 sm:pt-4 border-t border-red-500/20">
                      <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-wider block mb-2">Disposal</span>
                      <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed font-medium">{result.safety.disposal}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-center pt-4 border-t border-indigo-500/20">
              <p className="text-[10px] text-indigo-400/70">
                This analysis is generated by an AI model and may not be 100% accurate. Please verify critical information independently.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
