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
import { PerspectiveGrid, StaticGrid } from '@/components/GridBackground'

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
    <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-300">
      <PerspectiveGrid />

      <ModernNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-elixra-charcoal dark:text-white mb-2">{spectType.name}</h1>
          <p className="text-elixra-secondary text-lg">{spectType.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Spectroscopy Type */}
            <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-2xl p-6 relative overflow-hidden group">
               <StaticGrid className="opacity-30" />
               <div className="relative z-10">
                <h2 className="text-lg font-bold text-elixra-charcoal dark:text-white mb-4">Analysis Type</h2>
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
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                            selectedType === type.id
                            ? 'border-elixra-bunsen bg-elixra-bunsen/10 shadow-lg shadow-elixra-bunsen/20'
                            : 'border-elixra-border-subtle bg-white/50 dark:bg-white/5 hover:border-elixra-bunsen/30 hover:bg-white/80 dark:hover:bg-white/10'
                        }`}
                        >
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${
                                selectedType === type.id ? 'bg-elixra-bunsen text-white' : 'bg-elixra-charcoal/10 dark:bg-white/10 text-elixra-secondary'
                            }`}>
                            <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                            <div className={`font-semibold text-sm ${selectedType === type.id ? 'text-elixra-bunsen-dark dark:text-elixra-bunsen-light' : 'text-elixra-charcoal dark:text-white'}`}>
                                {type.name.split(' ')[0]}
                            </div>
                            <div className="text-xs text-elixra-secondary">
                                {type.name.split(' ').slice(1).join(' ')}
                            </div>
                            </div>
                        </div>
                        </button>
                    )
                    })}
                </div>
              </div>
            </div>

            {/* Sample Selection */}
            <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-2xl p-6">
              <h2 className="text-lg font-bold text-elixra-charcoal dark:text-white mb-4">Sample</h2>
              
              {/* Toggle between preset and custom */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setUseCustom(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !useCustom
                      ? 'bg-elixra-bunsen text-white shadow-md'
                      : 'bg-white/50 dark:bg-white/10 text-elixra-secondary hover:bg-white/80 dark:hover:bg-white/20'
                  }`}
                >
                  Preset
                </button>
                <button
                  onClick={() => setUseCustom(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    useCustom
                      ? 'bg-elixra-bunsen text-white shadow-md'
                      : 'bg-white/50 dark:bg-white/10 text-elixra-secondary hover:bg-white/80 dark:hover:bg-white/20'
                  }`}
                >
                  Custom
                </button>
              </div>

              {!useCustom ? (
                // Preset samples
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
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
                          ? 'border-elixra-bunsen bg-elixra-bunsen/10'
                          : 'border-elixra-border-subtle bg-white/50 dark:bg-white/5 hover:border-elixra-bunsen/30 hover:bg-white/80 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className={`font-semibold text-sm ${selectedSampleId === sample.id && !useCustom ? 'text-elixra-bunsen-dark dark:text-elixra-bunsen-light' : 'text-elixra-charcoal dark:text-white'}`}>{sample.name}</div>
                      <div className="text-xs text-elixra-secondary font-mono">{sample.formula}</div>
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
                    className="w-full px-3 py-2 bg-white/50 dark:bg-white/10 border border-elixra-border-subtle rounded-lg text-elixra-charcoal dark:text-elixra-cream placeholder-elixra-secondary text-sm focus:border-elixra-bunsen focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Formula (e.g., C₆H₆)"
                    value={customFormula}
                    onChange={(e) => setCustomFormula(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-white/10 border border-elixra-border-subtle rounded-lg text-elixra-charcoal dark:text-white placeholder-elixra-secondary text-sm font-mono focus:border-elixra-bunsen focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustom}
                    disabled={!customName || !customFormula}
                    className="w-full btn-primary disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Analyze Compound
                  </button>

                  {/* Custom samples list */}
                  {customSamples.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="text-xs text-elixra-secondary uppercase font-semibold">Your Compounds</div>
                      {customSamples.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => {
                            setSelectedSampleId(sample.id)
                            setSelectedPeak(null)
                          }}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedSampleId === sample.id && useCustom
                              ? 'border-elixra-bunsen bg-elixra-bunsen/10'
                              : 'border-elixra-border-subtle bg-white/50 dark:bg-white/5 hover:border-elixra-bunsen/30 hover:bg-white/80 dark:hover:bg-white/10'
                          }`}
                        >
                          <div className={`font-semibold text-sm ${selectedSampleId === sample.id && useCustom ? 'text-elixra-bunsen-dark dark:text-elixra-bunsen-light' : 'text-elixra-charcoal dark:text-elixra-cream'}`}>{sample.name}</div>
                          <div className="text-xs text-elixra-secondary font-mono">{sample.formula}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show preset samples as reference */}
                  <div className="mt-4 pt-4 border-t border-elixra-border-subtle">
                    <div className="text-xs text-elixra-secondary uppercase font-semibold mb-2">Preset Samples</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {allSamples.map((sample) => (
                        <button
                          key={`preset-${sample.id}`}
                          onClick={() => {
                            setSelectedSampleId(sample.id)
                            setSelectedPeak(null)
                            setUseCustom(false)
                          }}
                          className="w-full text-left p-2 rounded-lg border border-elixra-border-subtle bg-white/50 dark:bg-white/5 hover:border-elixra-bunsen/30 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                        >
                          <div className="font-semibold text-elixra-charcoal dark:text-white text-xs">{sample.name}</div>
                          <div className="text-xs text-elixra-secondary font-mono">{sample.formula}</div>
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
                <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-2xl p-6">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="px-4 py-2 bg-elixra-bunsen/10 border border-elixra-bunsen/20 rounded-lg">
                      <span className="text-sm text-elixra-secondary">Sample: </span>
                      <span className="font-bold text-elixra-bunsen-dark dark:text-elixra-bunsen-light">{selectedSample.name}</span>
                    </div>
                    <div className="px-4 py-2 bg-elixra-copper/10 border border-elixra-copper/20 rounded-lg">
                      <span className="text-sm text-elixra-secondary">Formula: </span>
                      <span className="font-mono font-bold text-elixra-copper">{selectedSample.formula}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Graph */}
                <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-2xl p-6">
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
              <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-2xl p-12 text-center">
                <p className="text-elixra-secondary text-lg">
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
