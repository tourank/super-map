import React, { useState, useEffect } from 'react'

const LocationTracker = ({ onLocationChange }) => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setLocation(newLocation)
        if (onLocationChange) {
          onLocationChange(newLocation)
        }
        setLoading(false)
      },
      (error) => {
        setError(`Error getting location: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  return (
    <div className="location-tracker">
      <h3>Location Tracker</h3>
      <button 
        className="location-button"
        onClick={getCurrentLocation} 
        disabled={loading}
      >
        <span>📍</span>
        {loading ? 'Getting Location...' : 'Get Current Location'}
      </button>
      
      {error && <p className="error-message">{error}</p>}
      
      {location && (
        <div className="location-info">
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>
          <p><strong>Accuracy:</strong> {location.accuracy} meters</p>
        </div>
      )}
    </div>
  )
}

export default LocationTracker
