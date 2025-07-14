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
var handler = async (event) => {
  const { query, location } = JSON.parse(event.body);
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Google Places API key not configured" })
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
          radius: 1e4
        }
      };
    }
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.types,places.location"
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
        status: "OK"
      })
    };
  } catch (error) {
    console.error("Places API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=search-places.js.map
