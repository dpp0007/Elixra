/**
 * Spectrum Handlers - Technique-Specific Formatting
 * Handles UV-Vis, IR, and NMR spectrum display and interpretation
 */

import { SpectrumData, Peak, SpectroscopyType } from '@/types/spectroscopy'

/**
 * Format spectrum data for display based on technique type
 * Applies technique-specific transformations (e.g., IR x-axis inversion)
 */
export function formatSpectrumForDisplay(
  spectrum: SpectrumData
): SpectrumData {
  switch (spectrum.type) {
    case 'ir':
      return formatIRSpectrum(spectrum)
    case 'uv-vis':
      return formatUVVisSpectrum(spectrum)
    case 'nmr':
      return formatNMRSpectrum(spectrum)
    default:
      return spectrum
  }
}

/**
 * UV-Vis Spectrum Handler
 * - Highlights λmax (maximum absorption)
 * - Labels electronic transitions
 * - Emphasizes chromophore regions
 */
function formatUVVisSpectrum(spectrum: SpectrumData): SpectrumData {
  if (spectrum.type !== 'uv-vis') return spectrum

  // Find λmax (peak with highest absorbance)
  if (spectrum.peaks.length === 0) return spectrum;

  const lambdaMax = spectrum.peaks.reduce((max, peak) =>
    peak.y > max.y ? peak : max
  )

  // Enhance λmax peak
  const enhancedPeaks = spectrum.peaks.map((peak) => ({
    ...peak,
    label: peak.label, // Trust AI label
    interpretation: peak.interpretation || `Absorption at ${peak.x} nm` // Trust AI interpretation
  }))

  return {
    ...spectrum,
    peaks: enhancedPeaks,
    xLabel: 'Wavelength (nm)',
    yLabel: 'Absorbance',
  }
}

/**
 * IR Spectrum Handler
 * - Inverts x-axis (4000 → 400 cm⁻¹)
 * - Shows functional group regions
 * - Labels bond vibrations
 */
function formatIRSpectrum(spectrum: SpectrumData): SpectrumData {
  if (spectrum.type !== 'ir') return spectrum

  // IR x-axis is typically displayed inverted (high to low)
  const enhancedPeaks = spectrum.peaks.map((peak) => {
    return {
      ...peak,
      label: peak.label, // Trust AI label
      interpretation: peak.interpretation || `Peak at ${peak.x} cm⁻¹` // Trust AI interpretation
    }
  })

  return {
    ...spectrum,
    peaks: enhancedPeaks,
    xLabel: 'Wavenumber (cm⁻¹)',
    yLabel: 'Transmittance (%)',
    xInverted: true,
  }
}

/**
 * NMR Spectrum Handler
 * - Displays chemical shift scale (ppm)
 * - Labels peak multiplicity
 * - Shows relative integration
 */
function formatNMRSpectrum(spectrum: SpectrumData): SpectrumData {
  if (spectrum.type !== 'nmr') return spectrum

  const enhancedPeaks = spectrum.peaks.map((peak) => {
    const multiplicity = peak.multiplicity || 'singlet'
    const integration = peak.integration || 1

    return {
      ...peak,
      label: `${peak.label} (${multiplicity}, ${integration}H)`,
      interpretation: peak.interpretation || `Signal at ${peak.x.toFixed(2)} ppm`, // Trust AI interpretation
    }
  })

  return {
    ...spectrum,
    peaks: enhancedPeaks,
    xLabel: 'Chemical Shift (ppm)',
    yLabel: 'Intensity',
  }
}

/**
 * Get educational interpretation for a peak
 * Returns beginner-friendly explanation (2-4 lines)
 */
export function getPeakInterpretation(
  peak: Peak,
  spectroscopyType: SpectroscopyType
): string {
  switch (spectroscopyType) {
    case 'uv-vis':
      return getUVVisInterpretation(peak)
    case 'ir':
      return getIRInterpretation(peak)
    case 'nmr':
      return getNMRInterpretation(peak)
    default:
      return peak.interpretation
  }
}

function getUVVisInterpretation(peak: Peak): string {
  // If specific interpretation exists from AI, prefer it
  if (peak.interpretation && peak.interpretation !== 'Electronic transition') {
      return peak.interpretation
  }

  if (peak.transitionType === 'π→π*') {
    return `This peak shows a π→π* transition, typical of aromatic rings or conjugated systems. The molecule absorbs light at ${peak.x} nm, indicating extended conjugation.`
  } else if (peak.transitionType === 'n→π*') {
    return `This peak shows an n→π* transition, typical of carbonyl groups or heteroatoms. The molecule absorbs light at ${peak.x} nm due to non-bonding electrons.`
  }
  return peak.interpretation
}

function getIRInterpretation(peak: Peak): string {
  // If specific interpretation exists from AI, prefer it
  if (peak.interpretation && peak.interpretation !== 'Functional group vibration') {
      return peak.interpretation
  }
  
  const wavenumber = peak.x

  if (wavenumber >= 3000 && wavenumber <= 3500) {
    return `O-H or N-H stretch at ${wavenumber} cm⁻¹. This indicates the presence of hydroxyl or amine groups. The broad appearance suggests hydrogen bonding.`
  } else if (wavenumber >= 2800 && wavenumber < 3000) {
    return `C-H stretch at ${wavenumber} cm⁻¹. This is characteristic of alkyl groups. The position indicates the type of C-H bonds present.`
  } else if (wavenumber >= 1650 && wavenumber <= 1750) {
    return `C=O stretch at ${wavenumber} cm⁻¹. This is a strong, characteristic peak of carbonyl groups. The exact position indicates the type of carbonyl (ketone, aldehyde, etc.).`
  } else if (wavenumber >= 1600 && wavenumber < 1650) {
    return `C=C stretch at ${wavenumber} cm⁻¹. This indicates the presence of alkene or aromatic bonds. Aromatic C=C stretches are typically weaker than alkene stretches.`
  } else if (wavenumber >= 1000 && wavenumber < 1300) {
    return `C-O stretch at ${wavenumber} cm⁻¹. This indicates the presence of ether or alcohol groups. The exact position depends on the type of C-O bond.`
  }

  return peak.interpretation
}

function getNMRInterpretation(peak: Peak): string {
  const multiplicity = peak.multiplicity || 'singlet'
  const integration = peak.integration || 1
  const shift = peak.x

  let multiplicityExplanation = ''
  switch (multiplicity) {
    case 'singlet':
      multiplicityExplanation = 'This singlet indicates no neighboring protons.'
      break
    case 'doublet':
      multiplicityExplanation = 'This doublet indicates one neighboring proton.'
      break
    case 'triplet':
      multiplicityExplanation = 'This triplet indicates two neighboring protons.'
      break
    case 'quartet':
      multiplicityExplanation = 'This quartet indicates three neighboring protons.'
      break
    default:
      multiplicityExplanation = `This ${multiplicity} indicates coupling to neighboring protons.`
  }

  const baseExplanation = `Peak at ${shift.toFixed(2)} ppm representing ${integration} proton(s). ${multiplicityExplanation}`
  
  // If specific interpretation exists from AI, append it
  if (peak.interpretation && peak.interpretation !== 'Proton environment') {
      return `${baseExplanation} ${peak.interpretation}`
  }

  return `${baseExplanation} The chemical shift indicates the electronic environment of these protons.`
}

/**
 * Get functional group regions for IR spectrum
 * Used for visual highlighting on the spectrum
 */
export function getIRFunctionalGroupRegions() {
  return [
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
}

/**
 * Validate spectrum data for consistency
 */
export function validateSpectrum(spectrum: SpectrumData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!spectrum.peaks || spectrum.peaks.length === 0) {
    errors.push('Spectrum has no peaks')
  }

  if (spectrum.xMin >= spectrum.xMax) {
    errors.push('X-axis range is invalid (xMin >= xMax)')
  }

  if (spectrum.yMin >= spectrum.yMax) {
    errors.push('Y-axis range is invalid (yMin >= yMax)')
  }

  spectrum.peaks.forEach((peak, index) => {
    if (peak.x < spectrum.xMin || peak.x > spectrum.xMax) {
      errors.push(`Peak ${index} x-value (${peak.x}) is outside x-axis range`)
    }
    if (peak.y < spectrum.yMin || peak.y > spectrum.yMax) {
      errors.push(`Peak ${index} y-value (${peak.y}) is outside y-axis range`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
