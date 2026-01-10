/**
 * Spectrum Data Generator
 * Generates educational spectroscopy data for common samples
 * NOT quantum-accurate, but chemically consistent
 */

import { SpectrumData, Peak, Sample, SpectroscopyType, FunctionalGroupRegion } from '@/types/spectroscopy'

// ============================================================================
// UV-VIS SPECTRA
// ============================================================================

const waterUVVis: SpectrumData = {
  type: 'uv-vis',
  sampleName: 'Water',
  xMin: 200,
  xMax: 800,
  yMin: 0,
  yMax: 2.5,
  xLabel: 'Wavelength (nm)',
  yLabel: 'Absorbance',
  peaks: [
    {
      id: 'water-uv-1',
      x: 167,
      y: 1.8,
      label: 'λmax',
      interpretation: 'O-H n→π* transition (weak)',
      molecularFeature: 'O-H bond',
      transitionType: 'n→π*',
    },
  ],
}

const ethanolUVVis: SpectrumData = {
  type: 'uv-vis',
  sampleName: 'Ethanol',
  xMin: 200,
  xMax: 800,
  yMin: 0,
  yMax: 2.5,
  xLabel: 'Wavelength (nm)',
  yLabel: 'Absorbance',
  peaks: [
    {
      id: 'ethanol-uv-1',
      x: 170,
      y: 1.5,
      label: 'λmax',
      interpretation: 'O-H n→π* transition',
      molecularFeature: 'O-H bond',
      transitionType: 'n→π*',
    },
  ],
}

const benzeneUVVis: SpectrumData = {
  type: 'uv-vis',
  sampleName: 'Benzene',
  xMin: 200,
  xMax: 800,
  yMin: 0,
  yMax: 2.5,
  xLabel: 'Wavelength (nm)',
  yLabel: 'Absorbance',
  peaks: [
    {
      id: 'benzene-uv-1',
      x: 254,
      y: 2.2,
      label: 'λmax (π→π*)',
      interpretation: 'Aromatic π→π* transition (strong)',
      molecularFeature: 'Aromatic ring',
      transitionType: 'π→π*',
    },
    {
      id: 'benzene-uv-2',
      x: 200,
      y: 1.8,
      label: 'Secondary band',
      interpretation: 'Higher energy π→π* transition',
      molecularFeature: 'Aromatic ring',
      transitionType: 'π→π*',
    },
  ],
}

// ============================================================================
// IR SPECTRA
// ============================================================================

const waterIR: SpectrumData = {
  type: 'ir',
  sampleName: 'Water',
  xMin: 400,
  xMax: 4000,
  yMin: 0,
  yMax: 100,
  xLabel: 'Wavenumber (cm⁻¹)',
  yLabel: 'Transmittance (%)',
  xInverted: true,
  peaks: [
    {
      id: 'water-ir-1',
      x: 3300,
      y: 20,
      label: 'O-H stretch',
      interpretation: 'Broad O-H stretch (hydrogen bonding)',
      molecularFeature: 'O-H bond',
      functionalGroup: 'Hydroxyl',
    },
    {
      id: 'water-ir-2',
      x: 1600,
      y: 40,
      label: 'H-O-H bend',
      interpretation: 'Bending vibration of water molecule',
      molecularFeature: 'H-O-H angle',
      functionalGroup: 'Hydroxyl',
    },
  ],
}

const ethanolIR: SpectrumData = {
  type: 'ir',
  sampleName: 'Ethanol',
  xMin: 400,
  xMax: 4000,
  yMin: 0,
  yMax: 100,
  xLabel: 'Wavenumber (cm⁻¹)',
  yLabel: 'Transmittance (%)',
  xInverted: true,
  peaks: [
    {
      id: 'ethanol-ir-1',
      x: 3300,
      y: 15,
      label: 'O-H stretch',
      interpretation: 'Broad O-H stretch (hydrogen bonding)',
      molecularFeature: 'O-H bond',
      functionalGroup: 'Hydroxyl',
    },
    {
      id: 'ethanol-ir-2',
      x: 2900,
      y: 50,
      label: 'C-H stretch',
      interpretation: 'Alkyl C-H stretching vibrations',
      molecularFeature: 'C-H bonds',
      functionalGroup: 'Alkyl',
    },
    {
      id: 'ethanol-ir-3',
      x: 1050,
      y: 30,
      label: 'C-O stretch',
      interpretation: 'C-O stretching vibration',
      molecularFeature: 'C-O bond',
      functionalGroup: 'Ether/Alcohol',
    },
  ],
}

const acetoneIR: SpectrumData = {
  type: 'ir',
  sampleName: 'Acetone',
  xMin: 400,
  xMax: 4000,
  yMin: 0,
  yMax: 100,
  xLabel: 'Wavenumber (cm⁻¹)',
  yLabel: 'Transmittance (%)',
  xInverted: true,
  peaks: [
    {
      id: 'acetone-ir-1',
      x: 2900,
      y: 60,
      label: 'C-H stretch',
      interpretation: 'Alkyl C-H stretching',
      molecularFeature: 'C-H bonds',
      functionalGroup: 'Alkyl',
    },
    {
      id: 'acetone-ir-2',
      x: 1715,
      y: 10,
      label: 'C=O stretch',
      interpretation: 'Strong carbonyl stretch (ketone)',
      molecularFeature: 'C=O bond',
      functionalGroup: 'Carbonyl',
    },
  ],
}

// ============================================================================
// NMR SPECTRA
// ============================================================================

const waterNMR: SpectrumData = {
  type: 'nmr',
  sampleName: 'Water',
  xMin: 0,
  xMax: 10,
  yMin: 0,
  yMax: 100,
  xLabel: 'Chemical Shift (ppm)',
  yLabel: 'Intensity',
  peaks: [
    {
      id: 'water-nmr-1',
      x: 4.7,
      y: 100,
      label: 'H₂O',
      interpretation: 'Protons in water molecule',
      molecularFeature: 'O-H protons',
      multiplicity: 'singlet',
      integration: 2,
    },
  ],
}

const ethanolNMR: SpectrumData = {
  type: 'nmr',
  sampleName: 'Ethanol',
  xMin: 0,
  xMax: 10,
  yMin: 0,
  yMax: 100,
  xLabel: 'Chemical Shift (ppm)',
  yLabel: 'Intensity',
  peaks: [
    {
      id: 'ethanol-nmr-1',
      x: 1.2,
      y: 100,
      label: 'CH₃',
      interpretation: 'Methyl group protons (triplet)',
      molecularFeature: 'CH₃ group',
      multiplicity: 'triplet',
      integration: 3,
    },
    {
      id: 'ethanol-nmr-2',
      x: 3.6,
      y: 80,
      label: 'CH₂',
      interpretation: 'Methylene group protons (quartet)',
      molecularFeature: 'CH₂ group',
      multiplicity: 'quartet',
      integration: 2,
    },
    {
      id: 'ethanol-nmr-3',
      x: 2.5,
      y: 40,
      label: 'OH',
      interpretation: 'Hydroxyl proton (exchangeable)',
      molecularFeature: 'O-H group',
      multiplicity: 'singlet',
      integration: 1,
    },
  ],
}

const benzeneNMR: SpectrumData = {
  type: 'nmr',
  sampleName: 'Benzene',
  xMin: 0,
  xMax: 10,
  yMin: 0,
  yMax: 100,
  xLabel: 'Chemical Shift (ppm)',
  yLabel: 'Intensity',
  peaks: [
    {
      id: 'benzene-nmr-1',
      x: 7.3,
      y: 100,
      label: 'Aromatic H',
      interpretation: 'Aromatic protons (singlet)',
      molecularFeature: 'Aromatic ring',
      multiplicity: 'singlet',
      integration: 6,
    },
  ],
}

// ============================================================================
// FUNCTIONAL GROUP REGIONS (IR)
// ============================================================================

export const irFunctionalGroupRegions: FunctionalGroupRegion[] = [
  {
    name: 'O-H / N-H Stretch',
    xMin: 3000,
    xMax: 3500,
    color: 'rgba(255, 100, 100, 0.1)',
    description: 'Hydroxyl and amine stretches',
  },
  {
    name: 'C-H Stretch',
    xMin: 2800,
    xMax: 3000,
    color: 'rgba(100, 150, 255, 0.1)',
    description: 'Alkyl and aromatic C-H stretches',
  },
  {
    name: 'C=O Stretch',
    xMin: 1650,
    xMax: 1750,
    color: 'rgba(255, 200, 100, 0.1)',
    description: 'Carbonyl stretch (ketone, aldehyde, carboxylic acid)',
  },
  {
    name: 'C=C Stretch',
    xMin: 1600,
    xMax: 1680,
    color: 'rgba(150, 255, 150, 0.1)',
    description: 'Alkene and aromatic C=C stretches',
  },
  {
    name: 'C-O Stretch',
    xMin: 1000,
    xMax: 1300,
    color: 'rgba(200, 150, 255, 0.1)',
    description: 'Ether and alcohol C-O stretches',
  },
]

// ============================================================================
// SAMPLE DATABASE
// ============================================================================

export const samples: Sample[] = [
  {
    id: 'water',
    name: 'Water',
    formula: 'H₂O',
    spectra: {
      'uv-vis': waterUVVis,
      'ir': waterIR,
      'nmr': waterNMR,
    },
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    spectra: {
      'uv-vis': ethanolUVVis,
      'ir': ethanolIR,
      'nmr': ethanolNMR,
    },
  },
  {
    id: 'benzene',
    name: 'Benzene',
    formula: 'C₆H₆',
    spectra: {
      'uv-vis': benzeneUVVis,
      'ir': undefined, // Benzene has weak IR
      'nmr': benzeneNMR,
    },
  },
  {
    id: 'acetone',
    name: 'Acetone',
    formula: 'C₃H₆O',
    spectra: {
      'uv-vis': undefined, // Acetone has weak UV-Vis
      'ir': acetoneIR,
      'nmr': undefined, // Simplified for now
    },
  },
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getSample(sampleId: string): Sample | undefined {
  return samples.find((s) => s.id === sampleId)
}

export function getSpectrum(sampleId: string, type: SpectroscopyType): SpectrumData | undefined {
  const sample = getSample(sampleId)
  if (!sample) return undefined
  return sample.spectra[type]
}

export function getAllSamples(): Sample[] {
  return samples
}

export function getSamplesForType(type: SpectroscopyType): Sample[] {
  return samples.filter((s) => s.spectra[type] !== undefined)
}
