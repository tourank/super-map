// Amenity keywords that trigger detailed Place Details requests
export const AMENITY_KEYWORDS = {
  // Pet-friendly
  dogs: ['dog', 'dogs', 'pet', 'pets', 'dog-friendly', 'pet-friendly'],
  
  // Dining options
  takeout: ['takeout', 'take-out', 'to-go', 'pickup'],
  delivery: ['delivery', 'delivers'],
  dineIn: ['dine-in', 'sit-down', 'eat-in'],
  curbsidePickup: ['curbside', 'curb-side', 'curbside pickup'],
  
  // Outdoor amenities
  outdoorSeating: ['outdoor', 'patio', 'terrace', 'outside seating', 'outdoor seating'],
  
  // Group dining
  goodForGroups: ['groups', 'group', 'large party', 'big group'],
  goodForChildren: ['kids', 'children', 'family', 'kid-friendly', 'family-friendly'],
  
  // Entertainment
  liveMusic: ['live music', 'music', 'band', 'entertainment'],
  goodForWatchingSports: ['sports', 'game', 'tv', 'television', 'watch sports'],
  
  // Food types
  servesBreakfast: ['breakfast', 'brunch', 'morning'],
  servesLunch: ['lunch', 'midday'],
  servesDinner: ['dinner', 'evening'],
  servesBrunch: ['brunch'],
  servesVegetarianFood: ['vegetarian', 'vegan', 'plant-based'],
  servesCoffee: ['coffee', 'espresso', 'cappuccino', 'latte'],
  
  // Beverages
  servesBeer: ['beer', 'brewery', 'craft beer'],
  servesWine: ['wine', 'winery'],
  servesCocktails: ['cocktails', 'drinks', 'bar', 'mixed drinks'],
  
  // Services
  reservable: ['reservation', 'reservations', 'book', 'booking'],
  restroom: ['restroom', 'bathroom', 'washroom'],
  parkingOptions: ['parking', 'valet', 'free parking']
};

// Check if a query contains amenity-related keywords
export function needsDetailedSearch(query) {
  const lowerQuery = query.toLowerCase();
  
  for (const [amenity, keywords] of Object.entries(AMENITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        return true;
      }
    }
  }
  
  return false;
}

// Get specific amenities mentioned in the query
export function getRelevantAmenities(query) {
  const lowerQuery = query.toLowerCase();
  const relevantAmenities = [];
  
  for (const [amenity, keywords] of Object.entries(AMENITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        relevantAmenities.push(amenity);
        break; // Don't add the same amenity multiple times
      }
    }
  }
  
  return relevantAmenities;
}

// Format amenity data for display
export function formatAmenityData(place, relevantAmenities) {
  const amenityText = [];
  
  relevantAmenities.forEach(amenity => {
    const value = place[amenity];
    if (value !== undefined && value !== null) {
      const displayName = amenity.replace(/([A-Z])/g, ' $1').toLowerCase();
      amenityText.push(`${displayName}: ${value === true ? 'Yes' : value === false ? 'No' : value}`);
    }
  });
  
  return amenityText.join(', ');
}