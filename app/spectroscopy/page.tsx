'use client'

import { useState } from 'react'
import { Activity, Waves, Atom as AtomIcon, Plus } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import SpectrumGraph from '@/components/SpectrumGraph'
import SpectrumExplanation from '@/components/SpectrumExplanation'
import SpectrumMoleculeLinker from '@/components/SpectrumMoleculeLinker'
import SpectrumComparison from '@/components/SpectrumComparison'
import { Peak, Sample, SpectroscopyType } from '@/types/spectroscopy'
import { getAllSamples } from '@/lib/spectrumData'
import { formatSpectrumForDisplay } from '@/lib/spectrumHandlers'

const SPECTROSCOPY_TYPES = [
  {
    id: 'uv-vis' as SpectroscopyType,
    name: 'UV-Vis Spectroscopy',
    description: 'Measures absorption of ultraviolet and visible light',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'ir' as SpectroscopyType,
    name: 'IR Spectroscopy',
    description: 'Identifies functional groups via infrared absorption',
    icon: Waves,
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'nmr' as SpectroscopyType,
    name: 'NMR Spectroscopy',
    description: 'Nuclear magnetic resonance for molecular structure',
    icon: AtomIcon,
    color: 'from-green-500 to-emerald-500',
  },
]

// Helper function to get spectrum
function getSpectrum(sampleId: string, type: SpectroscopyType) {
  const allSamples = getAllSamples()
  const sample = allSamples.find(s => s.id === sampleId)
  if (!sample) return null
  return sample.spectra[type]
}

// Helper function to get sample
function getSample(sampleId: string) {
  const allSamples = getAllSamples()
  return allSamples.find(s => s.id === sampleId)
}

export default function SpectroscopyPage() {
  const allSamples = getAllSamples()
  const [selectedSampleId, setSelectedSampleId] = useState('water')
  const [selectedType, setSelectedType] = useState<SpectroscopyType>('uv-vis')
  const [selectedPeak, setSelectedPeak] = useState<Peak | null>(null)
  const [useCustom, setUseCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customFormula, setCustomFormula] = useState('')
  const [customSamples, setCustomSamples] = useState<Sample[]>([])

  const selectedSample = useCustom 
    ? customSamples.find(s => s.id === selectedSampleId)
    : getSample(selectedSampleId)
  
  const spectrum = selectedSample ? getSpectrum(selectedSample.id, selectedType) : null
  const formattedSpectrum = spectrum ? formatSpectrumForDisplay(spectrum) : null
  const spectType = SPECTROSCOPY_TYPES.find((t) => t.id === selectedType)!

  const handleAddCustom = () => {
    if (!customName || !customFormula) return

    const newSample: Sample = {
      id: `custom-${Date.now()}`,
      name: customName,
      formula: customFormula,
      spectra: {
        'uv-vis': {
          type: 'uv-vis',
          sampleName: customName,
          xMin: 200,
          xMax: 800,
          yMin: 0,
          yMax: 2.5,
          xLabel: 'Wavelength (nm)',
          yLabel: 'Absorbance',
          peaks: [
            {
              id: `${customName}-uv-1`,
              x: 250 + Math.random() * 100,
              y: 0.5 + Math.random() * 1.5,
              label: 'λmax',
              interpretation: `Absorption peak for ${customName}. Electronic transition in the molecule.`,
              molecularFeature: 'Chromophore',
              transitionType: Math.random() > 0.5 ? 'π→π*' : 'n→π*',
            },
          ],
        },
        'ir': {
          type: 'ir',
          sampleName: customName,
          xMin: 400,
          xMax: 4000,
          yMin: 0,
          yMax: 100,
          xLabel: 'Wavenumber (cm⁻¹)',
          yLabel: 'Transmittance (%)',
          xInverted: true,
          peaks: [
            {
              id: `${customName}-ir-1`,
              x: 2900 + Math.random() * 200,
              y: 40 + Math.random() * 30,
              label: 'C-H stretch',
              interpretation: 'Alkyl C-H stretching vibration',
              molecularFeature: 'C-H bonds',
              functionalGroup: 'Alkyl',
            },
            {
              id: `${customName}-ir-2`,
              x: 1700 + Math.random() * 100,
              y: 10 + Math.random() * 20,
              label: 'C=O stretch',
              interpretation: 'Carbonyl stretching vibration',
              molecularFeature: 'C=O bond',
              functionalGroup: 'Carbonyl',
            },
          ],
        },
        'nmr': {
          type: 'nmr',
          sampleName: customName,
          xMin: 0,
          xMax: 10,
          yMin: 0,
          yMax: 100,
          xLabel: 'Chemical Shift (ppm)',
          yLabel: 'Intensity',
          peaks: [
            {
              id: `${customName}-nmr-1`,
              x: 1 + Math.random() * 3,
              y: 80 + Math.random() * 20,
              label: 'Alkyl protons',
              interpretation: 'Protons in alkyl groups',
              molecularFeature: 'Alkyl group',
              multiplicity: 'singlet',
              integration: 3,
            },
            {
              id: `${customName}-nmr-2`,
              x: 3 + Math.random() * 2,
              y: 60 + Math.random() * 20,
              label: 'Protons near heteroatom',
              interpretation: 'Protons deshielded by heteroatom',
              molecularFeature: 'Heteroatom group',
              multiplicity: 'doublet',
              integration: 2,
            },
          ],
        },
      },
    }

    setCustomSamples([...customSamples, newSample])
    setSelectedSampleId(newSample.id)
    setUseCustom(true)
    setCustomName('')
    setCustomFormula('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
      </div>

      <ModernNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{spectType.name}</h1>
          <p className="text-gray-300 text-lg">{spectType.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Spectroscopy Type */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Analysis Type</h2>
              <div className="space-y-3">
                {SPECTROSCOPY_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id)
                        setSelectedPeak(null)
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedType === type.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/30'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">
                            {type.name.split(' ')[0]}
                          </div>
                          <div className="text-xs text-gray-400">
                            {type.name.split(' ').slice(1).join(' ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sample Selection */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Sample</h2>
              
              {/* Toggle between preset and custom */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setUseCustom(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !useCustom
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Preset
                </button>
                <button
                  onClick={() => setUseCustom(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    useCustom
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Custom
                </button>
              </div>

              {!useCustom ? (
                // Preset samples
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-purple-500/50 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:hover:bg-purple-500/70">
                  {allSamples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setSelectedSampleId(sample.id)
                        setSelectedPeak(null)
                        setUseCustom(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedSampleId === sample.id && !useCustom
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-white text-sm">{sample.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{sample.formula}</div>
                    </button>
                  ))}
                </div>
              ) : (
                // Custom sample input and list
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Compound name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Formula (e.g., C₆H₆)"
                    value={customFormula}
                    onChange={(e) => setCustomFormula(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm font-mono focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustom}
                    disabled={!customName || !customFormula}
                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Analyze Compound
                  </button>

                  {/* Custom samples list */}
                  {customSamples.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-purple-500/50 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:hover:bg-purple-500/70">
                      <div className="text-xs text-gray-400 uppercase font-semibold">Your Compounds</div>
                      {customSamples.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => {
                            setSelectedSampleId(sample.id)
                            setSelectedPeak(null)
                          }}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedSampleId === sample.id && useCustom
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{sample.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{sample.formula}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show preset samples as reference */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Preset Samples</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-purple-500/50 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:hover:bg-purple-500/70">
                      {allSamples.map((sample) => (
                        <button
                          key={`preset-${sample.id}`}
                          onClick={() => {
                            setSelectedSampleId(sample.id)
                            setSelectedPeak(null)
                            setUseCustom(false)
                          }}
                          className="w-full text-left p-2 rounded-lg border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all"
                        >
                          <div className="font-semibold text-white text-xs">{sample.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{sample.formula}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedSample && formattedSpectrum ? (
              <>
                {/* Sample Info */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                      <span className="text-sm text-purple-200">Sample: </span>
                      <span className="font-bold text-white">{selectedSample.name}</span>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                      <span className="text-sm text-blue-200">Formula: </span>
                      <span className="font-mono font-bold text-white">{selectedSample.formula}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Graph */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
                  <SpectrumGraph
                    spectrum={formattedSpectrum}
                    onPeakSelected={setSelectedPeak}
                    selectedPeakId={selectedPeak?.id}
                  />
                </div>

                {/* Explanation Panel */}
                <SpectrumExplanation peak={selectedPeak} spectroscopyType={selectedType} />

                {/* Molecule Linker */}
                <SpectrumMoleculeLinker
                  selectedPeak={selectedPeak}
                  spectroscopyType={selectedType}
                />

                {/* Comparison */}
                <SpectrumComparison
                  currentSpectrum={formattedSpectrum}
                  currentSample={selectedSample}
                  allSamples={[...allSamples, ...customSamples]}
                  spectroscopyType={selectedType}
                />
              </>
            ) : (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-12 text-center">
                <p className="text-gray-300 text-lg">
                  {!selectedSample
                    ? 'Select a sample to view its spectrum'
                    : 'This sample does not have data for the selected spectroscopy type'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
