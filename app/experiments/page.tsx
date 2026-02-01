'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExperimentLog } from '@/types/chemistry'
import { Calendar, Atom, ChevronRight, Trash2 } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentLog | null>(null)

  useEffect(() => {
    fetchExperiments()
  }, [])

  const fetchExperiments = async () => {
    try {
      const response = await fetch('/api/experiments?userId=anonymous&limit=50')
      const data = await response.json()
      setExperiments(data)
    } catch (error) {
      console.error('Failed to fetch experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString()
  }

  const getReactionColor = (result: any) => {
    if (result?.color) {
      // Convert color name to hex or use default
      const colorMap: { [key: string]: string } = {
        'white': '#ffffff',
        'blue': '#3b82f6',
        'red': '#ef4444',
        'green': '#10b981',
        'yellow': '#f59e0b',
        'orange': '#f97316',
        'purple': '#8b5cf6',
        'brown': '#a3a3a3',
        'black': '#1f2937'
      }
      
      const colorName = result.color.toLowerCase()
      for (const [name, hex] of Object.entries(colorMap)) {
        if (colorName.includes(name)) {
          return hex
        }
      }
      
      // If it's already a hex color, use it
      if (result.color.startsWith('#')) {
        return result.color
      }
    }
    return '#e5e7eb'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading experiments...</p>
        </div>
      </div>
    )
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {experiments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Atom className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No experiments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start experimenting in the virtual lab to see your results here.
            </p>
            <a
              href="/lab"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Atom className="mr-2 h-5 w-5" />
              Go to Lab
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Experiments List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {experiments.map((experiment, index) => (
                  <motion.div
                    key={experiment._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`lab-container p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedExperiment?._id === experiment._id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                    onClick={() => setSelectedExperiment(experiment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: getReactionColor(experiment.reactionDetails) }}
                          />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {experiment.experimentName}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(experiment.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Atom className="h-4 w-4" />
                            <span>{experiment.chemicals.length} chemicals</span>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {experiment.chemicals.slice(0, 3).map((chemical, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md"
                            >
                              {chemical.chemical.formula}
                            </span>
                          ))}
                          {experiment.chemicals.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md">
                              +{experiment.chemicals.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Experiment Details */}
            <div className="lg:col-span-1">
              {selectedExperiment ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lab-container p-6 sticky top-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Experiment Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Chemicals Used
                      </h4>
                      <div className="space-y-2">
                        {selectedExperiment.chemicals.map((chemical, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              {chemical.chemical.name}
                            </span>
                            <span className="font-mono text-gray-900 dark:text-white">
                              {chemical.amount} {chemical.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedExperiment.reactionDetails && (
                      <>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Reaction Results
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 dark:text-gray-300">Color:</span>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: getReactionColor(selectedExperiment.reactionDetails) }}
                                />
                                <span className="text-gray-900 dark:text-white">
                                  {selectedExperiment.reactionDetails.color}
                                </span>
                              </div>
                            </div>
                            
                            {selectedExperiment.reactionDetails.precipitate && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-300">Precipitate: </span>
                                <span className="text-gray-900 dark:text-white">Yes</span>
                              </div>
                            )}
                            
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">Smell: </span>
                              <span className="text-gray-900 dark:text-white">
                                {selectedExperiment.reactionDetails.smell}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedExperiment.reactionDetails.balancedEquation && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Chemical Equation
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                              <code className="text-sm text-gray-900 dark:text-white">
                                {selectedExperiment.reactionDetails.balancedEquation}
                              </code>
                            </div>
                          </div>
                        )}

                        {selectedExperiment.reactionDetails.observations && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Observations
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              {selectedExperiment.reactionDetails.observations.map((obs, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{obs}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="lab-container p-6 text-center">
                  <Atom className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Select an experiment to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}