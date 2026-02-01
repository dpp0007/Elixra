/**
 * Dynamic pH Calculation Engine
 * Based on real chemistry principles
 */

import { ChemicalContent } from '@/types/chemistry'

// Chemical classification types
export type ChemicalType =
  | 'strong_acid'
  | 'weak_acid'
  | 'strong_base'
  | 'weak_base'
  | 'neutral_salt'
  | 'acidic_salt'
  | 'basic_salt'
  | 'buffer'
  | 'neutral_liquid'

export interface ChemicalProperties {
  type: ChemicalType
  Ka?: number // Acid dissociation constant
  Kb?: number // Base dissociation constant
  pKa?: number
  pKb?: number
  molarMass: number // g/mol
  chargePerMole?: number // For acids/bases (e.g., H2SO4 = 2, HCl = 1)
}

/**
 * REAGENT CLASSIFICATION TABLE
 * Maps chemical IDs to their properties
 */
export const CHEMICAL_PROPERTIES: Record<string, ChemicalProperties> = {
  // STRONG ACIDS
  'hcl': {
    type: 'strong_acid',
    molarMass: 36.46,
    chargePerMole: 1
  },
  'h2so4': {
    type: 'strong_acid',
    molarMass: 98.08,
    chargePerMole: 2 // Diprotic
  },
  'hno3': {
    type: 'strong_acid',
    molarMass: 63.01,
    chargePerMole: 1
  },
  
  // WEAK ACIDS
  'ch3cooh': {
    type: 'weak_acid',
    Ka: 1.8e-5,
    pKa: 4.76,
    molarMass: 60.05,
    chargePerMole: 1
  },
  'h3po4': {
    type: 'weak_acid',
    Ka: 7.5e-3, // First dissociation
    pKa: 2.12,
    molarMass: 98.00,
    chargePerMole: 1 // Treating as monoprotic for simplicity
  },
  
  // STRONG BASES
  'naoh': {
    type: 'strong_base',
    molarMass: 40.00,
    chargePerMole: 1
  },
  'koh': {
    type: 'strong_base',
    molarMass: 56.11,
    chargePerMole: 1
  },
  'ca_oh_2': {
    type: 'strong_base',
    molarMass: 74.09,
    chargePerMole: 2 // Produces 2 OH⁻
  },
  
  // WEAK BASES
  'nh4oh': {
    type: 'weak_base',
    Kb: 1.8e-5,
    pKb: 4.75,
    molarMass: 35.05,
    chargePerMole: 1
  },
  
  // NEUTRAL SALTS (no effect on pH)
  'nacl': {
    type: 'neutral_salt',
    molarMass: 58.44
  },
  'kcl': {
    type: 'neutral_salt',
    molarMass: 74.55
  },
  'cacl2': {
    type: 'neutral_salt',
    molarMass: 110.98
  },
  'mgso4': {
    type: 'neutral_salt',
    molarMass: 120.37
  },
  'na2so4': {
    type: 'neutral_salt',
    molarMass: 142.04
  },
  
  // ACIDIC SALTS (weak acid cation)
  'nh4cl': {
    type: 'acidic_salt',
    Ka: 5.6e-10, // NH4+ acts as weak acid
    pKa: 9.25,
    molarMass: 53.49,
    chargePerMole: 1
  },
  'alum': {
    type: 'acidic_salt',
    Ka: 1.4e-5,
    pKa: 4.85,
    molarMass: 474.39,
    chargePerMole: 1
  },
  
  // BASIC SALTS (weak base anion)
  'na2co3': {
    type: 'basic_salt',
    Kb: 2.1e-4, // CO3²⁻ acts as weak base
    pKb: 3.67,
    molarMass: 105.99,
    chargePerMole: 1
  },
  'nahco3': {
    type: 'basic_salt',
    Kb: 2.3e-8,
    pKb: 7.63,
    molarMass: 84.01,
    chargePerMole: 1
  },
  'k2co3': {
    type: 'basic_salt',
    Kb: 2.1e-4,
    pKb: 3.67,
    molarMass: 138.21,
    chargePerMole: 1
  },
  'na3po4': {
    type: 'basic_salt',
    Kb: 2.4e-2,
    pKb: 1.62,
    molarMass: 163.94,
    chargePerMole: 1
  },
  
  // NEUTRAL LIQUIDS
  'ethanol': {
    type: 'neutral_liquid',
    molarMass: 46.07
  },
  'glucose': {
    type: 'neutral_liquid',
    molarMass: 180.16
  },
  
  // METAL SALTS (mostly neutral, some slightly acidic due to hydrolysis)
  'cuso4': {
    type: 'acidic_salt',
    Ka: 1.0e-7,
    pKa: 7.0,
    molarMass: 249.68,
    chargePerMole: 1
  },
  'fecl3': {
    type: 'acidic_salt',
    Ka: 6.3e-3,
    pKa: 2.2,
    molarMass: 162.20,
    chargePerMole: 1
  },
  'feso4': {
    type: 'acidic_salt',
    Ka: 1.0e-7,
    pKa: 7.0,
    molarMass: 278.01,
    chargePerMole: 1
  },
  'zncl2': {
    type: 'acidic_salt',
    Ka: 2.5e-10,
    pKa: 9.6,
    molarMass: 136.30,
    chargePerMole: 1
  },
  'znso4': {
    type: 'neutral_salt',
    molarMass: 161.47
  },
  
  // INDICATORS (neutral)
  'phenolphthalein': {
    type: 'neutral_liquid',
    molarMass: 318.32
  },
  'methyl_orange': {
    type: 'neutral_liquid',
    molarMass: 327.33
  },
  'litmus': {
    type: 'neutral_liquid',
    molarMass: 300.0
  },
  
  // OXIDIZING/REDUCING AGENTS
  'kmno4': {
    type: 'neutral_salt',
    molarMass: 158.03
  },
  'k2cr2o7': {
    type: 'acidic_salt',
    Ka: 1.0e-7,
    pKa: 7.0,
    molarMass: 294.18,
    chargePerMole: 1
  },
  'h2o2': {
    type: 'weak_acid',
    Ka: 2.4e-12,
    pKa: 11.62,
    molarMass: 34.01,
    chargePerMole: 1
  }
}

/**
 * Convert amount to moles based on unit
 */
function convertToMoles(content: ChemicalContent, properties: ChemicalProperties): number {
  const { amount, unit } = content
  
  switch (unit) {
    case 'mol':
      return amount
    case 'g':
      return amount / properties.molarMass
    case 'ml':
      // Assume concentration from chemical or default 0.1 M
      const concentration = content.chemical.concentration || 0.1
      return (amount / 1000) * concentration // Convert ml to L, then multiply by molarity
    case 'drops':
      // Assume 1 drop = 0.05 ml
      const mlFromDrops = amount * 0.05
      const conc = content.chemical.concentration || 0.1
      return (mlFromDrops / 1000) * conc
    default:
      return 0
  }
}

/**
 * Calculate total volume in liters
 */
function calculateTotalVolume(contents: ChemicalContent[]): number {
  let totalVolume = 0
  
  for (const content of contents) {
    const { amount, unit, chemical } = content
    
    switch (unit) {
      case 'ml':
        totalVolume += amount / 1000
        break
      case 'drops':
        totalVolume += (amount * 0.05) / 1000
        break
      case 'g':
        // Assume density ~1 g/ml for solids dissolved
        if (chemical.state === 'solid') {
          totalVolume += (amount / 1000) * 0.1 // Assume 10% of mass as volume contribution
        }
        break
      case 'mol':
        // Assume 1 mol dissolved in 100 ml
        totalVolume += 0.1
        break
    }
  }
  
  // Minimum volume to avoid division by zero
  return Math.max(totalVolume, 0.001) // 1 ml minimum
}

/**
 * NEUTRALIZATION ENGINE
 * Calculate net acid/base equivalents
 */
function calculateNetCharge(contents: ChemicalContent[]): {
  acidEquivalents: number
  baseEquivalents: number
  weakAcids: Array<{ moles: number; Ka: number }>
  weakBases: Array<{ moles: number; Kb: number }>
} {
  let acidEquivalents = 0
  let baseEquivalents = 0
  const weakAcids: Array<{ moles: number; Ka: number }> = []
  const weakBases: Array<{ moles: number; Kb: number }> = []
  
  for (const content of contents) {
    const properties = CHEMICAL_PROPERTIES[content.chemical.id]
    if (!properties) continue
    
    const moles = convertToMoles(content, properties)
    const charge = properties.chargePerMole || 1
    
    switch (properties.type) {
      case 'strong_acid':
        acidEquivalents += moles * charge
        break
      case 'weak_acid':
        weakAcids.push({ moles: moles * charge, Ka: properties.Ka || 1e-5 })
        break
      case 'strong_base':
        baseEquivalents += moles * charge
        break
      case 'weak_base':
        weakBases.push({ moles: moles * charge, Kb: properties.Kb || 1e-5 })
        break
      case 'acidic_salt':
        weakAcids.push({ moles: moles * charge, Ka: properties.Ka || 1e-7 })
        break
      case 'basic_salt':
        weakBases.push({ moles: moles * charge, Kb: properties.Kb || 1e-4 })
        break
    }
  }
  
  return { acidEquivalents, baseEquivalents, weakAcids, weakBases }
}

/**
 * MASTER pH CALCULATION FUNCTION
 */
export function calculatePH(contents: ChemicalContent[]): number {
  if (contents.length === 0) return 7.0
  
  const totalVolume = calculateTotalVolume(contents)
  const { acidEquivalents, baseEquivalents, weakAcids, weakBases } = calculateNetCharge(contents)
  
  // NEUTRALIZATION: Strong acid + strong base
  const netAcid = acidEquivalents - baseEquivalents
  
  if (Math.abs(netAcid) > 1e-10) {
    // Strong acid/base dominates
    if (netAcid > 0) {
      // Excess acid
      const concentration = netAcid / totalVolume
      const pH = -Math.log10(concentration)
      return clampPH(pH)
    } else {
      // Excess base
      const concentration = Math.abs(netAcid) / totalVolume
      const pOH = -Math.log10(concentration)
      const pH = 14 - pOH
      return clampPH(pH)
    }
  }
  
  // No strong acid/base excess - check weak acids/bases
  if (weakAcids.length > 0 && weakBases.length === 0) {
    // Only weak acids present
    return calculateWeakAcidPH(weakAcids, totalVolume)
  }
  
  if (weakBases.length > 0 && weakAcids.length === 0) {
    // Only weak bases present
    return calculateWeakBasePH(weakBases, totalVolume)
  }
  
  if (weakAcids.length > 0 && weakBases.length > 0) {
    // Buffer or mixed system
    return calculateBufferPH(weakAcids, weakBases, totalVolume)
  }
  
  // Neutral solution
  return 7.0
}

/**
 * Calculate pH for weak acid solutions
 */
function calculateWeakAcidPH(weakAcids: Array<{ moles: number; Ka: number }>, volume: number): number {
  // Sum all weak acid contributions
  let totalHplus = 0
  
  for (const acid of weakAcids) {
    const concentration = acid.moles / volume
    // [H+] = sqrt(Ka × C)
    const Hplus = Math.sqrt(acid.Ka * concentration)
    totalHplus += Hplus
  }
  
  const pH = -Math.log10(totalHplus)
  return clampPH(pH)
}

/**
 * Calculate pH for weak base solutions
 */
function calculateWeakBasePH(weakBases: Array<{ moles: number; Kb: number }>, volume: number): number {
  // Sum all weak base contributions
  let totalOHminus = 0
  
  for (const base of weakBases) {
    const concentration = base.moles / volume
    // [OH-] = sqrt(Kb × C)
    const OHminus = Math.sqrt(base.Kb * concentration)
    totalOHminus += OHminus
  }
  
  const pOH = -Math.log10(totalOHminus)
  const pH = 14 - pOH
  return clampPH(pH)
}

/**
 * Calculate pH for buffer or mixed weak acid/base systems
 * Uses simplified approach: dominant species determines pH
 */
function calculateBufferPH(
  weakAcids: Array<{ moles: number; Ka: number }>,
  weakBases: Array<{ moles: number; Kb: number }>,
  volume: number
): number {
  // Calculate total acid and base strength
  const totalAcidStrength = weakAcids.reduce((sum, a) => sum + a.moles * a.Ka, 0)
  const totalBaseStrength = weakBases.reduce((sum, b) => sum + b.moles * b.Kb, 0)
  
  if (totalAcidStrength > totalBaseStrength * 10) {
    // Acid dominates
    return calculateWeakAcidPH(weakAcids, volume)
  } else if (totalBaseStrength > totalAcidStrength * 10) {
    // Base dominates
    return calculateWeakBasePH(weakBases, volume)
  } else {
    // Buffer region - approximate as neutral to slightly acidic/basic
    const ratio = totalAcidStrength / totalBaseStrength
    if (ratio > 1) {
      return 6.5 // Slightly acidic buffer
    } else if (ratio < 1) {
      return 7.5 // Slightly basic buffer
    } else {
      return 7.0 // Neutral buffer
    }
  }
}

/**
 * Clamp pH to valid range [0, 14]
 */
function clampPH(pH: number): number {
  if (isNaN(pH) || !isFinite(pH)) return 7.0
  return Math.max(0, Math.min(14, pH))
}

/**
 * Round pH to 1 decimal place
 */
export function formatPH(pH: number): number {
  return Math.round(pH * 10) / 10
}

/**
 * Get pH category for display
 */
export function getPHCategory(pH: number): string {
  if (pH < 3) return 'Strongly Acidic'
  if (pH < 6) return 'Weakly Acidic'
  if (pH < 8) return 'Neutral'
  if (pH < 11) return 'Weakly Basic'
  return 'Strongly Basic'
}
