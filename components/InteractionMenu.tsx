'use client'

import { X, Trash2 } from 'lucide-react'
import { Atom, Bond } from '@/types/molecule'

interface AtomMenuProps {
  atom: Atom
  onRemove: () => void
  onClose: () => void
}

export function AtomMenu({ atom, onRemove, onClose }: AtomMenuProps) {
  const ATOMIC_NUMBERS: Record<string, number> = {
    H: 1, C: 6, N: 7, O: 8, S: 16, P: 15, Cl: 17, Br: 35,
  }

  const ATOMIC_WEIGHTS: Record<string, number> = {
    H: 1.008, C: 12.011, N: 14.007, O: 15.999, S: 32.06, P: 30.974, Cl: 35.45, Br: 79.904,
  }

  const ELEMENT_NAMES: Record<string, string> = {
    H: 'Hydrogen', C: 'Carbon', N: 'Nitrogen', O: 'Oxygen', S: 'Sulfur', P: 'Phosphorus', Cl: 'Chlorine', Br: 'Bromine',
  }

  return (
    <div className="bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-blue-600/40 backdrop-blur-2xl border border-blue-400/40 rounded-3xl p-6 shadow-2xl min-w-max">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: atom.color }}
            >
              {atom.element}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{ELEMENT_NAMES[atom.element] || atom.element}</h3>
              <p className="text-sm text-blue-200">#{ATOMIC_NUMBERS[atom.element] || '?'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-gray-300 hover:text-white" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-3">
              <p className="text-sm text-blue-200">Mass</p>
              <p className="font-bold text-white text-lg">{ATOMIC_WEIGHTS[atom.element]?.toFixed(2) || '?'}</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-3">
              <p className="text-sm text-purple-200">Atomic #</p>
              <p className="font-bold text-white text-lg">{ATOMIC_NUMBERS[atom.element] || '?'}</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
            <p className="text-sm text-blue-200">Pos: ({atom.x.toFixed(1)}, {atom.y.toFixed(1)}, {atom.z.toFixed(1)})</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRemove}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/30 hover:bg-red-500/40 text-red-200 hover:text-red-100 rounded-xl transition-all text-sm font-bold border border-red-400/30"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded-xl transition-all text-sm font-bold border border-blue-400/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

interface BondMenuProps {
  bond: Bond
  atoms: Atom[]
  onChangeBondType: (type: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen') => void
  onRemove: () => void
  onClose: () => void
}

export function BondMenu({
  bond,
  atoms,
  onChangeBondType,
  onRemove,
  onClose,
}: BondMenuProps) {
  const fromAtom = atoms.find(a => a.id === bond.from)
  const toAtom = atoms.find(a => a.id === bond.to)

  if (!fromAtom || !toAtom) return null

  const distance = Math.sqrt(
    Math.pow(fromAtom.x - toAtom.x, 2) +
    Math.pow(fromAtom.y - toAtom.y, 2) +
    Math.pow(fromAtom.z - toAtom.z, 2)
  )

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
      case 'single': return 'Single Covalent'
      case 'double': return 'Double Covalent'
      case 'triple': return 'Triple Covalent'
      case 'ionic': return 'Ionic'
      case 'hydrogen': return 'Hydrogen'
      default: return type
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-blue-600/40 backdrop-blur-2xl border border-blue-400/40 rounded-3xl p-6 shadow-2xl min-w-max">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: fromAtom.color }}
              >
                {fromAtom.element}
              </div>
              <span className="text-blue-200 font-bold">—</span>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: toAtom.color }}
              >
                {toAtom.element}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{fromAtom.element}–{toAtom.element}</h3>
              <p className="text-sm text-blue-200">{getBondDescription(bond.type)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-gray-300 hover:text-white" />
          </button>
        </div>

        {/* Bond Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-3">
              <p className="text-sm text-blue-200">Bond Type</p>
              <p className="font-bold text-white text-lg">{getBondLabel(bond.type)}</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-3">
              <p className="text-sm text-purple-200">Distance</p>
              <p className="font-bold text-white text-lg">{distance.toFixed(2)} Å</p>
            </div>
          </div>
        </div>

        {/* Bond Type Selection */}
        <div className="pt-2">
          <p className="text-sm font-bold text-blue-200 mb-3">Change bond type:</p>
          <div className="grid grid-cols-5 gap-2">
            {(['single', 'double', 'triple', 'ionic', 'hydrogen'] as const).map(type => (
              <button
                key={type}
                onClick={() => onChangeBondType(type)}
                title={getBondDescription(type)}
                className={`px-2 py-2 rounded-lg transition-all font-bold text-sm border ${
                  bond.type === type
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-blue-500/10 border-blue-400/20 text-blue-200 hover:border-blue-400/40 hover:bg-blue-500/20'
                }`}
              >
                {getBondLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRemove}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/30 hover:bg-red-500/40 text-red-200 hover:text-red-100 rounded-xl transition-all text-sm font-bold border border-red-400/30"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded-xl transition-all text-sm font-bold border border-blue-400/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
