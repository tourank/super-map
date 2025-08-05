import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LocationTracker from '../LocationTracker'

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
}

describe('LocationTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    })
  })

  it('renders location tracker with get location button', () => {
    render(<LocationTracker />)
    
    expect(screen.getByText('Location Tracker')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows loading state when getting location', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error, options) => {
      // Don't call success callback to simulate loading
    })

    render(<LocationTracker />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('Getting Location...')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('displays location when successfully retrieved', async () => {
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10
      }
    }

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition)
    })

    const onLocationChange = vi.fn()
    render(<LocationTracker onLocationChange={onLocationChange} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/latitude:/i)).toBeInTheDocument()
      expect(screen.getByText(/longitude:/i)).toBeInTheDocument()
      expect(screen.getByText(/accuracy:/i)).toBeInTheDocument()
      expect(screen.getByText('37.7749')).toBeInTheDocument()
      expect(screen.getByText('-122.4194')).toBeInTheDocument()
    })

    expect(onLocationChange).toHaveBeenCalledWith({
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10
    })
  })

  it('shows error message when geolocation fails', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ message: 'Permission denied' })
    })

    render(<LocationTracker />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Error getting location: Permission denied')).toBeInTheDocument()
    })
  })

  it('shows error when geolocation is not supported', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
    })

    render(<LocationTracker />)
    
    expect(screen.getByText('Geolocation is not supported by your browser.')).toBeInTheDocument()
  })
})