/**
 * Extracts latitude and longitude from various Google Places API location formats
 * @param {Object} place - Place object from Google Places API
 * @returns {Object|null} - {lat, lng} coordinates or null if not found
 */
export function extractLocationCoords(place) {
  if (!place) return null;

  // Try different location formats from Google Places API
  if (place.location) {
    return {
      lat: place.location.latitude,
      lng: place.location.longitude
    };
  }
  
  if (place.geometry?.location) {
    return {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    };
  }
  
  if (place.lat && place.lng) {
    return {
      lat: place.lat,
      lng: place.lng
    };
  }
  
  return null;
}

/**
 * Generates a Google Maps URL for a single place
 * @param {Object} place - Place object with location data
 * @returns {string|null} - Google Maps URL or null if no location found
 */
export function generateSinglePlaceMapUrl(place) {
  const coords = extractLocationCoords(place);
  if (!coords) return null;

  const { lat, lng } = coords;
  const placeName = place.displayName?.text || place.name || 'Location';
  
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.place_id || ''}&zoom=15&markers=${lat},${lng}`;
}

/**
 * Generates a Google Maps URL showing all places and user location
 * @param {Array} places - Array of place objects
 * @param {Object} userLocation - User's current location {latitude, longitude}
 * @returns {string|null} - Google Maps URL or null if no valid places
 */
export function generateMultiplePlacesMapUrl(places, userLocation) {
  if (!places || places.length === 0) return null;

  const validPlaces = places
    .map(place => ({
      ...place,
      coords: extractLocationCoords(place)
    }))
    .filter(place => place.coords);

  if (validPlaces.length === 0) return null;

  // Create markers parameter for each place
  let markers = validPlaces
    .map(place => `${place.coords.lat},${place.coords.lng}`)
    .join('|');

  // Add user location marker if available
  if (userLocation) {
    markers += `|${userLocation.latitude},${userLocation.longitude}`;
  }

  // Calculate center point for the map
  const centerLat = validPlaces.reduce((sum, place) => sum + place.coords.lat, 0) / validPlaces.length;
  const centerLng = validPlaces.reduce((sum, place) => sum + place.coords.lng, 0) / validPlaces.length;

  return `https://www.google.com/maps/@${centerLat},${centerLng},13z/data=!3m1!4b1!4m2!6m1!1s${markers}`;
}

/**
 * Validates if a location object has required coordinates
 * @param {Object} location - Location object to validate
 * @returns {boolean} - True if location has valid coordinates
 */
export function isValidLocation(location) {
  return location && 
         typeof location.latitude === 'number' && 
         typeof location.longitude === 'number' &&
         !isNaN(location.latitude) && 
         !isNaN(location.longitude);
}