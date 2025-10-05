// backend/services/newsService.js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const geoMap = {
  india: "Chennai, India",
  netherlands: "Rotterdam, Netherlands",
  china: "Shenzhen, China",
  germany: "Berlin, Germany",
  usa: "New York, USA",
  canada: "Toronto, Canada",
  japan: "Tokyo, Japan",
  france: "Paris, France",
  uk: "London, UK",
  mexico: "Mexico City, Mexico",
  brazil: "São Paulo, Brazil",
  singapore: "Singapore"
};

function extractLocation(title, description) {
  const text = `${title} ${description || ""}`.toLowerCase();
  for (const keyword in geoMap) {
    if (text.includes(keyword)) {
      return geoMap[keyword];
    }
  }
  const regex = /\b([A-Z][a-z]+(?:, [A-Z][a-z]+)?)\b/;
  const match = (title + " " + description)?.match(regex);
  if (match) return match[0];
  return "Global";
}

function classifySeverity(text) {
  const lower = text.toLowerCase();
  if (lower.includes("flood") || lower.includes("strike") || lower.includes("shutdown") || lower.includes("earthquake")) {
    return "high";
  }
  if (lower.includes("tariff") || lower.includes("shortage") || lower.includes("delay")) {
    return "medium";
  }
  return "low";
}

function relevanceScore(text) {
  const keywords = [
    "shipping", "maritime", "cargo", "freight", "container", "vessel",
    "tanker", "barge", "ship", "fleet", "port", "dock", "harbor",
    "shipyard", "seaport",
    "supply chain", "logistics", "warehousing", "distribution", "fulfillment",
    "forwarding", "customs", "clearance", "transit", "trucking",
    "rail freight", "air freight", "sea freight",
    "congestion", "delay", "backlog", "reroute", "rerouting", "strike",
    "protest", "shortage", "disruption", "suspension", "shutdown",
    "closure", "blockade", "accident", "collision", "grounding",
    "spill", "piracy", "hijack", "sanctions", "embargo",
    "tariff", "trade war", "storm", "cyclone", "hurricane", "typhoon",
    "suez canal", "panama canal", "strait of hormuz", "south china sea",
    "red sea", "bab el-mandeb", "malacca strait", "persian gulf",
    "indian ocean route", "trans-pacific", "trans-atlantic"
  ];
  let score = 0;
  keywords.forEach((kw) => {
    if (text.toLowerCase().includes(kw)) {
      score += 0.2;
    }
  });
  return Math.min(score, 1.0);
}

/**
 * Main fetch function — currently loads from local JSON
 */
export async function fetchNews() {
  try {
    // ✅ Load from JSON file instead of Excel or API
    return await loadJsonNews();

    // If you want to re-enable the API later, you can uncomment below:
    /*
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://newsapi.org/v2/everything?q=supply+chain&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
    const response = await axios.get(url);
    */
  } catch (err) {
    console.error("❌ fetchNews error:", err.message);
    return [
      {
        id: uuidv4(),
        date: new Date().toISOString(),
        location: "Global",
        headline: "No news available",
        description: "Failed to load news_feed.json",
        source: "System",
        url: "",
        source_language: "en",
        category: "system",
        severity: "low",
        relevance_score: 0
      }
    ];
  }
}

/**
 * 📦 Load mock data from local JSON file
 */
async function loadJsonNews() {
  try {
    // ✅ Path to your data file
    const jsonPath = path.join(__dirname, "../data/news_feed.json");

    if (!fs.existsSync(jsonPath)) {
      throw new Error("news_feed.json not found at " + jsonPath);
    }

    // Read file content
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    if (!Array.isArray(jsonData)) {
      throw new Error("Invalid JSON structure: Expected an array");
    }

    // ✅ Refresh timestamps for realism (optional)
    const now = new Date();
    const articles = jsonData.map((item) => {
      const randomOffsetMs = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
      const randomDate = new Date(now.getTime() - randomOffsetMs);

      return {
        id: item.ID || uuidv4(),
        date: item.Date || randomDate.toISOString(),
        location: item.Location || extractLocation(item.Headline, item.Description),
        headline: item.Headline || "Untitled",
        description: item.Description || "No description available",
        source: item.Source || "Unknown",
        url: item.URL || "",
        source_language: item["Source Language"] || "en",
        category: item.Category || "general",
        severity: item.Severity || classifySeverity(item.Description || ""),
        relevance_score: parseFloat(item["Relevance Score"]) || relevanceScore(item.Description || "")
      };
    });

    console.log(`✅ Loaded ${articles.length} records from news_feed.json`);
    return articles;
  } catch (err) {
    console.error("❌ Error loading JSON data:", err.message);
    return [
      {
        id: uuidv4(),
        date: new Date().toISOString(),
        location: "Global",
        headline: "No JSON data available",
        description: "Failed to read news_feed.json file.",
        source: "System",
        url: "",
        source_language: "en",
        category: "system",
        severity: "low",
        relevance_score: 0
      }
    ];
  }
}
