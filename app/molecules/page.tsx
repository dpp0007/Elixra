'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Atom as AtomIcon, 
  Plus, 
  Trash2, 
  RotateCw, 
  Sparkles, 
  Search, 
  Filter, 
  Undo2, 
  Redo2, 
  Mic, 
  MicOff, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Settings,
  Zap
} from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import dynamic from 'next/dynamic'
import MoleculeDropZone from '@/components/MoleculeDropZone'
import { PerspectiveGrid, StaticGrid } from '@/components/GridBackground'
import { SpatialHash, BondCalculationWorker, PerformanceMonitor } from '@/lib/spatialHash'
import { PERIODIC_TABLE, PeriodicElement } from '@/lib/periodicTable'
import { Element } from '@/types/molecule'
import { validateMolecule, ChemicalValidator, ValidationResult } from '@/lib/chemicalValidation'
import { MOLECULAR_TEMPLATES, MolecularTemplate, searchTemplates } from '@/lib/molecularTemplates'
import { EnhancedAIAnalyzer, EnhancedAnalysis } from '@/lib/enhancedAIAnalysis'
import { UndoRedoManager, ACTION_TYPES, createActionDescription } from '@/lib/undoRedo'
import VoiceCommandSystem from '@/components/VoiceCommandSystem'
import PeriodicTable from '@/components/PeriodicTable'
import AtomBondDialog from '@/components/AtomBondDialog'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import AutoScrollIndicator from '@/components/AutoScrollIndicator'

const EnhancedMolecule3DViewer = dynamic(() => import('@/components/EnhancedMolecule3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-elixra-charcoal/10 dark:bg-white/10 animate-pulse rounded-lg flex items-center justify-center text-elixra-secondary">
      Loading 3D Viewer...
    </div>
  )
})

import { Atom, Bond } from '@/types/molecule'
import {
  calculateBonds,
  getMolecularFormula,
  calculateMolecularWeight,
  updateBondsOnMove,
  canFormBond,
} from '@/lib/bondingLogic'

export default function EnhancedMoleculesPage() {
  const [atoms, setAtoms] = useState<Atom[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null)
  const [moleculeName, setMoleculeName] = useState('Custom Molecule')
  const [analysis, setAnalysis] = useState<EnhancedAnalysis | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null)
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null)
  const [showBondDialog, setShowBondDialog] = useState(false)
  const [pendingDropElement, setPendingDropElement] = useState<Element | null>(null)
  const [pendingDropPosition, setPendingDropPosition] = useState<{ x: number; y: number; z: number } | null>(null)
  
  // Performance optimization
  const spatialHashRef = useRef<SpatialHash>(new SpatialHash())
  const bondWorkerRef = useRef<BondCalculationWorker>(new BondCalculationWorker())
  const performanceMonitorRef = useRef<PerformanceMonitor>(new PerformanceMonitor())
  const undoRedoManagerRef = useRef<UndoRedoManager>(new UndoRedoManager())
  const aiAnalyzerRef = useRef<EnhancedAIAnalyzer>(EnhancedAIAnalyzer.getInstance())
  
  // UI states
  const [showPeriodicTable, setShowPeriodicTable] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [templateSearch, setTemplateSearch] = useState('')
  const [qualityLevel, setQualityLevel] = useState('high')
  const [fps, setFPS] = useState(60)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)

  // Auto-scroll hook
  const { showIndicator: showScrollIndicator } = useAutoScroll({
    threshold: 50,
    maxSpeed: 100
  })

  // Initialize performance monitoring
  useEffect(() => {
    performanceMonitorRef.current.start()
    const unsubscribe = performanceMonitorRef.current.onFPSChange((newFPS, newQuality) => {
      setFPS(newFPS)
      setQualityLevel(newQuality)
    })
    
    return () => {
      performanceMonitorRef.current.stop()
      unsubscribe()
    }
  }, [])

  // Initialize undo/redo manager
  useEffect(() => {
    const unsubscribe = undoRedoManagerRef.current.addListener((state) => {
      setAtoms(state.atoms)
      setBonds(state.bonds)
    })
    
    return () => unsubscribe()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break
          case 'y':
            e.preventDefault()
            handleRedo()
            break
          case 'e':
            e.preventDefault()
            setShowPeriodicTable(true)
            break
          case 't':
            e.preventDefault()
            setShowTemplates(true)
            break
          case 'a':
            e.preventDefault()
            handleAnalyze()
            break
          case 'v':
            e.preventDefault()
            setIsVoiceListening(!isVoiceListening)
            break
        }
      }
      
      // Template hotkeys
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const template = MOLECULAR_TEMPLATES.find(t => t.hotkey === e.key.toLowerCase())
        if (template) {
          loadTemplate(template)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVoiceListening])

  const handleDropAtom = (element: Element, position?: { x: number; y: number; z: number }) => {
    setPendingDropElement(element)
    setPendingDropPosition(position || null)
    setShowBondDialog(true)
  }

  const loadTemplate = (template: MolecularTemplate) => {
    const newState = {
      atoms: template.atoms.map(atom => ({ ...atom })),
      bonds: template.bonds.map(bond => ({ ...bond })),
      timestamp: Date.now(),
      action: ACTION_TYPES.LOAD_TEMPLATE,
      description: `Loaded ${template.name}`
    }
    
    setAtoms(newState.atoms)
    setBonds(newState.bonds)
    setMoleculeName(template.name)
    setSelectedAtomId(null)
    setSelectedBondId(null)
    
    undoRedoManagerRef.current.recordState(
      newState.atoms,
      newState.bonds,
      ACTION_TYPES.LOAD_TEMPLATE,
      `Loaded ${template.name}`
    )
  }

  const addAtom = useCallback((element?: Element, position?: { x: number; y: number; z: number } | null, bondsToCreate?: Array<{ atomId: string; bondType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' }>) => {
    if (!element) return

    let finalPosition: { x: number; y: number; z: number } | null = null
    
    // Determine the reference atom for positioning
    const referenceAtomId = bondsToCreate && bondsToCreate.length > 0 ? bondsToCreate[0].atomId : null
    
    // Always find a position that's 3+ units away from ALL atoms
    let attempts = 0
    const maxAttempts = 100
    
    while (!finalPosition && attempts < maxAttempts) {
      let candidatePos: { x: number; y: number; z: number }
      
      if (referenceAtomId) {
        const referenceAtom = atoms.find(a => a.id === referenceAtomId)
        if (!referenceAtom) break
        
        const angle1 = Math.random() * Math.PI * 2
        const angle2 = Math.random() * Math.PI * 2
        candidatePos = {
          x: referenceAtom.x + 3.5 * Math.cos(angle1) * Math.sin(angle2),
          y: referenceAtom.y + 3.5 * Math.sin(angle1) * Math.sin(angle2),
          z: referenceAtom.z + 3.5 * Math.cos(angle2)
        }
      } else {
        // Random position in space
        candidatePos = {
          x: Math.random() * 8 - 4,
          y: Math.random() * 8 - 4,
          z: Math.random() * 8 - 4
        }
      }
      
      // Check if this position is 3+ units from ALL existing atoms
      const isValid = atoms.every(atom => {
        const dx = atom.x - candidatePos.x
        const dy = atom.y - candidatePos.y
        const dz = atom.z - candidatePos.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        return dist >= 3.0
      })
      
      if (isValid) {
        finalPosition = candidatePos
      }
      attempts++
    }

    // If no valid position found, place it anyway
    if (!finalPosition) {
      finalPosition = {
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5
      }
    }

    const newAtom: Atom = {
      id: `atom-${Date.now()}`,
      element: element.symbol,
      x: finalPosition.x,
      y: finalPosition.y,
      z: finalPosition.z,
      color: element.color
    }

    const updatedAtoms = [...atoms, newAtom]
    setAtoms(updatedAtoms)

    // Create bonds if specified
    if (bondsToCreate && bondsToCreate.length > 0) {
      const newBonds = bondsToCreate.map((bond, index) => ({
        id: `bond-${Date.now()}-${index}`,
        from: bond.atomId,
        to: newAtom.id,
        type: bond.bondType
      }))
      setBonds([...bonds, ...newBonds])
      
      undoRedoManagerRef.current.recordState(
        updatedAtoms,
        [...bonds, ...newBonds],
        ACTION_TYPES.ADD_ATOM,
        `Added ${element.name} with bonds`
      )
    } else {
      // Calculate bonds automatically
      const newBonds = calculateBonds(updatedAtoms)
      setBonds(newBonds)
      
      undoRedoManagerRef.current.recordState(
        updatedAtoms,
        newBonds,
        ACTION_TYPES.ADD_ATOM,
        `Added ${element.name}`
      )
    }
  }, [atoms, bonds])

  const removeAtom = useCallback((id: string) => {
    const updatedAtoms = atoms.filter(a => a.id !== id)
    const updatedBonds = bonds.filter(b => b.from !== id && b.to !== id)
    
    setAtoms(updatedAtoms)
    setBonds(updatedBonds)
    setSelectedAtomId(null)
    
    undoRedoManagerRef.current.recordState(
      updatedAtoms,
      updatedBonds,
      ACTION_TYPES.REMOVE_ATOM,
      'Removed atom'
    )
  }, [atoms, bonds])

  const removeBond = useCallback((id: string) => {
    const updatedBonds = bonds.filter(b => b.id !== id)
    setBonds(updatedBonds)
    setSelectedBondId(null)
    
    undoRedoManagerRef.current.recordState(
      atoms,
      updatedBonds,
      ACTION_TYPES.REMOVE_BOND,
      'Removed bond'
    )
  }, [atoms, bonds])

  const changeBondType = useCallback((bondId: string, newType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen') => {
    const bond = bonds.find(b => b.id === bondId)
    if (!bond) return

    const fromAtom = atoms.find(a => a.id === bond.from)
    const toAtom = atoms.find(a => a.id === bond.to)

    if (!fromAtom || !toAtom) return

    if (canFormBond(fromAtom, toAtom, bonds, newType)) {
      const updatedBonds = bonds.map(b => b.id === bondId ? { ...b, type: newType } : b)
      setBonds(updatedBonds)
      
      undoRedoManagerRef.current.recordState(
        atoms,
        updatedBonds,
        ACTION_TYPES.CHANGE_BOND_TYPE,
        `Changed to ${newType} bond`
      )
    }
  }, [atoms, bonds])

  const clearAll = useCallback(() => {
    setAtoms([])
    setBonds([])
    setMoleculeName('Custom Molecule')
    setSelectedAtomId(null)
    setSelectedBondId(null)
    setAnalysis(null)
    setValidation(null)
    
    undoRedoManagerRef.current.recordState(
      [],
      [],
      ACTION_TYPES.CLEAR_SCENE,
      'Cleared scene'
    )
  }, [])

  const handleAnalyze = async () => {
    if (atoms.length === 0) return

    setAnalyzing(true)
    try {
      const formula = getMolecularFormula(atoms)
      const analysis = await aiAnalyzerRef.current.analyzeMolecule(atoms, bonds)
      setAnalysis(analysis)
      setShowAnalysis(true)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleValidate = () => {
    const validation = validateMolecule(atoms, bonds)
    setValidation(validation)
    setShowValidation(true)
  }

  const autoCompleteWithHydrogen = () => {
    const validator = new ChemicalValidator(atoms, bonds)
    const { newAtoms, newBonds } = validator.autoCompleteWithHydrogen()
    
    const updatedAtoms = [...atoms, ...newAtoms]
    const updatedBonds = [...bonds, ...newBonds]
    
    setAtoms(updatedAtoms)
    setBonds(updatedBonds)
    
    undoRedoManagerRef.current.recordState(
      updatedAtoms,
      updatedBonds,
      ACTION_TYPES.AUTO_COMPLETE,
      'Auto-completed with hydrogen'
    )
  }

  const handleUndo = () => {
    undoRedoManagerRef.current.undo()
  }

  const handleRedo = () => {
    undoRedoManagerRef.current.redo()
  }

  const handleSelectAtom = useCallback((atomId: string) => {
    setSelectedAtomId(atomId)
    setSelectedBondId(null)
  }, [])

  const handleSelectBond = useCallback((bondId: string) => {
    setSelectedBondId(bondId)
    setSelectedAtomId(null)
  }, [])

  const handleCanvasClick = useCallback(() => {
    setSelectedAtomId(null)
    setSelectedBondId(null)
  }, [])

  const handleVoiceCommand = (command: any) => {
    switch (command.action) {
      case 'ADD_ELEMENT':
        if (command.data?.element) {
          const element = PERIODIC_TABLE.find(e => e.symbol === command.data.element)
          if (element) {
            addAtom(element)
          }
        }
        break
      case 'LOAD_TEMPLATE':
        if (command.data?.template) {
          const template = MOLECULAR_TEMPLATES.find(t => t.id === command.data.template)
          if (template) {
            loadTemplate(template)
          }
        }
        break
      case 'CLEAR_SCENE':
        clearAll()
        break
      case 'UNDO':
        handleUndo()
        break
      case 'REDO':
        handleRedo()
        break
      case 'ANALYZE':
        handleAnalyze()
        break
      case 'VALIDATE':
        handleValidate()
        break
      case 'AUTO_COMPLETE':
        autoCompleteWithHydrogen()
        break
    }
  }

  const orbitControlsRef = useRef<any>(null)

  return (
    <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-300">
      <PerspectiveGrid />

      <AutoScrollIndicator isVisible={showScrollIndicator} />

      {/* Bond Dialog */}
      {showBondDialog && pendingDropElement && (
        <AtomBondDialog
          newElement={pendingDropElement}
          existingAtoms={atoms}
          onConfirm={(bonds) => {
            setShowBondDialog(false)
            addAtom(pendingDropElement, pendingDropPosition, bonds)
            setPendingDropElement(null)
            setPendingDropPosition(null)
          }}
          onCancel={() => {
            setShowBondDialog(false)
            setPendingDropElement(null)
            setPendingDropPosition(null)
          }}
        />
      )}

      {/* Periodic Table Modal */}
      <AnimatePresence>
        {showPeriodicTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPeriodicTable(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel bg-white/90 dark:bg-elixra-charcoal/90 backdrop-blur-xl border border-elixra-border-subtle rounded-2xl p-6 max-w-6xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white">
                  Periodic Table of Elements
                </h2>
                <button
                  onClick={() => setShowPeriodicTable(false)}
                  className="p-2 rounded-lg glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all"
                >
                  ✕
                </button>
              </div>
              <PeriodicTable
                onElementSelect={(element) => {
                  setSelectedElement(element)
                  setShowPeriodicTable(false)
                }}
                selectedElement={selectedElement?.symbol || null}
                className="max-w-5xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel bg-white/90 dark:bg-elixra-charcoal/90 backdrop-blur-xl border border-elixra-border-subtle rounded-2xl p-6 max-w-5xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white">
                    Molecular Templates Library
                  </h2>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="p-2 rounded-lg glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-elixra-secondary" />
                  <input
                    type="text"
                    placeholder="Search templates by name, formula, or tags..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 glass-panel bg-white/60 dark:bg-white/10 border border-elixra-border-subtle rounded-xl focus:border-elixra-bunsen focus:ring-1 focus:ring-elixra-bunsen/50 transition-all text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                  {searchTemplates(templateSearch).map(template => (
                    <motion.button
                      key={template.id}
                      onClick={() => {
                        loadTemplate(template)
                        setShowTemplates(false)
                      }}
                      className="glass-panel bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-4 hover:border-elixra-bunsen/30 transition-all text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-elixra-charcoal dark:text-white group-hover:text-elixra-bunsen transition-colors">
                          {template.name}
                        </div>
                        {template.hotkey && (
                          <div className="px-2 py-1 bg-elixra-bunsen/20 text-elixra-bunsen text-xs rounded font-mono">
                            {template.hotkey.toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-elixra-secondary mb-2">
                        {template.formula} • {template.molecularWeight.toFixed(1)} g/mol
                      </div>
                      
                      <div className="text-xs text-elixra-secondary/70 mb-3 line-clamp-2">
                        {template.description}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-elixra-bunsen/10 text-elixra-bunsen text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-elixra-bunsen/10 text-elixra-bunsen text-xs rounded">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className={`mt-3 px-2 py-1 text-xs rounded font-medium ${
                        template.difficulty === 'beginner' 
                          ? 'bg-elixra-success/20 text-elixra-success' 
                          : template.difficulty === 'intermediate'
                          ? 'bg-elixra-copper/20 text-elixra-copper'
                          : 'bg-elixra-error/20 text-elixra-error'
                      }`}>
                        {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                <div className="glass-panel bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-4">
                  <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-2">
                    Quick Insert Hotkeys
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {MOLECULAR_TEMPLATES.filter(t => t.hotkey).slice(0, 8).map(template => (
                      <div key={template.id} className="flex items-center justify-between">
                        <span className="text-elixra-secondary">{template.name}</span>
                        <kbd className="px-2 py-1 bg-elixra-bunsen/20 text-elixra-bunsen rounded font-mono">
                          {template.hotkey?.toUpperCase()}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Panel */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 top-20 w-[450px] glass-panel bg-white/95 dark:bg-elixra-charcoal/95 backdrop-blur-xl border border-elixra-border-subtle rounded-2xl p-6 max-h-[80vh] overflow-y-auto z-40 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-elixra-charcoal dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-elixra-bunsen" />
                AI Analysis
              </h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="p-2 rounded-lg glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="glass-panel bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-4">
                <div className="text-lg font-semibold text-elixra-charcoal dark:text-white mb-2">
                  {analysis.commonName}
                </div>
                <div className="text-sm text-elixra-secondary mb-1">
                  {analysis.iupacName}
                </div>
                {analysis.casNumber && (
                  <div className="text-xs text-elixra-secondary/70">
                    CAS Registry Number: {analysis.casNumber}
                  </div>
                )}
              </div>
              
              {/* Properties */}
              <div>
                <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Physical Properties
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-panel bg-white/40 dark:bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-elixra-secondary">Formula</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white">{analysis.formula}</div>
                  </div>
                  <div className="glass-panel bg-white/40 dark:bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-elixra-secondary">Molecular Weight</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white">{analysis.molecularWeight.toFixed(2)} g/mol</div>
                  </div>
                  <div className="glass-panel bg-white/40 dark:bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-elixra-secondary">Physical State</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white capitalize">{analysis.properties.physicalState}</div>
                  </div>
                  <div className="glass-panel bg-white/40 dark:bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-elixra-secondary">Polarity</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white capitalize">{analysis.properties.polarity}</div>
                  </div>
                  {analysis.properties.meltingPoint && (
                    <div className="glass-panel bg-white/40 dark:bg-white/10 rounded-lg p-3">
                      <div className="text-xs text-elixra-secondary">Melting Point</div>
                      <div className="font-medium text-elixra-charcoal dark:text-white">{analysis.properties.meltingPoint}°C</div>
                    </div>
                  )}
                  {analysis.properties.boilingPoint && (
                    <div className="glass-panel bg-white/40 dark:bg-white/10 rounded-lg p-3">
                      <div className="text-xs text-elixra-secondary">Boiling Point</div>
                      <div className="font-medium text-elixra-charcoal dark:text-white">{analysis.properties.boilingPoint}°C</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Functional Groups */}
              {analysis.structure.functionalGroups.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-3">
                    Functional Groups
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.structure.functionalGroups.map(group => (
                      <span key={group} className="px-3 py-2 bg-elixra-bunsen/20 text-elixra-bunsen-dark rounded-lg text-sm font-medium">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Applications */}
              <div>
                <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-3">
                  Common Applications
                </div>
                <div className="space-y-3">
                  {analysis.applications.everyday.length > 0 && (
                    <div>
                      <div className="text-xs text-elixra-secondary mb-2">Everyday Uses</div>
                      <div className="space-y-1">
                        {analysis.applications.everyday.map((use, index) => (
                          <div key={index} className="text-sm text-elixra-charcoal dark:text-gray-200 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-elixra-bunsen rounded-full mt-2 flex-shrink-0" />
                            {use}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Safety */}
              <div>
                <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-3">
                  Safety Information
                </div>
                <div className={`p-4 rounded-lg border ${
                  analysis.safety.toxicity === 'non-toxic' 
                    ? 'bg-elixra-success/20 border-elixra-success/30' 
                    : analysis.safety.toxicity === 'low-toxicity'
                    ? 'bg-elixra-copper/20 border-elixra-copper/30'
                    : 'bg-elixra-error/20 border-elixra-error/30'
                }`}>
                  <div className="font-medium capitalize mb-2">
                    {analysis.safety.toxicity.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-elixra-charcoal dark:text-gray-200">
                    {analysis.safety.handling[0]}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Panel */}
      <AnimatePresence>
        {showValidation && validation && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 top-20 w-[400px] glass-panel bg-white/95 dark:bg-elixra-charcoal/95 backdrop-blur-xl border border-elixra-border-subtle rounded-2xl p-6 max-h-[80vh] overflow-y-auto z-40 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-elixra-charcoal dark:text-white flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  validation.isValid ? 'bg-elixra-success' : 'bg-elixra-error'
                }`} />
                Chemical Validation
              </h3>
              <button
                onClick={() => setShowValidation(false)}
                className="p-2 rounded-lg glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-xl border ${
                validation.isValid 
                  ? 'bg-elixra-success/20 border-elixra-success/30' 
                  : 'bg-elixra-error/20 border-elixra-error/30'
              }`}>
                <div className="font-semibold text-lg">
                  {validation.isValid ? '✓ Structure Valid' : '⚠ Structure Issues'}
                </div>
                <div className="text-sm text-elixra-secondary mt-1">
                  {validation.warnings.length} warnings • {validation.suggestions.length} suggestions
                </div>
              </div>
              
              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-3 flex items-center gap-2">
                    ⚠️ Warnings
                  </div>
                  <div className="space-y-3">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className={`p-4 rounded-xl border ${
                        warning.severity === 'high' 
                          ? 'bg-elixra-error/20 border-elixra-error/30' 
                          : warning.severity === 'medium'
                          ? 'bg-elixra-copper/20 border-elixra-copper/30'
                          : 'bg-elixra-bunsen/20 border-elixra-bunsen/30'
                      }`}>
                        <div className="font-medium mb-2">{warning.message}</div>
                        <div className="text-xs text-elixra-secondary/70">
                          Atom: {warning.atomSymbol}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Suggestions */}
              {validation.suggestions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-3 flex items-center gap-2">
                    💡 Suggestions
                  </div>
                  <div className="space-y-3">
                    {validation.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 rounded-xl border bg-elixra-bunsen/20 border-elixra-bunsen/30">
                        <div className="font-medium mb-2">{suggestion.action}</div>
                        <div className="text-sm text-elixra-secondary/80">
                          {suggestion.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={autoCompleteWithHydrogen}
                    className="w-full mt-4 btn-secondary"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Auto-complete with Hydrogen
                  </button>
                </div>
              )}
              
              {/* Electron Counts */}
              <div>
                <div className="text-sm font-semibold text-elixra-charcoal dark:text-white mb-3">
                  Electron Counts
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(validation.electronCounts).map(([atomId, count]) => {
                    const atom = atoms.find(a => a.id === atomId)
                    if (!atom) return null
                    return (
                      <div key={atomId} className="flex items-center justify-between p-3 rounded-lg border bg-white/40 dark:bg-white/10">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: atom.color }}
                          />
                          <span className="font-medium">{atom.element}</span>
                        </div>
                        <div className="text-sm text-elixra-secondary">
                          {count} valence electrons
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModernNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Element Quick Access */}
            <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-3xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-elixra-charcoal dark:text-white">
                  Quick Elements
                </h3>
                <button
                  onClick={() => setShowPeriodicTable(true)}
                  className="text-xs text-elixra-bunsen hover:text-elixra-bunsen-dark"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PERIODIC_TABLE.slice(0, 16).map(element => (
                  <motion.button
                    key={element.symbol}
                    draggable={true}
                    onDragStart={(e) => {
                      // @ts-ignore
                      window.__draggedElement = element
                      // @ts-ignore
                      if (e.dataTransfer) {
                        // @ts-ignore
                        e.dataTransfer.effectAllowed = 'copy'
                        // @ts-ignore
                        e.dataTransfer.setData('text/plain', element.symbol)
                      }
                    }}
                    onClick={() => {
                      setPendingDropElement(element)
                      setPendingDropPosition(null)
                      setShowBondDialog(true)
                    }}
                    className={`
                      p-2 rounded-lg border transition-all text-xs relative overflow-hidden
                      ${selectedElement?.symbol === element.symbol
                        ? 'border-elixra-bunsen bg-elixra-bunsen/20'
                        : 'border-white/20 hover:border-white/40'
                      }
                      cursor-grab active:cursor-grabbing
                    `}
                    style={{
                      backgroundColor: `${element.color}20`,
                      borderColor: selectedElement?.symbol === element.symbol ? '#2E6B6B' : `${element.color}40`
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="font-bold">{element.symbol}</div>
                    <div className="text-[8px] text-elixra-secondary">{element.atomicNumber}</div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="glass-panel bg-white/90 dark:bg-elixra-charcoal/90 backdrop-blur-xl border border-elixra-border-subtle rounded-lg p-2 text-xs whitespace-nowrap">
                        <div className="font-medium">{element.name}</div>
                        <div className="text-elixra-secondary">{element.category}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-3xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-elixra-charcoal dark:text-white">
                  Quick Actions
                </h3>
                <button
                  onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                  className="p-1 rounded-lg glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all"
                  title="Advanced Controls"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPeriodicTable(true)}
                  className="p-3 glass-panel bg-white/80 dark:bg-white/15 rounded-xl border border-elixra-border-subtle hover:border-elixra-bunsen hover:bg-elixra-bunsen/10 transition-all text-xs flex flex-col items-center justify-center gap-2 group"
                  title="Periodic Table (Ctrl+E)"
                >
                  <div className="text-2xl text-elixra-bunsen group-hover:scale-110 transition-transform">⚛</div>
                  <div className="font-semibold text-elixra-charcoal dark:text-white">Elements</div>
                </button>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="p-3 glass-panel bg-white/80 dark:bg-white/15 rounded-xl border border-elixra-border-subtle hover:border-elixra-bunsen hover:bg-elixra-bunsen/10 transition-all text-xs flex flex-col items-center justify-center gap-2 group"
                  title="Templates (Ctrl+T)"
                >
                  <div className="text-2xl text-elixra-copper group-hover:scale-110 transition-transform">📋</div>
                  <div className="font-semibold text-elixra-charcoal dark:text-white">Templates</div>
                </button>
                <button
                  onClick={handleUndo}
                  disabled={!undoRedoManagerRef.current.canUndo()}
                  className="p-3 glass-panel bg-white/80 dark:bg-white/15 rounded-xl border border-elixra-border-subtle hover:border-elixra-bunsen hover:bg-elixra-bunsen/10 transition-all text-xs flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="h-6 w-6 text-elixra-secondary group-hover:text-elixra-bunsen transition-colors" />
                  <div className="font-semibold text-elixra-charcoal dark:text-white">Undo</div>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!undoRedoManagerRef.current.canRedo()}
                  className="p-3 glass-panel bg-white/80 dark:bg-white/15 rounded-xl border border-elixra-border-subtle hover:border-elixra-bunsen hover:bg-elixra-bunsen/10 transition-all text-xs flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="h-6 w-6 text-elixra-secondary group-hover:text-elixra-bunsen transition-colors" />
                  <div className="font-semibold text-elixra-charcoal dark:text-white">Redo</div>
                </button>
              </div>
              
              <AnimatePresence>
                {showAdvancedControls && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-elixra-border-subtle"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleValidate}
                        disabled={atoms.length === 0}
                        className="p-2 glass-panel bg-white/60 dark:bg-white/10 rounded-lg border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all text-xs disabled:opacity-50"
                        title="Validate Structure"
                      >
                        <div className="w-4 h-4 rounded-full bg-elixra-success mx-auto" />
                        <div className="text-elixra-secondary">Validate</div>
                      </button>
                      <button
                        onClick={autoCompleteWithHydrogen}
                        disabled={atoms.length === 0}
                        className="p-2 glass-panel bg-white/60 dark:bg-white/10 rounded-lg border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all text-xs disabled:opacity-50"
                        title="Auto-complete"
                      >
                        <Zap className="h-4 w-4 mx-auto" />
                        <div className="text-elixra-secondary">Auto-H</div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Commands */}
            <VoiceCommandSystem
              onCommand={handleVoiceCommand}
              isListening={isVoiceListening}
              onToggleListening={() => setIsVoiceListening(!isVoiceListening)}
              className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-3xl p-4"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-3xl p-6 hover:border-elixra-bunsen/30 transition-all duration-300 relative overflow-hidden group">
              <StaticGrid className="opacity-30" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-elixra-charcoal dark:text-white">{moleculeName}</h2>
                  {atoms.length > 0 && (
                    <p className="text-sm text-elixra-secondary font-mono">
                      {getMolecularFormula(atoms)} • {calculateMolecularWeight(atoms).toFixed(2)} g/mol
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {selectedElement && (
                    <motion.button
                      onClick={() => {
                        setPendingDropElement(selectedElement)
                        setPendingDropPosition(null)
                        setShowBondDialog(true)
                      }}
                      className="btn-primary flex items-center gap-2 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="h-4 w-4" />
                      Add {selectedElement.symbol}
                    </motion.button>
                  )}
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing || atoms.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-elixra-bunsen to-elixra-bunsen-dark text-white rounded-lg shadow-lg shadow-elixra-bunsen/20 hover:shadow-elixra-bunsen/40 hover:scale-105 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        AI Analysis
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={clearAll}
                    className="p-2 bg-elixra-error/10 hover:bg-elixra-error/20 text-elixra-error border border-elixra-error/20 hover:border-elixra-error/40 rounded-xl transition-all"
                    title="Clear All"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 3D Viewer */}
              <div style={{ height: '500px' }} className="mb-6 relative z-10">
                <MoleculeDropZone onDrop={handleDropAtom}>
                  <EnhancedMolecule3DViewer
                    atoms={atoms}
                    bonds={bonds}
                    onSelectAtom={handleSelectAtom}
                    onSelectBond={handleSelectBond}
                    selectedAtomId={selectedAtomId}
                    selectedBondId={selectedBondId}
                    onCanvasClick={handleCanvasClick}
                    controlsRef={orbitControlsRef}
                    enablePerformanceOptimizations={atoms.length > 50}
                  />
                </MoleculeDropZone>
              </div>

              {/* Selected Atom/Bond Info */}
              {(selectedAtomId || selectedBondId) && (
                <div className="mb-6 p-4 bg-elixra-bunsen/10 border border-elixra-bunsen/20 rounded-2xl relative z-10">
                  {selectedAtomId && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-elixra-charcoal dark:text-white">
                          Selected Atom: {atoms.find(a => a.id === selectedAtomId)?.element}
                        </div>
                        <button
                          onClick={() => removeAtom(selectedAtomId)}
                          className="text-sm text-elixra-error hover:text-elixra-error-dark px-3 py-1 rounded-lg border border-elixra-error/20 hover:border-elixra-error/40 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-sm text-elixra-secondary">
                        Position: ({atoms.find(a => a.id === selectedAtomId)?.x.toFixed(1)}, 
                        {atoms.find(a => a.id === selectedAtomId)?.y.toFixed(1)}, 
                        {atoms.find(a => a.id === selectedAtomId)?.z.toFixed(1)})
                      </div>
                    </div>
                  )}
                  
                  {selectedBondId && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-elixra-charcoal dark:text-white">
                          Selected Bond: {bonds.find(b => b.id === selectedBondId)?.type}
                        </div>
                        <button
                          onClick={() => removeBond(selectedBondId)}
                          className="text-sm text-elixra-error hover:text-elixra-error-dark px-3 py-1 rounded-lg border border-elixra-error/20 hover:border-elixra-error/40 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6 relative z-10">
                <div className="glass-panel bg-white/40 dark:bg-elixra-bunsen/10 border border-elixra-bunsen/20 rounded-xl p-3 text-center backdrop-blur-sm hover:border-elixra-bunsen/40 transition-all">
                  <div className="text-2xl font-bold text-elixra-bunsen">{atoms.length}</div>
                  <div className="text-xs text-elixra-secondary uppercase tracking-wide">Atoms</div>
                </div>

                <div className="glass-panel bg-white/40 dark:bg-elixra-success/10 border border-elixra-success/20 rounded-xl p-3 text-center backdrop-blur-sm hover:border-elixra-success/40 transition-all">
                  <div className="text-2xl font-bold text-elixra-success">{bonds.length}</div>
                  <div className="text-xs text-elixra-secondary uppercase tracking-wide">Bonds</div>
                </div>

                <div className="glass-panel bg-white/40 dark:bg-elixra-copper/10 border border-elixra-copper/20 rounded-xl p-3 text-center backdrop-blur-sm hover:border-elixra-copper/40 transition-all">
                  <div className="text-2xl font-bold text-elixra-copper">
                    {new Set(atoms.map(a => a.element)).size}
                  </div>
                  <div className="text-xs text-elixra-secondary uppercase tracking-wide">Elements</div>
                </div>

                <div className="glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle rounded-xl p-3 text-center backdrop-blur-sm hover:border-elixra-border-subtle/40 transition-all">
                  <div className="text-2xl font-bold text-elixra-charcoal dark:text-white">{qualityLevel.toUpperCase()}</div>
                  <div className="text-xs text-elixra-secondary uppercase tracking-wide">Quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}