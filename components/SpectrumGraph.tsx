'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Peak, TooltipData, SpectrumViewport } from '@/types/spectroscopy'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface SpectrumData {
  type: 'uv-vis' | 'ir' | 'nmr'
  sampleName: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xLabel: string
  yLabel: string
  xInverted?: boolean
  peaks: Peak[]
}

interface SpectrumGraphProps {
  spectrum: SpectrumData
  onPeakSelected?: (peak: Peak) => void
  selectedPeakId?: string | null
}

export default function SpectrumGraph({
  spectrum,
  onPeakSelected,
  selectedPeakId,
}: SpectrumGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [viewport, setViewport] = useState<SpectrumViewport>({
    xMin: spectrum.xMin,
    xMax: spectrum.xMax,
    yMin: spectrum.yMin,
    yMax: spectrum.yMax,
    zoom: 1,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  // Padding for canvas
  const PADDING = { top: 40, right: 40, bottom: 60, left: 80 }

  // Find nearest peak to mouse position
  const findNearestPeak = useCallback(
    (canvasX: number, canvasY: number): Peak | null => {
      if (!canvasRef.current) return null

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = canvasX - rect.left
      const y = canvasY - rect.top

      const graphWidth = canvas.width - PADDING.left - PADDING.right
      const graphHeight = canvas.height - PADDING.top - PADDING.bottom

      // Convert canvas coords to data coords
      const dataX =
        viewport.xMin +
        ((x - PADDING.left) / graphWidth) * (viewport.xMax - viewport.xMin)
      const dataY =
        viewport.yMax -
        ((y - PADDING.top) / graphHeight) * (viewport.yMax - viewport.yMin)

      // Find nearest peak within threshold
      let nearest: Peak | null = null
      let minDistance = 50 // pixel threshold

      spectrum.peaks.forEach((peak) => {
        const peakCanvasX =
          PADDING.left +
          ((peak.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) *
            graphWidth
        const peakCanvasY =
          PADDING.top +
          ((viewport.yMax - peak.y) / (viewport.yMax - viewport.yMin)) *
            graphHeight

        const distance = Math.sqrt(
          Math.pow(x - peakCanvasX, 2) + Math.pow(y - peakCanvasY, 2)
        )

        if (distance < minDistance) {
          minDistance = distance
          nearest = peak
        }
      })

      return nearest
    },
    [spectrum.peaks, viewport]
  )

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const graphWidth = canvas.width - PADDING.left - PADDING.right
      const graphHeight = canvas.height - PADDING.top - PADDING.bottom

      // Convert to data coordinates
      const dataX =
        viewport.xMin +
        ((x - PADDING.left) / graphWidth) * (viewport.xMax - viewport.xMin)
      const dataY =
        viewport.yMax -
        ((y - PADDING.top) / graphHeight) * (viewport.yMax - viewport.yMin)

      // Check if in graph area
      if (
        x >= PADDING.left &&
        x <= canvas.width - PADDING.right &&
        y >= PADDING.top &&
        y <= canvas.height - PADDING.bottom
      ) {
        const peak = findNearestPeak(e.clientX, e.clientY)
        if (peak) {
          setTooltip({
            x: x,
            y: y,
            xValue: peak.x,
            yValue: peak.y,
            peakLabel: peak.label,
            interpretation: peak.interpretation,
            visible: true,
          })
        } else {
          setTooltip({
            x: x,
            y: y,
            xValue: dataX,
            yValue: dataY,
            peakLabel: '',
            interpretation: '',
            visible: true,
          })
        }
      } else {
        setTooltip(null)
      }

      // Handle panning
      if (isDragging && dragStart) {
        const deltaX = (e.clientX - dragStart.x) / graphWidth
        const deltaY = (e.clientY - dragStart.y) / graphHeight

        const xRange = viewport.xMax - viewport.xMin
        const yRange = viewport.yMax - viewport.yMin

        setViewport((prev) => ({
          ...prev,
          xMin: prev.xMin - deltaX * xRange,
          xMax: prev.xMax - deltaX * xRange,
          yMin: prev.yMin + deltaY * yRange,
          yMax: prev.yMax + deltaY * yRange,
        }))

        setDragStart({ x: e.clientX, y: e.clientY })
      }
    },
    [viewport, isDragging, dragStart, findNearestPeak]
  )

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      // Left click
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      setIsDragging(false)
      setDragStart(null)
    }
  }

  // Handle click to select peak
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const peak = findNearestPeak(e.clientX, e.clientY)
    if (peak) {
      onPeakSelected?.(peak)
    }
  }

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const graphWidth = canvas.width - PADDING.left - PADDING.right
    const graphHeight = canvas.height - PADDING.top - PADDING.bottom

    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 1.2 : 0.8
    const newZoom = Math.max(1, Math.min(10, viewport.zoom * zoomFactor))

    if (newZoom === viewport.zoom) return

    // Calculate zoom center in data coordinates
    const zoomCenterX =
      viewport.xMin +
      ((x - PADDING.left) / graphWidth) * (viewport.xMax - viewport.xMin)
    const zoomCenterY =
      viewport.yMax -
      ((y - PADDING.top) / graphHeight) * (viewport.yMax - viewport.yMin)

    // Calculate new range
    const xRange = (viewport.xMax - viewport.xMin) / (newZoom / viewport.zoom)
    const yRange = (viewport.yMax - viewport.yMin) / (newZoom / viewport.zoom)

    setViewport({
      xMin: zoomCenterX - (xRange * (x - PADDING.left)) / graphWidth,
      xMax: zoomCenterX + (xRange * (graphWidth - (x - PADDING.left))) / graphWidth,
      yMin: zoomCenterY - (yRange * (graphHeight - (y - PADDING.top))) / graphHeight,
      yMax: zoomCenterY + (yRange * (y - PADDING.top)) / graphHeight,
      zoom: newZoom,
    })
  }

  // Reset zoom
  const handleResetZoom = () => {
    setViewport({
      xMin: spectrum.xMin,
      xMax: spectrum.xMax,
      yMin: spectrum.yMin,
      yMax: spectrum.yMax,
      zoom: 1,
    })
  }

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)

    const graphWidth = width - PADDING.left - PADDING.right
    const graphHeight = height - PADDING.top - PADDING.bottom

    // Draw grid
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3

    for (let i = 0; i <= 10; i++) {
      const x = PADDING.left + (i / 10) * graphWidth
      const y = PADDING.top + (i / 10) * graphHeight

      ctx.beginPath()
      ctx.moveTo(x, PADDING.top)
      ctx.lineTo(x, height - PADDING.bottom)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(PADDING.left, y)
      ctx.lineTo(width - PADDING.right, y)
      ctx.stroke()
    }

    ctx.globalAlpha = 1

    // Draw axes
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(PADDING.left, height - PADDING.bottom)
    ctx.lineTo(width - PADDING.right, height - PADDING.bottom)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(PADDING.left, PADDING.top)
    ctx.lineTo(PADDING.left, height - PADDING.bottom)
    ctx.stroke()

    // Draw spectrum line
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.9
    ctx.beginPath()

    // Sort peaks by x value
    const sortedPeaks = [...spectrum.peaks].sort((a, b) => a.x - b.x)
    
    if (sortedPeaks.length > 0) {
      // Start from the first peak
      let firstPoint = true
      
      sortedPeaks.forEach((peak, index) => {
        const x =
          PADDING.left +
          ((peak.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) *
            graphWidth
        const y =
          PADDING.top +
          ((viewport.yMax - peak.y) / (viewport.yMax - viewport.yMin)) *
            graphHeight

        if (x >= PADDING.left && x <= width - PADDING.right) {
          if (firstPoint) {
            ctx.moveTo(x, y)
            firstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })

      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Draw baseline
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.moveTo(PADDING.left, height - PADDING.bottom)
    ctx.lineTo(width - PADDING.right, height - PADDING.bottom)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Draw peaks with better visibility
    spectrum.peaks.forEach((peak) => {
      const x =
        PADDING.left +
        ((peak.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) *
          graphWidth
      const y =
        PADDING.top +
        ((viewport.yMax - peak.y) / (viewport.yMax - viewport.yMin)) *
          graphHeight

      if (x >= PADDING.left && x <= width - PADDING.right) {
        // Draw vertical line from baseline to peak
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(x, height - PADDING.bottom)
        ctx.lineTo(x, y)
        ctx.stroke()

        // Draw peak circle
        const isSelected = peak.id === selectedPeakId
        ctx.fillStyle = isSelected ? '#ec4899' : '#3b82f6'
        ctx.beginPath()
        ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2)
        ctx.fill()

        // Draw highlight region if selected
        if (isSelected) {
          ctx.strokeStyle = '#ec4899'
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.arc(x, y, 20, 0, Math.PI * 2)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Draw peak label
        ctx.fillStyle = '#e0e7ff'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.globalAlpha = 0.9
        ctx.fillText(peak.label, x, y - 15)
        ctx.globalAlpha = 1
      }
    })

    // Draw axis labels
    ctx.fillStyle = '#cbd5e1'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(spectrum.xLabel, width / 2, height - 10)

    ctx.save()
    ctx.translate(20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(spectrum.yLabel, 0, 0)
    ctx.restore()

    // Draw axis tick labels
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#94a3b8'

    for (let i = 0; i <= 5; i++) {
      const x =
        PADDING.left +
        (i / 5) * graphWidth
      const xValue =
        viewport.xMin + (i / 5) * (viewport.xMax - viewport.xMin)
      ctx.textAlign = 'center'
      ctx.fillText(xValue.toFixed(1), x, height - PADDING.bottom + 20)

      const y =
        PADDING.top +
        (i / 5) * graphHeight
      const yValue =
        viewport.yMax - (i / 5) * (viewport.yMax - viewport.yMin)
      ctx.textAlign = 'right'
      ctx.fillText(yValue.toFixed(1), PADDING.left - 10, y + 5)
    }
  }, [spectrum, viewport, selectedPeakId])

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Canvas */}
      <div className="relative bg-slate-950/50 rounded-xl border border-white/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
          onMouseLeave={() => setTooltip(null)}
          className="w-full cursor-crosshair"
        />

        {/* Tooltip */}
        {tooltip?.visible && (
          <div
            className="absolute bg-slate-900 border border-white/30 rounded-lg p-3 pointer-events-none shadow-xl"
            style={{
              left: `${(tooltip.x / 800) * 100}%`,
              top: `${(tooltip.y / 400) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="text-xs text-gray-300 font-mono">
              {spectrum.xLabel.split(' ')[0]}: {tooltip.xValue.toFixed(2)}
            </div>
            <div className="text-xs text-gray-300 font-mono">
              {spectrum.yLabel}: {tooltip.yValue.toFixed(2)}
            </div>
            {tooltip.peakLabel && (
              <>
                <div className="text-sm font-bold text-blue-300 mt-2">
                  {tooltip.peakLabel}
                </div>
                <div className="text-xs text-gray-400 mt-1 max-w-xs">
                  {tooltip.interpretation}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Zoom: {viewport.zoom.toFixed(1)}x | Drag to pan, Scroll to zoom, Click peaks to select
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setViewport((prev) => ({
                ...prev,
                zoom: Math.min(10, prev.zoom * 1.2),
              }))
            }
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setViewport((prev) => ({
                ...prev,
                zoom: Math.max(1, prev.zoom / 1.2),
              }))
            }
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Reset zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
