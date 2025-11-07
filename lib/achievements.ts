import { Achievement } from '@/types/features'

export const ACHIEVEMENTS: Achievement[] = [
  // Experiments Category
  {
    id: 'first-experiment',
    name: 'First Steps',
    description: 'Complete your first experiment',
    icon: '🧪',
    category: 'experiments',
    requirement: 1,
    unlocked: false
  },
  {
    id: 'ten-experiments',
    name: 'Budding Chemist',
    description: 'Complete 10 experiments',
    icon: '⚗️',
    category: 'experiments',
    requirement: 10,
    unlocked: false
  },
  {
    id: 'fifty-experiments',
    name: 'Lab Veteran',
    description: 'Complete 50 experiments',
    icon: '🔬',
    category: 'experiments',
    requirement: 50,
    unlocked: false
  },
  {
    id: 'hundred-experiments',
    name: 'Master Chemist',
    description: 'Complete 100 experiments',
    icon: '👨‍🔬',
    category: 'experiments',
    requirement: 100,
    unlocked: false
  },
  
  // Accuracy Category
  {
    id: 'perfect-reaction',
    name: 'Perfect Precision',
    description: 'Get 100% accuracy on a reaction',
    icon: '🎯',
    category: 'accuracy',
    requirement: 1,
    unlocked: false
  },
  {
    id: 'accuracy-streak',
    name: 'Consistent Excellence',
    description: 'Maintain 90%+ accuracy for 10 experiments',
    icon: '⭐',
    category: 'accuracy',
    requirement: 10,
    unlocked: false
  },
  
  // Creativity Category
  {
    id: 'unique-combination',
    name: 'Creative Mixer',
    description: 'Try 20 unique chemical combinations',
    icon: '🎨',
    category: 'creativity',
    requirement: 20,
    unlocked: false
  },
  {
    id: 'all-chemicals',
    name: 'Chemical Explorer',
    description: 'Use all available chemicals at least once',
    icon: '🌟',
    category: 'creativity',
    requirement: 60,
    unlocked: false
  },
  
  // Safety Category
  {
    id: 'safety-certified',
    name: 'Safety First',
    description: 'Complete safety training',
    icon: '🛡️',
    category: 'safety',
    requirement: 1,
    unlocked: false
  },
  {
    id: 'no-accidents',
    name: 'Careful Chemist',
    description: 'Complete 25 experiments without safety warnings',
    icon: '✅',
    category: 'safety',
    requirement: 25,
    unlocked: false
  },
  
  // Collaboration Category
  {
    id: 'first-collaboration',
    name: 'Team Player',
    description: 'Complete your first collaborative experiment',
    icon: '🤝',
    category: 'collaboration',
    requirement: 1,
    unlocked: false
  },
  {
    id: 'collaboration-expert',
    name: 'Collaboration Expert',
    description: 'Complete 10 collaborative experiments',
    icon: '👥',
    category: 'collaboration',
    requirement: 10,
    unlocked: false
  },
  
  // Special Achievements
  {
    id: 'daily-streak-7',
    name: 'Week Warrior',
    description: 'Use the lab for 7 consecutive days',
    icon: '🔥',
    category: 'experiments',
    requirement: 7,
    unlocked: false
  },
  {
    id: 'daily-streak-30',
    name: 'Monthly Master',
    description: 'Use the lab for 30 consecutive days',
    icon: '💎',
    category: 'experiments',
    requirement: 30,
    unlocked: false
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete an experiment in under 2 minutes',
    icon: '⚡',
    category: 'experiments',
    requirement: 1,
    unlocked: false
  }
]

export function checkAchievements(userProgress: any): Achievement[] {
  const newAchievements: Achievement[] = []
  
  ACHIEVEMENTS.forEach(achievement => {
    if (achievement.unlocked) return
    
    let isUnlocked = false
    
    switch (achievement.id) {
      case 'first-experiment':
        isUnlocked = userProgress.experimentsCompleted >= 1
        break
      case 'ten-experiments':
        isUnlocked = userProgress.experimentsCompleted >= 10
        break
      case 'fifty-experiments':
        isUnlocked = userProgress.experimentsCompleted >= 50
        break
      case 'hundred-experiments':
        isUnlocked = userProgress.experimentsCompleted >= 100
        break
      case 'perfect-reaction':
        isUnlocked = userProgress.accuracyScore >= 100
        break
      case 'accuracy-streak':
        isUnlocked = userProgress.accuracyStreak >= 10
        break
      case 'daily-streak-7':
        isUnlocked = userProgress.streak >= 7
        break
      case 'daily-streak-30':
        isUnlocked = userProgress.streak >= 30
        break
      default:
        break
    }
    
    if (isUnlocked) {
      newAchievements.push({
        ...achievement,
        unlocked: true,
        unlockedAt: new Date()
      })
    }
  })
  
  return newAchievements
}

export function calculateXP(action: string): number {
  const xpValues: Record<string, number> = {
    'complete-experiment': 50,
    'perfect-accuracy': 100,
    'daily-login': 10,
    'complete-challenge': 150,
    'share-experiment': 25,
    'help-peer': 30,
    'complete-safety-training': 200
  }
  
  return xpValues[action] || 0
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function getXPForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100
}
