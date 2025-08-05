import { API_CONFIG, API_RESPONSES } from '../../src/constants/index.js';

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return API_RESPONSES.options();
  }


  if (!event.body) {
    return API_RESPONSES.error('Request body is required', 400);
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return API_RESPONSES.error('Invalid JSON in request body', 400);
  }

  const { query, location } = parsedBody;

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return API_RESPONSES.error('Google Places API key not configured');
  }

  try {
    const requestBody = {
      textQuery: query,
      maxResultCount: API_CONFIG.MAX_RESULTS_COUNT
    };

    if (location && location.latitude && location.longitude) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          radius: API_CONFIG.PLACES_SEARCH_RADIUS
        }
      };
    }


    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    return API_RESPONSES.success({ 
      results: data.places || [],
      status: 'OK'
    });
  } catch (error) {
    console.error('Places API error:', error);
    return API_RESPONSES.error(error.message);
  }
};
