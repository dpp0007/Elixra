'use client'

import React, { useState } from 'react'
import { SpectrumData, Sample, SpectroscopyType } from '@/types/spectroscopy'
import { Copy, X } from 'lucide-react'

interface SpectrumComparisonProps {
  currentSpectrum: SpectrumData
  currentSample: Sample
  allSamples: Sample[]
  spectroscopyType: SpectroscopyType
  onComparisonChange?: (spectrum: SpectrumData | null) => void // Updated to lift state up
  onModeChange?: (mode: 'side-by-side' | 'overlay') => void // Updated to lift state up
}

export default function SpectrumComparison({
  currentSpectrum,
  currentSample,
  allSamples,
  spectroscopyType,
  onComparisonChange,
  onModeChange
}: SpectrumComparisonProps) {
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>(
    'side-by-side'
  )
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)

  // Get available samples for comparison (must have the same spectroscopy type)
  const availableSamples = allSamples.filter(
    (s) =>
      s.id !== currentSample.id &&
      s.spectra[spectroscopyType] !== undefined
  )

  const handleSelectSample = (sample: Sample) => {
    setSelectedSample(sample)
    const spectrum2 = sample.spectra[spectroscopyType]
    if (spectrum2) {
      onComparisonChange?.(spectrum2) // Only send the comparison spectrum
    }
  }

  const handleModeChange = (mode: 'side-by-side' | 'overlay') => {
    setComparisonMode(mode)
    onModeChange?.(mode)
  }

  const handleClearComparison = () => {
    setIsComparing(false)
    setSelectedSample(null)
    onComparisonChange?.(null)
  }

  if (!isComparing) {
    return (
      <button
        onClick={() => setIsComparing(true)}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
      >
        <Copy className="h-5 w-5" />
        Compare Spectra
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Copy className="h-5 w-5 text-purple-400" />
          Compare Spectra
        </h3>
        <button
          onClick={handleClearComparison}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Mode Selection */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Display Mode
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('side-by-side')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all ${
              comparisonMode === 'side-by-side'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => handleModeChange('overlay')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all ${
              comparisonMode === 'overlay'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Overlay
          </button>
        </div>
      </div>

      {/* Sample Selection */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Select Sample to Compare
        </div>
        {availableSamples.length === 0 ? (
          <div className="text-sm text-gray-400 p-4 bg-white/5 rounded-lg border border-white/10">
            No other samples available for {spectroscopyType.toUpperCase()} spectroscopy.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableSamples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedSample?.id === sample.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold text-white text-sm">
                  {sample.name}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  {sample.formula}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Selection Info */}
      {selectedSample && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Comparison Setup
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Spectrum 1:</span>
              <span className="text-blue-300 font-semibold">{currentSample.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Spectrum 2:</span>
              <span className="text-orange-300 font-semibold">{selectedSample.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Mode:</span>
              <span className="text-purple-300 font-semibold capitalize">
                {comparisonMode}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
        <div className="text-xs text-blue-200">
          💡 Comparing spectra helps identify similarities and differences between molecules.
          Look for peaks that appear in one spectrum but not the other.
        </div>
      </div>
    </div>
  )
}
