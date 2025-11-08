'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrop } from 'react-dnd'
import TestTube from './TestTube'
import Beaker from './Beaker'
import QuantityModal from './QuantityModal'
import { Chemical, ChemicalContent, Experiment, ReactionResult } from '@/types/chemistry'
import { Plus, Trash2, Atom } from 'lucide-react'

interface LabTableProps {
  onReaction: (experiment: Experiment) => void
  reactionResult: ReactionResult | null
  isReacting: boolean
  onAddChemicalToTestTube?: (callback: (chemical: Chemical) => void) => void
}

export default function LabTable({ onReaction, reactionResult, isReacting, onAddChemicalToTestTube }: LabTableProps) {
  const [testTubes, setTestTubes] = useState<Array<{ id: string; contents: ChemicalContent[] }>>([
    { id: 'tube-1', contents: [] },
    { id: 'tube-2', contents: [] }
  ])
  const [beakers, setBeakers] = useState<Array<{ id: string; contents: ChemicalContent[] }>>([
    { id: 'beaker-1', contents: [] }
  ])
  const [quantityModal, setQuantityModal] = useState<{
    chemical: Chemical | null
    glasswareId: string | null
    isOpen: boolean
  }>({
    chemical: null,
    glasswareId: null,
    isOpen: false
  })

  const addTestTube = () => {
    const newId = `tube-${testTubes.length + 1}`
    setTestTubes([...testTubes, { id: newId, contents: [] }])
  }

  const addBeaker = () => {
    const newId = `beaker-${beakers.length + 1}`
    setBeakers([...beakers, { id: newId, contents: [] }])
  }

  const removeGlassware = (id: string, type: 'tube' | 'beaker') => {
    if (type === 'tube') {
      setTestTubes(testTubes.filter(tube => tube.id !== id))
    } else {
      setBeakers(beakers.filter(beaker => beaker.id !== id))
    }
  }

  const addChemicalToGlassware = useCallback((chemical: Chemical, glasswareId: string) => {
    // Validate chemical object
    if (!chemical || typeof chemical !== 'object') {
      console.warn('Invalid chemical object received')
      return
    }

    if (!chemical.name || !chemical.formula) {
      console.warn('Chemical missing required properties:', chemical)
      return
    }

    // Open quantity modal
    setQuantityModal({
      chemical,
      glasswareId,
      isOpen: true
    })
  }, [])

  const handleQuantityConfirm = useCallback((chemical: Chemical, amount: number, unit: string) => {
    const { glasswareId } = quantityModal
    if (!glasswareId) return

    const newContent: ChemicalContent = {
      chemical,
      amount,
      unit: unit as 'ml' | 'g' | 'mol' | 'drops'
    }

    setTestTubes(prev => prev.map(tube =>
      tube.id === glasswareId
        ? { ...tube, contents: [...tube.contents, newContent] }
        : tube
    ))

    setBeakers(prev => prev.map(beaker =>
      beaker.id === glasswareId
        ? { ...beaker, contents: [...beaker.contents, newContent] }
        : beaker
    ))

    // Reset the modal state after adding the chemical
    setQuantityModal({ chemical: null, glasswareId: null, isOpen: false })
    console.log('Chemical added successfully, modal reset')
  }, [quantityModal])

  const handleModalClose = useCallback(() => {
    console.log('Modal closing')
    setQuantityModal({ chemical: null, glasswareId: null, isOpen: false })
  }, [])

  const handleAddChemicalToFirstTestTube = useCallback((chemical: Chemical) => {
    // Validate chemical object
    if (!chemical || typeof chemical !== 'object') {
      console.warn('Invalid chemical object for test tube')
      return
    }

    if (!chemical.name || !chemical.formula) {
      console.warn('Chemical missing required properties for test tube')
      return
    }

    // Find the first test tube
    const firstTestTube = testTubes[0]
    if (firstTestTube) {
      setQuantityModal({
        chemical,
        glasswareId: firstTestTube.id,
        isOpen: true
      })
    }
  }, [testTubes])

  // Register the function with the parent component
  useEffect(() => {
    if (onAddChemicalToTestTube) {
      onAddChemicalToTestTube(handleAddChemicalToFirstTestTube)
    }
  }, [handleAddChemicalToFirstTestTube, onAddChemicalToTestTube])

  const clearGlassware = (glasswareId: string) => {
    setTestTubes(prev => prev.map(tube =>
      tube.id === glasswareId ? { ...tube, contents: [] } : tube
    ))
    setBeakers(prev => prev.map(beaker =>
      beaker.id === glasswareId ? { ...beaker, contents: [] } : beaker
    ))
  }

  const performReaction = () => {
    const allContents = [
      ...testTubes.flatMap(tube => tube.contents),
      ...beakers.flatMap(beaker => beaker.contents)
    ]

    if (allContents.length < 2) {
      alert('Add at least 2 chemicals to perform a reaction!')
      return
    }

    const experiment: Experiment = {
      name: `Experiment ${new Date().toLocaleTimeString()}`,
      chemicals: allContents,
      glassware: [
        ...testTubes.map(tube => ({
          id: tube.id,
          type: 'test-tube' as const,
          capacity: 10,
          contents: tube.contents
        })),
        ...beakers.map(beaker => ({
          id: beaker.id,
          type: 'beaker' as const,
          capacity: 50,
          contents: beaker.contents
        }))
      ]
    }

    onReaction(experiment)
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'chemical',
    drop: (item: Chemical, monitor) => {
      // Handle drop on table (will be handled by individual glassware)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop as any}
      className={`p-4 h-full overflow-y-auto transition-all duration-300 ${isOver ? 'border-2 border-blue-400 border-dashed rounded-2xl' : ''
        }`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#475569 #1e293b'
      }}
      role="region"
      aria-label="Laboratory workbench. Add glassware and chemicals here."
    >
      {/* Glassware Grid - Fixed Layout */}
      <div className="flex-1">
        <div className="flex flex-wrap justify-center gap-8 min-h-[400px]">
          <AnimatePresence>
            {testTubes.map((tube) => (
              <motion.div
                key={tube.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="relative group flex flex-col items-center justify-start w-[180px]"
              >
                <TestTube
                  id={tube.id}
                  contents={tube.contents}
                  onAddChemical={addChemicalToGlassware}
                  onClear={() => clearGlassware(tube.id)}
                  reactionResult={reactionResult}
                  isReacting={isReacting}
                />
                {testTubes.length > 1 && (
                  <motion.button
                    onClick={() => removeGlassware(tube.id, 'tube')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-0 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-50"
                    title="Remove test tube"
                  >
                    <Trash2 className="h-3 w-3" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {beakers.map((beaker) => (
              <motion.div
                key={beaker.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="relative group flex flex-col items-center justify-start w-[180px]"
              >
                <Beaker
                  id={beaker.id}
                  contents={beaker.contents}
                  onAddChemical={addChemicalToGlassware}
                  onClear={() => clearGlassware(beaker.id)}
                  reactionResult={reactionResult}
                  isReacting={isReacting}
                />
                {beakers.length > 1 && (
                  <motion.button
                    onClick={() => removeGlassware(beaker.id, 'beaker')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-0 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-50"
                    title="Remove beaker"
                  >
                    <Trash2 className="h-3 w-3" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {testTubes.length === 0 && beakers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
              <Atom className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No glassware added yet</p>
              <p className="text-xs sm:text-sm text-center px-4">
                <span className="hidden sm:inline">Click the buttons above to add test tubes or beakers</span>
                <span className="sm:hidden">Tap the buttons above to add glassware</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reaction Button */}
      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
        <motion.button
          onClick={performReaction}
          disabled={isReacting}
          whileHover={!isReacting ? { scale: 1.05 } : {}}
          whileTap={!isReacting ? { scale: 0.95 } : {}}
          className={`flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto touch-manipulation ${isReacting
            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
            : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white shadow-xl hover:shadow-2xl'
            }`}
        >
          <Atom className={`h-5 w-5 sm:h-6 sm:w-6 ${isReacting ? 'animate-spin' : ''}`} />
          <span>{isReacting ? 'Analyzing...' : 'Perform Reaction'}</span>
        </motion.button>

        {isReacting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 sm:space-x-3 text-blue-600 dark:text-blue-400"
          >
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-xs sm:text-sm font-medium text-center">
              AI is analyzing the reaction...
            </span>
          </motion.div>
        )}
      </div>

      {/* Quantity Selection Modal */}
      <QuantityModal
        chemical={quantityModal.chemical}
        isOpen={quantityModal.isOpen}
        onClose={handleModalClose}
        onConfirm={handleQuantityConfirm}
      />
    </div>
  )
}