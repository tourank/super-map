import { useState } from 'react';
import { generateSinglePlaceMapUrl, generateMultiplePlacesMapUrl } from '../utils/locationUtils';

function MapView({ places, userLocation }) {
  const [showMapLinks, setShowMapLinks] = useState(false);

  const generateMapUrl = (place) => {
    const mapUrl = generateSinglePlaceMapUrl(place);
    if (mapUrl) return mapUrl;
    
    // Fallback to search by name and address if no coordinates found
    const query = `${place.displayName?.text || place.name || ''} ${place.formattedAddress || ''}`.trim();
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  };

  const generateAllPlacesUrl = () => {
    if (!userLocation || places.length === 0) return null;
    
    // Try the utility function first
    const utilityUrl = generateMultiplePlacesMapUrl(places, userLocation);
    if (utilityUrl) return utilityUrl;
    
    // Fallback to directions-based URL
    const baseUrl = 'https://www.google.com/maps/dir/';
    const destinations = places.slice(0, 5).map(place => {
      const coords = place.location || place.geometry?.location;
      if (coords) {
        const lat = coords.latitude || coords.lat;
        const lng = coords.longitude || coords.lng;
        if (lat && lng) return `${lat},${lng}`;
      }
      return encodeURIComponent(place.displayName?.text || place.formattedAddress || 'Unknown location');
    });
    
    return `${baseUrl}${userLocation.latitude},${userLocation.longitude}/${destinations.join('/')}`;
  };

  if (places.length === 0) {
    return null;
  }

  return (
    <div className="map-container">
      <button 
        className="map-toggle-button"
        onClick={() => setShowMapLinks(!showMapLinks)}
      >
        <span>🗺️</span>
        {showMapLinks ? 'Hide Map Options' : 'View on Map'}
      </button>
      
      {showMapLinks && (
        <div className="map-links-container">
          {generateAllPlacesUrl() && (
            <a 
              href={generateAllPlacesUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="map-link all-places"
            >
              <span>🚗</span>
              View All Places (Directions)
            </a>
          )}
          
          <div className="individual-map-links">
            <h4>Individual Locations:</h4>
            {places.slice(0, 5).map((place, index) => (
              <a 
                key={index}
                href={generateMapUrl(place)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-link"
              >
                <span>📍</span>
                {place.displayName?.text || 'View Location'}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;