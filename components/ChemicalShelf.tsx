'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrag } from 'react-dnd'
import { COMMON_CHEMICALS, Chemical, ChemicalCategory } from '@/types/chemistry'
import {
  AlertTriangle,
  Droplets,
  Package,
  Info,
  X,
  Beaker,
  Eye,
  Thermometer,
  Zap,
  Search,
  Filter,
  FlaskConical,
  TestTube2,
  Flame,
  Sparkles,
  ChevronDown
} from 'lucide-react'

interface ChemicalCardProps {
  chemical: Chemical
  onClick: () => void
  onAddToTestTube?: (chemical: Chemical) => void
}

interface ChemicalDetailModalProps {
  chemical: Chemical
  isOpen: boolean
  onClose: () => void
}

function ChemicalDetailModal({ chemical, isOpen, onClose }: ChemicalDetailModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-elixra-cream dark:bg-elixra-charcoal border border-elixra-copper/20 rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div
              className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: chemical.color }}
            >
              {chemical.state === 'liquid' ? (
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              ) : (
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-elixra-text-primary truncate">
                {chemical.name}
              </h3>
              <p className="text-sm sm:text-base font-mono text-elixra-text-secondary break-all">
                {chemical.formula}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2 hover:bg-elixra-bunsen/10 rounded-lg transition-colors flex-shrink-0 ml-2 touch-manipulation"
          >
            <X className="h-5 w-5 text-elixra-text-secondary" />
          </button>
        </div>

        {/* Properties */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-elixra-bunsen" />
                <span className="text-xs font-medium text-elixra-text-secondary">State</span>
              </div>
              <p className="text-sm font-semibold text-elixra-text-primary capitalize">{chemical.state}</p>
            </div>

            {chemical.concentration && (
              <div className="bg-white/50 dark:bg-white/5 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1">
                  <Beaker className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-xs font-medium text-elixra-text-secondary">Concentration</span>
                </div>
                <p className="text-sm font-semibold text-elixra-text-primary">{chemical.concentration}M</p>
              </div>
            )}
          </div>

          {/* Description */}
          {chemical.description && (
            <div className="bg-elixra-bunsen/10 rounded-lg p-2.5 sm:p-3">
              <h4 className="text-xs font-semibold text-elixra-bunsen mb-1">Description</h4>
              <p className="text-xs text-elixra-bunsen-dark dark:text-elixra-bunsen-light">{chemical.description}</p>
            </div>
          )}

          {/* Hazards */}
          {chemical.hazards && chemical.hazards.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="text-xs font-semibold text-red-900 dark:text-red-100">Safety Hazards</h4>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {chemical.hazards.map((hazard, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full text-xs font-medium"
                  >
                    {hazard}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="bg-green-500/10 rounded-lg p-2.5 sm:p-3">
            <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Usage</h4>
            <p className="text-xs text-green-700 dark:text-green-300">
              <span className="hidden sm:inline">Drag this chemical to test tubes or beakers to add it to your experiment.</span>
              <span className="sm:hidden">Tap or drag this chemical to test tubes or beakers.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChemicalCard({ chemical, onClick, onAddToTestTube }: ChemicalCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'chemical',
    item: chemical,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on the info button
    if ((e.target as HTMLElement).closest('button')) {
      console.log('ChemicalCard: Info button clicked, ignoring')
      return
    }

    console.log('ChemicalCard: Card clicked', {
      hasCallback: !!onAddToTestTube,
      chemical: chemical?.name,
      chemicalObject: chemical
    })

    if (onAddToTestTube && chemical && chemical.name) {
      console.log('ChemicalCard: Calling onAddToTestTube with chemical:', chemical.name)
      onAddToTestTube(chemical)
    } else {
      console.error('ChemicalCard: Cannot add to test tube:', { 
        onAddToTestTube: !!onAddToTestTube, 
        chemical: chemical?.name,
        hasName: !!chemical?.name
      })
      alert('Error: Cannot add chemical to test tube. Please check console for details.')
    }
  }

  return (
    <div
      ref={drag as any}
      data-drag-type="chemical"
      onClick={handleCardClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all touch-manipulation active:scale-95 ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''
        }`}
      role="button"
      aria-label={`${chemical.name} - ${chemical.formula}. ${chemical.description || ''} ${chemical.hazards?.length ? `Hazards: ${chemical.hazards.join(', ')}` : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick(e as any)
        }
      }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* State Icon - no background */}
          {chemical.state === 'liquid' ? (
            <Droplets className="h-5 w-5 text-blue-500" />
          ) : (
            <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          {/* Color Indicator */}
          <div
            className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
            style={{ backgroundColor: chemical.color }}
          />
        </div>

        {/* State Badge - subtle */}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
          {chemical.state}
        </span>
      </div>

      {/* Chemical Name & Formula */}
      <div className="mb-3">
        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1.5">
          {chemical.name}
        </h3>
        <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {chemical.formula}
        </p>
      </div>

      {/* Metadata Row - Clean badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {chemical.concentration && (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
            <Beaker className="h-3.5 w-3.5" />
            <span>{chemical.concentration}M</span>
          </span>
        )}
        {chemical.category && (
          <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
            <FlaskConical className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{chemical.category}</span>
          </span>
        )}
      </div>

      {/* Description */}
      {chemical.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {chemical.description}
        </p>
      )}

      {/* Footer Row */}
      <div className="flex items-center justify-between">
        {/* Hazards */}
        {chemical.hazards && chemical.hazards.length > 0 ? (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">
              {chemical.hazards.length} hazard{chemical.hazards.length > 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <div></div>
        )}

        {/* Info Button - Larger tap target on mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="p-2 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors touch-manipulation -m-1"
        >
          <Info className="h-4 w-4 sm:h-4 sm:w-4 text-elixra-bunsen" />
        </button>
      </div>
    </div>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
  align?: 'left' | 'right'
}

function CustomSelect({ value, onChange, options, className = "", align = 'left' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-3 pr-3 py-2 bg-white/50 dark:bg-black/20 border border-elixra-copper/20 rounded-md text-elixra-text-primary focus:ring-2 focus:ring-elixra-bunsen focus:border-transparent cursor-pointer hover:border-elixra-copper/40 transition-colors text-left text-xs sm:text-sm"
      >
        <span className="truncate mr-2">{selectedOption?.label}</span>
        <ChevronDown className={`h-4 w-4 text-elixra-text-secondary transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-1 min-w-full w-max max-w-[300px] bg-elixra-cream dark:bg-elixra-charcoal border border-elixra-copper/20 rounded-md shadow-xl max-h-60 overflow-y-auto overflow-x-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`px-3 py-2 cursor-pointer text-xs sm:text-sm transition-colors whitespace-nowrap
                  ${option.value === value
                    ? 'bg-elixra-bunsen/10 text-elixra-bunsen font-medium'
                    : 'text-elixra-text-primary hover:bg-elixra-bunsen/5'
                  }
                `}
              >
                {option.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ChemicalShelfProps {
  onAddChemicalToTestTube?: (chemical: Chemical) => void
}

export default function ChemicalShelf({ onAddChemicalToTestTube }: ChemicalShelfProps) {
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<'all' | 'solid' | 'liquid'>('all')
  const [filterCategory, setFilterCategory] = useState<ChemicalCategory | 'all'>('all')

  // Get unique categories from chemicals
  const categories: ChemicalCategory[] = [
    'Acids',
    'Bases',
    'Common Salts',
    'Metal Salts',
    'Indicators',
    'Oxidizing/Reducing Agents',
    'Organic Compounds',
    'Other'
  ]

  // Filter chemicals based on search query, state filter, and category filter
  const filteredChemicals = useMemo(() => {
    let filtered = COMMON_CHEMICALS

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(chemical =>
        chemical.name.toLowerCase().includes(query) ||
        chemical.formula.toLowerCase().includes(query) ||
        chemical.description?.toLowerCase().includes(query) ||
        chemical.hazards?.some(hazard => hazard.toLowerCase().includes(query)) ||
        chemical.category?.toLowerCase().includes(query)
      )
    }

    // Filter by state
    if (filterState !== 'all') {
      filtered = filtered.filter(chemical => chemical.state === filterState)
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(chemical => chemical.category === filterCategory)
    }

    return filtered
  }, [searchQuery, filterState, filterCategory])

  const clearSearch = () => {
    setSearchQuery('')
    setFilterState('all')
    setFilterCategory('all')
  }

  // Get count for each category
  const getCategoryCount = (category: ChemicalCategory) => {
    return COMMON_CHEMICALS.filter(c => c.category === category).length
  }

  const stateOptions: SelectOption[] = [
    { value: 'all', label: 'All States' },
    { value: 'solid', label: 'Solid' },
    { value: 'liquid', label: 'Liquid' }
  ]

  const categoryOptions: SelectOption[] = [
    { value: 'all', label: `All Categories (${COMMON_CHEMICALS.length})` },
    ...categories.map(category => {
      const count = getCategoryCount(category)
      if (count === 0) return null
      return { value: category, label: `${category} (${count})` }
    }).filter(Boolean) as SelectOption[]
  ]

  return (
    <>
      <div className="p-4">
        {/* Search Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="relative mb-2 sm:mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chemicals..."
              className="w-full pl-10 pr-10 py-2.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-500 touch-manipulation"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>

          {/* Compact Filter Row */}
          <div className="flex items-center gap-3 text-xs">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />

            {/* State Filter */}
            <CustomSelect
              value={filterState}
              onChange={(val) => setFilterState(val as any)}
              options={stateOptions}
              className="min-w-[120px]"
            />

            {/* Category Filter */}
            <CustomSelect
              value={filterCategory}
              onChange={(val) => setFilterCategory(val as any)}
              options={categoryOptions}
              className="flex-1 min-w-0"
              align="right"
            />
          </div>

          {/* Active Filters Info */}
          {(searchQuery || filterState !== 'all' || filterCategory !== 'all') && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Found <strong>{filteredChemicals.length}</strong> chemical{filteredChemicals.length !== 1 ? 's' : ''}
              {filteredChemicals.length === 0 && (
                <button
                  onClick={clearSearch}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-medium touch-manipulation"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong className="hidden sm:inline">Click</strong>
            <strong className="sm:hidden">Tap</strong> to add to test tube or <strong>drag</strong> to containers
          </p>
        </div>

        {/* Chemical Grid - Responsive columns based on container width */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3">
          {filteredChemicals.length > 0 ? (
            filteredChemicals.map((chemical) => (
              <ChemicalCard
                key={chemical.id}
                chemical={chemical}
                onClick={() => setSelectedChemical(chemical)}
                onAddToTestTube={onAddChemicalToTestTube}
              />
            ))
          ) : (
            <div className="col-span-2 sm:col-span-1 text-center py-6 sm:py-8">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <Search className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  No chemicals found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Try adjusting your filters
                </p>
                <button
                  onClick={clearSearch}
                  className="px-3 py-2 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium touch-manipulation"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Safety Notice */}
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-yellow-500/10 rounded-md border border-yellow-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Virtual lab for educational purposes
            </p>
          </div>
        </div>
      </div>

      {/* Chemical Detail Modal */}
      <ChemicalDetailModal
        chemical={selectedChemical!}
        isOpen={!!selectedChemical}
        onClose={() => setSelectedChemical(null)}
      />
    </>
  )
}