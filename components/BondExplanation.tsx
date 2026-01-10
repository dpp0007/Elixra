'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, AlertCircle, CheckCircle } from 'lucide-react'
import { Atom, Bond } from '@/types/molecule'
import {
  explainMolecule,
  detectUnusualBond,
  checkMoleculeCompleteness,
  BOND_DEFINITIONS,
} from '@/lib/aiBondReasoning'

interface BondExplanationProps {
  moleculeName: string
  atoms: Atom[]
  bonds: Bond[]
  selectedBondId?: string | null
}

export function BondExplanation({
  moleculeName,
  atoms,
  bonds,
  selectedBondId,
}: BondExplanationProps) {
  const [explanation, setExplanation] = useState<string>('')
  const [warning, setWarning] = useState<string | null>(null)
  const [completenessNote, setCompletenessNote] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)

    // Generate explanation
    const newExplanation = explainMolecule(moleculeName, atoms, bonds)
    setExplanation(newExplanation)

    // Check for unusual bonds
    let unusualWarning: string | null = null
    if (selectedBondId) {
      const selectedBond = bonds.find((b) => b.id === selectedBondId)
      if (selectedBond) {
        unusualWarning = detectUnusualBond(selectedBond, atoms)
      }
    }
    setWarning(unusualWarning)

    // Check completeness
    const completenessMsg = checkMoleculeCompleteness(atoms, bonds)
    setCompletenessNote(completenessMsg)

    setIsLoading(false)
  }, [moleculeName, atoms, bonds, selectedBondId])

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-blue-400/20 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-blue-400/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-blue-400/20 rounded w-5/6"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Explanation */}
      <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-2">Bond Analysis</h3>
            <p className="text-gray-200 text-sm leading-relaxed">{explanation}</p>
          </div>
        </div>
      </div>

      {/* Unusual Bond Warning */}
      {warning && (
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-xl border border-orange-400/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-orange-200 mb-2">Interesting Bond!</h3>
              <p className="text-orange-100 text-sm leading-relaxed">{warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Completeness Note */}
      {completenessNote && (
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-cyan-200 mb-2">Molecule Status</h3>
              <p className="text-cyan-100 text-sm leading-relaxed">{completenessNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bond Type Reference */}
      {bonds.length > 0 && (
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white mb-3">Bond Types in This Molecule</h3>
          <div className="space-y-2">
            {Array.from(new Set(bonds.map((b) => b.type))).map((bondType) => {
              const def = BOND_DEFINITIONS[bondType as keyof typeof BOND_DEFINITIONS]
              const count = bonds.filter((b) => b.type === bondType).length
              return (
                <div key={bondType} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-purple-300">{def.label}</span>
                    <span className="font-semibold text-white">{def.name}</span>
                    <span className="text-xs text-gray-400">({count})</span>
                  </div>
                  <p className="text-xs text-gray-300">{def.definition}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
