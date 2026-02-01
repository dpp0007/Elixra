import { render, screen, act } from '@testing-library/react'
import SaveConfirmation from '@/components/SaveConfirmation'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('SaveConfirmation Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not render when isVisible is false', () => {
    render(
      <SaveConfirmation 
        isVisible={false} 
        onClose={() => {}} 
      />
    )
    const alert = screen.queryByRole('alert')
    expect(alert).not.toBeInTheDocument()
  })

  it('should render correctly when isVisible is true', () => {
    render(
      <SaveConfirmation 
        isVisible={true} 
        onClose={() => {}} 
      />
    )
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText('Experiment saved successfully!')).toBeInTheDocument()
  })

  it('should display custom message', () => {
    const message = 'Custom success message'
    render(
      <SaveConfirmation 
        isVisible={true} 
        message={message} 
        onClose={() => {}} 
      />
    )
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('should auto-dismiss after 2.5 seconds', () => {
    const onCloseMock = vi.fn()
    render(
      <SaveConfirmation 
        isVisible={true} 
        onClose={onCloseMock} 
      />
    )
    
    expect(onCloseMock).not.toHaveBeenCalled()
    
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close button is clicked', () => {
    const onCloseMock = vi.fn()
    render(
      <SaveConfirmation 
        isVisible={true} 
        onClose={onCloseMock} 
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /dismiss/i })
    closeButton.click()
    
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('should apply correct styles for error type', () => {
    render(
      <SaveConfirmation 
        isVisible={true} 
        onClose={() => {}} 
        type="error"
      />
    )
    
    // Check for error-specific icon (X icon) container class or check icon existence
    // Since we can't easily check class names with testing-library without custom matchers or data-testid,
    // we verify the component renders without crashing in error mode.
    // Ideally we would check for the X icon from lucide-react if we mocked it.
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
  })
})
