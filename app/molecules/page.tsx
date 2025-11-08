'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Atom, Plus, Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

interface Atom {
  id: string
  element: string
  x: number
  y: number
  z: number
  color: string
}

interface Bond {
  id: string
  from: string
  to: string
  type: 'single' | 'double' | 'triple'
}

const ELEMENTS = [
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
    formula: 'H₂O',
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
    formula: 'CH₄',
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
    formula: 'CO₂',
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
    formula: 'NH₃',
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
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [moleculeName, setMoleculeName] = useState('Custom Molecule')
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const loadMolecule = (molecule: typeof COMMON_MOLECULES[0]) => {
    setAtoms(molecule.atoms)
    setBonds(molecule.bonds)
    setMoleculeName(molecule.name)
  }

  const addAtom = () => {
    const element = ELEMENTS.find(e => e.symbol === selectedElement)
    if (!element) return

    const newAtom: Atom = {
      id: `atom-${Date.now()}`,
      element: element.symbol,
      x: Math.random() * 4 - 2,
      y: Math.random() * 4 - 2,
      z: Math.random() * 4 - 2,
      color: element.color
    }
    setAtoms([...atoms, newAtom])
  }

  const removeAtom = (id: string) => {
    setAtoms(atoms.filter(a => a.id !== id))
    setBonds(bonds.filter(b => b.from !== id && b.to !== id))
  }

  const clearAll = () => {
    setAtoms([])
    setBonds([])
    setMoleculeName('Custom Molecule')
  }

  const getMolecularFormula = () => {
    const elementCounts: Record<string, number> = {}
    atoms.forEach(atom => {
      elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1
    })

    return Object.entries(elementCounts)
      .sort(([a], [b]) => {
        // C first, then H, then alphabetical
        if (a === 'C') return -1
        if (b === 'C') return 1
        if (a === 'H') return -1
        if (b === 'H') return 1
        return a.localeCompare(b)
      })
      .map(([element, count]) => `${element}${count > 1 ? count : ''}`)
      .join('')
  }

  const analyzeMolecule = async () => {
    if (atoms.length === 0) return

    setAnalyzing(true)
    try {
      const formula = getMolecularFormula()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background - matching features page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
      </div>

      {/* Modern Navbar */}
      <ModernNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Element Selector */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all duration-300">
              <h2 className="text-lg font-bold text-white mb-4">
                Elements
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {ELEMENTS.map(element => (
                  <button
                    key={element.symbol}
                    onClick={() => setSelectedElement(element.symbol)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${selectedElement === element.symbol
                      ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/30 scale-105'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                      style={{ backgroundColor: element.color }}
                    >
                      {element.symbol}
                    </div>
                    <div className="text-xs text-gray-300 text-center font-medium">
                      {element.name}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={addAtom}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Add Atom</span>
              </button>
            </div>

            {/* Common Molecules */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all duration-300">
              <h2 className="text-lg font-bold text-white mb-4">
                Common Molecules
              </h2>
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
                      {molecule.formula}
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
                  <h2 className="text-xl font-bold text-white">
                    {moleculeName}
                  </h2>
                  {atoms.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {getMolecularFormula()}
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
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 bg-white/10 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    className="p-2 bg-white/10 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setRotation({ x: 0, y: 0 })}
                    className="p-2 bg-white/10 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
                    title="Reset Rotation"
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
              <div
                className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-inner"
                style={{ height: '500px' }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="-10 -10 20 20"
                  className="cursor-move"
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      setRotation({
                        x: rotation.x + e.movementY * 0.5,
                        y: rotation.y + e.movementX * 0.5
                      })
                    }
                  }}
                >
                  <g transform={`scale(${zoom}) rotate(${rotation.y})`}>
                    {/* Bonds */}
                    {bonds.map(bond => {
                      const fromAtom = atoms.find(a => a.id === bond.from)
                      const toAtom = atoms.find(a => a.id === bond.to)
                      if (!fromAtom || !toAtom) return null

                      return (
                        <line
                          key={bond.id}
                          x1={fromAtom.x}
                          y1={fromAtom.y}
                          x2={toAtom.x}
                          y2={toAtom.y}
                          stroke="#666"
                          strokeWidth={bond.type === 'triple' ? 0.3 : bond.type === 'double' ? 0.2 : 0.15}
                          className="dark:stroke-gray-400"
                        />
                      )
                    })}

                    {/* Atoms */}
                    {atoms.map(atom => (
                      <g key={atom.id}>
                        <circle
                          cx={atom.x}
                          cy={atom.y}
                          r={0.8}
                          fill={atom.color}
                          stroke="#333"
                          strokeWidth={0.1}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => removeAtom(atom.id)}
                        />
                        <text
                          x={atom.x}
                          y={atom.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="0.6"
                          fill={atom.element === 'H' ? '#000' : '#fff'}
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {atom.element}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>

                {atoms.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Atom className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Add atoms or load a common molecule
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl p-4 text-center backdrop-blur-xl">
                  <div className="text-3xl font-bold text-blue-300 mb-1">
                    {atoms.length}
                  </div>
                  <div className="text-sm text-blue-200 font-medium">
                    Atoms
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-4 text-center backdrop-blur-xl">
                  <div className="text-3xl font-bold text-green-300 mb-1">
                    {bonds.length}
                  </div>
                  <div className="text-sm text-green-200 font-medium">
                    Bonds
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-4 text-center backdrop-blur-xl">
                  <div className="text-3xl font-bold text-purple-300 mb-1">
                    {new Set(atoms.map(a => a.element)).size}
                  </div>
                  <div className="text-sm text-purple-200 font-medium">
                    Elements
                  </div>
                </div>
              </div>

              {/* AI Analysis Results */}
              {analysis && (
                <div className="mt-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-400/40 shadow-lg shadow-purple-500/20">
                  <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center gap-2">
                    ✨ AI Analysis Results
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-1">Name</h4>
                      <p className="text-gray-200">{analysis.commonName}</p>
                      {analysis.iupacName && (
                        <p className="text-sm text-gray-300">IUPAC: {analysis.iupacName}</p>
                      )}
                    </div>

                    {analysis.properties && (
                      <div>
                        <h4 className="font-semibold text-white mb-2">Properties</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 border border-white/20 rounded-xl p-3 backdrop-blur-sm">
                            <div className="text-xs text-gray-300">Geometry</div>
                            <div className="font-medium text-white">{analysis.properties.geometry}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Polarity</div>
                            <div className="font-medium text-gray-900 dark:text-white">{analysis.properties.polarity}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysis.uses && analysis.uses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Uses</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
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
