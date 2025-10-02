// backend/services/newsService.js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

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

  // Try "City, Country"
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
    // 🚢 Core Shipping & Trade
    "shipping", "maritime", "cargo", "freight", "container", "vessel",
    "tanker", "barge", "ship", "fleet", "port", "dock", "harbor",
    "shipyard", "seaport",

    // 📦 Supply Chain & Logistics
    "supply chain", "logistics", "warehousing", "distribution", "fulfillment",
    "forwarding", "customs", "clearance", "transit", "trucking",
    "rail freight", "air freight", "sea freight",

    // ⚠️ Disruptions & Events
    "congestion", "delay", "backlog", "reroute", "rerouting", "strike",
    "protest", "shortage", "disruption", "suspension", "shutdown",
    "closure", "blockade", "accident", "collision", "grounding",
    "spill", "piracy", "hijack", "sanctions", "embargo",
    "tariff", "trade war", "storm", "cyclone", "hurricane", "typhoon",

    // 🌐 Global Trade Hotspots
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


export async function fetchNews() {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://newsapi.org/v2/everything?q=supply+chain&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
    const response = await axios.get(url);

    const irrelevant = ["bitcoin", "crypto", "stock", "etf"];

    let articles = response.data.articles
      .map(article => {
        const text = `${article.title} ${article.description}`.toLowerCase();

        // skip irrelevant
        if (irrelevant.some(word => text.includes(word))) return null;

        const location = extractLocation(article.title, article.description || "");
        const severity = classifySeverity(article.title + " " + (article.description || ""));
        const relevance = relevanceScore(article.title + " " + (article.description || ""));

        return {
          id: uuidv4(),
          date: article.publishedAt,
          location,
          headline: article.title,
          description: article.description || "No description available",
          source: article.source?.name || "Unknown",
          url: article.url,
          source_language: "en",
          category: "news",
          severity,
          relevance_score: relevance
        };
      })
      .filter(Boolean);

    // ✅ Keep only relevant OR fallback to top 2
    let filtered = articles.filter(a => a.relevance_score >= 0.2);
    if (filtered.length === 0) {
      console.warn("⚠️ No relevant news, falling back to top 2 articles");
      filtered = articles.slice(0, 2);
    }

    // ✅ Guarantee at least one dummy if API gave nothing
    if (filtered.length === 0) {
      console.warn("⚠️ NewsAPI empty, injecting dummy fallback");
      filtered = [{
        id: uuidv4(),
        date: new Date().toISOString(),
        location: "Chennai, India",
        headline: "Chennai floods halt textile production",
        description: "Heavy monsoon rains have forced multiple factories to suspend operations.",
        source: "Dinamalar (Tamil)",
        url: "https://example.com/chennai-floods",
        source_language: "ta",
        category: "weather_impact",
        severity: "high",
        relevance_score: 0.9
      }];
    }

    console.log("✅ Final filtered news:", filtered.length, "/", articles.length);
    return filtered;
  } catch (err) {
    console.error("❌ News API error:", err.message);
    // absolute last-resort dummy
    return [{
      id: uuidv4(),
      date: new Date().toISOString(),
      location: "Global",
      headline: "No news available",
      description: "News API failed. Showing placeholder event.",
      source: "System",
      url: "",
      source_language: "en",
      category: "system",
      severity: "low",
      relevance_score: 0
    }];
  }
}
