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
  onTestTubesChange?: (tubes: Array<{ id: string; contents: ChemicalContent[] }>) => void
  // Collaborative props
  externalExperimentState?: Experiment | null
  onExperimentStateChange?: (experiment: Experiment) => void
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
  onSelectedTubeContentsChange,
  onTestTubesChange,
  externalExperimentState,
  onExperimentStateChange
}: LabTableProps) {
  const [testTubes, setTestTubes] = useState<Array<{ id: string; contents: ChemicalContent[] }>>([
    { id: 'tube-1', contents: [] },
    { id: 'tube-2', contents: [] }
  ])
  const [beakers, setBeakers] = useState<Array<{ id: string; contents: ChemicalContent[] }>>([
    { id: 'beaker-1', contents: [] }
  ])

  // Sync with external state (for collaboration)
  useEffect(() => {
    if (externalExperimentState && externalExperimentState.glassware) {
      const newTestTubes: any[] = []
      const newBeakers: any[] = []
      
      externalExperimentState.glassware.forEach(item => {
        if (item.type === 'test-tube') {
          newTestTubes.push({ id: item.id, contents: item.contents })
        } else if (item.type === 'beaker') {
          newBeakers.push({ id: item.id, contents: item.contents })
        }
      })
      
      // Only update if different to avoid infinite loops
      // JSON.stringify is a quick and dirty deep comparison
      if (JSON.stringify(newTestTubes) !== JSON.stringify(testTubes)) {
         setTestTubes(newTestTubes.length > 0 ? newTestTubes : [{ id: 'tube-1', contents: [] }, { id: 'tube-2', contents: [] }])
      }
      if (JSON.stringify(newBeakers) !== JSON.stringify(beakers)) {
         setBeakers(newBeakers.length > 0 ? newBeakers : [{ id: 'beaker-1', contents: [] }])
      }
    }
  }, [externalExperimentState])

  // Broadcast state changes
  const broadcastState = useCallback((newTestTubes: any[], newBeakers: any[]) => {
    if (onExperimentStateChange) {
      const experiment: Experiment = {
        name: `Shared Experiment`,
        chemicals: [], // derived from glassware
        glassware: [
          ...newTestTubes.map(tube => ({
            id: tube.id,
            type: 'test-tube' as const,
            capacity: 10,
            contents: tube.contents
          })),
          ...newBeakers.map(beaker => ({
            id: beaker.id,
            type: 'beaker' as const,
            capacity: 50,
            contents: beaker.contents
          }))
        ]
      }
      onExperimentStateChange(experiment)
    }
  }, [onExperimentStateChange])

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
      const newState = [...prev, { id: newId, contents: [] }]
      broadcastState(newState, beakers)
      return newState
    })
  }, [beakers, broadcastState])

  const addBeaker = useCallback(() => {
    setBeakers(prev => {
      const newId = `beaker-${prev.length + 1}`
      const newState = [...prev, { id: newId, contents: [] }]
      broadcastState(testTubes, newState)
      return newState
    })
  }, [testTubes, broadcastState])

  // Notify parent when selected tube contents change
  useEffect(() => {
    const selectedTube = testTubes.find(t => t.id === selectedTubeId) || beakers.find(b => b.id === selectedTubeId)
    if (selectedTube && onSelectedTubeContentsChange) {
      onSelectedTubeContentsChange(selectedTube.contents)
    }
  }, [testTubes, beakers, selectedTubeId, onSelectedTubeContentsChange])

  // Notify parent when test tubes list changes (for equipment selection)
  useEffect(() => {
    if (onTestTubesChange) {
      onTestTubesChange(testTubes)
    }
  }, [testTubes, onTestTubesChange])

  const removeGlassware = (id: string, type: 'tube' | 'beaker') => {
    if (type === 'tube') {
      const newState = testTubes.filter(tube => tube.id !== id)
      setTestTubes(newState)
      broadcastState(newState, beakers)
    } else {
      const newState = beakers.filter(beaker => beaker.id !== id)
      setBeakers(newState)
      broadcastState(testTubes, newState)
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

    const newTestTubes = testTubes.map(tube =>
      tube.id === glasswareId
        ? { ...tube, contents: [...tube.contents, newContent] }
        : tube
    )
    
    setTestTubes(newTestTubes)

    const newBeakers = beakers.map(beaker =>
      beaker.id === glasswareId
        ? { ...beaker, contents: [...beaker.contents, newContent] }
        : beaker
    )
    
    setBeakers(newBeakers)
    
    broadcastState(newTestTubes, newBeakers)

    // Reset the modal state after adding the chemical
    setQuantityModal({ chemical: null, glasswareId: null, isOpen: false })
    console.log('Chemical added successfully, modal reset')
  }, [quantityModal, testTubes, beakers, broadcastState])

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
    const newTestTubes = testTubes.map(tube =>
      tube.id === glasswareId ? { ...tube, contents: [] } : tube
    )
    setTestTubes(newTestTubes)
    
    const newBeakers = beakers.map(beaker =>
      beaker.id === glasswareId ? { ...beaker, contents: [] } : beaker
    )
    setBeakers(newBeakers)
    
    broadcastState(newTestTubes, newBeakers)
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
                className="relative group flex flex-col items-center justify-start w-[140px] sm:w-[180px]"
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
                className="relative group flex flex-col items-center justify-start w-[140px] sm:w-[180px]"
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
          whileHover={!isReacting && canPerformReaction ? { filter: 'brightness(1.1)', boxShadow: '0 0 25px rgba(46, 107, 107, 0.5)' } : {}}
          whileTap={!isReacting && canPerformReaction ? { scale: 0.98 } : {}}
          className={`flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto touch-manipulation ${isReacting || !canPerformReaction
            ? 'bg-gray-200 dark:bg-gray-800 cursor-not-allowed text-elixra-text-secondary border border-elixra-copper/10'
            : 'btn-primary shadow-lg shadow-elixra-bunsen/20'
            }`}
        >
          <Atom className={`h-5 w-5 sm:h-6 sm:w-6 ${isReacting ? 'animate-spin' : ''}`} />
          <span>{isReacting ? 'Analyzing...' : 'Perform Reaction'}</span>
        </motion.button>

 
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