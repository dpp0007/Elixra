'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrop } from 'react-dnd'
import TestTube from './TestTube'
import Beaker from './Beaker'
import QuantityModal from './QuantityModal'
import TestTubeSelectionModal from './TestTubeSelectionModal'
import { Chemical, ChemicalContent, Experiment, ReactionResult } from '@/types/chemistry'
import { Plus, Trash2, Atom, X } from 'lucide-react'

interface LabTableProps {
  onReaction: (experiment: Experiment) => void
  reactionResult: ReactionResult | null
  isReacting: boolean
  onAddChemicalToTestTube?: (callback: (chemical: Chemical) => void) => void
  onAddTestTube?: (callback: () => void) => void
  onAddBeaker?: (callback: () => void) => void
  equipmentAttachments?: any[]
  onEquipmentChange?: (attachments: any[]) => void
  selectedTubeId?: string
  onSelectTube?: (tubeId: string) => void
  onSelectedTubeContentsChange?: (contents: ChemicalContent[]) => void
}

export default function LabTable({
  onReaction,
  reactionResult,
  isReacting,
  onAddChemicalToTestTube,
  onAddTestTube,
  onAddBeaker,
  equipmentAttachments = [],
  onEquipmentChange,
  selectedTubeId = 'tube-1',
  onSelectTube,
  onSelectedTubeContentsChange
}: LabTableProps) {
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
  
  const [selectionModal, setSelectionModal] = useState<{
    isOpen: boolean
    chemical: Chemical | null
  }>({
    isOpen: false,
    chemical: null
  })

  const addTestTube = useCallback(() => {
    setTestTubes(prev => {
      const newId = `tube-${prev.length + 1}`
      return [...prev, { id: newId, contents: [] }]
    })
  }, [])

  const addBeaker = useCallback(() => {
    setBeakers(prev => {
      const newId = `beaker-${prev.length + 1}`
      return [...prev, { id: newId, contents: [] }]
    })
  }, [])

  // Notify parent when selected tube contents change
  useEffect(() => {
    const selectedTube = testTubes.find(t => t.id === selectedTubeId) || beakers.find(b => b.id === selectedTubeId)
    if (selectedTube && onSelectedTubeContentsChange) {
      onSelectedTubeContentsChange(selectedTube.contents)
    }
  }, [testTubes, beakers, selectedTubeId, onSelectedTubeContentsChange])

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

  const handleInitiateAddChemical = useCallback((chemical: Chemical) => {
    console.log('LabTable: handleInitiateAddChemical called with:', chemical)

    // Validate chemical object
    if (!chemical || typeof chemical !== 'object') {
      console.warn('LabTable: Invalid chemical object for test tube')
      return
    }

    if (!chemical.name || !chemical.formula) {
      console.warn('LabTable: Chemical missing required properties for test tube', chemical)
      return
    }

    // Open selection modal instead of automatically picking the first tube
    setSelectionModal({
      isOpen: true,
      chemical
    })
  }, [])

  const handleContainerSelected = useCallback((containerId: string) => {
    const { chemical } = selectionModal
    if (!chemical) return

    setSelectionModal({ isOpen: false, chemical: null })
    
    // Open quantity modal for the selected container
    setQuantityModal({
      chemical,
      glasswareId: containerId,
      isOpen: true
    })
  }, [selectionModal])

  const handleSelectionModalClose = useCallback(() => {
    setSelectionModal({ isOpen: false, chemical: null })
  }, [])

  // Register the function with the parent component
  useEffect(() => {
    if (onAddChemicalToTestTube) {
      onAddChemicalToTestTube(() => handleInitiateAddChemical)
    }
  }, [handleInitiateAddChemical, onAddChemicalToTestTube])

  // Expose add functions globally for the buttons (fallback)
  useEffect(() => {
    (window as any).__addTestTube = addTestTube;
    (window as any).__addBeaker = addBeaker;

    return () => {
      delete (window as any).__addTestTube;
      delete (window as any).__addBeaker;
    }
  }, [addTestTube, addBeaker])

  // Register add functions with parent component
  useEffect(() => {
    if (onAddTestTube) {
      onAddTestTube(() => addTestTube)
    }
    if (onAddBeaker) {
      onAddBeaker(() => addBeaker)
    }
  }, [addTestTube, addBeaker, onAddTestTube, onAddBeaker])

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

  // Calculate if reaction can be performed (at least 2 vessels with chemicals)
  const activeGlasswareCount = [...testTubes, ...beakers].filter(c => c.contents.length > 0).length
  const canPerformReaction = activeGlasswareCount >= 2

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
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 min-h-[400px]">
          <AnimatePresence>
            {testTubes.map((tube) => (
              <motion.div
                key={tube.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="relative group flex flex-col items-center justify-start w-[160px] sm:w-[180px]"
              >
                <TestTube
                  id={tube.id}
                  contents={tube.contents}
                  equipmentAttachments={equipmentAttachments}
                  onEquipmentChange={onEquipmentChange}
                  onAddChemical={addChemicalToGlassware}
                  onClear={() => clearGlassware(tube.id)}
                  reactionResult={reactionResult}
                  isReacting={isReacting}
                />
                {/* Clear button - aligned with trash button */}
                {tube.contents.length > 0 && (
                  <motion.button
                    onClick={() => clearGlassware(tube.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-0 left-0 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-50"
                    title="Clear contents"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
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
                className="relative group flex flex-col items-center justify-start w-[160px] sm:w-[180px]"
              >
                <Beaker
                  id={beaker.id}
                  contents={beaker.contents}
                  equipmentAttachments={equipmentAttachments}
                  onEquipmentChange={onEquipmentChange}
                  onAddChemical={addChemicalToGlassware}
                  onClear={() => clearGlassware(beaker.id)}
                  reactionResult={reactionResult}
                  isReacting={isReacting}
                />
                {/* Clear button - aligned with trash button */}
                {beaker.contents.length > 0 && (
                  <motion.button
                    onClick={() => clearGlassware(beaker.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-0 left-0 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-50"
                    title="Clear contents"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
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
      <div className="flex flex-col items-center space-y-3 sm:space-y-4 mt-8">
        <motion.button
          onClick={performReaction}
          disabled={isReacting || !canPerformReaction}
          whileHover={!isReacting && canPerformReaction ? { filter: 'brightness(1.1)', boxShadow: '0 0 25px rgba(37, 99, 235, 0.5)' } : {}}
          whileTap={!isReacting && canPerformReaction ? { scale: 0.98 } : {}}
          className={`flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto touch-manipulation ${isReacting || !canPerformReaction
            ? 'bg-[#1e293b] cursor-not-allowed text-gray-500 border border-white/10'
            : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
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

      {/* Container Selection Modal */}
      <TestTubeSelectionModal
        isOpen={selectionModal.isOpen}
        onClose={handleSelectionModalClose}
        onSelect={handleContainerSelected}
        testTubes={testTubes}
        chemical={selectionModal.chemical}
      />
    </div>
  )
}