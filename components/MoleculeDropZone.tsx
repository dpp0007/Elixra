'use client'

import { Element } from '@/types/molecule'
import { useRef, useState } from 'react'

interface MoleculeDropZoneProps {
  children: React.ReactNode
  onDrop: (element: Element, position?: { x: number; y: number; z: number }) => void
}

declare global {
  interface Window {
    __draggedElement: Element | null
  }
}

export default function MoleculeDropZone({
  children,
  onDrop,
}: MoleculeDropZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = useState(false)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(true)
    console.log('🟡 Drag enter')
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(false)
    console.log('🟡 Drag leave')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(false)

    try {
      // Get the data from dataTransfer if available (standard way)
      const elementSymbol = e.dataTransfer.getData('text/plain')
      
      // Fallback to window global if needed (for custom drag implementation)
      const draggedElement = typeof window !== 'undefined' ? window.__draggedElement : null
      
      console.log('Drop handler called, symbol:', elementSymbol, 'draggedElement:', draggedElement)
      
      if (!draggedElement && !elementSymbol) {
        console.log('No dragged element found')
        return
      }

      // If we have the symbol but not the full object, we might need to find it
      // For now, prioritize the full object if available, as onDrop expects an Element
      const elementToDrop = draggedElement 
        
      if (elementToDrop) {
        console.log('✅ Drop detected:', elementToDrop.symbol)

        // Calculate drop position relative to container center if possible
        // This is a rough estimation, as we don't have the exact 3D coordinates here
        // The 3D viewer will likely handle precise positioning or use (0,0,0) as default
        
        onDrop(elementToDrop, { 
          x: 0, 
          y: 0, 
          z: 0 
        })
        
        // Clear the global
        if (typeof window !== 'undefined') {
          window.__draggedElement = null
        }
      } else {
         console.warn('Could not resolve dragged element object')
      }

    } catch (error) {
      console.error('Drop error:', error)
    }
  }

  return (
    <div
      id="molecule-drop-zone"
      ref={containerRef}
      className="relative w-full h-full"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ 
        pointerEvents: 'auto'
      }}
    >
      {children}
      
      {/* Visual feedback when dragging over */}
      {isOver && (
        <div 
          className="absolute inset-0 bg-purple-500/20 border-2 border-purple-400 rounded-2xl pointer-events-none flex items-center justify-center"
          style={{ backdropFilter: 'blur(2px)', zIndex: 40 }}
        >
          <div className="text-white font-bold text-xl text-center">
            <div>Drop Atom Here</div>
            <div className="text-sm text-purple-200 mt-2">✓ Ready to drop</div>
          </div>
        </div>
      )}
    </div>
  )
}
