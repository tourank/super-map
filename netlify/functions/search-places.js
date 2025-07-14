export const handler = async (event) => {
  const { query, location } = JSON.parse(event.body);

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Google Places API key not configured' }),
    };
  }

  try {
    const requestBody = {
      textQuery: query,
      maxResultCount: 10
    };

    if (location && location.latitude && location.longitude) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          radius: 10000
        }
      };
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.types,places.location'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        results: data.places || [],
        status: 'OK'
      }),
    };
  } catch (error) {
    console.error('Places API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
