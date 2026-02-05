import { Atom, Bond } from '@/types/molecule'

// Valence electron configurations for main group elements
const VALENCE_ELECTRONS: { [key: string]: number } = {
  H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
  K: 1, Ca: 2, Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8,
  Rb: 1, Sr: 2, In: 3, Sn: 4, Sb: 5, Te: 6, I: 7, Xe: 8
}

// Common bonding patterns and exceptions
const BONDING_RULES = {
  // Octet rule exceptions
  hypervalent: ['P', 'S', 'Cl', 'Br', 'I', 'Xe', 'Kr'], // Can expand octet
  incompleteOctet: ['H', 'Li', 'Be', 'B'], // Don't need full octet
  
  // Maximum bonds
  maxBonds: {
    H: 1, He: 0, Li: 1, Be: 2, B: 4, C: 4, N: 4, O: 2, F: 1, Ne: 0,
    Na: 1, Mg: 2, Al: 4, Si: 4, P: 6, S: 6, Cl: 7, Ar: 0,
    K: 1, Ca: 2, Ga: 4, Ge: 4, As: 6, Se: 4, Br: 7, Kr: 8
  }
}

export interface ValidationResult {
  isValid: boolean
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  electronCounts: { [atomId: string]: number }
  bondCounts: { [atomId: string]: number }
}

export interface ValidationWarning {
  type: 'incomplete-octet' | 'expanded-octet' | 'hypervalent' | 'unusual-bond' | 'charge-imbalance'
  atomId: string
  atomSymbol: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface ValidationSuggestion {
  type: 'add-hydrogen' | 'change-bond-order' | 'add-lone-pair' | 'form-double-bond'
  atomId: string
  atomSymbol: string
  action: string
  reason: string
}

export class ChemicalValidator {
  private atoms: Atom[]
  private bonds: Bond[]
  private validationCache: Map<string, ValidationResult>

  constructor(atoms: Atom[], bonds: Bond[]) {
    this.atoms = atoms
    this.bonds = bonds
    this.validationCache = new Map()
  }

  validate(): ValidationResult {
    const cacheKey = this.generateCacheKey()
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!
    }

    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      suggestions: [],
      electronCounts: {},
      bondCounts: {}
    }

    // Calculate electron counts for each atom
    this.calculateElectronCounts(result)
    
    // Validate octet rule
    this.validateOctetRule(result)
    
    // Check for unusual bonding patterns
    this.validateBondingPatterns(result)
    
    // Check for charge balance in ionic compounds
    this.validateChargeBalance(result)
    
    // Generate suggestions
    this.generateSuggestions(result)

    this.validationCache.set(cacheKey, result)
    return result
  }

  private generateCacheKey(): string {
    const atomKey = this.atoms.map(a => `${a.id}:${a.element}:${a.x}:${a.y}:${a.z}`).join('|')
    const bondKey = this.bonds.map(b => `${b.id}:${b.from}:${b.to}:${b.type}`).join('|')
    return `${atomKey}::${bondKey}`
  }

  private calculateElectronCounts(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      const valenceElectrons = VALENCE_ELECTRONS[atom.element] || 0
      const bondElectrons = this.getBondElectronCount(atom.id)
      const lonePairs = this.getLonePairCount(atom.id)
      
      result.electronCounts[atom.id] = valenceElectrons
      result.bondCounts[atom.id] = this.bonds.filter(b => b.from === atom.id || b.to === atom.id).length
    })
  }

  private getBondElectronCount(atomId: string): number {
    const atom = this.atoms.find(a => a.id === atomId)
    if (!atom) return 0

    let bondElectrons = 0
    this.bonds.forEach(bond => {
      if (bond.from === atomId || bond.to === atomId) {
        switch (bond.type) {
          case 'single': bondElectrons += 1; break
          case 'double': bondElectrons += 2; break
          case 'triple': bondElectrons += 3; break
          case 'ionic': bondElectrons += 1; break // Simplified
          case 'hydrogen': bondElectrons += 0; break
        }
      }
    })
    return bondElectrons
  }

  private getLonePairCount(atomId: string): number {
    const atom = this.atoms.find(a => a.id === atomId)
    if (!atom) return 0

    const valenceElectrons = VALENCE_ELECTRONS[atom.element] || 0
    const bondElectrons = this.getBondElectronCount(atomId)
    
    // Calculate remaining electrons that could form lone pairs
    const remainingElectrons = valenceElectrons - bondElectrons
    return Math.max(0, Math.floor(remainingElectrons / 2))
  }

  private validateOctetRule(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      const valenceElectrons = VALENCE_ELECTRONS[atom.element] || 0
      const bondElectrons = this.getBondElectronCount(atom.id)
      const totalElectrons = bondElectrons + (this.getLonePairCount(atom.id) * 2)
      
      // Check for incomplete octet (except for H, He, Li, Be, B)
      if (!BONDING_RULES.incompleteOctet.includes(atom.element)) {
        if (totalElectrons < 8 && atom.element !== 'H') {
          result.warnings.push({
            type: 'incomplete-octet',
            atomId: atom.id,
            atomSymbol: atom.element,
            message: `${atom.element} has incomplete octet (${totalElectrons} electrons)`,
            severity: 'medium'
          })
          result.isValid = false
        }
      }
      
      // Check for expanded octet (hypervalent elements)
      if (totalElectrons > 8 && !BONDING_RULES.hypervalent.includes(atom.element)) {
        result.warnings.push({
          type: 'expanded-octet',
          atomId: atom.id,
          atomSymbol: atom.element,
          message: `${atom.element} has expanded octet (${totalElectrons} electrons)`,
          severity: 'high'
        })
      }
      
      // Check for hypervalent bonding
      if (BONDING_RULES.hypervalent.includes(atom.element) && totalElectrons > 8) {
        result.warnings.push({
          type: 'hypervalent',
          atomId: atom.id,
          atomSymbol: atom.element,
          message: `${atom.element} is hypervalent (${totalElectrons} electrons)`,
          severity: 'low'
        })
      }
    })
  }

  private validateBondingPatterns(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      const bondCount = result.bondCounts[atom.id]
      const maxBonds = (BONDING_RULES.maxBonds as {[key: string]: number})[atom.element] || 4
      
      if (bondCount > maxBonds) {
        result.warnings.push({
          type: 'unusual-bond',
          atomId: atom.id,
          atomSymbol: atom.element,
          message: `${atom.element} has ${bondCount} bonds (max: ${maxBonds})`,
          severity: 'high'
        })
      }
      
      // Check for unusual bond types
      this.bonds.forEach(bond => {
        if (bond.from === atom.id || bond.to === atom.id) {
          if (bond.type === 'triple' && !['C', 'N', 'O', 'S', 'P'].includes(atom.element)) {
            result.warnings.push({
              type: 'unusual-bond',
              atomId: atom.id,
              atomSymbol: atom.element,
              message: `${atom.element} has triple bond (unusual)`,
              severity: 'medium'
            })
          }
        }
      })
    })
  }

  private validateChargeBalance(result: ValidationResult): void {
    // Check if we have ionic bonds and ensure charge balance
    const ionicBonds = this.bonds.filter(b => b.type === 'ionic')
    
    if (ionicBonds.length > 0) {
      const positiveAtoms = new Set<string>()
      const negativeAtoms = new Set<string>()
      
      ionicBonds.forEach(bond => {
        const fromAtom = this.atoms.find(a => a.id === bond.from)
        const toAtom = this.atoms.find(a => a.id === bond.to)
        
        if (fromAtom && toAtom) {
          // Simple heuristic: metals are positive, nonmetals are negative
          if (this.isMetal(fromAtom.element)) {
            positiveAtoms.add(fromAtom.id)
          } else {
            negativeAtoms.add(fromAtom.id)
          }
          
          if (this.isMetal(toAtom.element)) {
            positiveAtoms.add(toAtom.id)
          } else {
            negativeAtoms.add(toAtom.id)
          }
        }
      })
      
      if (positiveAtoms.size === 0 || negativeAtoms.size === 0) {
        result.warnings.push({
          type: 'charge-imbalance',
          atomId: '',
          atomSymbol: '',
          message: 'Ionic compound lacks proper charge balance',
          severity: 'medium'
        })
      }
    }
  }

  private isMetal(element: string): boolean {
    const metals = ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr', 'Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra',
                   'Al', 'Ga', 'In', 'Tl', 'Sn', 'Pb', 'Bi', 'Po', 'Sc', 'Ti', 'V', 'Cr', 
                   'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru',
                   'Rh', 'Pd', 'Ag', 'Cd', 'La', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt',
                   'Au', 'Hg', 'Ac', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn',
                   'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og']
    return metals.includes(element)
  }

  private generateSuggestions(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      const valenceElectrons = VALENCE_ELECTRONS[atom.element] || 0
      const bondElectrons = this.getBondElectronCount(atom.id)
      const totalElectrons = bondElectrons + (this.getLonePairCount(atom.id) * 2)
      
      // Suggest adding hydrogen for incomplete octets
      if (!BONDING_RULES.incompleteOctet.includes(atom.element) && totalElectrons < 8) {
        const neededElectrons = 8 - totalElectrons
        if (neededElectrons >= 1) {
          result.suggestions.push({
            type: 'add-hydrogen',
            atomId: atom.id,
            atomSymbol: atom.element,
            action: `Add ${Math.ceil(neededElectrons / 2)} hydrogen atom(s)`,
            reason: 'To complete the octet'
          })
        }
      }
      
      // Suggest lone pairs for atoms with extra electrons
      if (totalElectrons > 8 && BONDING_RULES.hypervalent.includes(atom.element)) {
        result.suggestions.push({
          type: 'add-lone-pair',
          atomId: atom.id,
          atomSymbol: atom.element,
          action: 'Add lone pairs',
          reason: 'To accommodate expanded octet'
        })
      }
      
      // Suggest bond changes for unusual patterns
      const unusualBonds = this.bonds.filter(b => 
        (b.from === atom.id || b.to === atom.id) && 
        (b.type === 'triple' && !['C', 'N', 'O', 'S', 'P'].includes(atom.element))
      )
      
      if (unusualBonds.length > 0) {
        result.suggestions.push({
          type: 'change-bond-order',
          atomId: atom.id,
          atomSymbol: atom.element,
          action: 'Consider changing bond order',
          reason: 'Triple bond is unusual for this element'
        })
      }
    })
  }

  // Auto-completion functionality
  autoCompleteWithHydrogen(): { newAtoms: Atom[], newBonds: Bond[] } {
    const newAtoms: Atom[] = []
    const newBonds: Bond[] = []
    
    this.atoms.forEach(atom => {
      const valenceElectrons = VALENCE_ELECTRONS[atom.element] || 0
      const bondElectrons = this.getBondElectronCount(atom.id)
      const totalElectrons = bondElectrons + (this.getLonePairCount(atom.id) * 2)
      
      if (!BONDING_RULES.incompleteOctet.includes(atom.element) && totalElectrons < 8) {
        const neededElectrons = 8 - totalElectrons
        const hydrogenCount = Math.ceil(neededElectrons / 2)
        
        for (let i = 0; i < hydrogenCount; i++) {
          const hydrogenAtom: Atom = {
            id: `H-${Date.now()}-${Math.random()}`,
            element: 'H',
            x: atom.x + (Math.random() - 0.5) * 2,
            y: atom.y + (Math.random() - 0.5) * 2,
            z: atom.z + (Math.random() - 0.5) * 2,
            color: '#FFFFFF'
          }
          
          newAtoms.push(hydrogenAtom)
          
          const hydrogenBond: Bond = {
            id: `bond-${Date.now()}-${Math.random()}`,
            from: atom.id,
            to: hydrogenAtom.id,
            type: 'single'
          }
          
          newBonds.push(hydrogenBond)
        }
      }
    })
    
    return { newAtoms, newBonds }
  }

  // Get validation summary
  getValidationSummary(): {
    totalWarnings: number
    criticalWarnings: number
    mediumWarnings: number
    lowWarnings: number
    suggestions: number
  } {
    const result = this.validate()
    
    return {
      totalWarnings: result.warnings.length,
      criticalWarnings: result.warnings.filter(w => w.severity === 'high').length,
      mediumWarnings: result.warnings.filter(w => w.severity === 'medium').length,
      lowWarnings: result.warnings.filter(w => w.severity === 'low').length,
      suggestions: result.suggestions.length
    }
  }
}

// Utility function to validate a molecule
export function validateMolecule(atoms: Atom[], bonds: Bond[]): ValidationResult {
  const validator = new ChemicalValidator(atoms, bonds)
  return validator.validate()
}

// Utility function to get electron count for display
export function getElectronCount(atom: Atom, bonds: Bond[]): number {
  const valenceElectrons = VALENCE_ELECTRONS[atom.element] || 0
  let bondElectrons = 0
  
  bonds.forEach(bond => {
    if (bond.from === atom.id || bond.to === atom.id) {
      switch (bond.type) {
        case 'single': bondElectrons += 1; break
        case 'double': bondElectrons += 2; break
        case 'triple': bondElectrons += 3; break
        case 'ionic': bondElectrons += 1; break
        case 'hydrogen': bondElectrons += 0; break
      }
    }
  })
  
  return valenceElectrons - bondElectrons
}