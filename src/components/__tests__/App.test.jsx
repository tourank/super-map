import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../../App'

describe('App', () => {
  it('renders app title and subtitle', () => {
    render(<App />)
    
    expect(screen.getByText('Super Map')).toBeInTheDocument()
    expect(screen.getByText('AI-powered places discovery')).toBeInTheDocument()
  })

  it('renders LocationTracker and IntelligentPlacesQuery components', () => {
    render(<App />)
    
    expect(screen.getByText('Location Tracker')).toBeInTheDocument()
    expect(screen.getByText('Get Current Location')).toBeInTheDocument()
  })
})