'use client'

import { render, screen, act } from '@testing-library/react'
import EquipmentDebugOverlay from '@/components/equipment-effects/EquipmentDebugOverlay'
import { describe, it, expect } from 'vitest'

describe('EquipmentDebugOverlay', () => {
  const mockTubePosition = {
    x: 100,
    y: 200,
    width: 80,
    height: 160
  }

  const mockAttachments = [
    {
      equipmentType: 'bunsen-burner',
      targetTubeId: 'tube-1',
      isActive: true,
      settings: { temperature: 500 }
    },
    {
      equipmentType: 'ph-meter',
      targetTubeId: 'tube-1',
      isActive: false,
      settings: { pH: 7.0 }
    }
  ]

  it('should not render when isVisible is false', () => {
    render(
      <EquipmentDebugOverlay
        tubeId="tube-1"
        tubePosition={mockTubePosition}
        attachments={mockAttachments}
        isVisible={false}
      />
    )
    
    expect(screen.queryByText('🔧 Equipment Debug')).not.toBeInTheDocument()
  })

  it('should render debug information when visible', () => {
    render(
      <EquipmentDebugOverlay
        tubeId="tube-1"
        tubePosition={mockTubePosition}
        attachments={mockAttachments}
        isVisible={true}
      />
    )
    
    expect(screen.getByText('🔧 Equipment Debug')).toBeInTheDocument()
    expect(screen.getByText('tube-1')).toBeInTheDocument()
    expect(screen.getByText('100, 200')).toBeInTheDocument()
    expect(screen.getByText('80×160')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // Active equipment count
  })

  it('should show "NOT SET" when position is null', () => {
    render(
      <EquipmentDebugOverlay
        tubeId="tube-1"
        tubePosition={null}
        attachments={[]}
        isVisible={true}
      />
    )
    
    expect(screen.getAllByText('NOT SET')).toHaveLength(2)
  })

  it('should show "0" when no active equipment', () => {
    render(
      <EquipmentDebugOverlay
        tubeId="tube-1"
        tubePosition={mockTubePosition}
        attachments={[]}
        isVisible={true}
      />
    )
    
    expect(screen.getByText('0')).toBeInTheDocument() // Active equipment count
  })

  it('should show expanded details when expanded', async () => {
    render(
      <EquipmentDebugOverlay
        tubeId="tube-1"
        tubePosition={mockTubePosition}
        attachments={mockAttachments}
        isVisible={true}
      />
    )
    
    // Click expand button
    const expandButton = screen.getByText('Expand')
    await act(async () => {
      expandButton.click()
    })
    
    expect(screen.getByText('Active Attachments:')).toBeInTheDocument()
    expect(screen.getAllByText('bunsen-burner')[0]).toBeInTheDocument()
    expect(screen.getAllByText('ON')[0]).toBeInTheDocument()
  })
})
