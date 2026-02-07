'use client'

import React, { useState } from 'react'
import { Peak } from '@/types/spectroscopy'
import { ChevronDown, Lightbulb } from 'lucide-react'

interface SpectrumExplanationProps {
  peak: Peak | null
  spectroscopyType: 'uv-vis' | 'ir' | 'nmr'
}

export default function SpectrumExplanation({
  peak,
  spectroscopyType,
}: SpectrumExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!peak) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Peak Explanation
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
            />
          </button>
        </div>
        {isExpanded && (
          <div className="text-gray-400 text-sm">
            Click on a peak in the spectrum to see its explanation.
          </div>
        )}
      </div>
    )
  }

  // Generate educational explanation based on peak data
  const getExplanation = (): { title: string; description: string; feature: string } => {
    switch (spectroscopyType) {
      case 'uv-vis':
        return {
          title: peak.label,
          description: peak.interpretation,
          feature: peak.molecularFeature || 'Chromophore',
        }
      case 'ir':
        return {
          title: peak.label,
          description: peak.interpretation,
          feature: peak.functionalGroup || peak.molecularFeature || 'Functional group',
        }
      case 'nmr':
        return {
          title: `${peak.label} (${peak.multiplicity || 'singlet'})`,
          description: peak.interpretation,
          feature: peak.molecularFeature ? `${peak.molecularFeature} (${peak.integration || 1}H)` : `Integration: ${peak.integration || 1}H`,
        }
      default:
        return {
          title: peak.label,
          description: peak.interpretation,
          feature: peak.molecularFeature || 'Feature',
        }
    }
  }

  const explanation = getExplanation()

  // Color coding based on type
  const getColorClasses = () => {
    switch (spectroscopyType) {
      case 'uv-vis':
        return {
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-400/30',
          text: 'text-blue-200',
          badge: 'bg-blue-500/30 text-blue-100',
        }
      case 'ir':
        return {
          bg: 'from-red-500/20 to-orange-500/20',
          border: 'border-red-400/30',
          text: 'text-red-200',
          badge: 'bg-red-500/30 text-red-100',
        }
      case 'nmr':
        return {
          bg: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-400/30',
          text: 'text-green-200',
          badge: 'bg-green-500/30 text-green-100',
        }
      default:
        return {
          bg: 'from-purple-500/20 to-pink-500/20',
          border: 'border-purple-400/30',
          text: 'text-purple-200',
          badge: 'bg-purple-500/30 text-purple-100',
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} backdrop-blur-2xl border ${colors.border} rounded-2xl p-6 transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Peak Explanation
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Peak Label */}
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Peak Identification
            </div>
            <div className="text-2xl font-bold text-white">{explanation.title}</div>
          </div>

          {/* Molecular Feature */}
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Molecular Feature
            </div>
            <div className={`inline-block px-3 py-1 rounded-full ${colors.badge} text-sm font-semibold`}>
              {explanation.feature}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Why This Peak Appears
            </div>
            <p className={`${colors.text} text-sm leading-relaxed`}>
              {explanation.description}
            </p>
          </div>

          {/* Additional Info */}
          {spectroscopyType === 'nmr' && peak.multiplicity && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Multiplicity
              </div>
              <div className="text-sm text-white font-mono">
                {peak.multiplicity.charAt(0).toUpperCase() + peak.multiplicity.slice(1)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {peak.multiplicity === 'singlet' && 'No neighboring protons'}
                {peak.multiplicity === 'doublet' && 'One neighboring proton'}
                {peak.multiplicity === 'triplet' && 'Two neighboring protons'}
                {peak.multiplicity === 'quartet' && 'Three neighboring protons'}
              </div>
            </div>
          )}

          {spectroscopyType === 'uv-vis' && peak.transitionType && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Transition Type
              </div>
              <div className="text-sm text-white font-mono">{peak.transitionType}</div>
              <div className="text-xs text-gray-400 mt-1">
                {peak.transitionType === 'π→π*' && 'Aromatic or conjugated system'}
                {peak.transitionType === 'n→π*' && 'Carbonyl or heteroatom'}
              </div>
            </div>
          )}

          {spectroscopyType === 'ir' && peak.functionalGroup && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Functional Group
              </div>
              <div className="text-sm text-white font-mono">{peak.functionalGroup}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
