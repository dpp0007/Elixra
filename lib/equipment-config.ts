/**
 * Unified Equipment Configuration
 * Shared between /equipment page and lab equipment panel
 */

import { Flame, Zap, Wind, Droplet, Thermometer, Scale, Timer, Beaker } from 'lucide-react'

export interface Equipment {
  id: string
  name: string
  category: string
  description: string
  icon: any
  color: string
  active: boolean
  value?: number
  unit?: string
  min?: number
  max?: number
  step?: number
  status?: string
}

export const EQUIPMENT_CONFIG: Equipment[] = [
  {
    id: 'bunsen-burner',
    name: 'Bunsen Burner',
    category: 'Heating',
    description: 'Gas burner for heating substances up to 1500°C',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    active: false,
    value: 0,
    unit: '°C',
    min: 0,
    max: 1500,
    step: 50,
    status: 'Off'
  },
  {
    id: 'hot-plate',
    name: 'Hot Plate',
    category: 'Heating',
    description: 'Electric heating plate with precise temperature control',
    icon: Zap,
    color: 'from-red-500 to-pink-500',
    active: false,
    value: 25,
    unit: '°C',
    min: 25,
    max: 400,
    step: 25,
    status: 'Off'
  },
  {
    id: 'magnetic-stirrer',
    name: 'Magnetic Stirrer',
    category: 'Mixing',
    description: 'Stirs solutions using rotating magnetic field',
    icon: Wind,
    color: 'from-teal-500 to-green-500',
    active: false,
    value: 0,
    unit: 'RPM',
    min: 0,
    max: 1500,
    step: 100,
    status: 'Off'
  },
  {
    id: 'ph-meter',
    name: 'pH Meter',
    category: 'Measurement',
    description: 'Digital pH measurement device (0-14 scale)',
    icon: Droplet,
    color: 'from-green-500 to-emerald-500',
    active: false,
    value: 7.0,
    unit: 'pH',
    min: 0,
    max: 14,
    step: 0.1,
    status: 'Calibrated'
  },
  {
    id: 'thermometer',
    name: 'Digital Thermometer',
    category: 'Measurement',
    description: 'Precise temperature measurement (-50°C to 300°C)',
    icon: Thermometer,
    color: 'from-purple-500 to-pink-500',
    active: false,
    value: 25,
    unit: '°C',
    min: -50,
    max: 300,
    step: 5,
    status: 'Ready'
  },
  {
    id: 'analytical-balance',
    name: 'Analytical Balance',
    category: 'Measurement',
    description: 'High-precision weighing scale (0.0001g accuracy)',
    icon: Scale,
    color: 'from-indigo-500 to-blue-500',
    active: false,
    value: 0,
    unit: 'g',
    min: 0,
    max: 200,
    step: 0.1,
    status: 'Calibrated'
  },
  {
    id: 'timer',
    name: 'Lab Timer',
    category: 'Timing',
    description: 'Precise timing for reactions and experiments',
    icon: Timer,
    color: 'from-yellow-500 to-orange-500',
    active: false,
    value: 0,
    unit: 'min',
    min: 0,
    max: 120,
    step: 5,
    status: 'Ready'
  },
  {
    id: 'centrifuge',
    name: 'Centrifuge',
    category: 'Separation',
    description: 'Separates substances by density using centrifugal force',
    icon: Wind,
    color: 'from-blue-500 to-cyan-500',
    active: false,
    value: 0,
    unit: 'RPM',
    min: 0,
    max: 5000,
    step: 500,
    status: 'Ready'
  }
]

export const getEquipmentById = (id: string): Equipment | undefined => {
  return EQUIPMENT_CONFIG.find(eq => eq.id === id)
}

export const getEquipmentByCategory = (category: string): Equipment[] => {
  return EQUIPMENT_CONFIG.filter(eq => eq.category === category)
}

export const getAllCategories = (): string[] => {
  return Array.from(new Set(EQUIPMENT_CONFIG.map(eq => eq.category)))
}
