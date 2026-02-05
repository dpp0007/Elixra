import { useEffect, useRef, useState } from 'react'

interface AutoScrollOptions {
  threshold?: number // Distance from edge to trigger scroll (px)
  maxSpeed?: number // Maximum scroll speed (px/sec)
  acceleration?: number // Acceleration factor (0-1)
}

export function useAutoScroll({
  threshold = 50,
  maxSpeed = 100,
  acceleration = 0.1
}: AutoScrollOptions = {}) {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const scrollRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const requestRef = useRef<number | null>(null)
  const speedRef = useRef<number>(0)

  // Visual indicator state
  const [showIndicator, setShowIndicator] = useState(false)

  const scroll = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    
    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    // Smoothly interpolate speed
    const targetSpeed = scrollRef.current
    speedRef.current += (targetSpeed - speedRef.current) * acceleration
    
    if (Math.abs(speedRef.current) > 0.1) {
      // Calculate displacement: speed (px/s) * time (s)
      const displacement = (speedRef.current * deltaTime) / 1000
      window.scrollBy(0, displacement)
      
      requestRef.current = requestAnimationFrame(scroll)
    } else {
      setIsAutoScrolling(false)
      setShowIndicator(false)
      lastTimeRef.current = 0
      requestRef.current = null
    }
  }

  const handleDrag = (y: number) => {
    const viewportHeight = window.innerHeight
    const distanceFromBottom = viewportHeight - y
    
    if (distanceFromBottom < threshold) {
      // Calculate speed based on proximity to edge (closer = faster)
      // Normalize distance (0 at edge, 1 at threshold)
      const intensity = 1 - Math.max(0, Math.min(1, distanceFromBottom / threshold))
      
      // Target speed
      scrollRef.current = maxSpeed * intensity
      
      if (!requestRef.current) {
        setIsAutoScrolling(true)
        setShowIndicator(true)
        lastTimeRef.current = performance.now()
        requestRef.current = requestAnimationFrame(scroll)
      }
    } else {
      scrollRef.current = 0
      if (Math.abs(speedRef.current) < 1) {
         setShowIndicator(false)
      }
    }
  }

  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      handleDrag(e.clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientY)
      }
    }

    const onDragEnd = () => {
      scrollRef.current = 0
      setShowIndicator(false)
    }

    // Attach listeners to window to catch events everywhere
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('dragend', onDragEnd)
    window.addEventListener('touchend', onDragEnd)
    window.addEventListener('mouseup', onDragEnd)

    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('dragend', onDragEnd)
      window.removeEventListener('touchend', onDragEnd)
      window.removeEventListener('mouseup', onDragEnd)
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [threshold, maxSpeed, acceleration])

  return { isAutoScrolling, showIndicator }
}
