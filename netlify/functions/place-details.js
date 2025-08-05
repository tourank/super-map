export const handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Request body is required' }),
    };
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  const { placeId, fields } = parsedBody;

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Google Places API key not configured' }),
    };
  }

  if (!placeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Place ID is required' }),
    };
  }

  try {
    // Premium amenity fields for detailed searches
    const defaultFields = [
      'displayName',
      'formattedAddress',
      'rating',
      'priceLevel',
      'types',
      'location',
      'businessStatus',
      'currentOpeningHours',
      'nationalPhoneNumber',
      'websiteUri',
      // Premium amenity fields
      'allowsDogs',
      'delivery',
      'dineIn',
      'takeout',
      'outdoorSeating',
      'reservable',
      'servesBreakfast',
      'servesLunch',
      'servesDinner',
      'servesVegetarianFood',
      'servesBeer',
      'servesWine',
      'goodForChildren',
      'goodForGroups'
    ];

    const fieldsToRequest = fields || defaultFields;
    const fieldMask = fieldsToRequest.join(',');

    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': fieldMask
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        place: data,
        status: 'OK'
      }),
    };
  } catch (error) {
    console.error('Place Details API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};