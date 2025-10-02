import fetch from "node-fetch";

/**
 * Geocode a location string to lat/lng using OpenStreetMap Nominatim API
 */
export async function geocodeLocation(location) {
  // Handle fallback for global / unknown
  if (!location || location.toLowerCase() === "global") {
    return { lat: 20, lng: 0 }; // Neutral fallback point (mid-Atlantic)
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "SupplyChainRiskRadar/1.0 (contact@example.com)" }
    });

    if (!resp.ok) {
      console.error("🌍 Geocoding API failed:", resp.status, resp.statusText);
      return { lat: 20, lng: 0 };
    }

    const data = await resp.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("🌍 Geocoding failed for:", location, "→", err.message);
  }

  // Fallback if no result
  return { lat: 20, lng: 0 };
}
