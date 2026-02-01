'use client'

import { useEffect } from 'react'

export function useDragScroll() {
  useEffect(() => {
    let dragStarted = false
    let draggedElement: HTMLElement | null = null
    let dragTimeout: NodeJS.Timeout | null = null

    const handleDragStart = (e: DragEvent) => {
      draggedElement = e.target as HTMLElement
      // Only prevent scrolling if dragging a chemical card
      // Check if draggedElement is an HTMLElement before calling closest
      if (draggedElement && draggedElement instanceof HTMLElement && draggedElement.closest('[data-drag-type="chemical"]')) {
        if (!dragStarted) {
          document.body.classList.add('dragging')
          dragStarted = true
          console.log('Drag started for chemical')
        }
      }
    }

    const handleDragEnd = () => {
      if (dragStarted) {
        // Add a small delay before removing the dragging class
        // to ensure drop events are processed
        dragTimeout = setTimeout(() => {
          document.body.classList.remove('dragging')
          dragStarted = false
          console.log('Drag ended, scrolling restored')
        }, 200) // Increased delay to ensure modal operations complete
      }
      draggedElement = null
    }

    const handleMouseUp = () => {
      // Ensure dragging state is cleared on mouse up
      if (dragTimeout) {
        clearTimeout(dragTimeout)
      }
      if (dragStarted) {
        document.body.classList.remove('dragging')
        dragStarted = false
        console.log('Mouse up, scrolling restored')
      }
    }

    const handleClick = () => {
      // Clear drag state on any click
      if (dragTimeout) {
        clearTimeout(dragTimeout)
      }
      if (dragStarted) {
        document.body.classList.remove('dragging')
        dragStarted = false
        console.log('Click detected, drag state cleared')
      }
    }

    const forceCleanup = () => {
      if (dragTimeout) {
        clearTimeout(dragTimeout)
      }
      document.body.classList.remove('dragging')
      dragStarted = false
      draggedElement = null
      console.log('Force cleanup executed')
    }

    // Add a global cleanup function that can be called from anywhere
    ;(window as any).forceCleanupDrag = forceCleanup

    // Listen for drag events
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('dragend', handleDragEnd)
    document.addEventListener('drop', handleDragEnd)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClick)
    document.addEventListener('touchend', handleMouseUp)

    // Cleanup
    return () => {
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('dragend', handleDragEnd)
      document.removeEventListener('drop', handleDragEnd)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchend', handleMouseUp)
      if (dragTimeout) {
        clearTimeout(dragTimeout)
      }
      document.body.classList.remove('dragging')
    }
  }, [])
}