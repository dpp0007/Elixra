'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Beaker } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import { EQUIPMENT_CONFIG, Equipment } from '@/lib/equipment-config'

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(
    EQUIPMENT_CONFIG.map(eq => ({ ...eq }))
  )
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(equipment.map(e => e.category)))]

  const filteredEquipment = filterCategory === 'all'
    ? equipment
    : equipment.filter(e => e.category === filterCategory)

  const toggleEquipment = (id: string) => {
    setEquipment(equipment.map(e =>
      e.id === id ? { 
        ...e, 
        active: !e.active, 
        status: e.active ? 'Off' : 'On' 
      } : e
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background - matching features page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
      </div>

      {/* Modern Navbar */}
      <ModernNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link
            href="/lab"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Lab</span>
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Lab Equipment
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional laboratory equipment for precise experiments and measurements
          </p>
        </motion.div>
        {/* Filter */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all duration-300 mb-6">
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
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 100
                }}
                className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 rounded-3xl p-6 hover:border-white/40 transition-all duration-300 flex flex-col ${item.active
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-white/20'
                  }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 mx-auto ${
                  item.active ? 'animate-pulse' : ''
                }`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-lg font-bold text-white text-center mb-2">
                  {item.name}
                </h3>

                <p className="text-xs text-gray-400 text-center mb-3">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Category:</span>
                    <span className="font-medium text-white">{item.category}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${item.active ? 'text-green-400' : 'text-gray-400'}`}>
                      {item.status}
                    </span>
                  </div>

                  {item.value !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Setting:</span>
                      <span className="font-medium text-white">
                        {item.active ? item.value : 0} {item.unit}
                      </span>
                    </div>
                  )}
                  
                  {item.min !== undefined && item.max !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Range:</span>
                      <span className="font-medium text-gray-300">
                        {item.min}-{item.max} {item.unit}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleEquipment(item.id)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors mt-auto ${item.active
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  {item.active ? 'Turn Off' : 'Turn On'}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {equipment.length}
            </div>
            <div className="text-sm text-gray-400">
              Total Equipment
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {equipment.filter(e => e.active).length}
            </div>
            <div className="text-sm text-gray-400">
              Currently Active
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 hover:border-white/40 transition-all">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-400">
              Categories
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/50 rounded-3xl p-6"
        >
          <div className="flex items-start space-x-4">
            <Beaker className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Equipment Integration
              </h3>
              <p className="text-sm text-gray-300">
                All equipment shown here is available in the lab. Go to the{' '}
                <Link href="/lab" className="text-blue-400 hover:text-blue-300 underline">
                  Virtual Lab
                </Link>
                {' '}and click &quot;Lab Equipment&quot; to activate and configure these devices for your experiments.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
