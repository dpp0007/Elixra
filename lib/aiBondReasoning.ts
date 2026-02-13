import { Atom, Bond } from '@/types/molecule'

/**
 * AI Bond Reasoning System
 * Generates educational explanations for molecular bonds
 * Follows strict guidelines to avoid forbidden inferences
 */

// Bond type definitions
export const BOND_DEFINITIONS = {
  single: {
    label: '—',
    name: 'Single Bond',
    definition: 'Two atoms share one pair of electrons',
    strength: 'Typical (~100 kcal/mol)',
    role: 'Forms the primary molecular skeleton',
  },
  double: {
    label: '=',
    name: 'Double Bond',
    definition: 'Two atoms share two pairs of electrons',
    strength: 'Stronger than single (~150 kcal/mol)',
    role: 'Indicates unsaturation, affects molecular properties',
  },
  triple: {
    label: '≡',
    name: 'Triple Bond',
    definition: 'Two atoms share three pairs of electrons',
    strength: 'Strongest covalent (~200 kcal/mol)',
    role: 'Indicates high unsaturation, linear geometry',
  },
  ionic: {
    label: '↔',
    name: 'Ionic Bond',
    definition: 'Electron transfer from one atom to another',
    strength: 'Electrostatic attraction',
    role: 'Forms primary structure in ionic compounds',
  },
  hydrogen: {
    label: '⋯',
    name: 'Hydrogen Bond',
    definition: 'Weak attraction between H and electronegative atom',
    strength: 'Weak (~5 kcal/mol)',
    role: 'Intermolecular force, affects physical properties',
  },
  dative: {
    label: '→',
    name: 'Coordinate Bond',
    definition: 'One atom provides both electrons for the bond',
    strength: 'Variable',
    role: 'Formation of complexes and Lewis adducts',
  },
}

// Forbidden inferences - AI must NEVER infer these
export const FORBIDDEN_INFERENCES = [
  'lone pairs',
  'hybridization',
  'orbital overlap',
  'sigma/pi bonds',
  'resonance structures',
  'formal charges',
  'oxidation states',
  'bond angles',
  '3D geometry',
  'molecular orbital theory',
  'electronegativity differences',
  'reaction mechanisms',
  'thermodynamic properties',
  'spectroscopic data',
]

// Allowed observations
export const ALLOWED_OBSERVATIONS = [
  'bond types explicitly shown',
  'atom types and count',
  'molecular formula',
  'structural connectivity',
  'relative bond strength',
  'common bond patterns',
  'educational context',
]

/**
 * Molecule state contract - validates structure before AI processing
 */
export interface MoleculeState {
  moleculeId: string
  moleculeName: string
  atoms: Array<{
    id: string
    element: string
    atomicNumber: number
    position: { x: number; y: number; z: number }
  }>
  bonds: Array<{
    id: string
    atomA_id: string
    atomB_id: string
    bond_type: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen'
    created_at: string
    user_created: boolean
  }>
  timestamp: string
}

/**
 * Validates molecule state before sending to AI
 */
export function validateMoleculeState(atoms: Atom[], bonds: Bond[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate atoms
  if (!atoms || atoms.length === 0) {
    errors.push('No atoms in molecule')
  }

  atoms.forEach((atom) => {
    if (!atom.id || !atom.element) {
      errors.push(`Atom missing id or element: ${JSON.stringify(atom)}`)
    }
    if (typeof atom.x !== 'number' || typeof atom.y !== 'number' || typeof atom.z !== 'number') {
      errors.push(`Atom ${atom.id} has invalid position`)
    }
  })

  // Validate bonds
  bonds.forEach((bond) => {
    if (!bond.id || !bond.from || !bond.to) {
      errors.push(`Bond missing id, from, or to: ${JSON.stringify(bond)}`)
    }

    // Check for self-bonds
    if (bond.from === bond.to) {
      errors.push(`Self-bond detected: ${bond.id}`)
    }

    // Check atom references
    const fromAtom = atoms.find((a) => a.id === bond.from)
    const toAtom = atoms.find((a) => a.id === bond.to)

    if (!fromAtom) {
      errors.push(`Bond ${bond.id} references non-existent atom: ${bond.from}`)
    }
    if (!toAtom) {
      errors.push(`Bond ${bond.id} references non-existent atom: ${bond.to}`)
    }

    // Check bond type
    const validTypes = ['single', 'double', 'triple', 'ionic', 'hydrogen', 'dative']
    if (!validTypes.includes(bond.type)) {
      errors.push(`Bond ${bond.id} has invalid type: ${bond.type}`)
    }
  })

  // Check for duplicate bonds
  const bondPairs = new Set<string>()
  bonds.forEach((bond) => {
    const pair = [bond.from, bond.to].sort().join('-')
    if (bondPairs.has(pair)) {
      errors.push(`Duplicate bond between ${bond.from} and ${bond.to}`)
    }
    bondPairs.add(pair)
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Converts molecule data to AI-compatible state contract
 */
export function createMoleculeState(
  moleculeName: string,
  atoms: Atom[],
  bonds: Bond[]
): MoleculeState {
  return {
    moleculeId: `mol-${Date.now()}`,
    moleculeName,
    atoms: atoms.map((atom) => ({
      id: atom.id,
      element: atom.element,
      atomicNumber: getAtomicNumber(atom.element),
      position: { x: atom.x, y: atom.y, z: atom.z },
    })),
    bonds: bonds.map((bond) => ({
      id: bond.id,
      atomA_id: bond.from,
      atomB_id: bond.to,
      bond_type: bond.type as 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' | 'dative',
      created_at: new Date().toISOString(),
      user_created: true,
    })),
    timestamp: new Date().toISOString(),
  }
}

/**
 * Gets atomic number for element
 */
function getAtomicNumber(element: string): number {
  const atomicNumbers: Record<string, number> = {
    H: 1,
    C: 6,
    N: 7,
    O: 8,
    S: 16,
    P: 15,
    Cl: 17,
    Br: 35,
  }
  return atomicNumbers[element] || 0
}

/**
 * Generates educational explanation for a single bond
 */
export function explainSingleBond(atom1: Atom, atom2: Atom): string {
  return `This molecule contains a single bond between ${atom1.element} and ${atom2.element}, which represents two atoms sharing one pair of electrons. Single bonds are the most common type of covalent bond and form the backbone of most organic molecules. This bond holds the atoms together in a stable structure.`
}

/**
 * Generates educational explanation for a double bond
 */
export function explainDoubleBond(atom1: Atom, atom2: Atom): string {
  return `This molecule contains a double bond between ${atom1.element} and ${atom2.element}, which represents two atoms sharing two pairs of electrons. Double bonds are stronger than single bonds and indicate unsaturation in the molecule. The presence of a double bond means the atoms are more tightly bonded together.`
}

/**
 * Generates educational explanation for a triple bond
 */
export function explainTripleBond(atom1: Atom, atom2: Atom): string {
  return `This molecule contains a triple bond between ${atom1.element} and ${atom2.element}, which represents two atoms sharing three pairs of electrons. Triple bonds are the strongest covalent bonds and indicate high unsaturation. The high bond strength explains why molecules with triple bonds are often very stable.`
}

/**
 * Generates educational explanation for an ionic bond
 */
export function explainIonicBond(atom1: Atom, atom2: Atom): string {
  return `This molecule contains an ionic bond between ${atom1.element} and ${atom2.element}, which represents electron transfer from one atom to another. Ionic bonds form through electrostatic attraction between charged ions. In this case, one atom transfers electrons to the other, and the resulting ions hold the compound together.`
}

/**
 * Generates educational explanation for a hydrogen bond
 */
export function explainHydrogenBond(atom1: Atom, atom2: Atom): string {
  return `This molecule contains a hydrogen bond between ${atom1.element} and ${atom2.element}, which represents a weak attraction. Hydrogen bonds are intermolecular forces, not true chemical bonds, but they significantly affect molecular properties. While hydrogen bonds are much weaker than covalent bonds, they are crucial for many important molecular behaviors.`
}

/**
 * Generates educational explanation for a dative bond
 */
export function explainDativeBond(atom1: Atom, atom2: Atom): string {
  return `This molecule contains a coordinate (dative) bond between ${atom1.element} and ${atom2.element}, where both electrons in the bond come from the same atom. This is common in Lewis acid-base adducts and transition metal complexes. It highlights the versatility of electron sharing beyond simple covalent bonding.`
}

/**
 * Generates explanation for a specific bond
 */
export function explainBond(bond: Bond, atoms: Atom[]): string {
  const atom1 = atoms.find((a) => a.id === bond.from)
  const atom2 = atoms.find((a) => a.id === bond.to)

  if (!atom1 || !atom2) {
    return 'Bond atoms not found'
  }

  switch (bond.type) {
    case 'single':
      return explainSingleBond(atom1, atom2)
    case 'double':
      return explainDoubleBond(atom1, atom2)
    case 'triple':
      return explainTripleBond(atom1, atom2)
    case 'ionic':
      return explainIonicBond(atom1, atom2)
    case 'hydrogen':
      return explainHydrogenBond(atom1, atom2)
    case 'dative':
      return explainDativeBond(atom1, atom2)
    default:
      return 'Unknown bond type'
  }
}

/**
 * Generates comprehensive explanation for entire molecule
 */
export function explainMolecule(moleculeName: string, atoms: Atom[], bonds: Bond[]): string {
  if (bonds.length === 0) {
    return `${moleculeName} contains ${atoms.length} atom(s) but no bonds. You might want to add bonds to connect the atoms.`
  }

  if (bonds.length === 1) {
    const bond = bonds[0]
    return explainBond(bond, atoms)
  }

  // Multiple bonds
  const bondExplanations = bonds.map((bond) => {
    const atom1 = atoms.find((a) => a.id === bond.from)
    const atom2 = atoms.find((a) => a.id === bond.to)
    if (!atom1 || !atom2) return ''

    const bondDef = BOND_DEFINITIONS[bond.type as keyof typeof BOND_DEFINITIONS]
    return `- ${bondDef.name} between ${atom1.element} and ${atom2.element}: ${bondDef.definition}`
  })

  const bondList = bondExplanations.filter((e) => e).join('\n')

  return `${moleculeName} contains ${bonds.length} bond(s):\n${bondList}\n\nThese bonds connect the atoms together to form the molecular structure. The different bond types indicate different strengths and properties.`
}

/**
 * Detects unusual bonds and provides educational feedback
 */
export function detectUnusualBond(bond: Bond, atoms: Atom[]): string | null {
  const atom1 = atoms.find((a) => a.id === bond.from)
  const atom2 = atoms.find((a) => a.id === bond.to)

  if (!atom1 || !atom2) return null

  // Triple bond with hydrogen
  if (bond.type === 'triple' && (atom1.element === 'H' || atom2.element === 'H')) {
    return `You've created a triple bond with hydrogen. In typical chemistry, hydrogen atoms form only single bonds because they have only one electron to share. A triple bond would require three electron pairs, but hydrogen cannot provide this. This is a good opportunity to learn about valence: hydrogen's valence is 1, meaning it typically forms only one bond.`
  }

  // Ionic bond between two nonmetals
  if (bond.type === 'ionic') {
    const nonmetals = ['H', 'C', 'N', 'O', 'S', 'P', 'Cl', 'Br']
    if (nonmetals.includes(atom1.element) && nonmetals.includes(atom2.element)) {
      return `You've created an ionic bond between two nonmetals (${atom1.element} and ${atom2.element}). While ionic bonds typically form between metals and nonmetals, it's possible for two nonmetals to form ionic bonds under certain conditions. However, these atoms more commonly form covalent bonds. This is a great example of how chemistry can be complex: the same atoms can bond in different ways depending on conditions.`
    }
  }

  return null
}

/**
 * Provides feedback for incomplete molecules
 */
export function checkMoleculeCompleteness(atoms: Atom[], bonds: Bond[]): string | null {
  if (atoms.length === 0) {
    return 'No atoms in molecule. Add atoms to get started.'
  }

  if (bonds.length === 0 && atoms.length > 1) {
    return `This molecule has ${atoms.length} atoms but no bonds. You might want to add bonds to connect the atoms.`
  }

  // Check for isolated atoms
  const connectedAtoms = new Set<string>()
  bonds.forEach((bond) => {
    connectedAtoms.add(bond.from)
    connectedAtoms.add(bond.to)
  })

  const isolatedAtoms = atoms.filter((a) => !connectedAtoms.has(a.id))
  if (isolatedAtoms.length > 0) {
    return `This molecule has ${isolatedAtoms.length} isolated atom(s) not connected to any bonds. You might want to add bonds to connect them.`
  }

  return null
}
