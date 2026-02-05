'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Save, Share, Download, FolderOpen, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import SaveConfirmation from './SaveConfirmation'

interface ExperimentControlsProps {
  onClear: () => void
  hasExperiment: boolean
  currentExperiment?: any
  reactionResult?: any
}

export default function ExperimentControls({ onClear, hasExperiment, currentExperiment, reactionResult }: ExperimentControlsProps) {
  const [showSavedExperiments, setShowSavedExperiments] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ isVisible: boolean; message: string; type: 'success' | 'error' }>({
    isVisible: false,
    message: '',
    type: 'success'
  })
  const { experiments, deleteExperiment, isAuthenticated, saveExperiment } = useAuth()

  const loadSavedExperiments = () => {
    setShowSavedExperiments(true)
  }

  const deleteSavedExperiment = async (id: string) => {
    try {
      await deleteExperiment(id)
    } catch (error) {
      console.error('Failed to delete experiment:', error)
      alert('Failed to delete experiment. Please try again.')
    }
  }

  const isDuplicateExperiment = useCallback((newExperiment: any) => {
    return experiments.some(exp => 
      exp.experimentName === newExperiment.experimentName && 
      JSON.stringify(exp.chemicals) === JSON.stringify(newExperiment.chemicals) &&
      JSON.stringify(exp.reactionDetails) === JSON.stringify(newExperiment.reactionDetails)
    )
  }, [experiments])

  const handleSave = async () => {
    if (!currentExperiment) return
    
    const experimentData = {
      name: currentExperiment.name || `Experiment ${new Date().toLocaleString()}`,
      chemicals: currentExperiment.chemicals,
      reactionDetails: reactionResult,
    }

    if (isDuplicateExperiment(experimentData)) {
      setSaveStatus({
        isVisible: true,
        message: 'This experiment has already been saved!',
        type: 'error'
      })
      return
    }
    
    try {
      await saveExperiment(experimentData)
      setSaveStatus({
        isVisible: true,
        message: 'Experiment saved successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Failed to save experiment:', error)
      setSaveStatus({
        isVisible: true,
        message: 'Failed to save experiment. Please try again.',
        type: 'error'
      })
    }
  }

  const handleShare = async () => {
    if (!currentExperiment) return
    
    try {
      const shareData = {
        title: `Chemistry Experiment - ${currentExperiment.name}`,
        text: `Check out this chemistry experiment: ${currentExperiment.chemicals.map((c: any) => c.chemical.name).join(' + ')}`,
        url: window.location.href
      }
      
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        await navigator.clipboard.writeText(shareText)
        alert('Experiment details copied to clipboard!')
      }
      
      console.log('Experiment shared')
    } catch (error) {
      console.error('Failed to share experiment:', error)
      alert('Failed to share experiment. Please try again.')
    }
  }

  const handleExport = async () => {
    if (!currentExperiment) return
    
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const doc = new jsPDF()
      
      // Set up the document
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      let yPosition = margin
      
      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Chemistry Experiment Report', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      // Experiment Info
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Experiment Details', margin, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Name: ${currentExperiment.name}`, margin, yPosition)
      yPosition += 8
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 8
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, margin, yPosition)
      yPosition += 15
      
      // Chemicals Used
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Chemicals Used', margin, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      currentExperiment.chemicals.forEach((chemical: any, index: number) => {
        const chemicalText = `${index + 1}. ${chemical.chemical.name} (${chemical.chemical.formula}) - ${chemical.amount} ${chemical.unit}`
        doc.text(chemicalText, margin + 5, yPosition)
        yPosition += 6
      })
      yPosition += 10
      
      // Glassware Used
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Glassware Used', margin, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      currentExperiment.glassware.forEach((glass: any, index: number) => {
        const glassText = `${index + 1}. ${glass.type.replace('-', ' ').toUpperCase()} (${glass.capacity}ml capacity)`
        doc.text(glassText, margin + 5, yPosition)
        yPosition += 6
      })
      yPosition += 15
      
      // Reaction Results (if available)
      if (reactionResult) {
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Reaction Results', margin, yPosition)
        yPosition += 10
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        
        // Balanced Equation
        doc.setFont('helvetica', 'bold')
        doc.text('Balanced Equation:', margin, yPosition)
        yPosition += 6
        doc.setFont('helvetica', 'normal')
        doc.text(reactionResult.balancedEquation, margin + 5, yPosition)
        yPosition += 10
        
        // Reaction Type
        doc.setFont('helvetica', 'bold')
        doc.text('Reaction Type:', margin, yPosition)
        yPosition += 6
        doc.setFont('helvetica', 'normal')
        doc.text(reactionResult.reactionType, margin + 5, yPosition)
        yPosition += 10
        
        // Visual Observations
        doc.setFont('helvetica', 'bold')
        doc.text('Visual Observations:', margin, yPosition)
        yPosition += 6
        doc.setFont('helvetica', 'normal')
        doc.text(`Color: ${reactionResult.color}`, margin + 5, yPosition)
        yPosition += 6
        doc.text(`Smell: ${reactionResult.smell}`, margin + 5, yPosition)
        yPosition += 6
        
        if (reactionResult.precipitate) {
          doc.text(`Precipitate: Yes (${reactionResult.precipitateColor || 'color not specified'})`, margin + 5, yPosition)
          yPosition += 6
        }
        
        if (reactionResult.gasEvolution) {
          doc.text('Gas Evolution: Yes', margin + 5, yPosition)
          yPosition += 6
        }
        
        yPosition += 10
        
        // Products
        if (reactionResult.products && reactionResult.products.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Products Formed:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          reactionResult.products.forEach((product: string, index: number) => {
            doc.text(`${index + 1}. ${product}`, margin + 5, yPosition)
            yPosition += 6
          })
          yPosition += 10
        }
        
        // Observations
        if (reactionResult.observations && reactionResult.observations.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Detailed Observations:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          reactionResult.observations.forEach((obs: string, index: number) => {
            const lines = doc.splitTextToSize(`${index + 1}. ${obs}`, pageWidth - 2 * margin - 10)
            lines.forEach((line: string) => {
              if (yPosition > 270) { // Check if we need a new page
                doc.addPage()
                yPosition = margin
              }
              doc.text(line, margin + 5, yPosition)
              yPosition += 6
            })
          })
          yPosition += 10
        }
        
        // Safety Notes
        if (reactionResult.safetyNotes && reactionResult.safetyNotes.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Safety Notes:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          reactionResult.safetyNotes.forEach((note: string, index: number) => {
            const lines = doc.splitTextToSize(`${index + 1}. ${note}`, pageWidth - 2 * margin - 10)
            lines.forEach((line: string) => {
              if (yPosition > 270) { // Check if we need a new page
                doc.addPage()
                yPosition = margin
              }
              doc.text(line, margin + 5, yPosition)
              yPosition += 6
            })
          })
          yPosition += 10
        }
        
        // AI Confidence
        if (reactionResult.confidence) {
          doc.setFont('helvetica', 'bold')
          doc.text('AI Analysis Confidence:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          doc.text(`${Math.round(reactionResult.confidence * 100)}%`, margin + 5, yPosition)
        }
      }
      
      // Footer
      const pageCount = doc.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Generated by Virtual Chemistry Lab - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }
      
      // Save the PDF
      const fileName = `chemistry-experiment-${new Date().toISOString().split('T')[0]}-${Date.now()}.pdf`
      doc.save(fileName)
      
      console.log('Experiment exported as PDF')
    } catch (error) {
      console.error('Failed to export experiment as PDF:', error)
      alert('Failed to export experiment as PDF. Please try again.')
    }
  }

  return (
    <>
    <div className="flex items-center space-x-1">
      <motion.button
        onClick={loadSavedExperiments}
        className="flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 bg-white/50 dark:bg-white/10 text-elixra-text-secondary hover:bg-elixra-bunsen/10 hover:text-elixra-bunsen border border-elixra-copper/20"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Load Experiment"
      >
        <FolderOpen className="h-4 w-4" />
        <span className="hidden lg:inline text-sm">Load</span>
      </motion.button>
      
      <motion.button
        onClick={onClear}
        disabled={!hasExperiment}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border ${
          hasExperiment
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-red-500/30'
            : 'bg-gray-200 dark:bg-gray-800 text-elixra-text-muted cursor-not-allowed border-elixra-copper/10'
        }`}
        whileHover={hasExperiment ? { scale: 1.02 } : {}}
        whileTap={hasExperiment ? { scale: 0.98 } : {}}
        title="Clear Experiment"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden lg:inline text-sm">Clear</span>
      </motion.button>

      <motion.button
        onClick={handleSave}
        disabled={!hasExperiment}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border ${
          hasExperiment
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/30'
            : 'bg-gray-200 dark:bg-gray-800 text-elixra-text-muted cursor-not-allowed border-elixra-copper/10'
        }`}
        whileHover={hasExperiment ? { scale: 1.02 } : {}}
        whileTap={hasExperiment ? { scale: 0.98 } : {}}
        title="Save Experiment"
      >
        <Save className="h-4 w-4" />
        <span className="hidden lg:inline text-sm">Save</span>
      </motion.button>

      <motion.button
        onClick={handleShare}
        disabled={!hasExperiment}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border ${
          hasExperiment
            ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-green-500/30'
            : 'bg-gray-200 dark:bg-gray-800 text-elixra-text-muted cursor-not-allowed border-elixra-copper/10'
        }`}
        whileHover={hasExperiment ? { scale: 1.02 } : {}}
        whileTap={hasExperiment ? { scale: 0.98 } : {}}
        title="Share Experiment"
      >
        <Share className="h-4 w-4" />
        <span className="hidden lg:inline text-sm">Share</span>
      </motion.button>

      <motion.button
        onClick={handleExport}
        disabled={!hasExperiment}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border ${
          hasExperiment
            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border-purple-500/30'
            : 'bg-gray-200 dark:bg-gray-800 text-elixra-text-muted cursor-not-allowed border-elixra-copper/10'
        }`}
        whileHover={hasExperiment ? { scale: 1.02 } : {}}
        whileTap={hasExperiment ? { scale: 0.98 } : {}}
        title="Export PDF"
      >
        <Download className="h-4 w-4" />
        <span className="hidden lg:inline text-sm">Export</span>
      </motion.button>
    </div>

    {/* Saved Experiments Modal */}
    <AnimatePresence>
      {showSavedExperiments && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay bg-black/50 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSavedExperiments(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="modal-content bg-elixra-cream dark:bg-elixra-charcoal rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl w-full max-w-2xl border border-elixra-copper/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-elixra-text-primary">
                Saved Experiments
              </h3>
              <button
                onClick={() => setShowSavedExperiments(false)}
                className="p-2 hover:bg-elixra-bunsen/10 rounded-full transition-all duration-200 flex items-center justify-center group"
                title="Close"
              >
                <X className="h-5 w-5 text-elixra-text-secondary group-hover:text-elixra-text-primary" />
              </button>
            </div>

            {experiments.length === 0 ? (
              <div className="text-center py-8 text-elixra-text-secondary">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved experiments yet</p>
                <p className="text-sm">Save an experiment to see it here</p>
                {!isAuthenticated && (
                  <p className="text-xs mt-2 text-elixra-bunsen">
                    Sign in to sync experiments across devices
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {experiments.map((exp, index) => (
                  <div
                    key={exp._id || index}
                    className="bg-white/50 dark:bg-white/5 rounded-lg p-4 hover:bg-white/80 dark:hover:bg-white/10 transition-colors border border-elixra-copper/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-elixra-text-primary">
                          {exp.experimentName}
                        </h4>
                        <p className="text-sm text-elixra-text-secondary">
                          Chemicals: {exp.chemicals.map((c: any) => c.chemical.name).join(', ')}
                        </p>
                        <p className="text-xs text-elixra-text-muted">
                          Saved: {new Date(exp.timestamp).toLocaleString()}
                        </p>
                        {exp.reactionDetails && (
                          <p className="text-xs text-elixra-bunsen">
                            Reaction: {exp.reactionDetails.reactionType}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSavedExperiment(exp._id || index.toString())}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors flex items-center justify-center"
                        title="Delete experiment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <SaveConfirmation
      isVisible={saveStatus.isVisible}
      message={saveStatus.message}
      type={saveStatus.type}
      onClose={() => setSaveStatus(prev => ({ ...prev, isVisible: false }))}
    />
    </>
  )
}