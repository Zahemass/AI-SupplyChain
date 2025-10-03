// backend/services/aiRiskService.js
import { analyzeWithCerebras } from "./cerebrasClient.js";
import { translateToEnglish } from "./translatorService.js";
import { geocodeLocationWithCache } from "./geoService.js";
import { getSuppliers as loadBaseSuppliers } from "../services/supplierService.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Match suppliers by location text with fuzzy matching
 */
function matchSuppliers(location, suppliers) {
  if (!location || !suppliers?.length) return [];
  
  const locationLower = location.toLowerCase();
  
  return suppliers
    .filter(s => {
      if (!s.location) return false;
      const supLocLower = s.location.toLowerCase();
      
      // Extract city name from "City, Country" format
      const city = locationLower.split(',')[0].trim();
      const supCity = supLocLower.split(',')[0].trim();
      
      return supLocLower.includes(locationLower) || 
             locationLower.includes(supCity) ||
             supCity.includes(city);
    })
    .map(s => s.supplier_name);
}

/**
 * Calculate financial impact based on risk score and affected suppliers
 */
function estimateFinancialImpact(riskScore, affectedSuppliers) {
  const baseImpact = riskScore * 500000; // Base: $0-$200k
  const supplierMultiplier = affectedSuppliers.length > 0 ? affectedSuppliers.length : 1;
  
  const min = Math.round(baseImpact * 0.5 * supplierMultiplier);
  const max = Math.round(baseImpact * 1.5 * supplierMultiplier);
  
  return `$${(min/1000).toFixed(0)}K - $${(max/1000).toFixed(0)}K`;
}

/**
 * Estimate delay based on risk score and event type
 */
function estimateDelay(riskScore, headline) {
  const lower = headline.toLowerCase();
  
  if (riskScore >= 0.8 || lower.includes("shutdown") || lower.includes("closed")) {
    return "7-14 days";
  }
  if (riskScore >= 0.6 || lower.includes("flood") || lower.includes("strike")) {
    return "3-7 days";
  }
  if (riskScore >= 0.4 || lower.includes("delay") || lower.includes("shortage")) {
    return "1-3 days";
  }
  return "< 1 day";
}

/**
 * Generate affected routes based on location and suppliers
 */
function generateAffectedRoutes(location, affectedSuppliers, suppliers) {
  if (!affectedSuppliers.length) return [];
  
  const routes = [];
  const destinations = ["Singapore", "Dubai", "Los Angeles", "Hamburg"];
  
  // Use actual location from event
  const origin = location.split(',')[0].trim();
  
  // Generate realistic routes
  destinations.forEach(dest => {
    if (Math.random() > 0.5) { // Randomly select some routes
      routes.push(`${origin} → ${dest}`);
    }
  });
  
  return routes.length ? routes : [`${origin} → Singapore`];
}

export async function analyzeEventsBatch(events) {
  console.log("⚡ analyzeEventsBatch called with", events.length, "events");

  let suppliers = [];
  try {
    const { loadSuppliers } = await import('./supplierService.js');
    suppliers = loadSuppliers();
  } catch (err) {
    console.warn("⚠️ Could not load suppliers directly:", err.message);
  }

  const relevantEvents = events.filter(e => {
    if (!e.headline || !e.location) return false;
    if (e.location === "Global") return false;
    if (e.relevance_score !== undefined && e.relevance_score < 0.1) return false;
    return true;
  });

  console.log(`📊 Processing ${relevantEvents.length}/${events.length} relevant events`);

  if (!relevantEvents.length) {
    return [];
  }

  // ✅ CRITICAL FIX: Process in smaller batches of 10
  const BATCH_SIZE = 10;
  const allResults = [];

  for (let i = 0; i < relevantEvents.length; i += BATCH_SIZE) {
    const batch = relevantEvents.slice(i, i + BATCH_SIZE);
    console.log(`🔄 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(relevantEvents.length/BATCH_SIZE)}`);
    
    const batchResults = await processBatch(batch, suppliers);
    allResults.push(...batchResults);
    
    // Add small delay between batches to be nice to APIs
    if (i + BATCH_SIZE < relevantEvents.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return allResults;
}

// Helper function to process a single batch
async function processBatch(batch, suppliers) {
  const translatedEvents = batch.map(e => ({
    ...e,
    headline: translateToEnglish ? translateToEnglish(e.headline, e.lang || "en") : e.headline
  }));

  const prompt = `You are an AI supply chain risk analyzer. Analyze these events and return ONLY a valid JSON array.

Events:
${translatedEvents.map((e, i) =>
    `${i+1}. "${e.headline}" (Location: ${e.location}, Date: ${e.date}, Severity: ${e.severity || 'unknown'})`
  ).join("\n")}

Return JSON array with this EXACT structure (no additional text):
[
  {
    "risk_score": 0.75,
    "risk_level": "HIGH",
    "confidence": 0.85,
    "summary": "One-sentence business impact (max 120 chars)",
    "mitigation": "Specific business action",
    "source": "news source name"
  }
]


Rules:
- summary: Must be one sentence (≤120 chars) describing supply chain business impact.  
  Example: "Flooding in Chennai halts textile exports, delaying shipments 5 days."
- mitigation: Must be a clear, actionable business recommendation.  
  Example: "Divert cargo to Tuticorin port and activate backup supplier in Bangalore."
- risk_score: 0.0-1.0 (0.0-0.3=LOW, 0.4-0.6=MEDIUM, 0.7-1.0=HIGH)
- risk_level: Must be "LOW", "MEDIUM", or "HIGH"
- confidence: 0.0-1.0 (how certain you are)
- Return array with ${batch.length} objects
- NO text outside JSON`;

  try {
    const rawOutput = await analyzeWithCerebras(prompt);
    console.log("🧠 Full Cerebras output:", rawOutput);


    let parsed = [];

try {
  // Try parsing the whole response
  parsed = JSON.parse(rawOutput);
  if (!Array.isArray(parsed)) parsed = [parsed];
} catch {
  console.warn("⚠️ Whole JSON parse failed, attempting partial recovery...");

  // Try to recover individual JSON objects
  const matches = rawOutput.match(/\{[\s\S]*?\}/g);
  if (matches) {
    parsed = matches.map((m, idx) => {
      try {
        return JSON.parse(m);
      } catch {
        console.warn(`❌ Skipped malformed object #${idx + 1}`);
        return null;
      }
    }).filter(Boolean);
  }
}


    console.log("✅ Parsed AI results:", parsed.length, "items for", batch.length, "events");

    // ✅ Enrich with coordinates, suppliers, routes, financial impact
    const enriched = [];
    
    for (let i = 0; i < translatedEvents.length; i++) {
      const e = translatedEvents[i];
      const defaults = {
  risk_score: 0.5,
  risk_level: "MEDIUM",
  confidence: 0.5,
  summary: `Supply chain disruption in ${e.location}`,
  mitigation: "Monitor situation and prepare contingency plans.",
  source: e.source || "Unknown"
};

const aiResult = { ...defaults, ...(parsed[i] || {}) };

      // Normalize risk_score to 0-1 range if needed
      let normalizedScore = aiResult.risk_score;
      if (normalizedScore > 1) normalizedScore = normalizedScore / 100;

      // Ensure risk_level matches score
      let riskLevel = aiResult.risk_level;

// If AI didn't give a valid risk_level, calculate from normalizedScore
if (!riskLevel || !["LOW", "MEDIUM", "HIGH"].includes(riskLevel.toUpperCase())) {
  if (normalizedScore >= 0.7) riskLevel = "HIGH";
  else if (normalizedScore >= 0.4) riskLevel = "MEDIUM";
  else if (normalizedScore >= 0.2) riskLevel = "LOW";
  else riskLevel = "VERY LOW";
}


      // ✅ Rate-limited geocoding with cache
      const coords = await geocodeLocationWithCache(e.location);
      const linkedSuppliers = matchSuppliers(e.location, suppliers);
      const routes = generateAffectedRoutes(e.location, linkedSuppliers, suppliers);
      const delay = estimateDelay(normalizedScore, e.headline);
      const financialImpact = estimateFinancialImpact(normalizedScore, linkedSuppliers);

      enriched.push({
  id: uuidv4(),
  name: e.headline || "Unknown Event",
  date: e.date,
  location: e.location,
  headline: e.headline,
  risk_score: Math.round(normalizedScore * 100),
  risk_level: riskLevel,
  confidence: aiResult.confidence || 0.7,
  summary: aiResult.summary || "Supply chain event detected.",
  mitigation: aiResult.mitigation || "Monitor situation and prepare contingency plans.",
  lat: coords.lat,
  lng: coords.lng,

  // ✅ Links back to suppliers
  affected_suppliers: linkedSuppliers,                  // names
  linked_supplier_ids: suppliers
    .filter(s => linkedSuppliers.includes(s.supplier_name))
    .map(s => s.id),                                    // IDs

  affected_routes: routes,
  estimated_delay: delay,
  financial_impact: financialImpact,
  source: aiResult.source || e.source || "Unknown",
  created_at: new Date().toISOString(),
  category: e.category || "supply_chain",
  severity: e.severity || "medium"
});


      // ✅ Add 1 second delay between geocoding calls
      if (i < translatedEvents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
    }

    const significantRisks = enriched.filter(r => r.risk_score >= 20);
    console.log(`✅ Batch complete: ${significantRisks.length}/${enriched.length} significant risks`);

    return significantRisks;

  } catch (err) {
    console.error("❌ AI Risk Batch Error:", err.message);
    return [];
  }
}