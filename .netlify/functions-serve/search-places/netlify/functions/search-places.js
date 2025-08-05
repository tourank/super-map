var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/search-places.js
var search_places_exports = {};
__export(search_places_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(search_places_exports);

// src/constants/index.js
var API_CONFIG = {
  // Google Places API
  PLACES_SEARCH_RADIUS: 1e4,
  // 10km radius for place searches
  MAX_RESULTS_COUNT: 10,
  // Maximum number of results to return
  // Geolocation Settings
  GEOLOCATION_TIMEOUT: 1e4,
  // 10 seconds timeout for geolocation
  GEOLOCATION_MAX_AGE: 6e4,
  // 1 minute cache for location data
  // Test Timeouts
  TEST_TIMEOUT: 5e3
  // 5 seconds for E2E test assertions
};
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
var API_RESPONSES = {
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
    body: ""
  })
};

// netlify/functions/search-places.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return API_RESPONSES.options();
  }
  if (!event.body) {
    return API_RESPONSES.error("Request body is required", 400);
  }
  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return API_RESPONSES.error("Invalid JSON in request body", 400);
  }
  const { query, location } = parsedBody;
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return API_RESPONSES.error("Google Places API key not configured");
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
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.types"
      },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }
    return API_RESPONSES.success({
      results: data.places || [],
      status: "OK"
    });
  } catch (error) {
    console.error("Places API error:", error);
    return API_RESPONSES.error(error.message);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=search-places.js.map
