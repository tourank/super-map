import { useState } from 'react';
import { needsDetailedSearch, getRelevantAmenities, formatAmenityData } from '../utils/amenityDetection';

function IntelligentPlacesQuery({ location }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);

  const handleIntelligentQuery = async () => {
    setLoading(true);
    setResponse('');
    setPlaces([]);

    try {
      // First, get relevant places based on the query
      const placesResponse = await fetch('/.netlify/functions/search-places', {
        method: 'POST',
        body: JSON.stringify({ 
          query: query,
          location: location
        })
      });
      
      const placesData = await placesResponse.json();
      let placesResults = placesData.results || [];

      // Check if we need detailed amenity data
      const needsDetails = needsDetailedSearch(query);
      const relevantAmenities = getRelevantAmenities(query);

      if (needsDetails && placesResults.length > 0) {
        console.log('Query needs detailed search for amenities:', relevantAmenities);
        
        // Get detailed information for each place
        const detailPromises = placesResults.map(async (place) => {
          try {
            const detailResponse = await fetch('/.netlify/functions/place-details', {
              method: 'POST',
              body: JSON.stringify({ placeId: place.id })
            });
            const detailData = await detailResponse.json();
            return { ...place, ...detailData.place };
          } catch (error) {
            console.error('Error getting place details:', error);
            return place; // Return basic place data if details fail
          }
        });

        placesResults = await Promise.all(detailPromises);
      }

      setPlaces(placesResults);

      // Create enhanced query with amenity data if available
      const enhancedQuery = `
        User query: "${query}"
        
        ${location ? `User location: ${location.latitude}, ${location.longitude}` : ''}
        
        Available places data:
        ${placesResults.map((place, index) => `
        ${index + 1}. ${place.displayName?.text || 'Unknown'}
           Address: ${place.formattedAddress || 'Unknown'}
           Rating: ${place.rating || 'No rating'}
           Types: ${place.types?.join(', ') || 'Unknown'}
           ${needsDetails ? `Amenities: ${formatAmenityData(place, relevantAmenities) || 'No specific amenity data available'}` : ''}
        `).join('\n')}
        
        ${needsDetails ? `
        Note: This query specifically asks about amenities. Focus on places that match the requested amenities: ${relevantAmenities.join(', ')}.
        ` : ''}
        
        Please provide a helpful response based on this data. Be specific and mention relevant places by name.
      `;

      const llmResponse = await fetch('/.netlify/functions/query-llm', {
        method: 'POST',
        body: JSON.stringify({ query: enhancedQuery }),
      });
      
      const llmData = await llmResponse.json();
      setResponse(llmData.response);
    } catch (error) {
      console.error('Error with intelligent query:', error);
      setResponse('Sorry, there was an error processing your request.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Intelligent Places Query</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about places near you..."
          style={{ width: '300px', padding: '10px' }}
        />
        <button 
          onClick={handleIntelligentQuery} 
          disabled={loading || !query.trim()}
          style={{ padding: '10px 20px', marginLeft: '10px' }}
        >
          {loading ? 'Processing...' : 'Ask'}
        </button>
      </div>

      {response && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          marginBottom: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>AI Response:</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{response}</p>
        </div>
      )}

      {places.length > 0 && (
        <div>
          <h3>Found Places:</h3>
          {places.map((place, index) => {
            const needsDetails = needsDetailedSearch(query);
            const relevantAmenities = getRelevantAmenities(query);
            const amenityInfo = needsDetails ? formatAmenityData(place, relevantAmenities) : null;
            
            return (
              <div key={index} style={{ 
                border: '1px solid #ccc', 
                margin: '10px 0', 
                padding: '15px',
                borderRadius: '5px'
              }}>
                <h4>{place.displayName?.text}</h4>
                <p><strong>Address:</strong> {place.formattedAddress}</p>
                {place.rating && <p><strong>Rating:</strong> {place.rating}</p>}
                {place.types && <p><strong>Types:</strong> {place.types.join(', ')}</p>}
                {place.priceLevel && <p><strong>Price Level:</strong> {'$'.repeat(place.priceLevel)}</p>}
                {needsDetails && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '3px' }}>
                    <strong>Amenities:</strong>
                    {amenityInfo ? (
                      <p style={{ margin: '5px 0' }}>{amenityInfo}</p>
                    ) : (
                      <p style={{ margin: '5px 0', fontStyle: 'italic' }}>No specific amenity data available</p>
                    )}
                    {place.currentOpeningHours && (
                      <p><strong>Hours:</strong> {place.currentOpeningHours.openNow ? 'Open now' : 'Closed'}</p>
                    )}
                    {place.nationalPhoneNumber && <p><strong>Phone:</strong> {place.nationalPhoneNumber}</p>}
                    {place.websiteUri && (
                      <p><strong>Website:</strong> <a href={place.websiteUri} target="_blank" rel="noopener noreferrer">Visit</a></p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IntelligentPlacesQuery;