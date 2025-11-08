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
  Wind
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
    <div className="p-4" style={{
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              AI is analyzing the reaction...
            </p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Reaction Equation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-blue-500 rounded-lg">
                  <Atom className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100">
                  Balanced Equation
                </h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700 shadow-inner">
                <p className="font-mono text-lg text-gray-900 dark:text-white font-medium">
                  {result.balancedEquation}
                </p>
              </div>
            </div>

            {/* Reaction Type */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm text-purple-700 dark:text-purple-300 font-medium uppercase tracking-wide">
                    Reaction Type
                  </span>
                  <p className="text-xl text-purple-900 dark:text-purple-100 font-bold capitalize">
                    {result.reactionType}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Observations */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-1.5 bg-gray-600 rounded-lg">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Visual Observations
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Solution Color:</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-inner relative flex-shrink-0"
                        style={{
                          backgroundColor: result.color === 'colorless' || result.color === 'transparent'
                            ? 'transparent'
                            : result.color
                        }}
                      >
                        {(result.color === 'colorless' || result.color === 'transparent') && (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full opacity-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {result.color === 'colorless' ? 'Clear' : result.color}
                      </span>
                    </div>
                  </div>
                </div>

                {result.precipitate && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Precipitate:</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-inner flex-shrink-0"
                          style={{ backgroundColor: result.precipitateColor || '#ffffff' }}
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-white capitalize text-sm">
                          {result.precipitateColor || 'White'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {result.gasEvolution && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Gas Evolution:</span>
                      <div className="flex items-center space-x-2">
                        <Wind className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          Yes
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Smell */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <SmellIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium uppercase tracking-wide">
                    Smell
                  </span>
                  <p className="text-lg text-yellow-900 dark:text-yellow-100 font-semibold capitalize">
                    {result.smell}
                  </p>
                </div>
              </div>
            </div>

            {/* Temperature Change */}
            {result.temperature && result.temperature !== 'unchanged' && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Thermometer className="h-5 w-5 text-orange-600" />
                <div>
                  <span className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    Temperature:
                  </span>
                  <p className="text-orange-900 dark:text-orange-100 capitalize">
                    Temperature {result.temperature}
                  </p>
                </div>
              </div>
            )}

            {/* Products */}
            {result.products && Array.isArray(result.products) && result.products.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Beaker className="h-4 w-4 mr-2" />
                  Products Formed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.products.map((product, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Observations */}
            {result.observations && Array.isArray(result.observations) && result.observations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Detailed Observations
                </h3>
                <ul className="space-y-1">
                  {result.observations.map((observation, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2"
                    >
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{observation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety Notes */}
            {result.safetyNotes && Array.isArray(result.safetyNotes) && result.safetyNotes.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 dark:text-red-100 flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Safety Notes
                </h3>
                <ul className="space-y-1">
                  {result.safetyNotes.map((note, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-800 dark:text-red-200 flex items-start space-x-2"
                    >
                      <span className="text-red-500 mt-1">⚠</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence Score */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-500 rounded-lg">
                    <Beaker className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-indigo-900 dark:text-indigo-100">
                    AI Confidence
                  </span>
                </div>
                <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {result.confidence && !isNaN(result.confidence) ? Math.round(result.confidence * 100) : 50}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence && !isNaN(result.confidence) ? result.confidence * 100 : 50}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}