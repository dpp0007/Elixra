export type ChemicalCategory = 
  | 'Acids'
  | 'Bases'
  | 'Common Salts'
  | 'Metal Salts'
  | 'Indicators'
  | 'Oxidizing/Reducing Agents'
  | 'Organic Compounds'
  | 'Other'

export interface Chemical {
  id: string
  name: string
  formula: string
  color: string
  state: 'solid' | 'liquid' | 'gas'
  concentration?: number
  hazards?: string[]
  description?: string
  category?: ChemicalCategory
}

export interface Glassware {
  id: string
  type: 'test-tube' | 'beaker' | 'flask' | 'burette'
  capacity: number
  contents: ChemicalContent[]
}

export interface ChemicalContent {
  chemical: Chemical
  amount: number
  unit: 'ml' | 'g' | 'mol' | 'drops'
}

export interface EquipmentSetting {
  name: string
  value: number
  unit: string
}

export interface Experiment {
  id?: string
  name: string
  chemicals: ChemicalContent[]
  glassware: Glassware[]
  equipment?: EquipmentSetting[]
  timestamp?: Date
  userId?: string
}

export interface ReactionResult {
  color: string
  smell: string
  precipitate: boolean
  precipitateColor?: string
  products: string[]
  balancedEquation: string
  reactionType: string
  observations: string[]
  safetyNotes?: string[]
  temperature?: 'increased' | 'decreased' | 'unchanged'
  gasEvolution?: boolean
  confidence: number
}

export interface ExperimentLog {
  _id?: string
  userId: string
  experimentName: string
  chemicals: ChemicalContent[]
  reactionDetails: ReactionResult
  timestamp: Date
  updatedAt?: Date
  notes?: string
  isSaved?: boolean
  metadata?: {
    userAgent?: string | null
    ip?: string | null
    sessionId?: string
  }
}

export interface User {
  _id?: string
  name: string
  email: string
  password?: string
  image?: string | null
  emailVerified?: Date | null
  createdAt: Date
  updatedAt?: Date
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    notifications?: boolean
    autoSave?: boolean
    defaultUnits?: 'ml' | 'g' | 'mol' | 'drops'
  }
  stats?: {
    experimentsCount?: number
    lastExperiment?: Date
    totalExperiments?: number
    reactionTypes?: string[]
    chemicalsUsed?: string[]
  }
}

export const COMMON_CHEMICALS: Chemical[] = [
  {
    id: 'nacl',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    color: '#ffffff',
    state: 'solid',
    description: 'Common table salt',
    category: 'Common Salts'
  },
  {
    id: 'agno3',
    name: 'Silver Nitrate',
    formula: 'AgNO₃',
    color: '#f8f9fa',
    state: 'solid',
    hazards: ['Oxidizing', 'Corrosive'],
    description: 'Used for halide testing',
    category: 'Other'
  },
  {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    color: '#e3f2fd',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Corrosive'],
    description: 'Dilute hydrochloric acid',
    category: 'Acids'
  },
  {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    color: '#f3e5f5',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Corrosive'],
    description: 'Dilute sodium hydroxide',
    category: 'Bases'
  },
  {
    id: 'baco3',
    name: 'Barium Carbonate',
    formula: 'BaCO₃',
    color: '#ffffff',
    state: 'solid',
    hazards: ['Toxic'],
    description: 'White powder',
    category: 'Other'
  },
  {
    id: 'cuso4',
    name: 'Copper Sulfate',
    formula: 'CuSO₄·5H₂O',
    color: '#2196f3',
    state: 'solid',
    description: 'Blue crystals',
    category: 'Metal Salts'
  },
  {
    id: 'fecl3',
    name: 'Iron(III) Chloride',
    formula: 'FeCl₃',
    color: '#ff9800',
    state: 'solid',
    description: 'Orange-brown crystals',
    category: 'Metal Salts'
  },
  {
    id: 'nh4oh',
    name: 'Ammonium Hydroxide',
    formula: 'NH₄OH',
    color: '#e8f5e8',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Irritant'],
    description: 'Dilute ammonia solution',
    category: 'Bases'
  },
  {
    id: 'h2so4',
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    color: '#fff3e0',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Corrosive'],
    description: 'Dilute sulfuric acid',
    category: 'Acids'
  },
  {
    id: 'kscn',
    name: 'Potassium Thiocyanate',
    formula: 'KSCN',
    color: '#ffffff',
    state: 'solid',
    description: 'Used for iron detection',
    category: 'Other'
  },
  // Additional Acids
  {
    id: 'hno3',
    name: 'Nitric Acid',
    formula: 'HNO₃',
    color: '#fffde7',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Corrosive', 'Oxidizing'],
    description: 'Dilute nitric acid',
    category: 'Acids'
  },
  {
    id: 'ch3cooh',
    name: 'Acetic Acid',
    formula: 'CH₃COOH',
    color: '#f5f5f5',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Corrosive'],
    description: 'Dilute acetic acid (vinegar)',
    category: 'Acids'
  },
  {
    id: 'h3po4',
    name: 'Phosphoric Acid',
    formula: 'H₃PO₄',
    color: '#fafafa',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Corrosive'],
    description: 'Dilute phosphoric acid',
    category: 'Acids'
  },
  // Additional Bases
  {
    id: 'koh',
    name: 'Potassium Hydroxide',
    formula: 'KOH',
    color: '#f3e5f5',
    state: 'liquid',
    concentration: 0.1,
    hazards: ['Corrosive'],
    description: 'Dilute potassium hydroxide',
    category: 'Bases'
  },
  {
    id: 'ca_oh_2',
    name: 'Calcium Hydroxide',
    formula: 'Ca(OH)₂',
    color: '#ffffff',
    state: 'solid',
    hazards: ['Irritant'],
    description: 'Lime water / slaked lime',
    category: 'Bases'
  },
  // Salts
  {
    id: 'kcl',
    name: 'Potassium Chloride',
    formula: 'KCl',
    color: '#ffffff',
    state: 'solid',
    description: 'White crystalline salt',
    category: 'Common Salts'
  },
  {
    id: 'cacl2',
    name: 'Calcium Chloride',
    formula: 'CaCl₂',
    color: '#ffffff',
    state: 'solid',
    hazards: ['Irritant'],
    description: 'Hygroscopic white solid',
    category: 'Common Salts'
  },
  {
    id: 'mgso4',
    name: 'Magnesium Sulfate',
    formula: 'MgSO₄',
    color: '#ffffff',
    state: 'solid',
    description: 'Epsom salt',
    category: 'Common Salts'
  },
  {
    id: 'na2co3',
    name: 'Sodium Carbonate',
    formula: 'Na₂CO₃',
    color: '#ffffff',
    state: 'solid',
    description: 'Washing soda',
    category: 'Common Salts'
  },
  {
    id: 'nahco3',
    name: 'Sodium Bicarbonate',
    formula: 'NaHCO₃',
    color: '#ffffff',
    state: 'solid',
    description: 'Baking soda',
    category: 'Common Salts'
  },
  {
    id: 'k2co3',
    name: 'Potassium Carbonate',
    formula: 'K₂CO₃',
    color: '#ffffff',
    state: 'solid',
    description: 'Potash',
    category: 'Common Salts'
  },
  {
    id: 'na2so4',
    name: 'Sodium Sulfate',
    formula: 'Na₂SO₄',
    color: '#ffffff',
    state: 'solid',
    description: "Glauber's salt",
    category: 'Common Salts'
  },
  {
    id: 'nh4cl',
    name: 'Ammonium Chloride',
    formula: 'NH₄Cl',
    color: '#ffffff',
    state: 'solid',
    description: 'Sal ammoniac',
    category: 'Common Salts'
  },
  // Metal Salts (Colored)
  {
    id: 'feso4',
    name: 'Iron(II) Sulfate',
    formula: 'FeSO₄·7H₂O',
    color: '#90ee90',
    state: 'solid',
    description: 'Green vitriol',
    category: 'Metal Salts'
  },
  {
    id: 'niso4',
    name: 'Nickel(II) Sulfate',
    formula: 'NiSO₄',
    color: '#90ee90',
    state: 'solid',
    hazards: ['Toxic'],
    description: 'Green crystals',
    category: 'Metal Salts'
  },
  {
    id: 'cocl2',
    name: 'Cobalt(II) Chloride',
    formula: 'CoCl₂',
    color: '#ff69b4',
    state: 'solid',
    hazards: ['Toxic'],
    description: 'Pink/blue crystals',
    category: 'Metal Salts'
  },
  {
    id: 'mnso4',
    name: 'Manganese(II) Sulfate',
    formula: 'MnSO₄',
    color: '#ffb6c1',
    state: 'solid',
    description: 'Light pink crystals',
    category: 'Metal Salts'
  },
  {
    id: 'zncl2',
    name: 'Zinc Chloride',
    formula: 'ZnCl₂',
    color: '#ffffff',
    state: 'solid',
    hazards: ['Corrosive'],
    description: 'White hygroscopic solid',
    category: 'Metal Salts'
  },
  {
    id: 'znso4',
    name: 'Zinc Sulfate',
    formula: 'ZnSO₄',
    color: '#ffffff',
    state: 'solid',
    description: 'White zinc vitriol',
    category: 'Metal Salts'
  },
  {
    id: 'pbno3_2',
    name: 'Lead(II) Nitrate',
    formula: 'Pb(NO₃)₂',
    color: '#ffffff',
    state: 'solid',
    hazards: ['Toxic', 'Oxidizing'],
    description: 'White crystalline solid',
    category: 'Metal Salts'
  },
  {
    id: 'cucl2',
    name: 'Copper(II) Chloride',
    formula: 'CuCl₂',
    color: '#4682b4',
    state: 'solid',
    hazards: ['Toxic'],
    description: 'Blue-green crystals',
    category: 'Metal Salts'
  },
  {
    id: 'agcl',
    name: 'Silver Chloride',
    formula: 'AgCl',
    color: '#ffffff',
    state: 'solid',
    description: 'White precipitate (light sensitive)',
    category: 'Metal Salts'
  },
  // Indicators
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    formula: 'C₂₀H₁₄O₄',
    color: '#ffc0cb',
    state: 'liquid',
    description: 'pH indicator (colorless to pink)',
    category: 'Indicators'
  },
  {
    id: 'methyl_orange',
    name: 'Methyl Orange',
    formula: 'C₁₄H₁₄N₃NaO₃S',
    color: '#ff8c00',
    state: 'liquid',
    description: 'pH indicator (red to yellow)',
    category: 'Indicators'
  },
  {
    id: 'litmus',
    name: 'Litmus Solution',
    formula: 'Natural dye',
    color: '#9370db',
    state: 'liquid',
    description: 'pH indicator (red to blue)',
    category: 'Indicators'
  },
  // Oxidizing/Reducing Agents
  {
    id: 'kmno4',
    name: 'Potassium Permanganate',
    formula: 'KMnO₄',
    color: '#8b008b',
    state: 'solid',
    hazards: ['Oxidizing', 'Toxic'],
    description: 'Purple crystals, strong oxidizer',
    category: 'Oxidizing/Reducing Agents'
  },
  {
    id: 'k2cr2o7',
    name: 'Potassium Dichromate',
    formula: 'K₂Cr₂O₇',
    color: '#ff8c00',
    state: 'solid',
    hazards: ['Oxidizing', 'Toxic', 'Carcinogenic'],
    description: 'Orange crystals, strong oxidizer',
    category: 'Oxidizing/Reducing Agents'
  },
  {
    id: 'h2o2',
    name: 'Hydrogen Peroxide',
    formula: 'H₂O₂',
    color: '#e8f4f8',
    state: 'liquid',
    concentration: 0.03,
    hazards: ['Oxidizing', 'Irritant'],
    description: '3% hydrogen peroxide solution',
    category: 'Oxidizing/Reducing Agents'
  },
  {
    id: 'na2s2o3',
    name: 'Sodium Thiosulfate',
    formula: 'Na₂S₂O₃',
    color: '#ffffff',
    state: 'solid',
    description: 'Hypo, reducing agent',
    category: 'Oxidizing/Reducing Agents'
  },
  // Organic Compounds
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    color: '#f5f5f5',
    state: 'liquid',
    hazards: ['Flammable'],
    description: 'Ethyl alcohol',
    category: 'Organic Compounds'
  },
  {
    id: 'glucose',
    name: 'Glucose',
    formula: 'C₆H₁₂O₆',
    color: '#ffffff',
    state: 'solid',
    description: 'Dextrose sugar',
    category: 'Organic Compounds'
  },
  {
    id: 'starch',
    name: 'Starch Solution',
    formula: '(C₆H₁₀O₅)ₙ',
    color: '#f5f5dc',
    state: 'liquid',
    description: 'Indicator for iodine',
    category: 'Organic Compounds'
  },
  // Additional Important Reagents
  {
    id: 'bano3_2',
    name: 'Barium Nitrate',
    formula: 'Ba(NO₃)₂',
    color: '#ffffff',
    state: 'solid',
    hazards: ['Toxic', 'Oxidizing'],
    description: 'White crystalline solid',
    category: 'Other'
  },
  {
    id: 'bacl2',
    name: 'Barium Chloride',
    formula: 'BaCl₂',
    color: '#ffffff',
    state: 'solid',
    hazards: ['Toxic'],
    description: 'White crystals, sulfate test',
    category: 'Other'
  },
  {
    id: 'ki',
    name: 'Potassium Iodide',
    formula: 'KI',
    color: '#ffffff',
    state: 'solid',
    description: 'White salt, iodine source',
    category: 'Other'
  },
  {
    id: 'i2',
    name: 'Iodine Solution',
    formula: 'I₂',
    color: '#8b4513',
    state: 'liquid',
    hazards: ['Toxic', 'Corrosive'],
    description: 'Brown iodine in KI solution',
    category: 'Other'
  },
  {
    id: 'na3po4',
    name: 'Sodium Phosphate',
    formula: 'Na₃PO₄',
    color: '#ffffff',
    state: 'solid',
    description: 'Trisodium phosphate',
    category: 'Other'
  },
  {
    id: 'alum',
    name: 'Potassium Alum',
    formula: 'KAl(SO₄)₂·12H₂O',
    color: '#ffffff',
    state: 'solid',
    description: 'Colorless octahedral crystals',
    category: 'Other'
  }
]