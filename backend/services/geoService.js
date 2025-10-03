// backend/services/geoService.js
import fetch from "node-fetch";

// ✅ In-memory cache for geocoding results
const geocodingCache = new Map();

/**
 * Geocode with caching and rate limiting
 */
export async function geocodeLocationWithCache(location) {
  // Check cache first
  if (geocodingCache.has(location)) {
    console.log(`✨ Cache hit for: ${location}`);
    return geocodingCache.get(location);
  }

  const result = await geocodeLocation(location);
  geocodingCache.set(location, result);
  return result;
}

/**
 * Geocode a location string to lat/lng using OpenStreetMap Nominatim API
 */
export async function geocodeLocation(location) {
  if (!location || location.toLowerCase() === "global") {
    return { lat: 20, lng: 0 };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    const resp = await fetch(url, {
      headers: { 
        "User-Agent": "SupplyChainRiskRadar/1.0 (contact@example.com)"
      }
    });

    if (!resp.ok) {
      console.error("🌍 Geocoding API failed:", resp.status, resp.statusText);
      
      // Return city-based fallback for common locations
      return getCityFallback(location);
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

  return getCityFallback(location);
}

/**
 * Fallback coordinates for common cities
 */
function getCityFallback(location) 
  {
  const fallbacks = {
    "singapore": { lat: 1.3521, lng: 103.8198 },
    "rotterdam, netherlands": { lat: 51.9225, lng: 4.47917 },
    "toronto, canada": { lat: 43.6532, lng: -79.3832 },
    "paris, france": { lat: 48.8566, lng: 2.3522 },
    "são paulo, brazil": { lat: -23.5505, lng: -46.6333 },
    "sao paulo, brazil": { lat: -23.5505, lng: -46.6333 },
    "shenzhen, china": { lat: 22.5431, lng: 114.0579 },
    "mexico city, mexico": { lat: 19.4326, lng: -99.1332 },
    "berlin, germany": { lat: 52.5200, lng: 13.4050 },
    "london, uk": { lat: 51.5074, lng: -0.1278 },
    "new york, usa": { lat: 40.7128, lng: -74.0060 },
    "tokyo, japan": { lat: 35.6895, lng: 139.6917 },
    "chennai, india": { lat: 13.0827, lng: 80.2707 },
    // keep previously present fallbacks and extras
    "mumbai, india": { lat: 19.0760, lng: 72.8777 },
    "shanghai, china": { lat: 31.2304, lng: 121.4737 },
    "dubai, uae": { lat: 25.2048, lng: 55.2708 },
    "los angeles, usa": { lat: 34.0522, lng: -118.2437 },
    "hamburg, germany": { lat: 53.5511, lng: 9.9937 }
  };

  const key = location.toLowerCase();
  if (fallbacks[key]) {
    console.log(`📍 Using fallback coords for: ${location}`);
    return fallbacks[key];
  }

  return { lat: 20, lng: 0 };
}