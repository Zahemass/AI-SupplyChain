import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// ✅ Helper to map weather type → impact, severity, affected sectors
function mapWeatherToImpact(weather) {
  const main = weather.main.toLowerCase();
  const description = weather.description.toLowerCase();

  if (main.includes("rain") || description.includes("heavy rain")) {
    return {
      event_type: "Heavy Rain",
      severity: "high",
      impact: "Flooding risk may disrupt transport and port operations",
      affected_sectors: ["shipping", "textiles", "logistics"],
      forecast_hours: 24,
    };
  }
  if (main.includes("storm") || description.includes("cyclone")) {
    return {
      event_type: "Cyclone / Storm",
      severity: "severe",
      impact: "Severe storm could halt shipping and factory production",
      affected_sectors: ["shipping", "manufacturing", "energy"],
      forecast_hours: 48,
    };
  }
  if (main.includes("snow")) {
    return {
      event_type: "Snowstorm",
      severity: "high",
      impact: "Transport and flights may be delayed",
      affected_sectors: ["logistics", "aerospace", "automotive"],
      forecast_hours: 24,
    };
  }
  if (main.includes("heat")) {
    return {
      event_type: "Heatwave",
      severity: "medium",
      impact: "Energy demand surge, worker productivity reduced",
      affected_sectors: ["energy", "manufacturing"],
      forecast_hours: 72,
    };
  }

  return {
    event_type: weather.main,
    severity: "low",
    impact: "No major supply chain disruption expected",
    affected_sectors: [],
    forecast_hours: 12,
  };
}

// ✅ Fetch weather for one city
async function fetchCityWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}`;
    const resp = await axios.get(url);

    const weather = resp.data.weather[0];
    const mapped = mapWeatherToImpact(weather);

    return {
      id: `weather_${city.toLowerCase()}_${Date.now()}`,
      date: new Date().toISOString(),
      location: resp.data.name,
      lat: resp.data.coord.lat,
      lng: resp.data.coord.lon,
      ...mapped,
      description: weather.description,
    };
  } catch (err) {
    console.error(`❌ Weather API error for ${city}:`, err.message);
    return null;
  }
}

// ✅ Fetch weather for multiple cities in parallel
export async function fetchWeather() {
  const cities = [
    "Chennai",         // India
    "Singapore",       // Singapore
    "Iceland",         // Germany (optional: major EU logistics hub)
    "New York",        // USA (for completeness)
  ];

  try {
    const results = await Promise.all(cities.map(fetchCityWeather));
    const validResults = results.filter(Boolean);

    console.log(`✅ Weather data fetched for ${validResults.length}/${cities.length} cities.`);
    return validResults;
  } catch (err) {
    console.error("❌ Error fetching multiple city weather:", err.message);
    return [];
  }
}
