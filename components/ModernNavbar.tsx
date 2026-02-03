'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import AuthButton from '@/components/AuthButton'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Lab', path: '/lab' },
  { name: 'AI Teacher', path: '/avatar' },
  { name: 'Quiz', path: '/quiz' },
  { name: 'Molecules', path: '/molecules' },
  { name: 'Spectroscopy', path: '/spectroscopy' },
  { name: 'Collaborate', path: '/collaborate' }
]

export default function ModernNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-[100] w-full py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pill-shaped container with fancy border */}
        <div className="relative h-16">
          {/* Outer glow effect - matching features page purple theme */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 blur-xl opacity-75"></div>

          {/* SVG animated border beam - purple/pink gradient */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="beam-gradient">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="35%" stopColor="rgba(139, 92, 246, 0)" />
                <stop offset="45%" stopColor="rgba(139, 92, 246, 0.6)" />
                <stop offset="50%" stopColor="rgba(168, 85, 247, 1)" />
                <stop offset="55%" stopColor="rgba(236, 72, 153, 0.6)" />
                <stop offset="65%" stopColor="rgba(236, 72, 153, 0)" />
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

          {/* Main container - matching features page glass morphism */}
          <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-full shadow-2xl border-2 border-white/20 hover:border-white/30 transition-all duration-300">
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
                      onClick={(e) => {
                        console.log('Navbar link clicked:', item.name, item.path)
                      }}
                      className={`relative px-4 py-2.5 text-sm font-medium transition-all rounded-full whitespace-nowrap ${isActive
                        ? 'text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
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
                className="lg:hidden ml-auto p-2 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 rounded-full transition-all duration-300"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - matching features page theme */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden mt-2 mx-4 sm:mx-6 lg:mx-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden relative z-[100]"
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-full transition-all ${isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {item.name}
                </Link>
              )
            })}
            <div className="pt-2">
              <AuthButton />
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
