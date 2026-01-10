'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Atom as AtomIcon, Plus, Trash2, RotateCw } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import Molecule3DViewer from '@/components/Molecule3DViewer'
import MoleculeDropZone from '@/components/MoleculeDropZone'
import ElementDragSource from '@/components/ElementDragSource'
import { AtomMenu, BondMenu } from '@/components/InteractionMenu'
import AtomBondDialog from '@/components/AtomBondDialog'
import { BondExplanation } from '@/components/BondExplanation'
import { useRef } from 'react'
import { Atom, Bond, Element } from '@/types/molecule'
import {
  calculateBonds,
  getMolecularFormula,
  calculateMolecularWeight,
  updateBondsOnMove,
  canFormBond,
} from '@/lib/bondingLogic'

const ELEMENTS: Element[] = [
  { symbol: 'H', name: 'Hydrogen', color: '#FFFFFF' },
  { symbol: 'C', name: 'Carbon', color: '#909090' },
  { symbol: 'N', name: 'Nitrogen', color: '#3050F8' },
  { symbol: 'O', name: 'Oxygen', color: '#FF0D0D' },
  { symbol: 'S', name: 'Sulfur', color: '#FFFF30' },
  { symbol: 'P', name: 'Phosphorus', color: '#FF8000' },
  { symbol: 'Cl', name: 'Chlorine', color: '#1FF01F' },
  { symbol: 'Br', name: 'Bromine', color: '#A62929' },
]

const COMMON_MOLECULES = [
  {
    name: 'Water (H₂O)',
    atoms: [
      { id: '1', element: 'O', x: 0, y: 0, z: 0, color: '#FF0D0D' },
      { id: '2', element: 'H', x: -1, y: 1, z: 0, color: '#FFFFFF' },
      { id: '3', element: 'H', x: 1, y: 1, z: 0, color: '#FFFFFF' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'single' as const },
      { id: 'b2', from: '1', to: '3', type: 'single' as const },
    ]
  },
  {
    name: 'Methane (CH₄)',
    atoms: [
      { id: '1', element: 'C', x: 0, y: 0, z: 0, color: '#909090' },
      { id: '2', element: 'H', x: 1, y: 1, z: 1, color: '#FFFFFF' },
      { id: '3', element: 'H', x: -1, y: -1, z: 1, color: '#FFFFFF' },
      { id: '4', element: 'H', x: -1, y: 1, z: -1, color: '#FFFFFF' },
      { id: '5', element: 'H', x: 1, y: -1, z: -1, color: '#FFFFFF' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'single' as const },
      { id: 'b2', from: '1', to: '3', type: 'single' as const },
      { id: 'b3', from: '1', to: '4', type: 'single' as const },
      { id: 'b4', from: '1', to: '5', type: 'single' as const },
    ]
  },
  {
    name: 'Carbon Dioxide (CO₂)',
    atoms: [
      { id: '1', element: 'C', x: 0, y: 0, z: 0, color: '#909090' },
      { id: '2', element: 'O', x: -2, y: 0, z: 0, color: '#FF0D0D' },
      { id: '3', element: 'O', x: 2, y: 0, z: 0, color: '#FF0D0D' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'double' as const },
      { id: 'b2', from: '1', to: '3', type: 'double' as const },
    ]
  },
  {
    name: 'Ammonia (NH₃)',
    atoms: [
      { id: '1', element: 'N', x: 0, y: 0, z: 0, color: '#3050F8' },
      { id: '2', element: 'H', x: 1, y: 1, z: 0, color: '#FFFFFF' },
      { id: '3', element: 'H', x: -1, y: 1, z: 0, color: '#FFFFFF' },
      { id: '4', element: 'H', x: 0, y: -1, z: 1, color: '#FFFFFF' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'single' as const },
      { id: 'b2', from: '1', to: '3', type: 'single' as const },
      { id: 'b3', from: '1', to: '4', type: 'single' as const },
    ]
  },
]

export default function MoleculesPage() {
  const [atoms, setAtoms] = useState<Atom[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [selectedElement, setSelectedElement] = useState('C')
  const [moleculeName, setMoleculeName] = useState('Custom Molecule')
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null)
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showBondDialog, setShowBondDialog] = useState(false)
  const [pendingDropElement, setPendingDropElement] = useState<Element | null>(null)
  const [pendingDropPosition, setPendingDropPosition] = useState<{ x: number; y: number; z: number } | null>(null)

  const FIXED_BOND_DISTANCE = 1.8

  const handleDropAtom = (element: Element, position?: { x: number; y: number; z: number }) => {
    setPendingDropElement(element)
    setPendingDropPosition(position || null)
    setShowBondDialog(true)
  }

  const loadMolecule = (molecule: typeof COMMON_MOLECULES[0]) => {
    setAtoms(molecule.atoms)
    setBonds(molecule.bonds)
    setMoleculeName(molecule.name)
    setSelectedAtomId(null)
    setSelectedBondId(null)
  }

  const addAtom = useCallback((element?: Element, position?: { x: number; y: number; z: number } | null, bondsToCreate?: Array<{ atomId: string; bondType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' }>) => {
    const el = element || ELEMENTS.find(e => e.symbol === selectedElement)
    if (!el) return

    let finalPosition: { x: number; y: number; z: number } | null = null
    
    // Determine the reference atom for positioning (first bond's atomId if available)
    const referenceAtomId = bondsToCreate && bondsToCreate.length > 0 ? bondsToCreate[0].atomId : null
    
    // Always find a position that's 3+ units away from ALL atoms
    let attempts = 0
    const maxAttempts = 100
    
    while (!finalPosition && attempts < maxAttempts) {
      let candidatePos: { x: number; y: number; z: number }
      
      if (referenceAtomId) {
        // If bonding to atoms, place around the first reference atom (3.5 units away)
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

    // If no valid position found after many attempts, place it anyway
    if (!finalPosition) {
      finalPosition = {
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5
      }
    }

    const newAtom: Atom = {
      id: `atom-${Date.now()}`,
      element: el.symbol,
      x: finalPosition.x,
      y: finalPosition.y,
      z: finalPosition.z,
      color: el.color
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
      console.log('Creating bonds:', newBonds)
      setBonds([...bonds, ...newBonds])
    } else {
      const newBonds = calculateBonds(updatedAtoms)
      setBonds(newBonds)
    }
  }, [atoms, bonds, selectedElement])

  const removeAtom = useCallback((id: string) => {
    const updatedAtoms = atoms.filter(a => a.id !== id)
    setAtoms(updatedAtoms)
    setBonds(bonds.filter(b => b.from !== id && b.to !== id))
    setSelectedAtomId(null)
  }, [atoms, bonds])

  const removeBond = useCallback((id: string) => {
    setBonds(bonds.filter(b => b.id !== id))
    setSelectedBondId(null)
  }, [bonds])

  const changeBondType = useCallback((bondId: string, newType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen') => {
    const bond = bonds.find(b => b.id === bondId)
    if (!bond) return

    const fromAtom = atoms.find(a => a.id === bond.from)
    const toAtom = atoms.find(a => a.id === bond.to)

    if (!fromAtom || !toAtom) return

    if (canFormBond(fromAtom, toAtom, bonds, newType)) {
      setBonds(bonds.map(b => b.id === bondId ? { ...b, type: newType } : b))
    }
  }, [atoms, bonds])

  const clearAll = useCallback(() => {
    setAtoms([])
    setBonds([])
    setMoleculeName('Custom Molecule')
    setSelectedAtomId(null)
    setSelectedBondId(null)
  }, [])

  const analyzeMolecule = async () => {
    if (atoms.length === 0) return

    setAnalyzing(true)
    try {
      const formula = getMolecularFormula(atoms)
      const response = await fetch('/api/molecules/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula, atoms })
      })

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
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

  const orbitControlsRef = useRef<any>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
        </div>

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

        {/* Navbar */}
        <ModernNavbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Element Selector */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all duration-300">
                <h2 className="text-lg font-bold text-white mb-4">Elements</h2>
                <div className="grid grid-cols-2 gap-3">
                  {ELEMENTS.map(element => (
                    <ElementDragSource
                      key={element.symbol}
                      element={element}
                      isSelected={selectedElement === element.symbol}
                      onClick={() => setSelectedElement(element.symbol)}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    const el = ELEMENTS.find(e => e.symbol === selectedElement)
                    if (el) {
                      setPendingDropElement(el)
                      setPendingDropPosition(null)
                      setShowBondDialog(true)
                    }
                  }}
                  className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Atom</span>
                </button>
              </div>

              {/* Common Molecules */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all duration-300">
                <h2 className="text-lg font-bold text-white mb-4">Common Molecules</h2>
                <div className="space-y-3">
                  {COMMON_MOLECULES.map(molecule => (
                    <button
                      key={molecule.name}
                      onClick={() => loadMolecule(molecule)}
                      className="w-full text-left p-4 rounded-xl border-2 border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300 group"
                    >
                      <div className="font-semibold text-white text-sm mb-1 group-hover:text-purple-200 transition-colors">
                        {molecule.name}
                      </div>
                      <div className="text-xs text-gray-400 font-mono group-hover:text-gray-300 transition-colors">
                        {getMolecularFormula(molecule.atoms)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Viewer */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all duration-300">
                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{moleculeName}</h2>
                    {atoms.length > 0 && (
                      <p className="text-sm text-gray-400 font-mono">
                        {getMolecularFormula(atoms)} • {calculateMolecularWeight(atoms).toFixed(2)} g/mol
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {atoms.length > 0 && (
                      <button
                        onClick={analyzeMolecule}
                        disabled={analyzing}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 text-sm font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                      >
                        {analyzing ? 'Analyzing...' : '✨ AI Analysis'}
                      </button>
                    )}
                    <button
                      onClick={() => {}}
                      className="p-2 bg-white/10 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
                      title="Reset View"
                    >
                      <RotateCw className="h-5 w-5" />
                    </button>
                    <button
                      onClick={clearAll}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-300"
                      title="Clear All"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* 3D Viewer */}
                <div style={{ height: '500px' }} className="mb-6">
                  <MoleculeDropZone onDrop={handleDropAtom}>
                    <Molecule3DViewer
                      atoms={atoms}
                      bonds={bonds}
                      onSelectAtom={handleSelectAtom}
                      onSelectBond={handleSelectBond}
                      selectedAtomId={selectedAtomId}
                      selectedBondId={selectedBondId}
                      onCanvasClick={handleCanvasClick}
                      controlsRef={orbitControlsRef}
                    />
                  </MoleculeDropZone>
                </div>

                {/* Interaction Menu */}
                {selectedAtomId && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl">
                    <AtomMenu
                      atom={atoms.find(a => a.id === selectedAtomId)!}
                      onRemove={() => removeAtom(selectedAtomId)}
                      onClose={() => setSelectedAtomId(null)}
                    />
                  </div>
                )}

                {selectedBondId && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl">
                    <BondMenu
                      bond={bonds.find(b => b.id === selectedBondId)!}
                      atoms={atoms}
                      onChangeBondType={(type) => changeBondType(selectedBondId, type)}
                      onRemove={() => removeBond(selectedBondId)}
                      onClose={() => setSelectedBondId(null)}
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-600/30 to-blue-500/20 border border-blue-400/40 rounded-xl p-3 text-center backdrop-blur-sm hover:border-blue-400/60 transition-all">
                    <div className="text-2xl font-bold text-blue-300 mb-1">{atoms.length}</div>
                    <div className="text-xs text-blue-200 font-semibold uppercase tracking-wide">Atoms</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-600/30 to-green-500/20 border border-green-400/40 rounded-xl p-3 text-center backdrop-blur-sm hover:border-green-400/60 transition-all">
                    <div className="text-2xl font-bold text-green-300 mb-1">{bonds.length}</div>
                    <div className="text-xs text-green-200 font-semibold uppercase tracking-wide">Bonds</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/30 to-purple-500/20 border border-purple-400/40 rounded-xl p-3 text-center backdrop-blur-sm hover:border-purple-400/60 transition-all">
                    <div className="text-2xl font-bold text-purple-300 mb-1">
                      {new Set(atoms.map(a => a.element)).size}
                    </div>
                    <div className="text-xs text-purple-200 font-semibold uppercase tracking-wide">Elements</div>
                  </div>
                </div>

                {/* Bond Explanation */}
                {atoms.length > 0 && (
                  <div className="mb-6">
                    <BondExplanation
                      moleculeName={moleculeName}
                      atoms={atoms}
                      bonds={bonds}
                      selectedBondId={selectedBondId}
                    />
                  </div>
                )}

                {/* AI Analysis Results */}
                {analysis && (
                  <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-xl p-5 border border-purple-400/30 shadow-lg shadow-purple-500/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-xl">✨</span> Analysis
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-1">Name</h4>
                        <p className="text-gray-200 text-sm">{analysis.commonName}</p>
                        {analysis.iupacName && (
                          <p className="text-xs text-gray-400 mt-1">IUPAC: {analysis.iupacName}</p>
                        )}
                      </div>

                      {analysis.properties && (
                        <div>
                          <h4 className="font-semibold text-white text-sm mb-2">Properties</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-2 backdrop-blur-sm">
                              <div className="text-xs text-gray-400">Geometry</div>
                              <div className="font-medium text-white text-sm">{analysis.properties.geometry}</div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-2 backdrop-blur-sm">
                              <div className="text-xs text-gray-400">Polarity</div>
                              <div className="font-medium text-white text-sm">{analysis.properties.polarity}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysis.uses && analysis.uses.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white text-sm mb-2">Uses</h4>
                          <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                            {analysis.uses.slice(0, 3).map((use: string, i: number) => (
                              <li key={i}>{use}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}
