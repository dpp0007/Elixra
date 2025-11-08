'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Beaker, Flame, Droplet, Thermometer, Scale, Timer, Zap, Wind } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

interface Equipment {
  id: string
  name: string
  category: string
  description: string
  icon: any
  color: string
  inUse: boolean
  temperature?: number
  status?: string
}

const EQUIPMENT_LIST: Equipment[] = [
  {
    id: 'bunsen-burner',
    name: 'Bunsen Burner',
    category: 'Heating',
    description: 'Gas burner for heating substances',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    inUse: false,
    temperature: 1500,
    status: 'Off'
  },
  {
    id: 'hot-plate',
    name: 'Hot Plate',
    category: 'Heating',
    description: 'Electric heating plate with temperature control',
    icon: Zap,
    color: 'from-red-500 to-pink-500',
    inUse: false,
    temperature: 0,
    status: 'Off'
  },
  {
    id: 'centrifuge',
    name: 'Centrifuge',
    category: 'Separation',
    description: 'Separates substances by density using centrifugal force',
    icon: Wind,
    color: 'from-blue-500 to-cyan-500',
    inUse: false,
    status: 'Ready'
  },
  {
    id: 'ph-meter',
    name: 'pH Meter',
    category: 'Measurement',
    description: 'Digital pH measurement device',
    icon: Droplet,
    color: 'from-green-500 to-emerald-500',
    inUse: false,
    status: 'Calibrated'
  },
  {
    id: 'thermometer',
    name: 'Digital Thermometer',
    category: 'Measurement',
    description: 'Precise temperature measurement',
    icon: Thermometer,
    color: 'from-purple-500 to-pink-500',
    inUse: false,
    temperature: 25,
    status: 'Ready'
  },
  {
    id: 'balance',
    name: 'Analytical Balance',
    category: 'Measurement',
    description: 'High-precision weighing scale',
    icon: Scale,
    color: 'from-indigo-500 to-blue-500',
    inUse: false,
    status: 'Calibrated'
  },
  {
    id: 'timer',
    name: 'Lab Timer',
    category: 'Timing',
    description: 'Precise timing for reactions',
    icon: Timer,
    color: 'from-yellow-500 to-orange-500',
    inUse: false,
    status: 'Ready'
  },
  {
    id: 'stirrer',
    name: 'Magnetic Stirrer',
    category: 'Mixing',
    description: 'Stirs solutions using magnetic field',
    icon: Wind,
    color: 'from-teal-500 to-green-500',
    inUse: false,
    status: 'Off'
  },
]

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT_LIST)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(equipment.map(e => e.category)))]

  const filteredEquipment = filterCategory === 'all'
    ? equipment
    : equipment.filter(e => e.category === filterCategory)

  const toggleEquipment = (id: string) => {
    setEquipment(equipment.map(e =>
      e.id === id ? { ...e, inUse: !e.inUse, status: e.inUse ? 'Off' : 'On' } : e
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-1/2 right-0 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse delay-2000"></div>
      </div>

      {/* Modern Navbar */}
      <ModernNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-colors ${filterCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {cat === 'all' ? 'All Equipment' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/10 backdrop-blur-xl border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col ${item.inUse
                    ? 'border-green-500'
                    : 'border-transparent hover:border-blue-500'
                  }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                  {item.name}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-3">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`font-medium ${item.inUse ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.temperature !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Temp:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.inUse ? item.temperature : 0}°C
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleEquipment(item.id)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors mt-auto ${item.inUse
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  {item.inUse ? 'Turn Off' : 'Turn On'}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {equipment.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Equipment
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {equipment.filter(e => e.inUse).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Currently In Use
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Categories
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
