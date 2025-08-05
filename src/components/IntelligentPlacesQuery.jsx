import { useState } from 'react';
import { needsDetailedSearch, getRelevantAmenities, formatAmenityData } from '../utils/amenityDetection';
import MapView from './MapView';

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
      const requestBody = { 
        query: query,
        location: location
      };
      
      console.log('Request body:', requestBody);
      console.log('Stringified:', JSON.stringify(requestBody));
      
      const placesResponse = await fetch('/.netlify/functions/search-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const placesData = await placesResponse.json();
      console.log('Places API response:', placesData);
      
      if (placesData.error) {
        console.error('Google API Error:', placesData);
        setResponse(`Error: ${placesData.error}. Google said: ${JSON.stringify(placesData.googleResponse)}`);
        setLoading(false);
        return;
      }
      
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
              headers: {
                'Content-Type': 'application/json'
              },
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
        headers: {
          'Content-Type': 'application/json'
        },
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
    <div className="intelligent-query">
      <div className="query-input-section">
        <div className="input-container">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about places near you..."
            className="query-input"
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!loading && query.trim()) {
                  handleIntelligentQuery();
                }
              }
            }}
          />
          <button 
            onClick={handleIntelligentQuery} 
            disabled={loading || !query.trim()}
            className="query-button"
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>
      </div>

      {response && (
        <div className="ai-response">
          <h3>AI Response:</h3>
          <p className="ai-response-text">{response}</p>
        </div>
      )}

      {places.length > 0 && (
        <>
          <MapView places={places} userLocation={location} />
          
          <div className="places-results">
            <h3>Found Places:</h3>
            {places.map((place, index) => {
              const needsDetails = needsDetailedSearch(query);
              const relevantAmenities = getRelevantAmenities(query);
              const amenityInfo = needsDetails ? formatAmenityData(place, relevantAmenities) : null;
              
              return (
                <div key={index} className="place-card">
                  <h4 className="place-name">{place.displayName?.text}</h4>
                  <p className="place-info"><strong>Address:</strong> {place.formattedAddress}</p>
                  {place.rating && <p className="place-info"><strong>Rating:</strong> {place.rating}</p>}
                  {place.types && <p className="place-info"><strong>Types:</strong> {place.types.join(', ')}</p>}
                  {place.priceLevel && <p className="place-info price-level"><strong>Price Level:</strong> {'$'.repeat(place.priceLevel)}</p>}
                  {needsDetails && (
                    <div className="amenities-section">
                      <strong>Amenities:</strong>
                      {amenityInfo ? (
                        <p className="amenities-text">{amenityInfo}</p>
                      ) : (
                        <p className="amenities-text no-data">No specific amenity data available</p>
                      )}
                      <div className="contact-info">
                        {place.currentOpeningHours && (
                          <p><strong>Hours:</strong> {place.currentOpeningHours.openNow ? 'Open now' : 'Closed'}</p>
                        )}
                        {place.nationalPhoneNumber && <p><strong>Phone:</strong> {place.nationalPhoneNumber}</p>}
                        {place.websiteUri && (
                          <p><strong>Website:</strong> <a href={place.websiteUri} target="_blank" rel="noopener noreferrer" className="website-link">Visit</a></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default IntelligentPlacesQuery;