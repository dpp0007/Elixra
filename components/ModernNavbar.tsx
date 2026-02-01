'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import Image from 'next/image'
import AuthButton from '@/components/AuthButton'
import { useTheme } from '@/components/ThemeProvider'

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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-[100] w-full py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-16">
          {/* Main container with Glass Panel style - Improved Light Mode Contrast */}
          <div className="glass-panel relative h-full rounded-full transition-all duration-300 bg-white/40 dark:bg-[#252830]/80 border border-elixra-bunsen/10 dark:border-elixra-border-subtle shadow-lg">
            <div className="flex h-16 items-center pl-4 sm:pl-8 lg:pl-10 pr-3">
              {/* Logo - Left side */}
              <div className="flex items-center flex-shrink-0 mr-4 sm:mr-8">
                <div className="relative h-10 w-24 sm:w-32">
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
                      className={`relative px-4 py-2.5 text-sm font-medium transition-all rounded-full whitespace-nowrap ${
                        isActive
                          ? 'text-elixra-bunsen font-semibold bg-elixra-bunsen/5 dark:bg-elixra-bunsen/10'
                          : 'text-elixra-charcoal/80 dark:text-gray-300 hover:text-elixra-bunsen hover:bg-white/20 dark:hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Right Side Actions */}
              <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-elixra-border-subtle gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-elixra-copper hover:bg-elixra-bunsen/10 transition-colors"
                  aria-label="Toggle theme"
                >
                  {mounted && theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
                
                <AuthButton />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden ml-auto p-2 text-elixra-charcoal dark:text-gray-200 hover:text-elixra-bunsen rounded-full transition-all duration-300"
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
          className="lg:hidden mt-2 mx-4 sm:mx-6 lg:mx-8 glass-panel bg-white/90 dark:bg-[#252830]/95 rounded-3xl overflow-hidden relative z-[100] border border-elixra-bunsen/10 dark:border-elixra-border-subtle shadow-xl"
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? 'bg-elixra-bunsen/10 text-elixra-bunsen font-semibold'
                      : 'text-elixra-charcoal/80 dark:text-gray-300 hover:text-elixra-bunsen hover:bg-white/20 dark:hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            <div className="pt-2 flex items-center justify-between px-4 border-t border-elixra-border-subtle mt-2">
              <span className="text-sm font-medium text-elixra-charcoal dark:text-gray-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-elixra-copper hover:bg-elixra-bunsen/10 transition-colors"
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="pt-2 px-4 pb-2">
              <AuthButton dropdownPosition="top" />
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
