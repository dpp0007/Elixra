'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Lab', path: '/lab' },
  { name: 'Features', path: '/features' },
  { name: 'Quiz', path: '/quiz' },
  { name: 'Molecules', path: '/molecules' },
  { name: 'Equipment', path: '/equipment' },
  { name: 'Spectroscopy', path: '/spectroscopy' },
  { name: 'Collaborate', path: '/collaborate' }
]

export default function ModernNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pill-shaped container with fancy border */}
        <div className="relative h-16">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl opacity-75"></div>

          {/* SVG animated border beam - positioned absolutely to cover entire navbar */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="beam-gradient">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="35%" stopColor="rgba(59, 130, 246, 0)" />
                <stop offset="45%" stopColor="rgba(59, 130, 246, 0.6)" />
                <stop offset="50%" stopColor="rgba(96, 165, 250, 1)" />
                <stop offset="55%" stopColor="rgba(139, 92, 246, 0.6)" />
                <stop offset="65%" stopColor="rgba(139, 92, 246, 0)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="32"
              fill="none"
              stroke="url(#beam-gradient)"
              strokeWidth="3"
              strokeDasharray="1200"
              filter="url(#glow)"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-2400"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>

          {/* Main container with gradient border */}
          <div className="relative h-full bg-slate-900/95 backdrop-blur-xl rounded-full shadow-2xl border-2 border-white/10">
            <div className="flex h-16 items-center px-8 lg:px-10">
              {/* Logo - Left side */}
              <div className="flex items-center flex-shrink-0 mr-8">
                <div className="relative h-10 w-32">
                  <Image
                    src="/Assets/Main Logo.svg"
                    alt="Elixra Virtual Chem Lab"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </div>

              {/* Desktop Navigation - Centered */}
              <nav className="hidden lg:flex items-center justify-center flex-1 gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`px-4 py-2.5 text-sm font-medium transition-all rounded-full whitespace-nowrap ${isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden ml-auto p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden mt-2 mx-4 sm:mx-6 lg:mx-8 bg-slate-900/95 backdrop-blur-xl border-2 border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-full transition-colors ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </header>
  )
}
