import { Challenge } from '@/types/features'

export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'precipitation-master',
    title: 'Precipitation Master',
    description: 'Create a white precipitate using silver nitrate',
    difficulty: 'easy',
    chemicals: ['agno3', 'nacl'],
    targetReaction: 'precipitation',
    points: 100,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'acid-base-neutralization',
    title: 'Neutralization Expert',
    description: 'Perform an acid-base neutralization reaction',
    difficulty: 'easy',
    chemicals: ['hcl', 'naoh'],
    targetReaction: 'acid-base',
    points: 100,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'color-change-master',
    title: 'Color Change Master',
    description: 'Create a blue solution using copper sulfate',
    difficulty: 'medium',
    chemicals: ['cuso4'],
    targetReaction: 'complexation',
    points: 150,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'gas-evolution',
    title: 'Gas Evolution',
    description: 'Create a reaction that produces gas bubbles',
    difficulty: 'medium',
    chemicals: ['nahco3', 'hcl'],
    targetReaction: 'gas-evolution',
    points: 150,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'complex-reaction',
    title: 'Complex Reaction',
    description: 'Perform a reaction with 4 or more chemicals',
    difficulty: 'hard',
    chemicals: [],
    targetReaction: 'any',
    points: 200,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
]

export function generateDailyChallenge(): Challenge {
  const challenges = [...DAILY_CHALLENGES]
  const randomIndex = Math.floor(Math.random() * challenges.length)
  const challenge = challenges[randomIndex]
  
  return {
    ...challenge,
    id: `${challenge.id}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
}

export function checkChallengeCompletion(
  challenge: Challenge,
  experiment: any,
  reactionResult: any
): boolean {
  // Check if required chemicals are used
  if (challenge.chemicals.length > 0) {
    const usedChemicals = experiment.chemicals.map((c: any) => c.chemical.id)
    const hasAllChemicals = challenge.chemicals.every(chem => 
      usedChemicals.includes(chem)
    )
    if (!hasAllChemicals) return false
  }
  
  // Check reaction type
  if (challenge.targetReaction !== 'any') {
    if (reactionResult.reactionType !== challenge.targetReaction) {
      return false
    }
  }
  
  // Check for complex reaction (4+ chemicals)
  if (challenge.id.includes('complex-reaction')) {
    if (experiment.chemicals.length < 4) return false
  }
  
  return true
}
