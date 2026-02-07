'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Atom, Element } from '@/types/molecule'

interface AtomBondDialogProps {
  newElement: Element
  existingAtoms: Atom[]
  onConfirm: (bonds: Array<{ atomId: string; bondType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' }>) => void
  onCancel: () => void
}

export default function AtomBondDialog({
  newElement,
  existingAtoms,
  onConfirm,
  onCancel,
}: AtomBondDialogProps) {
  const [selectedBonds, setSelectedBonds] = useState<Array<{ atomId: string; bondType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' }>>([])

  const handleAddBond = (atomId: string) => {
    if (!selectedBonds.find(b => b.atomId === atomId)) {
      setSelectedBonds([...selectedBonds, { atomId, bondType: 'single' }])
    }
  }

  const handleRemoveBond = (atomId: string) => {
    setSelectedBonds(selectedBonds.filter(b => b.atomId !== atomId))
  }

  const handleChangeBondType = (atomId: string, bondType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen') => {
    setSelectedBonds(selectedBonds.map(b => b.atomId === atomId ? { ...b, bondType } : b))
  }

  const handleConfirm = () => {
    onConfirm(selectedBonds)
  }

  const getBondLabel = (type: string) => {
    switch (type) {
      case 'single': return '—'
      case 'double': return '='
      case 'triple': return '≡'
      case 'ionic': return '↔'
      case 'hydrogen': return '⋯'
      default: return type
    }
  }

  const getBondDescription = (type: string) => {
    switch (type) {
      case 'single': return 'Single'
      case 'double': return 'Double'
      case 'triple': return 'Triple'
      case 'ionic': return 'Ionic'
      case 'hydrogen': return 'Hydrogen'
      default: return type
    }
  }

  const canAddMultipleBonds = existingAtoms.length >= 3

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: newElement.color }}
            >
              {newElement.symbol}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add {newElement.name}</h2>
              <p className="text-xs text-gray-400">Configure bonding</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Available atoms to bond with */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              Available atoms
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
              {existingAtoms.map(atom => {
                const isBonded = selectedBonds.some(b => b.atomId === atom.id)
                return (
                  <button
                    key={atom.id}
                    onClick={() => {
                      if (isBonded) {
                        handleRemoveBond(atom.id)
                      } else {
                        handleAddBond(atom.id)
                      }
                    }}
                    className={`text-left px-4 py-3 rounded-xl transition-all border-2 ${
                      isBonded
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full shadow-lg"
                        style={{ backgroundColor: atom.color }}
                      />
                      <span className="font-medium">{atom.element}</span>
                      {isBonded && <span className="ml-auto text-xs bg-purple-500/30 px-2 py-1 rounded">Selected</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected bonds configuration */}
          {selectedBonds.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                Bond configuration ({selectedBonds.length})
              </p>
              <div className="space-y-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
                {selectedBonds.map(bond => {
                  const atom = existingAtoms.find(a => a.id === bond.atomId)
                  if (!atom) return null
                  return (
                    <div key={bond.atomId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full shadow-lg"
                            style={{ backgroundColor: atom.color }}
                          />
                          <span className="font-semibold text-white">{atom.element}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveBond(bond.atomId)}
                          className="p-1 hover:bg-red-500/20 rounded-lg transition-all text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {(['single', 'double', 'triple', 'ionic', 'hydrogen'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => handleChangeBondType(bond.atomId, type)}
                            title={getBondDescription(type)}
                            className={`px-2 py-2 rounded-lg transition-all font-bold text-sm border-2 ${
                              bond.bondType === type
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            {getBondLabel(type)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Info message */}
          {canAddMultipleBonds && selectedBonds.length === 0 && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
              <p className="text-sm text-blue-200">
                💡 You can bond with multiple atoms. Click atoms above to add bonds.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-semibold border border-white/20 hover:border-white/30"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 border border-purple-400/30"
            >
              Add Atom
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
