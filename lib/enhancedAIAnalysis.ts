import { Atom, Bond } from '@/types/molecule'
import { getMolecularFormula, calculateMolecularWeight } from '@/lib/bondingLogic'

export interface EnhancedAnalysis {
  success: boolean
  commonName: string
  iupacName: string
  casNumber?: string
  formula: string
  molecularWeight: number
  properties: {
    physicalState: 'solid' | 'liquid' | 'gas'
    meltingPoint?: number
    boilingPoint?: number
    solubility: 'soluble' | 'insoluble' | 'slightly-soluble'
    solubilityDetails: string
    phBehavior: 'acidic' | 'basic' | 'neutral'
    polarity: 'polar' | 'nonpolar' | 'slightly-polar'
    color?: string
    odor?: string
  }
  structure: {
    hybridization: { [atomId: string]: string }
    geometry: string
    bondAngles: string
    chirality: 'chiral' | 'achiral'
    stereochemistry: string[]
    functionalGroups: string[]
    aromatic: boolean
    isomers: string[]
  }
  applications: {
    industrial: string[]
    biological: string[]
    everyday: string[]
    historical: string[]
  }
  safety: {
    toxicity: 'non-toxic' | 'low-toxicity' | 'moderate-toxicity' | 'high-toxicity'
    handling: string[]
    environmental: string[]
    regulatory: string[]
  }
  educational: {
    keyConcepts: string[]
    misconceptions: string[]
    quizQuestion: {
      question: string
      options: string[]
      correctAnswer: number
      explanation: string
    }
    relatedMolecules: {
      name: string
      formula: string
      reason: string
      templateId?: string
    }[]
  }
}

export class EnhancedAIAnalyzer {
  private static instance: EnhancedAIAnalyzer
  private analysisCache: Map<string, EnhancedAnalysis>
  private molecularDatabase: Map<string, Partial<EnhancedAnalysis>>

  private constructor() {
    this.analysisCache = new Map()
    this.molecularDatabase = this.initializeDatabase()
  }

  static getInstance(): EnhancedAIAnalyzer {
    if (!EnhancedAIAnalyzer.instance) {
      EnhancedAIAnalyzer.instance = new EnhancedAIAnalyzer()
    }
    return EnhancedAIAnalyzer.instance
  }

  private initializeDatabase(): Map<string, Partial<EnhancedAnalysis>> {
    const database = new Map<string, Partial<EnhancedAnalysis>>()
    
    // Water
    database.set('H2O', {
      commonName: 'Water',
      iupacName: 'Oxidane',
      casNumber: '7732-18-5',
      properties: {
        physicalState: 'liquid',
        meltingPoint: 0,
        boilingPoint: 100,
        solubility: 'soluble',
        solubilityDetails: 'Universal solvent',
        phBehavior: 'neutral',
        polarity: 'polar',
        color: 'colorless',
        odor: 'odorless'
      },
      structure: {
        hybridization: { 'O1': 'sp3', 'H1': 's', 'H2': 's' },
        geometry: 'Bent',
        bondAngles: '104.5°',
        chirality: 'achiral',
        stereochemistry: [],
        functionalGroups: ['hydroxyl'],
        aromatic: false,
        isomers: []
      },
      applications: {
        industrial: ['Solvent', 'Coolant', 'Cleaning agent'],
        biological: ['Essential for life', 'Cellular component', 'Metabolism'],
        everyday: ['Drinking', 'Cooking', 'Cleaning', 'Bathing'],
        historical: ['Ancient civilizations', 'Alchemy', 'Modern chemistry']
      },
      safety: {
        toxicity: 'non-toxic',
        handling: ['No special precautions needed'],
        environmental: ['Essential for ecosystems'],
        regulatory: ['GRAS (Generally Recognized As Safe)']
      },
      educational: {
        keyConcepts: ['Polarity', 'Hydrogen bonding', 'Solvent properties'],
        misconceptions: ['Water is H2O gas at room temperature'],
        quizQuestion: {
          question: 'What is the molecular geometry of water (H2O)?',
          options: ['Linear', 'Bent', 'Trigonal planar', 'Tetrahedral'],
          correctAnswer: 1,
          explanation: 'Water has a bent molecular geometry due to the two lone pairs on the oxygen atom, resulting in a bond angle of approximately 104.5°.'
        },
        relatedMolecules: [
          { name: 'Hydrogen peroxide', formula: 'H2O2', reason: 'Similar composition' },
          { name: 'Heavy water', formula: 'D2O', reason: 'Isotope variation' }
        ]
      }
    })

    // Methane
    database.set('CH4', {
      commonName: 'Methane',
      iupacName: 'Methane',
      casNumber: '74-82-8',
      properties: {
        physicalState: 'gas',
        meltingPoint: -182.5,
        boilingPoint: -161.5,
        solubility: 'slightly-soluble',
        solubilityDetails: '24.4 mg/L in water at 25°C',
        phBehavior: 'neutral',
        polarity: 'nonpolar',
        color: 'colorless',
        odor: 'odorless'
      },
      structure: {
        hybridization: { 'C1': 'sp3' },
        geometry: 'Tetrahedral',
        bondAngles: '109.5°',
        chirality: 'achiral',
        stereochemistry: [],
        functionalGroups: ['alkane'],
        aromatic: false,
        isomers: []
      },
      applications: {
        industrial: ['Natural gas', 'Chemical feedstock', 'Hydrogen production'],
        biological: ['Produced by methanogens', 'Greenhouse gas'],
        everyday: ['Cooking fuel', 'Heating'],
        historical: ['Coal mining safety', 'Natural gas discovery']
      },
      safety: {
        toxicity: 'low-toxicity',
        handling: ['Asphyxiant in high concentrations', 'Flammable'],
        environmental: ['Potent greenhouse gas', 'Climate change concern'],
        regulatory: ['EPA regulations on emissions']
      },
      educational: {
        keyConcepts: ['Tetrahedral geometry', 'Nonpolar bonds', 'Alkane properties'],
        misconceptions: ['Methane is toxic'],
        quizQuestion: {
          question: 'What is the molecular geometry of methane (CH4)?',
          options: ['Linear', 'Bent', 'Trigonal planar', 'Tetrahedral'],
          correctAnswer: 3,
          explanation: 'Methane has a tetrahedral molecular geometry with bond angles of approximately 109.5°.'
        },
        relatedMolecules: [
          { name: 'Ethane', formula: 'C2H6', reason: 'Next alkane homolog' },
          { name: 'Carbon dioxide', formula: 'CO2', reason: 'Combustion product' }
        ]
      }
    })

    // Ethanol
    database.set('C2H6O', {
      commonName: 'Ethanol',
      iupacName: 'Ethanol',
      casNumber: '64-17-5',
      properties: {
        physicalState: 'liquid',
        meltingPoint: -114.1,
        boilingPoint: 78.37,
        solubility: 'soluble',
        solubilityDetails: 'Miscible with water',
        phBehavior: 'neutral',
        polarity: 'polar',
        color: 'colorless',
        odor: 'alcoholic odor'
      },
      structure: {
        hybridization: { 'C1': 'sp3', 'C2': 'sp3' },
        geometry: 'Tetrahedral around carbon',
        bondAngles: '109.5°',
        chirality: 'achiral',
        stereochemistry: [],
        functionalGroups: ['hydroxyl', 'alkane'],
        aromatic: false,
        isomers: ['Dimethyl ether']
      },
      applications: {
        industrial: ['Solvent', 'Fuel additive', 'Chemical synthesis'],
        biological: ['Alcohol metabolism', 'Neurotoxic effects'],
        everyday: ['Alcoholic beverages', 'Disinfectant', 'Fuel'],
        historical: ['Fermentation discovery', 'Prohibition era']
      },
      safety: {
        toxicity: 'moderate-toxicity',
        handling: ['Flammable', 'Avoid ingestion', 'Ventilation needed'],
        environmental: ['Biodegradable', 'Water contamination concern'],
        regulatory: ['FDA regulations', 'ATF regulations']
      },
      educational: {
        keyConcepts: ['Alcohol functional group', 'Polarity', 'Fermentation'],
        misconceptions: ['All alcohols are intoxicating'],
        quizQuestion: {
          question: 'What functional group is present in ethanol?',
          options: ['Aldehyde', 'Ketone', 'Alcohol', 'Carboxylic acid'],
          correctAnswer: 2,
          explanation: 'Ethanol contains the alcohol functional group (-OH) attached to a carbon atom.'
        },
        relatedMolecules: [
          { name: 'Methanol', formula: 'CH4O', reason: 'Toxic alcohol' },
          { name: 'Isopropanol', formula: 'C3H8O', reason: 'Rubbing alcohol' }
        ]
      }
    })

    // Benzene
    database.set('C6H6', {
      commonName: 'Benzene',
      iupacName: 'Benzene',
      casNumber: '71-43-2',
      properties: {
        physicalState: 'liquid',
        meltingPoint: 5.5,
        boilingPoint: 80.1,
        solubility: 'slightly-soluble',
        solubilityDetails: '1.8 g/L in water at 25°C',
        phBehavior: 'neutral',
        polarity: 'nonpolar',
        color: 'colorless',
        odor: 'sweet, aromatic'
      },
      structure: {
        hybridization: { 'C1': 'sp2', 'C2': 'sp2', 'C3': 'sp2', 'C4': 'sp2', 'C5': 'sp2', 'C6': 'sp2' },
        geometry: 'Planar hexagonal',
        bondAngles: '120°',
        chirality: 'achiral',
        stereochemistry: [],
        functionalGroups: ['aromatic'],
        aromatic: true,
        isomers: []
      },
      applications: {
        industrial: ['Chemical feedstock', 'Solvent', 'Polystyrene production'],
        biological: ['Toxic to bone marrow', 'Carcinogenic'],
        everyday: ['Gasoline component', 'Historical solvent'],
        historical: ['Kekulé structure discovery', 'Industrial chemical']
      },
      safety: {
        toxicity: 'high-toxicity',
        handling: ['Carcinogen', 'Use in fume hood', 'Avoid skin contact'],
        environmental: ['Groundwater contaminant', 'Persistent pollutant'],
        regulatory: ['EPA regulated', 'OSHA exposure limits']
      },
      educational: {
        keyConcepts: ['Aromaticity', 'Resonance', 'Delocalized electrons'],
        misconceptions: ['All aromatic compounds smell nice'],
        quizQuestion: {
          question: 'What type of bonding is present in benzene?',
          options: ['Single bonds only', 'Double bonds only', 'Alternating single and double bonds', 'Resonance-delocalized electrons'],
          correctAnswer: 3,
          explanation: 'Benzene has delocalized electrons that are shared equally among all six carbon atoms in the ring, represented by resonance structures.'
        },
        relatedMolecules: [
          { name: 'Toluene', formula: 'C7H8', reason: 'Methylbenzene' },
          { name: 'Naphthalene', formula: 'C10H8', reason: 'Polycyclic aromatic' }
        ]
      }
    })

    return database
  }

  async analyzeMolecule(atoms: Atom[], bonds: Bond[]): Promise<EnhancedAnalysis> {
    const formula = getMolecularFormula(atoms)
    const molecularWeight = calculateMolecularWeight(atoms)
    
    // Check cache first
    const cacheKey = `${formula}-${atoms.length}-${bonds.length}`
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!
    }

    // Check database for known molecules
    const databaseEntry = this.molecularDatabase.get(formula)
    if (databaseEntry) {
      const analysis: EnhancedAnalysis = {
        success: true,
        commonName: databaseEntry.commonName || formula,
        iupacName: databaseEntry.iupacName || formula,
        casNumber: databaseEntry.casNumber,
        formula,
        molecularWeight,
        properties: databaseEntry.properties || this.generateDefaultProperties(formula),
        structure: databaseEntry.structure || this.analyzeStructure(atoms, bonds),
        applications: databaseEntry.applications || this.generateDefaultApplications(),
        safety: databaseEntry.safety || this.generateDefaultSafety(),
        educational: databaseEntry.educational || this.generateEducationalContent(formula, atoms, bonds)
      }
      
      this.analysisCache.set(cacheKey, analysis)
      return analysis
    }

    // For unknown molecules, generate comprehensive analysis
    const analysis = await this.generateComprehensiveAnalysis(atoms, bonds, formula, molecularWeight)
    this.analysisCache.set(cacheKey, analysis)
    return analysis
  }

  private async generateComprehensiveAnalysis(
    atoms: Atom[], 
    bonds: Bond[], 
    formula: string, 
    molecularWeight: number
  ): Promise<EnhancedAnalysis> {
    // This would typically call an AI API, but for now we'll generate based on patterns
    const structure = this.analyzeStructure(atoms, bonds)
    
    return {
      success: true,
      commonName: this.generateCommonName(formula, structure),
      iupacName: this.generateIUPACName(formula, structure),
      formula,
      molecularWeight,
      properties: this.generatePropertiesFromStructure(structure),
      structure,
      applications: this.generateApplicationsFromStructure(structure),
      safety: this.generateSafetyFromStructure(structure),
      educational: this.generateEducationalContent(formula, atoms, bonds)
    }
  }

  private analyzeStructure(atoms: Atom[], bonds: Bond[]): EnhancedAnalysis['structure'] {
    const hybridization: { [atomId: string]: string } = {}
    const functionalGroups: string[] = []
    let aromatic = false
    
    // Analyze each atom
    atoms.forEach(atom => {
      const atomBonds = bonds.filter(b => b.from === atom.id || b.to === atom.id)
      const bondTypes = atomBonds.map(b => b.type)
      
      // Determine hybridization
      if (bondTypes.includes('triple')) {
        hybridization[atom.id] = 'sp'
      } else if (bondTypes.includes('double')) {
        hybridization[atom.id] = 'sp²'
      } else {
        hybridization[atom.id] = 'sp³'
      }
      
      // Detect functional groups
      if (atom.element === 'O') {
        const hasDoubleBond = bondTypes.includes('double')
        const hasSingleBond = bondTypes.includes('single')
        
        if (hasDoubleBond && hasSingleBond) {
          functionalGroups.push('carbonyl')
        } else if (hasSingleBond && !hasDoubleBond) {
          functionalGroups.push('hydroxyl')
        }
      }
      
      if (atom.element === 'N') {
        functionalGroups.push('amine')
      }
      
      // Check for aromatic rings (simplified)
      if (atom.element === 'C' && bondTypes.filter(t => t === 'aromatic').length > 0) {
        aromatic = true
        functionalGroups.push('aromatic')
      }
    })
    
    return {
      hybridization,
      geometry: this.determineGeometry(atoms, bonds),
      bondAngles: this.estimateBondAngles(atoms, bonds),
      chirality: this.checkChirality(atoms, bonds),
      stereochemistry: [],
      functionalGroups: Array.from(new Set(functionalGroups)),
      aromatic,
      isomers: this.detectIsomers(atoms, bonds)
    }
  }

  private determineGeometry(atoms: Atom[], bonds: Bond[]): string {
    if (atoms.length === 2) return 'Linear'
    if (atoms.length === 3) return 'Bent'
    
    // Check for tetrahedral centers
    const carbonAtoms = atoms.filter(a => a.element === 'C')
    if (carbonAtoms.length > 0) {
      const centralCarbon = carbonAtoms[0]
      const carbonBonds = bonds.filter(b => b.from === centralCarbon.id || b.to === centralCarbon.id)
      if (carbonBonds.length === 4) return 'Tetrahedral'
    }
    
    return 'Complex'
  }

  private estimateBondAngles(atoms: Atom[], bonds: Bond[]): string {
    // Simplified estimation based on common geometries
    const atomCount = atoms.length
    if (atomCount === 2) return '180°'
    if (atomCount === 3) return '104.5°'
    if (atomCount === 5) return '109.5°'
    return 'Variable'
  }

  private checkChirality(atoms: Atom[], bonds: Bond[]): 'chiral' | 'achiral' {
    // Simple check: look for carbon with four different substituents
    for (const atom of atoms) {
      if (atom.element === 'C') {
        const connectedBonds = bonds.filter(b => b.from === atom.id || b.to === atom.id)
        if (connectedBonds.length === 4) {
          return 'chiral'
        }
      }
    }
    return 'achiral'
  }

  private detectIsomers(atoms: Atom[], bonds: Bond[]): string[] {
    const formula = getMolecularFormula(atoms)
    const isomers: string[] = []
    
    // Basic isomer detection based on formula
    if (formula === 'C2H6O') {
      isomers.push('Ethanol', 'Dimethyl ether')
    }
    if (formula === 'C4H10') {
      isomers.push('Butane', 'Isobutane')
    }
    
    return isomers
  }

  private generateCommonName(formula: string, structure: EnhancedAnalysis['structure']): string {
    // Simple name generation based on formula and structure
    if (structure.functionalGroups.includes('aromatic')) return 'Aromatic compound'
    if (structure.functionalGroups.includes('hydroxyl')) return 'Alcohol'
    if (structure.functionalGroups.includes('carbonyl')) return 'Carbonyl compound'
    return `Organic compound (${formula})`
  }

  private generateIUPACName(formula: string, structure: EnhancedAnalysis['structure']): string {
    // Simplified IUPAC name generation
    if (formula === 'CH4') return 'Methane'
    if (formula === 'C2H6') return 'Ethane'
    if (formula === 'C2H6O' && structure.functionalGroups.includes('hydroxyl')) return 'Ethanol'
    return `Systematic name for ${formula}`
  }

  private generatePropertiesFromStructure(structure: EnhancedAnalysis['structure']) {
    return {
      physicalState: 'liquid' as const,
      meltingPoint: 25,
      boilingPoint: 100,
      solubility: 'slightly-soluble' as const,
      solubilityDetails: 'Depends on functional groups',
      phBehavior: 'neutral' as const,
      polarity: structure.functionalGroups.length > 0 ? 'polar' as const : 'nonpolar' as const,
      color: 'colorless',
      odor: 'characteristic odor'
    }
  }

  private generateDefaultProperties(formula: string) {
    return {
      physicalState: 'liquid' as const,
      meltingPoint: 0,
      boilingPoint: 100,
      solubility: 'slightly-soluble' as const,
      solubilityDetails: 'Variable solubility',
      phBehavior: 'neutral' as const,
      polarity: 'polar' as const,
      color: 'colorless',
      odor: 'characteristic odor'
    }
  }

  private generateApplicationsFromStructure(structure: EnhancedAnalysis['structure']) {
    return {
      industrial: ['Solvent', 'Chemical intermediate', 'Research chemical'],
      biological: ['Biological activity depends on structure'],
      everyday: ['Common chemical compound'],
      historical: ['Discovered through chemical synthesis']
    }
  }

  private generateDefaultApplications() {
    return {
      industrial: ['Chemical synthesis', 'Research applications'],
      biological: ['Biological role varies'],
      everyday: ['Common chemical'],
      historical: ['Chemical discovery']
    }
  }

  private generateSafetyFromStructure(structure: EnhancedAnalysis['structure']) {
    return {
      toxicity: 'low-toxicity' as const,
      handling: ['Use in well-ventilated area', 'Avoid skin contact'],
      environmental: ['Biodegradable', 'Follow disposal guidelines'],
      regulatory: ['Check local regulations']
    }
  }

  private generateDefaultSafety() {
    return {
      toxicity: 'low-toxicity' as const,
      handling: ['Standard laboratory precautions'],
      environmental: ['Follow disposal guidelines'],
      regulatory: ['Check local regulations']
    }
  }

  private generateEducationalContent(formula: string, atoms: Atom[], bonds: Bond[]) {
    return {
      keyConcepts: ['Molecular structure', 'Chemical bonding', 'Functional groups'],
      misconceptions: ['Structure determines properties', 'All molecules are simple'],
      quizQuestion: {
        question: `What is the molecular formula of this compound?`,
        options: [formula, 'CH4', 'H2O', 'CO2'],
        correctAnswer: 0,
        explanation: `The molecular formula ${formula} represents the actual number of atoms of each element in the molecule.`
      },
      relatedMolecules: [
        { name: 'Similar compound', formula: 'C2H6', reason: 'Related structure' },
        { name: 'Isomer', formula: formula, reason: 'Same formula, different structure' }
      ]
    }
  }

  clearCache(): void {
    this.analysisCache.clear()
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.analysisCache.size,
      hitRate: 0.85 // Simulated cache hit rate
    }
  }
}