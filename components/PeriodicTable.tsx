'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, ChevronLeft, ChevronRight, Info, Zap } from 'lucide-react'
import { PERIODIC_TABLE, ELEMENT_CATEGORIES, ELEMENT_GROUPS, ORGANIC_CHEMISTRY_ELEMENTS, STATE_AT_ROOM_TEMP, RADIOACTIVITY_STATUS, PeriodicElement } from '@/lib/periodicTable'

interface PeriodicTableProps {
  onElementSelect: (element: PeriodicElement) => void
  selectedElement: string | null
  className?: string
}

interface FilterState {
  category: string[]
  stateAtRoomTemp: string[]
  group: string[]
  period: string[]
  isRadioactive: string[]
  isOrganic: boolean
}

export default function PeriodicTable({ onElementSelect, selectedElement, className }: PeriodicTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showCompact, setShowCompact] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<PeriodicElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Drag to scroll logic
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }
  
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    stateAtRoomTemp: [],
    group: [],
    period: [],
    isRadioactive: [],
    isOrganic: false
  })

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearchTerm('')
        setShowFilters(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter and search logic
  const filteredElements = useMemo(() => {
    return PERIODIC_TABLE.filter(element => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          element.symbol.toLowerCase().includes(searchLower) ||
          element.name.toLowerCase().includes(searchLower) ||
          element.atomicNumber.toString().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(element.category)) {
        return false
      }

      // State at room temperature filter
      if (filters.stateAtRoomTemp.length > 0 && !filters.stateAtRoomTemp.includes(element.stateAtRoomTemp)) {
        return false
      }

      // Group filter
      if (filters.group.length > 0 && !filters.group.includes(element.group.toString())) {
        return false
      }

      // Period filter
      if (filters.period.length > 0 && !filters.period.includes(element.period.toString())) {
        return false
      }

      // Radioactivity filter
      if (filters.isRadioactive.length > 0) {
        const isRadioactive = element.isRadioactive ? 'radioactive' : 'stable'
        if (!filters.isRadioactive.includes(isRadioactive)) {
          return false
        }
      }

      // Organic chemistry filter
      if (filters.isOrganic && !ORGANIC_CHEMISTRY_ELEMENTS.includes(element.symbol)) {
        return false
      }

      return true
    })
  }, [searchTerm, filters])

  // Toggle filter
  const toggleFilter = useCallback((filterType: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      return {
        ...prev,
        [filterType]: newValues
      }
    })
  }, [])

  // Toggle boolean filter
  const toggleBooleanFilter = useCallback((filterType: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      category: [],
      stateAtRoomTemp: [],
      group: [],
      period: [],
      isRadioactive: [],
      isOrganic: false
    })
    setSearchTerm('')
  }, [])

  // Get element position in periodic table layout
  const getElementPosition = (element: PeriodicElement) => {
    // Special positions for lanthanides and actinides
    if (element.atomicNumber >= 57 && element.atomicNumber <= 71) {
      return { row: 8, col: element.atomicNumber - 54 }
    }
    if (element.atomicNumber >= 89 && element.atomicNumber <= 103) {
      return { row: 9, col: element.atomicNumber - 86 }
    }
    
    return { row: element.period, col: element.group }
  }

  // Render periodic table grid
  const renderPeriodicTable = () => {
    const grid: (PeriodicElement | null)[][] = Array(10).fill(null).map(() => Array(18).fill(null))
    
    filteredElements.forEach(element => {
      const pos = getElementPosition(element)
      if (pos.row < 10 && pos.col <= 18) {
        grid[pos.row - 1][pos.col - 1] = element
      }
    })

    return (
      <div 
        className="grid gap-1 p-4 min-w-[800px]"
        style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
      >
        {grid.map((row, rowIndex) =>
          row.map((element, colIndex) => {
            if (!element) {
              return <div key={`${rowIndex}-${colIndex}`} className="aspect-square" />
            }

            const isSelected = selectedElement === element.symbol
            const category = ELEMENT_CATEGORIES[element.category as keyof typeof ELEMENT_CATEGORIES]

            return (
              <motion.button
                key={element.symbol}
                onClick={() => onElementSelect(element)}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                className={`
                  relative aspect-square rounded-sm border transition-all duration-200
                  flex flex-col items-center justify-between p-0.5
                  ${isSelected 
                    ? 'border-elixra-bunsen ring-2 ring-elixra-bunsen/50 z-10' 
                    : 'border-white/20 hover:border-white/60 hover:z-10'
                  }
                `}
                style={{
                  backgroundColor: `${category.color}40`,
                  borderColor: isSelected ? '#2E6B6B' : `${category.color}60`
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-full flex justify-between items-start leading-none">
                  <span className="text-[6px] md:text-[8px] font-bold text-white/90">
                    {element.atomicNumber}
                  </span>
                </div>
                <div className="font-bold text-white text-xs md:text-sm drop-shadow-sm">
                  {element.symbol}
                </div>
                <div className="text-[5px] md:text-[6px] text-white/90 font-semibold truncate w-full text-center">
                  {element.name}
                </div>
                
                {/* Tooltip on hover */}
                <AnimatePresence>
                  {hoveredElement?.symbol === element.symbol && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-50"
                    >
                      <div className="glass-panel bg-white/90 dark:bg-elixra-charcoal/90 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-3 min-w-max shadow-xl">
                        <div className="text-center">
                          <div className="font-bold text-elixra-charcoal dark:text-white text-sm">
                            {element.name}
                          </div>
                          <div className="text-xs text-elixra-secondary">
                            {element.symbol} • Atomic #{element.atomicNumber}
                          </div>
                          <div className="text-xs text-elixra-secondary mt-1">
                            Mass: {element.atomicMass}
                          </div>
                          {element.electronegativity && (
                            <div className="text-xs text-elixra-secondary">
                              EN: {element.electronegativity}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })
        )}
      </div>
    )
  }

  // Render compact element list
  const renderCompactList = () => {
    return (
      <div className="grid grid-cols-6 gap-2 p-4 max-h-96 overflow-y-auto">
        {filteredElements.map(element => {
          const isSelected = selectedElement === element.symbol
          const category = ELEMENT_CATEGORIES[element.category as keyof typeof ELEMENT_CATEGORIES]

          return (
            <motion.button
              key={element.symbol}
              onClick={() => onElementSelect(element)}
              onMouseEnter={() => setHoveredElement(element)}
              onMouseLeave={() => setHoveredElement(null)}
              className={`
                relative p-2 rounded-lg border transition-all duration-200
                ${isSelected 
                  ? 'border-elixra-bunsen scale-105 shadow-lg shadow-elixra-bunsen/30' 
                  : 'border-white/20 hover:border-white/40'
                }
              `}
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: isSelected ? '#2E6B6B' : `${category.color}40`
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="font-bold text-elixra-charcoal dark:text-white text-sm">
                  {element.symbol}
                </div>
                <div className="text-xs text-elixra-secondary">
                  {element.atomicNumber}
                </div>
                <div className="text-[10px] text-elixra-secondary truncate">
                  {element.name}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    )
  }

  // Render filter panel
  const renderFilters = () => {
    return (
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel bg-white/60 dark:bg-elixra-charcoal/60 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-4 mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-elixra-charcoal dark:text-white mb-2 text-sm">Category</h3>
                <div className="space-y-1">
                  {Object.entries(ELEMENT_CATEGORIES).map(([category, info]) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={() => toggleFilter('category', category)}
                        className="rounded border-elixra-border-subtle text-elixra-bunsen focus:ring-elixra-bunsen"
                      />
                      <span className="text-xs text-elixra-secondary">{info.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <h3 className="font-semibold text-elixra-charcoal dark:text-white mb-2 text-sm">State</h3>
                <div className="space-y-1">
                  {Object.entries(STATE_AT_ROOM_TEMP).map(([state, info]) => (
                    <label key={state} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.stateAtRoomTemp.includes(state)}
                        onChange={() => toggleFilter('stateAtRoomTemp', state)}
                        className="rounded border-elixra-border-subtle text-elixra-bunsen focus:ring-elixra-bunsen"
                      />
                      <span className="text-xs text-elixra-secondary">{info.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Radioactivity Filter */}
              <div>
                <h3 className="font-semibold text-elixra-charcoal dark:text-white mb-2 text-sm">Radioactivity</h3>
                <div className="space-y-1">
                  {Object.entries(RADIOACTIVITY_STATUS).map(([status, info]) => (
                    <label key={status} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.isRadioactive.includes(status)}
                        onChange={() => toggleFilter('isRadioactive', status)}
                        className="rounded border-elixra-border-subtle text-elixra-bunsen focus:ring-elixra-bunsen"
                      />
                      <span className="text-xs text-elixra-secondary">{info.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Organic Chemistry Filter */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isOrganic}
                    onChange={() => toggleBooleanFilter('isOrganic')}
                    className="rounded border-elixra-border-subtle text-elixra-bunsen focus:ring-elixra-bunsen"
                  />
                  <span className="text-sm text-elixra-secondary">Organic Chemistry Elements Only</span>
                </label>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs font-medium text-elixra-charcoal dark:text-white hover:text-white bg-elixra-bunsen/10 hover:bg-elixra-bunsen rounded-lg transition-all duration-200 border border-elixra-bunsen/20 hover:border-elixra-bunsen hover:shadow-lg hover:shadow-elixra-bunsen/20"
              >
                Clear All Filters
              </button>
              <div className="text-xs text-elixra-secondary">
                {filteredElements.length} elements found
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-elixra-charcoal dark:text-white">
          Periodic Table
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCompact(!showCompact)}
            className="p-2 rounded-lg glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all"
            title={showCompact ? "Show Full Table" : "Show Compact View"}
          >
            {showCompact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg glass-panel bg-white/40 dark:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 transition-all"
            title="Toggle Filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-elixra-secondary" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search elements (Ctrl+E)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 glass-panel bg-white/60 dark:bg-white/10 border border-elixra-border-subtle rounded-xl focus:border-elixra-bunsen focus:ring-1 focus:ring-elixra-bunsen/50 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Legend */}
      <div className="glass-panel bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-3">
        <div className="text-xs text-elixra-secondary mb-2">Element Categories</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(ELEMENT_CATEGORIES).slice(0, 10).map(([category, info]) => (
            <div key={category} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: info.color }}
              />
              <span className="text-xs text-elixra-secondary">{info.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Periodic Table or Compact List */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`glass-panel bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-elixra-border-subtle rounded-xl overflow-x-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {showCompact ? renderCompactList() : renderPeriodicTable()}
      </div>

      {/* Selected Element Info */}
      {selectedElement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel bg-white/60 dark:bg-white/15 backdrop-blur-xl border border-elixra-border-subtle rounded-xl p-4"
        >
          {(() => {
            const element = PERIODIC_TABLE.find(e => e.symbol === selectedElement)
            if (!element) return null
            
            const category = ELEMENT_CATEGORIES[element.category as keyof typeof ELEMENT_CATEGORIES]
            
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-elixra-charcoal dark:text-white">
                      {element.name}
                    </div>
                    <div className="text-sm text-elixra-secondary">
                      {element.symbol} • Atomic #{element.atomicNumber}
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}30` }}
                  >
                    <span className="font-bold text-elixra-charcoal dark:text-white">
                      {element.symbol}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-elixra-secondary">Atomic Mass</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white">
                      {element.atomicMass}
                    </div>
                  </div>
                  <div>
                    <div className="text-elixra-secondary">Category</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white">
                      {category.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-elixra-secondary">Period</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white">
                      {element.period}
                    </div>
                  </div>
                  <div>
                    <div className="text-elixra-secondary">Group</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white">
                      {element.group}
                    </div>
                  </div>
                  {element.electronegativity && (
                    <div>
                      <div className="text-elixra-secondary">Electronegativity</div>
                      <div className="font-medium text-elixra-charcoal dark:text-white">
                        {element.electronegativity}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-elixra-secondary">State</div>
                    <div className="font-medium text-elixra-charcoal dark:text-white capitalize">
                      {element.stateAtRoomTemp}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="text-elixra-secondary mb-1">Description</div>
                  <div className="text-elixra-charcoal dark:text-gray-200">
                    {element.description}
                  </div>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}