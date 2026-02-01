'use client'

import { Element } from '@/types/molecule'
import { useState, useRef } from 'react'

interface ElementDragSourceProps {
  element: Element
  isSelected: boolean
  onClick: () => void
}

declare global {
  interface Window {
    __draggedElement: Element | null
  }
}

export default function ElementDragSource({
  element,
  isSelected,
  onClick,
}: ElementDragSourceProps) {
  const [isDragging, setIsDragging] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    console.log('🔴 Pointer down on:', element.symbol)
    
    if (e.isPrimary) {
      setIsDragging(true)
      if (typeof window !== 'undefined') {
        window.__draggedElement = element
        console.log('🔴 Set window.__draggedElement to:', element.symbol)
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    console.log('🔴 Pointer up on:', element.symbol)
    setIsDragging(false)
    if (typeof window !== 'undefined') {
      window.__draggedElement = null
    }
  }

  return (
    <div
      ref={divRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={onClick}
      draggable
      className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-move select-none ${
        isSelected
          ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/30 scale-105'
          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div
        className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm shadow-lg"
        style={{ backgroundColor: element.color }}
      >
        {element.symbol}
      </div>
      <div className="text-xs text-gray-300 text-center font-medium">
        {element.name}
      </div>
    </div>
  )
}
