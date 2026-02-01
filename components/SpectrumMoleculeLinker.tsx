'use client'

import React, { useEffect, useState } from 'react'
import { Peak, SpectroscopyType } from '@/types/spectroscopy'
import { Link2, AlertCircle } from 'lucide-react'

interface SpectrumMoleculeLinkerProps {
  selectedPeak: Peak | null
  spectroscopyType: SpectroscopyType
  onMoleculeFeatureHighlight?: (feature: string) => void
}

interface MolecularMapping {
  peakLabel: string
  molecularFeature: string
  description: string
  atomicIndices?: number[]
}

export default function SpectrumMoleculeLinker({
  selectedPeak,
  spectroscopyType,
  onMoleculeFeatureHighlight,
}: SpectrumMoleculeLinkerProps) {
  const [mapping, setMapping] = useState<MolecularMapping | null>(null)

  // Generate educational mapping between peak and molecular feature
  useEffect(() => {
    if (!selectedPeak) {
      setMapping(null)
      return
    }

    const newMapping = generateMapping(selectedPeak, spectroscopyType)
    setMapping(newMapping)
    onMoleculeFeatureHighlight?.(newMapping.molecularFeature)
  }, [selectedPeak, spectroscopyType, onMoleculeFeatureHighlight])

  if (!selectedPeak || !mapping) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Link2 className="h-5 w-5" />
          <span className="text-sm">Select a peak to see molecular feature mapping</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Molecular Feature</h3>
      </div>

      {/* Mapping Info */}
      <div className="space-y-4">
        {/* Peak Label */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Spectrum Peak
          </div>
          <div className="px-4 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <div className="text-sm font-semibold text-blue-100">
              {mapping.peakLabel}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="text-gray-500">↓</div>
        </div>

        {/* Molecular Feature */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Molecular Feature
          </div>
          <div className="px-4 py-3 bg-purple-500/20 border border-purple-400/30 rounded-lg">
            <div className="text-sm font-semibold text-purple-100">
              {mapping.molecularFeature}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Why This Connection
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {mapping.description}
          </p>
        </div>

        {/* Educational Note */}
        <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-200">
            This mapping is educational and approximate. Real spectroscopy involves complex quantum mechanics.
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Generate educational mapping between peak and molecular feature
 * Approximate but chemically consistent
 */
function generateMapping(
  peak: Peak,
  spectroscopyType: SpectroscopyType
): MolecularMapping {
  switch (spectroscopyType) {
    case 'uv-vis':
      return generateUVVisMapping(peak)
    case 'ir':
      return generateIRMapping(peak)
    case 'nmr':
      return generateNMRMapping(peak)
    default:
      return {
        peakLabel: peak.label,
        molecularFeature: peak.molecularFeature || 'Unknown',
        description: peak.interpretation,
      }
  }
}

function generateUVVisMapping(peak: Peak): MolecularMapping {
  const wavelength = peak.x

  if (wavelength < 200) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'Saturated bonds (σ→σ*)',
      description:
        'Very short wavelength absorption indicates transitions in saturated C-C or C-H bonds. These require high-energy UV light.',
    }
  } else if (wavelength < 250) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'Aromatic ring or conjugated system',
      description:
        'This wavelength is typical for aromatic compounds like benzene. The π electrons in the aromatic ring absorb UV light.',
    }
  } else if (wavelength < 300) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'Extended conjugation',
      description:
        'Longer wavelength absorption indicates extended conjugation. Multiple double bonds or aromatic rings increase the wavelength.',
    }
  } else {
    return {
      peakLabel: peak.label,
      molecularFeature: 'Carbonyl or heteroatom',
      description:
        'This longer wavelength suggests n→π* transition from a carbonyl group or heteroatom. These transitions occur at lower energy.',
    }
  }
}

function generateIRMapping(peak: Peak): MolecularMapping {
  const wavenumber = peak.x

  if (wavenumber >= 3000 && wavenumber <= 3500) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'O-H or N-H bond',
      description:
        'The O-H or N-H stretch vibration causes this peak. The broad appearance indicates hydrogen bonding between molecules.',
    }
  } else if (wavenumber >= 2800 && wavenumber < 3000) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'C-H bonds (alkyl)',
      description:
        'The C-H stretching vibration of alkyl groups causes this peak. The position indicates whether the carbons are sp³, sp², or sp hybridized.',
    }
  } else if (wavenumber >= 1650 && wavenumber <= 1750) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'C=O bond (carbonyl)',
      description:
        'The C=O stretching vibration is very strong and characteristic. The exact position indicates the type of carbonyl (ketone, aldehyde, ester, etc.).',
    }
  } else if (wavenumber >= 1600 && wavenumber < 1650) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'C=C bond (alkene or aromatic)',
      description:
        'The C=C stretching vibration causes this peak. Aromatic C=C stretches are weaker than alkene stretches.',
    }
  } else if (wavenumber >= 1000 && wavenumber < 1300) {
    return {
      peakLabel: peak.label,
      molecularFeature: 'C-O bond (ether or alcohol)',
      description:
        'The C-O stretching vibration causes this peak. The position depends on whether the oxygen is in an ether, alcohol, or ester.',
    }
  } else {
    return {
      peakLabel: peak.label,
      molecularFeature: 'Fingerprint region',
      description:
        'Peaks below 1000 cm⁻¹ are in the fingerprint region. These complex vibrations are unique to each molecule.',
    }
  }
}

function generateNMRMapping(peak: Peak): MolecularMapping {
  const shift = peak.x
  const multiplicity = peak.multiplicity || 'singlet'

  let environment = ''
  if (shift < 1) {
    environment = 'Alkyl protons (far from electron-withdrawing groups)'
  } else if (shift < 2) {
    environment = 'Protons on carbons near electron-withdrawing groups'
  } else if (shift < 3) {
    environment = 'Protons on carbons with heteroatoms (O, N)'
  } else if (shift < 5) {
    environment = 'Protons on carbons with multiple heteroatoms or aromatic'
  } else if (shift < 7) {
    environment = 'Aromatic protons'
  } else {
    environment = 'Highly deshielded protons (aldehyde, carboxylic acid)'
  }

  let multiplicityExplanation = ''
  switch (multiplicity) {
    case 'singlet':
      multiplicityExplanation =
        'No neighboring protons. This proton is isolated or equivalent to all neighbors.'
      break
    case 'doublet':
      multiplicityExplanation =
        'One neighboring proton. The peak splits into two lines due to spin-spin coupling.'
      break
    case 'triplet':
      multiplicityExplanation =
        'Two neighboring protons. The peak splits into three lines due to spin-spin coupling.'
      break
    case 'quartet':
      multiplicityExplanation =
        'Three neighboring protons. The peak splits into four lines due to spin-spin coupling.'
      break
    default:
      multiplicityExplanation = `${multiplicity} pattern indicates coupling to neighboring protons.`
  }

  return {
    peakLabel: peak.label,
    molecularFeature: environment,
    description: `${environment}. ${multiplicityExplanation}`,
  }
}
