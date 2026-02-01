/**
 * Equipment Animation System - Type Definitions and State Management
 * Implements the canonical animation spec for Elixra virtual lab
 */

export interface EquipmentAttachment {
  equipmentId: string
  equipmentType: string
  targetTubeId: string
  isActive: boolean
  settings: EquipmentSettings
}

export interface EquipmentSettings {
  // Bunsen Burner / Hot Plate
  temperature?: number // 0-1500°C or 25-400°C
  
  // Magnetic Stirrer / Centrifuge
  rpm?: number // 0-1500 or 0-5000
  
  // pH Meter
  pH?: number // 0-14
  
  // Thermometer
  measuredTemp?: number // -50 to 300°C
  
  // Analytical Balance
  weight?: number // 0-200g
  tareOffset?: number // Tare offset in grams
  
  // Lab Timer
  timeRemaining?: number // 0-120 min (in seconds)
  timerMode?: 'countdown' | 'countup'
  isTimerRunning?: boolean
}

export interface AnimationState {
  attachments: EquipmentAttachment[]
}

// Stacking rule validation
export function canAttachEquipment(
  equipmentType: string,
  targetTubeId: string,
  currentAttachments: EquipmentAttachment[]
): { allowed: boolean; reason?: string } {
  const tubeAttachments = currentAttachments.filter(
    a => a.targetTubeId === targetTubeId && a.isActive
  )

  // Heating exclusivity: Bunsen Burner OR Hot Plate
  if (equipmentType === 'bunsen-burner' || equipmentType === 'hot-plate') {
    const hasHeating = tubeAttachments.some(
      a => a.equipmentType === 'bunsen-burner' || a.equipmentType === 'hot-plate'
    )
    if (hasHeating) {
      return { allowed: false, reason: 'Only one heating device per tube' }
    }
  }

  // Motion exclusivity: Stirrer OR Centrifuge
  if (equipmentType === 'magnetic-stirrer' || equipmentType === 'centrifuge') {
    const hasMotion = tubeAttachments.some(
      a => a.equipmentType === 'magnetic-stirrer' || a.equipmentType === 'centrifuge'
    )
    if (hasMotion) {
      return { allowed: false, reason: 'Only one motion device per tube' }
    }
  }

  // Centrifuge cannot stack with heating
  if (equipmentType === 'centrifuge') {
    const hasHeating = tubeAttachments.some(
      a => a.equipmentType === 'bunsen-burner' || a.equipmentType === 'hot-plate'
    )
    if (hasHeating) {
      return { allowed: false, reason: 'Centrifuge cannot run with heating' }
    }
  }

  // Balance exclusivity: one tube per balance
  if (equipmentType === 'analytical-balance') {
    const hasBalance = tubeAttachments.some(a => a.equipmentType === 'analytical-balance')
    if (hasBalance) {
      return { allowed: false, reason: 'One tube per balance' }
    }
  }

  return { allowed: true }
}

// Calculate intensity scaling for animations
export function getIntensityScale(equipmentType: string, value: number): {
  level: 'minimal' | 'low' | 'medium' | 'high' | 'extreme'
  percentage: number
} {
  let percentage = 0
  let level: 'minimal' | 'low' | 'medium' | 'high' | 'extreme' = 'minimal'

  switch (equipmentType) {
    case 'bunsen-burner':
      percentage = (value / 1500) * 100
      if (value < 100) level = 'minimal'
      else if (value < 500) level = 'low'
      else if (value < 1000) level = 'medium'
      else if (value < 1500) level = 'high'
      else level = 'extreme'
      break

    case 'hot-plate':
      percentage = ((value - 25) / 375) * 100
      if (value < 100) level = 'minimal'
      else if (value < 200) level = 'low'
      else if (value < 300) level = 'medium'
      else level = 'high'
      break

    case 'magnetic-stirrer':
      percentage = (value / 1500) * 100
      if (value < 300) level = 'minimal'
      else if (value < 800) level = 'low'
      else if (value < 1200) level = 'medium'
      else level = 'high'
      break

    case 'centrifuge':
      percentage = (value / 5000) * 100
      if (value < 1000) level = 'minimal'
      else if (value < 2500) level = 'low'
      else if (value < 4000) level = 'medium'
      else level = 'high'
      break

    default:
      percentage = 50
      level = 'medium'
  }

  return { level, percentage }
}

// pH color mapping
export function getPhColor(pH: number): string {
  if (pH <= 3) return '#ef4444' // Red
  if (pH <= 6) return '#f97316' // Orange
  if (pH <= 7.5) return '#10b981' // Green
  if (pH <= 10) return '#3b82f6' // Blue
  return '#a855f7' // Purple
}

// Timer color mapping
export function getTimerColor(minutes: number): string {
  if (minutes <= 30) return '#10b981' // Green
  if (minutes <= 60) return '#eab308' // Yellow
  if (minutes <= 90) return '#f97316' // Orange
  return '#ef4444' // Red
}
