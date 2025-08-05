import { useState } from 'react';

function MapView({ places, userLocation }) {
  const [showMapLinks, setShowMapLinks] = useState(false);

  const generateMapUrl = (place) => {
    console.log('Place data for map:', place); // Debug logging
    
    // Try different location formats from Google Places API
    let lat, lng;
    
    if (place.location) {
      lat = place.location.latitude;
      lng = place.location.longitude;
    } else if (place.geometry?.location) {
      lat = place.geometry.location.lat;
      lng = place.geometry.location.lng;
    } else if (place.lat && place.lng) {
      lat = place.lat;
      lng = place.lng;
    }
    
    if (lat && lng) {
      // Use exact coordinates with place name as query
      const placeName = encodeURIComponent(place.displayName?.text || place.name || 'Location');
      return `https://www.google.com/maps/search/${placeName}/@${lat},${lng},17z`;
    } else {
      // Fall back to search by name and address
      const query = `${place.displayName?.text || place.name || ''} ${place.formattedAddress || ''}`.trim();
      return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    }
  };

  const generateAllPlacesUrl = () => {
    const baseUrl = 'https://www.google.com/maps/dir/';
    
    if (userLocation && places.length > 0) {
      // Create a multi-destination route
      let destinations = places.slice(0, 5).map(place => {
        // Try different location formats
        let lat, lng;
        if (place.location) {
          lat = place.location.latitude;
          lng = place.location.longitude;
        } else if (place.geometry?.location) {
          lat = place.geometry.location.lat;
          lng = place.geometry.location.lng;
        }
        
        if (lat && lng) {
          return `${lat},${lng}`;
        }
        // Fallback to address/name search
        return encodeURIComponent(place.displayName?.text || place.formattedAddress || 'Unknown location');
      });
      
      return `${baseUrl}${userLocation.latitude},${userLocation.longitude}/${destinations.join('/')}`;
    }
    
    return null;
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