export interface Atom {
  id: string
  element: string
  x: number
  y: number
  z: number
  color: string
}

export interface Bond {
  id: string
  from: string
  to: string
  type: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' | 'aromatic' | 'dative'
}

export interface MoleculeState {
  atoms: Atom[]
  bonds: Bond[]
  selectedAtomId: string | null
  selectedBondId: string | null
  moleculeName: string
}

export interface Element {
  symbol: string
  name: string
  color: string
  atomicNumber?: number
  atomicWeight?: number
}
