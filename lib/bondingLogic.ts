import { Atom, Bond } from '@/types/molecule'

const BOND_THRESHOLD = 2.5
const VALENCE_RULES: Record<string, number> = {
  H: 1,
  C: 4,
  N: 3,
  O: 2,
  S: 2,
  P: 3,
  Cl: 1,
  Br: 1,
}

// Electronegativity for ionic bond detection
const ELECTRONEGATIVITY: Record<string, number> = {
  H: 2.1,
  C: 2.55,
  N: 3.04,
  O: 3.44,
  S: 2.58,
  P: 2.19,
  Cl: 3.16,
  Br: 2.96,
}

// Ionic bond threshold (difference in electronegativity)
const IONIC_THRESHOLD = 1.7

export function calculateDistance(a1: Atom, a2: Atom): number {
  const dx = a1.x - a2.x
  const dy = a1.y - a2.y
  const dz = a1.z - a2.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function calculateBonds(atoms: Atom[]): Bond[] {
  const bonds: Bond[] = []
  const bondMap = new Map<string, number>()

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const distance = calculateDistance(atoms[i], atoms[j])

      if (distance < BOND_THRESHOLD) {
        const bondKey = `${atoms[i].id}-${atoms[j].id}`
        const bondKey2 = `${atoms[j].id}-${atoms[i].id}`

        if (!bondMap.has(bondKey) && !bondMap.has(bondKey2)) {
          bonds.push({
            id: `bond-${Date.now()}-${i}-${j}`,
            from: atoms[i].id,
            to: atoms[j].id,
            type: 'single',
          })
          bondMap.set(bondKey, 1)
        }
      }
    }
  }

  return bonds
}

export function getAtomValence(element: string): number {
  return VALENCE_RULES[element] || 0
}

export function getUsedValence(atomId: string, bonds: Bond[]): number {
  return bonds
    .filter(b => b.from === atomId || b.to === atomId)
    .reduce((sum, bond) => {
      const multiplier = bond.type === 'single' ? 1 : bond.type === 'double' ? 2 : bond.type === 'triple' ? 3 : bond.type === 'dative' ? 1 : 0
      return sum + multiplier
    }, 0)
}

export function canFormBond(
  fromAtom: Atom,
  toAtom: Atom,
  bonds: Bond[],
  bondType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' | 'dative' = 'single'
): boolean {
  // Hydrogen bonds are always allowed (intermolecular)
  if (bondType === 'hydrogen') return true
  if (bondType === 'dative') return true // Allow dative bonds generally (simplified)

  // Ionic bonds are allowed between different elements
  if (bondType === 'ionic') {
    const enDiff = Math.abs((ELECTRONEGATIVITY[fromAtom.element] || 0) - (ELECTRONEGATIVITY[toAtom.element] || 0))
    return enDiff >= IONIC_THRESHOLD
  }

  // Covalent bonds check valency
  const fromValence = getAtomValence(fromAtom.element)
  const toValence = getAtomValence(toAtom.element)

  const fromUsed = getUsedValence(fromAtom.id, bonds)
  const toUsed = getUsedValence(toAtom.id, bonds)

  const multiplier = bondType === 'single' ? 1 : bondType === 'double' ? 2 : bondType === 'triple' ? 3 : 1

  return fromUsed + multiplier <= fromValence && toUsed + multiplier <= toValence
}

export function getAvailableBondTypes(
  fromAtom: Atom,
  toAtom: Atom,
  bonds: Bond[]
): Array<'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' | 'dative'> {
  const available: Array<'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' | 'dative'> = []

  // Always allow hydrogen bonds
  available.push('hydrogen')
  available.push('dative')

  // Check covalent bonds
  if (canFormBond(fromAtom, toAtom, bonds, 'single')) available.push('single')
  if (canFormBond(fromAtom, toAtom, bonds, 'double')) available.push('double')
  if (canFormBond(fromAtom, toAtom, bonds, 'triple')) available.push('triple')

  // Check ionic bonds
  if (canFormBond(fromAtom, toAtom, bonds, 'ionic')) available.push('ionic')

  return available
}

export function updateBondsOnMove(
  atomId: string,
  atoms: Atom[],
  bonds: Bond[]
): Bond[] {
  const movedAtom = atoms.find(a => a.id === atomId)
  if (!movedAtom) return bonds

  const updatedBonds = bonds.filter(bond => {
    if (bond.from === atomId || bond.to === atomId) {
      const otherAtomId = bond.from === atomId ? bond.to : bond.from
      const otherAtom = atoms.find(a => a.id === otherAtomId)

      if (!otherAtom) return false

      const distance = calculateDistance(movedAtom, otherAtom)
      return distance < BOND_THRESHOLD
    }
    return true
  })

  return updatedBonds
}

export function getMolecularFormula(atoms: Atom[]): string {
  const elementCounts: Record<string, number> = {}

  atoms.forEach(atom => {
    elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1
  })

  return Object.entries(elementCounts)
    .sort(([a], [b]) => {
      if (a === 'C') return -1
      if (b === 'C') return 1
      if (a === 'H') return -1
      if (b === 'H') return 1
      return a.localeCompare(b)
    })
    .map(([element, count]) => `${element}${count > 1 ? count : ''}`)
    .join('')
}

export function calculateMolecularWeight(atoms: Atom[]): number {
  const ATOMIC_WEIGHTS: Record<string, number> = {
    H: 1.008,
    C: 12.011,
    N: 14.007,
    O: 15.999,
    S: 32.06,
    P: 30.974,
    Cl: 35.45,
    Br: 79.904,
  }

  return atoms.reduce((sum, atom) => sum + (ATOMIC_WEIGHTS[atom.element] || 0), 0)
}
