import { Atom, Bond } from '@/types/molecule'

// Valence electron configurations for main group elements
const VALENCE_ELECTRONS: { [key: string]: number } = {
  H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
  K: 1, Ca: 2, Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8,
  Rb: 1, Sr: 2, In: 3, Sn: 4, Sb: 5, Te: 6, I: 7, Xe: 8
}

// Standard bonding capacity (valency)
const STANDARD_VALENCY: { [key: string]: number } = {
  H: 1, He: 0, Li: 1, Be: 2, B: 3, C: 4, N: 3, O: 2, F: 1, Ne: 0,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 3, S: 2, Cl: 1, Ar: 0,
  K: 1, Ca: 2, Ga: 3, Ge: 4, As: 3, Se: 2, Br: 1, Kr: 0,
  Rb: 1, Sr: 2, In: 3, Sn: 4, Sb: 3, Te: 2, I: 1, Xe: 0
}

// Common bonding patterns and exceptions
const BONDING_RULES = {
  // Octet rule exceptions
  hypervalent: ['P', 'S', 'Cl', 'Br', 'I', 'Xe', 'Kr', 'As', 'Se', 'Te'], // Can expand octet
  incompleteOctet: ['H', 'He', 'Li', 'Be', 'B', 'Al'], // Don't need full octet
  
  // Maximum bonds (hard limits)
  maxBonds: {
    H: 1, He: 0, Li: 1, Be: 2, B: 4, C: 4, N: 4, O: 3, F: 1, Ne: 0,
    Na: 1, Mg: 2, Al: 6, Si: 6, P: 6, S: 6, Cl: 7, Ar: 0,
    K: 1, Ca: 2, Ga: 4, Ge: 4, As: 6, Se: 6, Br: 7, Kr: 0
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
  type: 'incomplete-octet' | 'expanded-octet' | 'hypervalent' | 'unusual-bond' | 'charge-imbalance' | 'valency-exceeded'
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

    // Calculate basic stats
    this.calculateCounts(result)
    
    // Validate rules
    this.validateValency(result)
    this.validateOctetRule(result)
    this.validateBondingPatterns(result)
    this.validateChargeBalance(result)
    
    // Generate suggestions
    this.generateSuggestions(result)

    this.validationCache.set(cacheKey, result)
    return result
  }

  private generateCacheKey(): string {
    const atomKey = this.atoms.map(a => `${a.id}:${a.element}`).join('|') // Simplified key
    const bondKey = this.bonds.map(b => `${b.id}:${b.from}:${b.to}:${b.type}`).join('|')
    return `${atomKey}::${bondKey}`
  }

  private calculateCounts(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      // Count valence electrons (just the number the atom brings)
      result.electronCounts[atom.id] = VALENCE_ELECTRONS[atom.element] || 0
      
      // Count bonds
      const atomBonds = this.bonds.filter(b => b.from === atom.id || b.to === atom.id)
      let totalBonds = 0
      atomBonds.forEach(b => {
        if (b.type === 'single') totalBonds += 1
        if (b.type === 'double') totalBonds += 2
        if (b.type === 'triple') totalBonds += 3
        if (b.type === 'dative') totalBonds += 1
        if (b.type === 'ionic') totalBonds += 0 // Ionic doesn't count as covalent bond
      })
      result.bondCounts[atom.id] = totalBonds
    })
  }

  private getBondElectronCount(atomId: string): number {
    // Electrons contributed by THIS atom to bonds
    const atom = this.atoms.find(a => a.id === atomId)
    if (!atom) return 0

    let contributedElectrons = 0
    this.bonds.forEach(bond => {
      if (bond.from === atomId || bond.to === atomId) {
        switch (bond.type) {
          case 'single': contributedElectrons += 1; break
          case 'double': contributedElectrons += 2; break
          case 'triple': contributedElectrons += 3; break
          case 'dative': 
            // Donor (from) gives 2, Acceptor (to) gives 0
            if (bond.from === atomId) contributedElectrons += 2;
            else contributedElectrons += 0;
            break;
          // Ionic bonds involve transfer, simplified here
        }
      }
    })
    return contributedElectrons
  }

  private getValenceShellElectronCount(atomId: string): number {
    const atom = this.atoms.find(a => a.id === atomId)
    if (!atom) return 0

    const valence = VALENCE_ELECTRONS[atom.element] || 0
    const contributed = this.getBondElectronCount(atomId)
    
    // Remaining electrons on atom (lone pairs)
    const lonePairElectrons = Math.max(0, valence - contributed)
    
    // Electrons shared in bonds (2 per single bond, 4 per double, etc.)
    // Assuming covalent bonds share equally
    let sharedElectrons = 0
    this.bonds.forEach(bond => {
      if (bond.from === atomId || bond.to === atomId) {
        switch (bond.type) {
          case 'single': sharedElectrons += 2; break
          case 'double': sharedElectrons += 4; break
          case 'triple': sharedElectrons += 6; break
          case 'dative': sharedElectrons += 2; break
        }
      }
    })

    return lonePairElectrons + sharedElectrons
  }

  private validateValency(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      const currentBonds = result.bondCounts[atom.id]
      const max = (BONDING_RULES.maxBonds as any)[atom.element]
      
      if (max !== undefined && currentBonds > max) {
        result.warnings.push({
          type: 'valency-exceeded',
          atomId: atom.id,
          atomSymbol: atom.element,
          message: `${atom.element} has ${currentBonds} bonds (max possible: ${max})`,
          severity: 'high'
        })
        result.isValid = false
      }
    })
  }

  private validateOctetRule(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      const totalElectrons = this.getValenceShellElectronCount(atom.id)
      
      // Incomplete octet check
      if (!BONDING_RULES.incompleteOctet.includes(atom.element)) {
        if (totalElectrons < 8) {
          result.warnings.push({
            type: 'incomplete-octet',
            atomId: atom.id,
            atomSymbol: atom.element,
            message: `${atom.element} has incomplete octet (${totalElectrons}e⁻)`,
            severity: 'medium'
          })
          // Don't invalidate for incomplete octet, it's just unstable usually
        }
      }
      
      // Expanded octet check
      if (totalElectrons > 8 && !BONDING_RULES.hypervalent.includes(atom.element)) {
        result.warnings.push({
          type: 'expanded-octet',
          atomId: atom.id,
          atomSymbol: atom.element,
          message: `${atom.element} exceeds octet rule (${totalElectrons}e⁻)`,
          severity: 'high'
        })
        result.isValid = false
      }
    })
  }

  private validateBondingPatterns(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      // Triple bond check
      this.bonds.forEach(bond => {
        if ((bond.from === atom.id || bond.to === atom.id) && bond.type === 'triple') {
          if (!['C', 'N', 'O', 'S', 'P'].includes(atom.element)) {
            result.warnings.push({
              type: 'unusual-bond',
              atomId: atom.id,
              atomSymbol: atom.element,
              message: `Triple bond on ${atom.element} is unstable`,
              severity: 'medium'
            })
          }
        }
      })
    })
  }

  private validateChargeBalance(result: ValidationResult): void {
    const ionicBonds = this.bonds.filter(b => b.type === 'ionic')
    if (ionicBonds.length > 0) {
      // Simplified charge check
      // Ideally would check if cations match anions
    }
  }

  private generateSuggestions(result: ValidationResult): void {
    this.atoms.forEach(atom => {
      const currentBonds = result.bondCounts[atom.id]
      const standard = STANDARD_VALENCY[atom.element]
      
      if (standard && currentBonds < standard) {
        const diff = standard - currentBonds
        result.suggestions.push({
          type: 'add-hydrogen',
          atomId: atom.id,
          atomSymbol: atom.element,
          action: `Add ${diff} Hydrogen(s)`,
          reason: `To satisfy standard valency of ${standard}`
        })
      }
    })
  }

  // Improved Auto-completion
  autoCompleteWithHydrogen(): { newAtoms: Atom[], newBonds: Bond[] } {
    const newAtoms: Atom[] = []
    const newBonds: Bond[] = []
    const BOND_LENGTH = 2.0 // Angstroms, optimized for visual clarity

    this.atoms.forEach(atom => {
      const currentBonds = this.bonds.filter(b => b.from === atom.id || b.to === atom.id)
      let currentBondCount = 0
      currentBonds.forEach(b => {
        if (b.type === 'single') currentBondCount += 1
        if (b.type === 'double') currentBondCount += 2
        if (b.type === 'triple') currentBondCount += 3
      })

      const standard = STANDARD_VALENCY[atom.element] || 0
      
      if (currentBondCount < standard) {
        const needed = standard - currentBondCount
        
        // Calculate existing bond vectors to avoid overlap
        const existingVectors = currentBonds.map(b => {
          const otherId = b.from === atom.id ? b.to : b.from
          const otherAtom = this.atoms.find(a => a.id === otherId)
          if (!otherAtom) return { x: 1, y: 0, z: 0 }
          
          return this.normalize({
            x: otherAtom.x - atom.x,
            y: otherAtom.y - atom.y,
            z: otherAtom.z - atom.z
          })
        })

        // Generate positions using VSEPR-like logic (simplified)
        // Try random vectors and pick ones furthest from existing bonds
        for (let i = 0; i < needed; i++) {
          let bestDir = { x: 0, y: 1, z: 0 }
          let maxMinDist = -1

          // Try 50 random directions to find best gap
          for (let attempt = 0; attempt < 50; attempt++) {
            const phi = Math.acos(2 * Math.random() - 1)
            const theta = Math.random() * 2 * Math.PI
            const dir = {
              x: Math.sin(phi) * Math.cos(theta),
              y: Math.sin(phi) * Math.sin(theta),
              z: Math.cos(phi)
            }

            // Calculate min distance (dot product) to existing vectors
            // Dot product = 1 means same dir, -1 means opposite
            // We want to minimize max dot product (furthest away)
            let maxDot = -1
            
            // Check against existing bonds
            existingVectors.forEach(v => {
              const dot = dir.x*v.x + dir.y*v.y + dir.z*v.z
              if (dot > maxDot) maxDot = dot
            })
            
            // Also check against new bonds we just added for this atom
            // (Not implemented here for simplicity, but helps)

            // We want the direction that has the lowest 'maxDot' (most isolation)
            if (existingVectors.length === 0) {
              bestDir = dir
              break // No constraints
            }

            if (maxDot < 0.5) { // Threshold for "good enough"
               bestDir = dir
               // If it's really good, take it
               if (maxDot < -0.5) break
            }
            
            // Keep track of best found so far
            // Actually, we want to MINIMIZE the MAX dot product (closest neighbor)
            // Wait, logic above is slightly messy. 
            // Simplified: Just use tetrahedron vertices if C, etc.
            // For now, random search with best-of-N is robust enough for general cases.
            bestDir = dir // Placeholder
          }
          
          // Use tetrahedral vectors for standard cases if possible, but random search with repulsion is easier to implement generically
          // Let's implement a simple repulsion algorithm
          
          // Start with random
          let dir = this.randomSpherePoint()
          
          // Iterative repulsion
          for(let iter=0; iter<5; iter++) {
             let force = {x:0, y:0, z:0}
             existingVectors.forEach(v => {
                const distSq = (dir.x-v.x)**2 + (dir.y-v.y)**2 + (dir.z-v.z)**2
                if (distSq < 0.01) return
                const f = 1/distSq
                force.x -= (v.x - dir.x) * f
                force.y -= (v.y - dir.y) * f
                force.z -= (v.z - dir.z) * f
             })
             
             dir.x += force.x * 0.1
             dir.y += force.y * 0.1
             dir.z += force.z * 0.1
             dir = this.normalize(dir)
          }
          
          const newH: Atom = {
            id: `H-${Date.now()}-${i}-${Math.random()}`,
            element: 'H',
            x: atom.x + dir.x * BOND_LENGTH,
            y: atom.y + dir.y * BOND_LENGTH,
            z: atom.z + dir.z * BOND_LENGTH,
            color: '#FFFFFF'
          }
          
          newAtoms.push(newH)
          newBonds.push({
            id: `bond-${newH.id}`,
            from: atom.id,
            to: newH.id,
            type: 'single'
          })
          
          // Add this new bond vector to constraints for next H
          existingVectors.push(dir)
        }
      }
    })

    return { newAtoms, newBonds }
  }

  private randomSpherePoint() {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * 2 * Math.PI
    return {
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi)
    }
  }

  private normalize(v: {x:number, y:number, z:number}) {
    const len = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
    return len === 0 ? {x:0,y:1,z:0} : {x:v.x/len, y:v.y/len, z:v.z/len}
  }

  getValidationSummary() {
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

export function validateMolecule(atoms: Atom[], bonds: Bond[]): ValidationResult {
  return new ChemicalValidator(atoms, bonds).validate()
}

export function calculateOptimalBondPosition(
  referenceAtom: Atom,
  existingAtoms: Atom[],
  bondLength: number = 2.5
): { x: number; y: number; z: number } {
  // Find connected neighbors (simplified distance check) for explicit angle optimization
  const neighbors = existingAtoms.filter(a => {
    if (a.id === referenceAtom.id) return false
    const dx = a.x - referenceAtom.x
    const dy = a.y - referenceAtom.y
    const dz = a.z - referenceAtom.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    return dist < (bondLength * 1.5) // Adaptive neighbor check
  })

  const existingVectors = neighbors.map(a => {
    const dx = a.x - referenceAtom.x
    const dy = a.y - referenceAtom.y
    const dz = a.z - referenceAtom.z
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
    return len === 0 ? { x: 1, y: 0, z: 0 } : { x: dx / len, y: dy / len, z: dz / len }
  })

  // Iterative repulsion algorithm to find optimal hole
  // Instead of random start, pick the best initial direction from a set of candidates (Fibonacci sphere)
  let bestDir = { x: 0, y: 0, z: 1 }
  let minRepulsion = Infinity
  
  const numPoints = 32
  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = 2.39996 * i // Golden angle

    const candDir = {
      x: Math.cos(theta) * radius,
      y: y,
      z: Math.sin(theta) * radius
    }

    let energy = 0
    
    // Bond repulsion
    if (existingVectors.length > 0) {
      existingVectors.forEach(v => {
         const dot = candDir.x*v.x + candDir.y*v.y + candDir.z*v.z
         // Penalize directions close to existing bonds
         // (1 + dot) ranges from 0 (opposite) to 2 (same)
         // We want to minimize this.
         energy += Math.pow(1 + dot, 4) // Higher power = sharper repulsion
      })
    } else {
      // If no neighbors, prefer specific orientation or just first one
      // But to avoid "different every time", this loop is deterministic.
      // However, to make it look nicer, maybe prefer +X or +Y?
      // For now, energy is 0, so it keeps the first one.
    }
    
    if (energy < minRepulsion) {
       minRepulsion = energy
       bestDir = candDir
    }
  }

  let dir = bestDir
  
  // Normalize (just in case)
  let len = Math.sqrt(dir.x*dir.x + dir.y*dir.y + dir.z*dir.z)
  if (len === 0) len = 1
  dir = { x: dir.x/len, y: dir.y/len, z: dir.z/len }

  // 10 iterations of repulsion
  for (let iter = 0; iter < 10; iter++) {
    let force = { x: 0, y: 0, z: 0 }
    
    // 1. Repulsion from bonded neighbors (Bond Angle Optimization)
    if (existingVectors.length > 0) {
      existingVectors.forEach(v => {
        const distSq = (dir.x - v.x) ** 2 + (dir.y - v.y) ** 2 + (dir.z - v.z) ** 2
        if (distSq < 0.001) return
        const f = 1 / distSq
        force.x -= (v.x - dir.x) * f
        force.y -= (v.y - dir.y) * f
        force.z -= (v.z - dir.z) * f
      })
    }

    // 2. Steric repulsion from ALL atoms (Collision Avoidance)
    existingAtoms.forEach(a => {
      if (a.id === referenceAtom.id) return
      
      const vToAtom = { x: a.x - referenceAtom.x, y: a.y - referenceAtom.y, z: a.z - referenceAtom.z }
      const dist = Math.sqrt(vToAtom.x**2 + vToAtom.y**2 + vToAtom.z**2)
      
      if (dist > 5.0) return // Optimization: ignore far atoms
      
      // Normalize vector to atom
      const vToAtomNorm = { x: vToAtom.x/dist, y: vToAtom.y/dist, z: vToAtom.z/dist }
      
      // Check if we are pointing towards this atom
      const dot = dir.x*vToAtomNorm.x + dir.y*vToAtomNorm.y + dir.z*vToAtomNorm.z
      
      if (dot > 0.5) {
         // Repel if we are pointing roughly towards it
         const repulsion = (dot - 0.5) * 2.0 // Strength 0 to 1
         // Stronger repulsion for closer atoms
         const distFactor = 1.0 / Math.max(0.1, dist)
         
         force.x -= vToAtomNorm.x * repulsion * distFactor
         force.y -= vToAtomNorm.y * repulsion * distFactor
         force.z -= vToAtomNorm.z * repulsion * distFactor
      }
    })

    dir.x += force.x * 0.2
    dir.y += force.y * 0.2
    dir.z += force.z * 0.2
    
    // Normalize again
    len = Math.sqrt(dir.x*dir.x + dir.y*dir.y + dir.z*dir.z)
    if (len === 0) len = 1
    dir = { x: dir.x/len, y: dir.y/len, z: dir.z/len }
  }

  return {
    x: referenceAtom.x + dir.x * bondLength,
    y: referenceAtom.y + dir.y * bondLength,
    z: referenceAtom.z + dir.z * bondLength
  }
}
