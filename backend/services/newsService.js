// backend/services/newsService.js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

export async function fetchNews() {
  try {
    // 🔄 Toggle this line to use mock data instead of API
    return await loadMockNews();

    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://newsapi.org/v2/everything?q=supply+chain&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
    const response = await axios.get(url);

    const irrelevant = ["bitcoin", "crypto", "stock", "etf"];

    let articles = response.data.articles
      .map(article => {
        const text = `${article.title} ${article.description}`.toLowerCase();
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

    let filtered = articles;/*.filter(a => a.relevance_score >= 0.5);
    if (filtered.length === 0) {
      console.warn("⚠️ No relevant news, falling back to top 2 articles");
      filtered = articles.slice(0, 2);
    }*/

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

// 📦 Load mock data from Excel
// 📦 Load mock data from Excel (with fresh dynamic dates)
async function loadMockNews() {
  try {
    const workbook = new ExcelJS.Workbook();
    const mockDataPath = path.join(__dirname, "../../backend/mock_news_data.xlsx");
    await workbook.xlsx.readFile(mockDataPath);
    const sheet = workbook.getWorksheet("Mock News");

    const articles = sheet.getSheetValues()
      .slice(2)
      .map(row => {
        // 🕒 Generate dynamic date: today or yesterday, random time
        const now = new Date();
        const base = new Date(now);
        if (Math.random() < 0.5) base.setDate(now.getDate() - 1); // 50% chance yesterday
        base.setHours(Math.floor(Math.random() * 24));
        base.setMinutes(Math.floor(Math.random() * 60));
        base.setSeconds(Math.floor(Math.random() * 60));

        const randomISO = base.toISOString();

        return {
          id: row[1],
          date: randomISO, // ✅ override Excel date
          location: row[3],
          headline: row[4],
          description: row[5],
          source: row[6],
          url: row[7],
          source_language: row[8],
          category: row[9],
          severity: row[10],
          relevance_score: parseFloat(row[11])
        };
      });

    console.log("✅ Loaded mock news (with fresh timestamps):", articles.length);
    return articles;
  } catch (err) {
    console.error("❌ Error loading mock data:", err.message);
    return [{
      id: uuidv4(),
      date: new Date().toISOString(),
      location: "Global",
      headline: "No mock data available",
      description: "Excel file failed to load. Showing placeholder event.",
      source: "System",
      url: "",
      source_language: "en",
      category: "system",
      severity: "low",
      relevance_score: 0
    }];
  }
}

