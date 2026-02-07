/**
 * Spectroscopy Types and Interfaces
 * Defines data structures for interactive spectrum visualization
 */

export type SpectroscopyType = 'uv-vis' | 'ir' | 'nmr'

export interface Peak {
  id: string
  x: number // nm (UV-Vis), cm⁻¹ (IR), ppm (NMR)
  y: number // Absorbance/Intensity
  label: string // e.g., "λmax", "C=O stretch", "CH₃"
  interpretation: string // Short explanation
  molecularFeature?: string // Related bond/group
  multiplicity?: 'singlet' | 'doublet' | 'triplet' | 'quartet' | 'broad singlet' // NMR only
  integration?: number // NMR only (relative)
  transitionType?: 'π→π*' | 'n→π*' // UV-Vis only
  functionalGroup?: string // IR only
}

export interface SpectrumData {
  type: SpectroscopyType
  sampleName: string
  peaks: Peak[]
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xLabel: string // "Wavelength (nm)", "Wavenumber (cm⁻¹)", "Chemical Shift (ppm)"
  yLabel: string // "Absorbance", "Transmittance", "Intensity"
  xInverted?: boolean // For IR (4000 → 400)
}

export interface TooltipData {
  x: number
  y: number
  xValue: number
  yValue: number
  peakLabel: string
  interpretation: string
  visible: boolean
  placement?: 'top' | 'bottom'
}

export interface SelectionState {
  peakId: string | null
  peak: Peak | null
  molecularFeature: string | null
}

export interface ComparisonState {
  enabled: boolean
  spectrum1: SpectrumData | null
  spectrum2: SpectrumData | null
  mode: 'side-by-side' | 'overlay'
}

export interface SpectrumViewport {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  zoom: number // 1 = 100%, 2 = 200%, etc.
}

// Functional group regions for IR
export interface FunctionalGroupRegion {
  name: string
  xMin: number
  xMax: number
  color: string
  description: string
}

// Sample data
export interface Sample {
  id: string
  name: string
  formula: string
  spectra: {
    'uv-vis'?: SpectrumData
    'ir'?: SpectrumData
    'nmr'?: SpectrumData
  }
}

// Interaction events
export interface PeakHoverEvent {
  peakId: string
  peak: Peak
  mouseX: number
  mouseY: number
}

export interface PeakSelectEvent {
  peakId: string
  peak: Peak
}

export interface ZoomEvent {
  viewport: SpectrumViewport
}

export interface PanEvent {
  viewport: SpectrumViewport
}
