'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy, Target, BookOpen, Users, BarChart3, ShoppingBag,
  Shield, GraduationCap, Globe, Beaker, Microscope, Atom,
  Video, GitBranch, Wifi, Package, Zap, ArrowLeft
} from 'lucide-react'

const features = [
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration',
    description: 'Work together with other users in shared lab sessions. See reactions in real-time and collaborate on experiments.',
    icon: Users,
    status: 'active',
    color: 'from-orange-500 to-red-500',
    path: '/collaborate'
  },
  {
    id: 'challenges',
    title: 'Daily Reaction Quiz',
    description: 'Predict chemical reactions and earn points. New challenges every day to test your chemistry knowledge.',
    icon: Target,
    status: 'active',
    color: 'from-blue-500 to-cyan-500',
    path: '/quiz'
  },
  {
    id: 'molecular',
    title: 'Molecular Modeling',
    description: 'Visualize molecular reactions in 3D. Build molecules and see how they interact at the atomic level.',
    icon: Atom,
    status: 'active',
    color: 'from-fuchsia-500 to-pink-500',
    path: '/molecules'
  },
  {
    id: 'equipment',
    title: 'Advanced Equipment',
    description: 'Access professional lab equipment including Bunsen burners, centrifuges, pH meters, and more.',
    icon: Beaker,
    status: 'active',
    color: 'from-cyan-500 to-blue-500',
    path: '/equipment'
  },
  {
    id: 'spectroscopy',
    title: 'Spectroscopy Tools',
    description: 'Analyze substances using UV-Vis, IR, NMR, and mass spectrometry simulations.',
    icon: Microscope,
    status: 'active',
    color: 'from-violet-500 to-purple-500',
    path: '/spectroscopy'
  }
]

export default function FeaturesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'coming-soon'>('all')

  const filteredFeatures = features.filter(f =>
    filter === 'all' || f.status === filter
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('coming-soon')}
                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'coming-soon'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore all the powerful features that make Virtual Chemistry Lab the most comprehensive online chemistry platform
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={feature.path}
                className={`block h-full ${feature.status === 'coming-soon' ? 'pointer-events-none' : ''}`}
              >
                <div className={`h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 ${feature.status === 'coming-soon' ? 'opacity-60' : ''
                  }`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    {feature.status === 'active' && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                    {feature.status === 'coming-soon' && (
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                        Soon
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {features.filter(f => f.status === 'active').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Active Features
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {features.filter(f => f.status === 'coming-soon').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Coming Soon
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {features.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Total Features
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
