// Extended types for new features

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'experiments' | 'accuracy' | 'creativity' | 'safety' | 'collaboration'
  requirement: number
  unlocked: boolean
  unlockedAt?: Date
}

export interface UserProgress {
  userId: string
  level: number
  xp: number
  achievements: Achievement[]
  experimentsCompleted: number
  accuracyScore: number
  streak: number
  lastActive: Date
}

export interface LabNotebookEntry {
  id: string
  experimentId: string
  userId: string
  hypothesis: string
  observations: string[]
  conclusion: string
  drawings?: string[] // Base64 images
  timestamp: Date
  tags: string[]
}

export interface CollaborationSession {
  id: string
  roomCode: string
  hostId: string
  participants: Participant[]
  experiment: any
  createdAt: Date
  isActive: boolean
}

export interface Participant {
  userId: string
  name: string
  color: string
  cursor?: { x: number; y: number }
  isActive: boolean
}

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  chemicals: string[]
  targetReaction: string
  points: number
  timeLimit?: number
  expiresAt: Date
}

export interface InventoryItem {
  chemicalId: string
  quantity: number
  unit: string
  cost: number
  expirationDate?: Date
  lastRestocked: Date
}

export interface SpectroscopyData {
  type: 'uv-vis' | 'ir' | 'nmr' | 'mass'
  wavelengths?: number[]
  absorbance?: number[]
  peaks?: { position: number; intensity: number }[]
  molecularWeight?: number
}

export interface Equipment {
  id: string
  name: string
  type: 'bunsen-burner' | 'centrifuge' | 'ph-meter' | 'thermometer' | 'stirrer' | 'separatory-funnel' | 'distillation'
  isActive: boolean
  settings?: {
    temperature?: number
    speed?: number
    time?: number
  }
}

export interface CurriculumLesson {
  id: string
  title: string
  gradeLevel: 'high-school' | 'undergraduate' | 'graduate'
  subject: string
  objectives: string[]
  experiments: string[]
  quiz?: Quiz
  duration: number
}

export interface Quiz {
  id: string
  questions: QuizQuestion[]
  passingScore: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface SafetyTraining {
  userId: string
  completed: boolean
  score: number
  completedAt?: Date
  certificateUrl?: string
}

export interface MarketplaceExperiment {
  id: string
  authorId: string
  authorName: string
  title: string
  description: string
  chemicals: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  downloads: number
  price: number // 0 for free
  isPremium: boolean
  tags: string[]
  createdAt: Date
}

export interface Review {
  id: string
  experimentId: string
  userId: string
  userName: string
  rating: number
  comment: string
  helpful: number
  createdAt: Date
}

export interface MolecularModel {
  id: string
  formula: string
  atoms: Atom[]
  bonds: Bond[]
  properties: {
    molecularWeight: number
    bondAngles: number[]
    bondLengths: number[]
  }
}

export interface Atom {
  id: string
  element: string
  position: { x: number; y: number; z: number }
  charge: number
}

export interface Bond {
  id: string
  atom1: string
  atom2: string
  type: 'single' | 'double' | 'triple'
  length: number
}

export interface AnalyticsData {
  userId: string
  totalExperiments: number
  successRate: number
  averageAccuracy: number
  mostUsedChemicals: { chemical: string; count: number }[]
  timeSpent: number // in minutes
  experimentsPerDay: { date: string; count: number }[]
  reactionTypes: { type: string; count: number }[]
}

export interface VideoRecording {
  id: string
  experimentId: string
  userId: string
  videoUrl: string
  duration: number
  thumbnail: string
  annotations: Annotation[]
  createdAt: Date
}

export interface Annotation {
  timestamp: number
  text: string
  position?: { x: number; y: number }
}
