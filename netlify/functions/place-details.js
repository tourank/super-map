import { API_RESPONSES } from '../../src/constants/index.js';

export const handler = async (event) => {
  if (!event.body) {
    return API_RESPONSES.error('Request body is required', 400);
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return API_RESPONSES.error('Invalid JSON in request body', 400);
  }

  const { placeId, fields } = parsedBody;

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return API_RESPONSES.error('Google Places API key not configured');
  }

  if (!placeId) {
    return API_RESPONSES.error('Place ID is required', 400);
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

    return API_RESPONSES.success({ 
      place: data,
      status: 'OK'
    });
  } catch (error) {
    console.error('Place Details API error:', error);
    return API_RESPONSES.error(error.message);
  }
};