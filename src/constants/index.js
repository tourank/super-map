// API Configuration Constants
export const API_CONFIG = {
  // Google Places API
  PLACES_SEARCH_RADIUS: 10000, // 10km radius for place searches
  MAX_RESULTS_COUNT: 10, // Maximum number of results to return
  
  // Geolocation Settings
  GEOLOCATION_TIMEOUT: 10000, // 10 seconds timeout for geolocation
  GEOLOCATION_MAX_AGE: 60000, // 1 minute cache for location data
  
  // Test Timeouts
  TEST_TIMEOUT: 5000, // 5 seconds for E2E test assertions
};

// CORS Headers Template
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// API Response Templates
export const API_RESPONSES = {
  success: (data) => ({
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(data)
  }),
  
  error: (message, statusCode = 500) => ({
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message })
  }),
  
  options: () => ({
    statusCode: 200,
    headers: CORS_HEADERS,
    body: ''
  })
};