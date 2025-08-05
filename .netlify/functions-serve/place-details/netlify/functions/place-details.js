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

// netlify/functions/place-details.js
var place_details_exports = {};
__export(place_details_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(place_details_exports);
var handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Request body is required" })
    };
  }
  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body" })
    };
  }
  const { placeId, fields } = parsedBody;
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Google Places API key not configured" })
    };
  }
  if (!placeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Place ID is required" })
    };
  }
  try {
    const defaultFields = [
      "displayName",
      "formattedAddress",
      "rating",
      "priceLevel",
      "types",
      "location",
      "businessStatus",
      "currentOpeningHours",
      "nationalPhoneNumber",
      "websiteUri",
      // Premium amenity fields
      "allowsDogs",
      "delivery",
      "dineIn",
      "takeout",
      "outdoorSeating",
      "reservable",
      "servesBreakfast",
      "servesLunch",
      "servesDinner",
      "servesVegetarianFood",
      "servesBeer",
      "servesWine",
      "goodForChildren",
      "goodForGroups"
    ];
    const fieldsToRequest = fields || defaultFields;
    const fieldMask = fieldsToRequest.join(",");
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": fieldMask
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status} - ${data.error?.message || "Unknown error"}`);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        place: data,
        status: "OK"
      })
    };
  } catch (error) {
    console.error("Place Details API error:", error);
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
//# sourceMappingURL=place-details.js.map
