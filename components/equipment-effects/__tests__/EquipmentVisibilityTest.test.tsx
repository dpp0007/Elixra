'use client'

import { render, screen, act } from '@testing-library/react'
import EquipmentVisibilityTest from '@/components/equipment-effects/EquipmentVisibilityTest'
import { describe, it, expect, vi } from 'vitest'

describe('EquipmentVisibilityTest', () => {
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

  it('should render equipment components when visible', () => {
    render(
      <EquipmentVisibilityTest
        tubeId="tube-1"
        tubePosition={mockTubePosition}
        attachments={mockAttachments}
        isVisible={true}
      />
    )
    
    expect(screen.getByText('🔬 Equipment Visibility Test')).toBeInTheDocument()
    expect(screen.getByText('Bunsen Burner')).toBeInTheDocument()
    expect(screen.getByText('500°C')).toBeInTheDocument()
  })

  it('should not render when not visible', () => {
    render(
      <EquipmentVisibilityTest
        tubeId="tube-1"
        tubePosition={mockTubePosition}
        attachments={mockAttachments}
        isVisible={false}
      />
    )
    
    expect(screen.queryByText('🔬 Equipment Visibility Test')).not.toBeInTheDocument()
  })

  it('should show error state when equipment fails to render', () => {
    vi.useFakeTimers()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <EquipmentVisibilityTest
        tubeId="tube-1"
        tubePosition={mockTubePosition}
        attachments={mockAttachments}
        isVisible={true}
        simulateError={true}
      />
    )
    
    // Fast-forward time to trigger timeouts
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    // The icon should be present (we check for the icon by its color class or use a testid ideally, 
    // but here we can check if the status update happened)
    // The component renders an XCircle icon for error
    // We can also check if the renderStatus state was updated by checking for the red text
    
    // Wait, the component uses getStatusIcon which renders XCircle
    // Let's check for the XCircle icon indirectly via container or something unique
    // Or we can check if console.error was called if the component logs errors (it doesn't seem to)
    
    // Actually, looking at the component, simulateError sets status to 'error' for index 0 (bunsenBurner)
    // The icon XCircle has class "text-red-500"
    // Let's check for an element with this class or we can assume if the component re-renders, it's working
    
    // But wait, the previous test failed with "Unable to find ... Equipment rendering failed".
    // I don't see "Equipment rendering failed" text in the component code!
    // The component renders equipment names and icons.
    // If status is error, it shows XCircle.
    // So expecting "Equipment rendering failed" is wrong.
    // I should check for the presence of the error icon.
    
    // Let's modify the test to check for the error indicator (red color or icon)
    const errorIcon = document.querySelector('.text-red-500')
    expect(errorIcon).toBeInTheDocument()
    
    consoleSpy.mockRestore()
    vi.useRealTimers()
  })

  it('should validate tube position', () => {
    const invalidPosition = { x: 0, y: 0, width: 0, height: 0 }
    
    render(
      <EquipmentVisibilityTest
        tubeId="tube-1"
        tubePosition={invalidPosition}
        attachments={mockAttachments}
        isVisible={true}
      />
    )
    
    expect(screen.getByText('⚠️ Invalid tube position')).toBeInTheDocument()
  })
})
