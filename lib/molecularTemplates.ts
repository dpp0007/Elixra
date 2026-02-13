import { Atom, Bond } from '@/types/molecule'
import { GeometryGenerator } from '@/lib/geometryGenerator'

export interface MolecularTemplate {
  id: string
  name: string
  category: 'functional-group' | 'ring' | 'basic-molecule' | 'biomolecule' | 'drug'
  description: string
  atoms: Atom[]
  bonds: Bond[]
  formula: string
  molecularWeight: number
  hotkey?: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  educationalNotes?: string[]
}

// CPK color standard
const ELEMENT_COLORS = {
  H: '#FFFFFF',  // White
  C: '#909090',  // Grey
  N: '#3050F8',  // Blue
  O: '#FF0D0D',  // Red
  F: '#90E050',  // Green
  Cl: '#1FF01F',  // Green
  Br: '#A62929',  // Dark red
  I: '#940094',   // Purple
  P: '#FF8000',   // Orange
  S: '#FFFF30',   // Yellow
  B: '#FFB5B5',   // Pink (Boron)
  I: '#940094',   // Purple (Iodine)
  Xe: '#429EB0',  // Teal (Xenon)
}

function createGeometricTemplate(
  name: string, 
  sides: number, 
  center: string, 
  outer: string, 
  isVSEPR: boolean = false
): MolecularTemplate {
  const config = {
    centerElement: center,
    outerElement: outer,
    bondLength: 1.5,
    centerColor: ELEMENT_COLORS[center as keyof typeof ELEMENT_COLORS] || '#909090',
    outerColor: ELEMENT_COLORS[outer as keyof typeof ELEMENT_COLORS] || '#FFFFFF'
  };

  const { atoms, bonds } = isVSEPR 
    ? GeometryGenerator.generateVSEPR(sides, config)
    : GeometryGenerator.generatePolygon(sides, config);

  return {
    id: `geo-${name.toLowerCase()}`,
    name: `${name} Geometry`,
    category: 'basic-molecule',
    description: `A ${name.toLowerCase()} arrangement of atoms (${isVSEPR ? '3D VSEPR' : 'Planar Polygon'}).`,
    formula: `${center}${outer}${sides}`,
    molecularWeight: 0, 
    tags: ['geometry', name.toLowerCase(), isVSEPR ? 'vsepr' : 'planar'],
    difficulty: 'intermediate',
    atoms,
    bonds
  };
}

export const MOLECULAR_TEMPLATES: MolecularTemplate[] = [
  // New Geometries
  createGeometricTemplate('Triangular Planar', 3, 'B', 'H'),
  createGeometricTemplate('Pentagonal Planar', 5, 'Xe', 'F'),
  createGeometricTemplate('Hexagonal Planar', 6, 'C', 'H'), 
  createGeometricTemplate('Heptagonal Planar', 7, 'C', 'H'),
  createGeometricTemplate('Octagonal Planar', 8, 'C', 'H'),
  
  // VSEPR 3D Geometries
  createGeometricTemplate('Trigonal Bipyramidal', 5, 'P', 'Cl', true),
  createGeometricTemplate('Octahedral', 6, 'S', 'F', true),
  createGeometricTemplate('Pentagonal Bipyramidal', 7, 'I', 'F', true),
  createGeometricTemplate('Square Antiprismatic', 8, 'Xe', 'F', true),

  // Functional Groups
  {
    id: 'methyl-group',
    name: 'Methyl Group (-CH₃)',
    category: 'functional-group',
    description: 'A methyl group is an alkyl derived from methane, containing one carbon atom bonded to three hydrogen atoms.',
    formula: 'CH₃',
    molecularWeight: 15.03,
    hotkey: 'M',
    tags: ['alkyl', 'methane', 'organic', 'basic'],
    difficulty: 'beginner',
    educationalNotes: [
      'The methyl group is the simplest alkyl group',
      'Carbon forms four single bonds (tetrahedral geometry)',
      'Common in organic molecules like methane and methyl chloride'
    ],
    atoms: [
      { id: 'c1', element: 'C', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'h1', element: 'H', x: 1.09, y: 0, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h2', element: 'H', x: -0.545, y: 0.945, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h3', element: 'H', x: -0.545, y: -0.945, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'h1', type: 'single' },
      { id: 'b2', from: 'c1', to: 'h2', type: 'single' },
      { id: 'b3', from: 'c1', to: 'h3', type: 'single' }
    ]
  },
  {
    id: 'hydroxyl-group',
    name: 'Hydroxyl Group (-OH)',
    category: 'functional-group',
    description: 'A hydroxyl group consists of an oxygen atom covalently bonded to a hydrogen atom.',
    formula: 'OH',
    molecularWeight: 17.01,
    hotkey: 'H',
    tags: ['hydroxyl', 'alcohol', 'polar', 'hydrogen-bonding'],
    difficulty: 'beginner',
    educationalNotes: [
      'Forms hydrogen bonds due to polarity',
      'Characteristic of alcohols',
      'Oxygen has two lone pairs of electrons'
    ],
    atoms: [
      { id: 'o1', element: 'O', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.O },
      { id: 'h1', element: 'H', x: 0.96, y: 0, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'o1', to: 'h1', type: 'single' }
    ]
  },
  {
    id: 'carbonyl-group',
    name: 'Carbonyl Group (C=O)',
    category: 'functional-group',
    description: 'A carbonyl group is a functional group composed of a carbon atom double-bonded to an oxygen atom.',
    formula: 'CO',
    molecularWeight: 28.01,
    hotkey: 'C',
    tags: ['carbonyl', 'double-bond', 'polar', 'aldehyde', 'ketone'],
    difficulty: 'intermediate',
    educationalNotes: [
      'Double bond between carbon and oxygen',
      'Highly polar due to electronegativity difference',
      'Found in aldehydes, ketones, carboxylic acids'
    ],
    atoms: [
      { id: 'c1', element: 'C', x: -0.6, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'o1', element: 'O', x: 0.6, y: 0, z: 0, color: ELEMENT_COLORS.O }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'o1', type: 'double' }
    ]
  },
  {
    id: 'carboxyl-group',
    name: 'Carboxyl Group (-COOH)',
    category: 'functional-group',
    description: 'A carboxyl group consists of a carbonyl group and a hydroxyl group attached to the same carbon atom.',
    formula: 'COOH',
    molecularWeight: 45.02,
    hotkey: 'R',
    tags: ['carboxyl', 'acid', 'polar', 'hydrogen-bonding'],
    difficulty: 'intermediate',
    educationalNotes: [
      'Characteristic of carboxylic acids',
      'Can donate a proton (acidic)',
      'Forms strong hydrogen bonds'
    ],
    atoms: [
      { id: 'c1', element: 'C', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'o1', element: 'O', x: 1.2, y: 0, z: 0, color: ELEMENT_COLORS.O },
      { id: 'o2', element: 'O', x: -0.6, y: 1.04, z: 0, color: ELEMENT_COLORS.O },
      { id: 'h1', element: 'H', x: -1.56, y: 1.04, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'o1', type: 'double' },
      { id: 'b2', from: 'c1', to: 'o2', type: 'single' },
      { id: 'b3', from: 'o2', to: 'h1', type: 'single' }
    ]
  },
  {
    id: 'amine-group',
    name: 'Amine Group (-NH₂)',
    category: 'functional-group',
    description: 'An amine group consists of a nitrogen atom bonded to two hydrogen atoms and one carbon atom.',
    formula: 'NH₂',
    molecularWeight: 16.02,
    hotkey: 'N',
    tags: ['amine', 'basic', 'nitrogen', 'lone-pair'],
    difficulty: 'intermediate',
    educationalNotes: [
      'Nitrogen has a lone pair of electrons',
      'Can act as a base',
      'Forms hydrogen bonds'
    ],
    atoms: [
      { id: 'n1', element: 'N', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.N },
      { id: 'h1', element: 'H', x: 1.01, y: 0, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h2', element: 'H', x: -0.505, y: 0.875, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'n1', to: 'h1', type: 'single' },
      { id: 'b2', from: 'n1', to: 'h2', type: 'single' }
    ]
  },

  // Ring Structures
  {
    id: 'benzene-ring',
    name: 'Benzene Ring (C₆H₆)',
    category: 'ring',
    description: 'Benzene is an aromatic hydrocarbon with a planar hexagonal ring structure.',
    formula: 'C₆H₆',
    molecularWeight: 78.11,
    hotkey: 'B',
    tags: ['aromatic', 'benzene', 'ring', 'delocalized'],
    difficulty: 'advanced',
    educationalNotes: [
      'Aromatic compound with delocalized π electrons',
      'All C-C bonds are equivalent (resonance)',
      'Planar hexagonal structure with 120° bond angles'
    ],
    atoms: [
      { id: 'c1', element: 'C', x: 1.4, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c2', element: 'C', x: 0.7, y: 1.21, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c3', element: 'C', x: -0.7, y: 1.21, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c4', element: 'C', x: -1.4, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c5', element: 'C', x: -0.7, y: -1.21, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c6', element: 'C', x: 0.7, y: -1.21, z: 0, color: ELEMENT_COLORS.C },
      { id: 'h1', element: 'H', x: 2.49, y: 0, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h2', element: 'H', x: 1.24, y: 2.16, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h3', element: 'H', x: -1.24, y: 2.16, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h4', element: 'H', x: -2.49, y: 0, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h5', element: 'H', x: -1.24, y: -2.16, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h6', element: 'H', x: 1.24, y: -2.16, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'c2', type: 'aromatic' },
      { id: 'b2', from: 'c2', to: 'c3', type: 'aromatic' },
      { id: 'b3', from: 'c3', to: 'c4', type: 'aromatic' },
      { id: 'b4', from: 'c4', to: 'c5', type: 'aromatic' },
      { id: 'b5', from: 'c5', to: 'c6', type: 'aromatic' },
      { id: 'b6', from: 'c6', to: 'c1', type: 'aromatic' },
      { id: 'b7', from: 'c1', to: 'h1', type: 'single' },
      { id: 'b8', from: 'c2', to: 'h2', type: 'single' },
      { id: 'b9', from: 'c3', to: 'h3', type: 'single' },
      { id: 'b10', from: 'c4', to: 'h4', type: 'single' },
      { id: 'b11', from: 'c5', to: 'h5', type: 'single' },
      { id: 'b12', from: 'c6', to: 'h6', type: 'single' }
    ]
  },
  {
    id: 'cyclohexane-chair',
    name: 'Cyclohexane (Chair)',
    category: 'ring',
    description: 'Cyclohexane in chair conformation, the most stable conformation.',
    formula: 'C₆H₁₂',
    molecularWeight: 84.16,
    hotkey: 'C',
    tags: ['cyclohexane', 'chair', 'conformation', 'alicyclic'],
    difficulty: 'advanced',
    educationalNotes: [
      'Chair conformation is most stable',
      'Axial and equatorial positions',
      'Ring strain minimized'
    ],
    atoms: [
      // Ring carbons
      { id: 'c1', element: 'C', x: 0, y: 1.5, z: 0.5, color: ELEMENT_COLORS.C },
      { id: 'c2', element: 'C', x: 1.3, y: 0.75, z: -0.5, color: ELEMENT_COLORS.C },
      { id: 'c3', element: 'C', x: 1.3, y: -0.75, z: 0.5, color: ELEMENT_COLORS.C },
      { id: 'c4', element: 'C', x: 0, y: -1.5, z: -0.5, color: ELEMENT_COLORS.C },
      { id: 'c5', element: 'C', x: -1.3, y: -0.75, z: 0.5, color: ELEMENT_COLORS.C },
      { id: 'c6', element: 'C', x: -1.3, y: 0.75, z: -0.5, color: ELEMENT_COLORS.C },
      // Hydrogens (simplified)
      { id: 'h1a', element: 'H', x: 0, y: 1.5, z: 1.5, color: ELEMENT_COLORS.H },
      { id: 'h1e', element: 'H', x: 0, y: 2.4, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h2a', element: 'H', x: 2.2, y: 0.75, z: -0.5, color: ELEMENT_COLORS.H },
      { id: 'h2e', element: 'H', x: 1.3, y: 0.75, z: -1.5, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      // Ring bonds
      { id: 'b1', from: 'c1', to: 'c2', type: 'single' },
      { id: 'b2', from: 'c2', to: 'c3', type: 'single' },
      { id: 'b3', from: 'c3', to: 'c4', type: 'single' },
      { id: 'b4', from: 'c4', to: 'c5', type: 'single' },
      { id: 'b5', from: 'c5', to: 'c6', type: 'single' },
      { id: 'b6', from: 'c6', to: 'c1', type: 'single' },
      // Hydrogen bonds (simplified)
      { id: 'b7', from: 'c1', to: 'h1a', type: 'single' },
      { id: 'b8', from: 'c1', to: 'h1e', type: 'single' },
      { id: 'b9', from: 'c2', to: 'h2a', type: 'single' },
      { id: 'b10', from: 'c2', to: 'h2e', type: 'single' }
    ]
  },

  // Basic Molecules
  {
    id: 'water',
    name: 'Water (H₂O)',
    category: 'basic-molecule',
    description: 'Water molecule with bent geometry due to lone pairs on oxygen.',
    formula: 'H₂O',
    molecularWeight: 18.02,
    hotkey: 'W',
    tags: ['water', 'polar', 'hydrogen-bonding', 'bent'],
    difficulty: 'beginner',
    educationalNotes: [
      'Bent geometry (104.5° bond angle)',
      'Polar molecule due to electronegativity difference',
      'Forms hydrogen bonds'
    ],
    atoms: [
      { id: 'o1', element: 'O', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.O },
      { id: 'h1', element: 'H', x: 0.96, y: 0, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h2', element: 'H', x: -0.24, y: 0.93, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'o1', to: 'h1', type: 'single' },
      { id: 'b2', from: 'o1', to: 'h2', type: 'single' }
    ]
  },
  {
    id: 'methane',
    name: 'Methane (CH₄)',
    category: 'basic-molecule',
    description: 'Methane is the simplest hydrocarbon with tetrahedral geometry.',
    formula: 'CH₄',
    molecularWeight: 16.04,
    hotkey: 'M',
    tags: ['methane', 'alkane', 'tetrahedral', 'hydrocarbon'],
    difficulty: 'beginner',
    educationalNotes: [
      'Perfect tetrahedral geometry (109.5° bond angles)',
      'Nonpolar molecule',
      'Main component of natural gas'
    ],
    atoms: [
      { id: 'c1', element: 'C', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'h1', element: 'H', x: 1.09, y: 1.09, z: 1.09, color: ELEMENT_COLORS.H },
      { id: 'h2', element: 'H', x: -1.09, y: -1.09, z: 1.09, color: ELEMENT_COLORS.H },
      { id: 'h3', element: 'H', x: -1.09, y: 1.09, z: -1.09, color: ELEMENT_COLORS.H },
      { id: 'h4', element: 'H', x: 1.09, y: -1.09, z: -1.09, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'h1', type: 'single' },
      { id: 'b2', from: 'c1', to: 'h2', type: 'single' },
      { id: 'b3', from: 'c1', to: 'h3', type: 'single' },
      { id: 'b4', from: 'c1', to: 'h4', type: 'single' }
    ]
  },
  {
    id: 'ammonia',
    name: 'Ammonia (NH₃)',
    category: 'basic-molecule',
    description: 'Ammonia with trigonal pyramidal geometry due to lone pair on nitrogen.',
    formula: 'NH₃',
    molecularWeight: 17.03,
    hotkey: 'A',
    tags: ['ammonia', 'trigonal-pyramidal', 'base', 'nitrogen'],
    difficulty: 'beginner',
    educationalNotes: [
      'Trigonal pyramidal geometry (107° bond angle)',
      'Nitrogen has one lone pair',
      'Weak base in aqueous solution'
    ],
    atoms: [
      { id: 'n1', element: 'N', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.N },
      { id: 'h1', element: 'H', x: 1.01, y: 0, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h2', element: 'H', x: -0.505, y: 0.875, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h3', element: 'H', x: -0.505, y: -0.875, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'n1', to: 'h1', type: 'single' },
      { id: 'b2', from: 'n1', to: 'h2', type: 'single' },
      { id: 'b3', from: 'n1', to: 'h3', type: 'single' }
    ]
  },
  {
    id: 'ethanol',
    name: 'Ethanol (C₂H₅OH)',
    category: 'basic-molecule',
    description: 'Ethanol is a simple alcohol with both nonpolar and polar regions.',
    formula: 'C₂H₅OH',
    molecularWeight: 46.07,
    hotkey: 'E',
    tags: ['ethanol', 'alcohol', 'polar', 'organic'],
    difficulty: 'intermediate',
    educationalNotes: [
      'Contains both polar (OH) and nonpolar (CH₃) regions',
      'Forms hydrogen bonds',
      'The alcohol in alcoholic beverages'
    ],
    atoms: [
      { id: 'c1', element: 'C', x: -0.77, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c2', element: 'C', x: 0.77, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'o1', element: 'O', x: 1.43, y: 1.1, z: 0, color: ELEMENT_COLORS.O },
      { id: 'h1', element: 'H', x: -1.32, y: 0.89, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h2', element: 'H', x: -1.32, y: -0.89, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h3', element: 'H', x: -1.32, y: 0, z: 1.54, color: ELEMENT_COLORS.H },
      { id: 'h4', element: 'H', x: 1.32, y: -0.89, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h5', element: 'H', x: 1.32, y: 0.89, z: 0, color: ELEMENT_COLORS.H },
      { id: 'h6', element: 'H', x: 2.08, y: 1.1, z: 0, color: ELEMENT_COLORS.H }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'c2', type: 'single' },
      { id: 'b2', from: 'c2', to: 'o1', type: 'single' },
      { id: 'b3', from: 'c1', to: 'h1', type: 'single' },
      { id: 'b4', from: 'c1', to: 'h2', type: 'single' },
      { id: 'b5', from: 'c1', to: 'h3', type: 'single' },
      { id: 'b6', from: 'c2', to: 'h4', type: 'single' },
      { id: 'b7', from: 'c2', to: 'h5', type: 'single' },
      { id: 'b8', from: 'o1', to: 'h6', type: 'single' }
    ]
  },

  // Biomolecules
  {
    id: 'glucose',
    name: 'Glucose (C₆H₁₂O₆)',
    category: 'biomolecule',
    description: 'Glucose is a simple sugar and primary energy source for cells.',
    formula: 'C₆H₁₂O₆',
    molecularWeight: 180.16,
    hotkey: 'G',
    tags: ['glucose', 'sugar', 'carbohydrate', 'energy'],
    difficulty: 'advanced',
    educationalNotes: [
      'Six-carbon monosaccharide',
      'Multiple hydroxyl groups',
      'Can exist in linear or cyclic forms'
    ],
    atoms: [
      // Simplified linear glucose
      { id: 'c1', element: 'C', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c2', element: 'C', x: 1.5, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c3', element: 'C', x: 3, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c4', element: 'C', x: 4.5, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c5', element: 'C', x: 6, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c6', element: 'C', x: 7.5, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'o1', element: 'O', x: 1.5, y: 1.2, z: 0, color: ELEMENT_COLORS.O },
      { id: 'o2', element: 'O', x: 3, y: 1.2, z: 0, color: ELEMENT_COLORS.O },
      { id: 'o3', element: 'O', x: 4.5, y: 1.2, z: 0, color: ELEMENT_COLORS.O },
      { id: 'o4', element: 'O', x: 6, y: 1.2, z: 0, color: ELEMENT_COLORS.O },
      { id: 'o5', element: 'O', x: 7.5, y: 1.2, z: 0, color: ELEMENT_COLORS.O },
      { id: 'o6', element: 'O', x: 8.5, y: 0, z: 0, color: ELEMENT_COLORS.O }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'c2', type: 'single' },
      { id: 'b2', from: 'c2', to: 'c3', type: 'single' },
      { id: 'b3', from: 'c3', to: 'c4', type: 'single' },
      { id: 'b4', from: 'c4', to: 'c5', type: 'single' },
      { id: 'b5', from: 'c5', to: 'c6', type: 'single' },
      { id: 'b6', from: 'c2', to: 'o1', type: 'single' },
      { id: 'b7', from: 'c3', to: 'o2', type: 'single' },
      { id: 'b8', from: 'c4', to: 'o3', type: 'single' },
      { id: 'b9', from: 'c5', to: 'o4', type: 'single' },
      { id: 'b10', from: 'c6', to: 'o5', type: 'single' },
      { id: 'b11', from: 'c6', to: 'o6', type: 'single' }
    ]
  },

  // Drugs and Common Compounds
  {
    id: 'caffeine',
    name: 'Caffeine (C₈H₁₀N₄O₂)',
    category: 'drug',
    description: 'Caffeine is a stimulant drug found in coffee, tea, and energy drinks.',
    formula: 'C₈H₁₀N₄O₂',
    molecularWeight: 194.19,
    hotkey: 'F',
    tags: ['caffeine', 'stimulant', 'alkaloid', 'xanthine'],
    difficulty: 'advanced',
    educationalNotes: [
      'Purine alkaloid stimulant',
      'Blocks adenosine receptors in brain',
      'Found in coffee, tea, and chocolate'
    ],
    atoms: [
      // Simplified caffeine structure
      { id: 'c1', element: 'C', x: 0, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c2', element: 'C', x: 1.4, y: 0, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c3', element: 'C', x: 2.1, y: 1.2, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c4', element: 'C', x: 1.4, y: 2.4, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c5', element: 'C', x: 0, y: 2.4, z: 0, color: ELEMENT_COLORS.C },
      { id: 'c6', element: 'C', x: -0.7, y: 1.2, z: 0, color: ELEMENT_COLORS.C },
      { id: 'n1', element: 'N', x: 0.7, y: 1.2, z: 0, color: ELEMENT_COLORS.N },
      { id: 'n2', element: 'N', x: 2.1, y: 2.4, z: 0, color: ELEMENT_COLORS.N },
      { id: 'n3', element: 'N', x: -0.7, y: 2.4, z: 0, color: ELEMENT_COLORS.N },
      { id: 'o1', element: 'O', x: 2.8, y: 1.2, z: 0, color: ELEMENT_COLORS.O },
      { id: 'o2', element: 'O', x: -1.4, y: 1.2, z: 0, color: ELEMENT_COLORS.O }
    ],
    bonds: [
      { id: 'b1', from: 'c1', to: 'c2', type: 'single' },
      { id: 'b2', from: 'c2', to: 'c3', type: 'single' },
      { id: 'b3', from: 'c3', to: 'c4', type: 'single' },
      { id: 'b4', from: 'c4', to: 'c5', type: 'single' },
      { id: 'b5', from: 'c5', to: 'c6', type: 'single' },
      { id: 'b6', from: 'c6', to: 'c1', type: 'single' },
      { id: 'b7', from: 'c1', to: 'n1', type: 'single' },
      { id: 'b8', from: 'c3', to: 'n2', type: 'single' },
      { id: 'b9', from: 'c5', to: 'n3', type: 'single' },
      { id: 'b10', from: 'c3', to: 'o1', type: 'double' },
      { id: 'b11', from: 'c6', to: 'o2', type: 'double' }
    ]
  }
]

// Template categories for organization
export const TEMPLATE_CATEGORIES = {
  'functional-group': { label: 'Functional Groups', color: '#FF6B6B', icon: '🧪' },
  'ring': { label: 'Ring Structures', color: '#4ECDC4', icon: '⭕' },
  'basic-molecule': { label: 'Basic Molecules', color: '#45B7D1', icon: '💧' },
  'biomolecule': { label: 'Biomolecules', color: '#96CEB4', icon: '🧬' },
  'drug': { label: 'Drugs & Compounds', color: '#FFEAA7', icon: '💊' }
}

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  beginner: { label: 'Beginner', color: '#32CD32', description: 'Simple structures for learning basics' },
  intermediate: { label: 'Intermediate', color: '#FFD700', description: 'Moderate complexity structures' },
  advanced: { label: 'Advanced', color: '#FF4500', description: 'Complex structures for advanced study' }
}

// Search and filter functions
export function searchTemplates(query: string, templates: MolecularTemplate[] = MOLECULAR_TEMPLATES): MolecularTemplate[] {
  if (!query.trim()) return templates
  
  const searchTerm = query.toLowerCase()
  return templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm) ||
    template.formula.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}

export function filterTemplates(
  category?: string,
  difficulty?: string,
  tags?: string[],
  templates: MolecularTemplate[] = MOLECULAR_TEMPLATES
): MolecularTemplate[] {
  return templates.filter(template => {
    if (category && template.category !== category) return false
    if (difficulty && template.difficulty !== difficulty) return false
    if (tags && tags.length > 0 && !tags.some(tag => template.tags.includes(tag))) return false
    return true
  })
}

export function getTemplatesByCategory(category: string): MolecularTemplate[] {
  return MOLECULAR_TEMPLATES.filter(template => template.category === category)
}

export function getTemplatesByDifficulty(difficulty: string): MolecularTemplate[] {
  return MOLECULAR_TEMPLATES.filter(template => template.difficulty === difficulty)
}

export function getTemplateByHotkey(hotkey: string): MolecularTemplate | undefined {
  return MOLECULAR_TEMPLATES.find(template => template.hotkey === hotkey)
}