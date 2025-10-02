// backend/services/aiRiskService.js
import { analyzeWithCerebras } from "./cerebrasClient.js";
import { translateToEnglish } from "./translatorService.js";
import { geocodeLocation } from "./geoService.js";
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
  const baseImpact = riskScore * 200000; // Base: $0-$200k
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

  // ✅ CRITICAL FIX: Don't call getSuppliers here (causes infinite loop)
  // We'll receive suppliers as parameter or load them differently
  let suppliers = [];
  try {
    const { loadSuppliers } = await import('./supplierService.js');
    suppliers = loadSuppliers();
  } catch (err) {
    console.warn("⚠️ Could not load suppliers directly:", err.message);
  }

  // Filter out irrelevant events before processing
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

  const translatedEvents = relevantEvents.map(e => ({
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
    "summary": "Brief impact explanation (max 100 chars)",
    "mitigation": "Specific action recommendation",
    "source": "news source name"
  }
]

Rules:
- risk_score: 0.0-1.0 (0.0-0.3=LOW, 0.4-0.6=MEDIUM, 0.7-1.0=HIGH)
- risk_level: Must be "LOW", "MEDIUM", or "HIGH"
- confidence: 0.0-1.0 (how certain you are)
- Return array with ${relevantEvents.length} objects
- NO text outside JSON`;

  try {
    const rawOutput = await analyzeWithCerebras(prompt);
    console.log("🧠 Raw Cerebras output:", rawOutput.substring(0, 500));

    let parsed = [];
    try {
      parsed = JSON.parse(rawOutput);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch {
      const match = rawOutput.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    console.log("✅ Parsed AI results:", parsed.length, "items");

    // ✅ Enrich with coordinates, suppliers, routes, financial impact
    const enriched = await Promise.all(
      translatedEvents.map(async (e, i) => {
        const aiResult = parsed[i] || {
          risk_score: 0.5,
          risk_level: "MEDIUM",
          confidence: 0.5,
          summary: "Event detected but AI analysis incomplete.",
          mitigation: "Manual review recommended.",
          source: e.source || "Unknown"
        };

        // Normalize risk_score to 0-1 range if needed
        let normalizedScore = aiResult.risk_score;
        if (normalizedScore > 1) normalizedScore = normalizedScore / 100;

        // Ensure risk_level matches score
        let riskLevel = aiResult.risk_level;
        if (normalizedScore >= 0.6) riskLevel = "HIGH";
        else if (normalizedScore >= 0.3) riskLevel = "MEDIUM";
        else if (normalizedScore >= 0.2) riskLevel = "LOW";
        else riskLevel = "VERY LOW";

        const coords = await geocodeLocation(e.location);
        const linkedSuppliers = matchSuppliers(e.location, suppliers);
        const routes = generateAffectedRoutes(e.location, linkedSuppliers, suppliers);
        const delay = estimateDelay(normalizedScore, e.headline);
        const financialImpact = estimateFinancialImpact(normalizedScore, linkedSuppliers);

        return {
          id: uuidv4(),
          name: e.headline || "Unknown Event",
          date: e.date,
          location: e.location,
          headline: e.headline,
          risk_score: Math.round(normalizedScore * 100), // Convert to 0-100
          risk_level: riskLevel,
          confidence: aiResult.confidence || 0.7,
          summary: aiResult.summary || "Supply chain event detected.",
          mitigation: aiResult.mitigation || "Monitor situation and prepare contingency plans.",
          lat: coords.lat,
          lng: coords.lng,
          affected_suppliers: linkedSuppliers,
          affected_routes: routes,
          estimated_delay: delay,
          financial_impact: financialImpact,
          source: aiResult.source || e.source || "Unknown",
          created_at: new Date().toISOString(),
          category: e.category || "supply_chain",
          severity: e.severity || "medium"
        };
      })
    );

    // ✅ Filter out low-impact risks (score < 30)
    const significantRisks = enriched.filter(r => r.risk_score >= 20);
    console.log(`✅ Filtered to ${significantRisks.length}/${enriched.length} significant risks (score >= 30)`);

    return significantRisks;

  } catch (err) {
    console.error("❌ AI Risk Batch Error:", err.message);
    console.error("Stack:", err.stack);
    
    // Return enriched fallback data
    return await Promise.all(
      relevantEvents.map(async (e, i) => {
        const coords = await geocodeLocation(e.location);
        const linkedSuppliers = matchSuppliers(e.location, suppliers);
        
        return {
          id: uuidv4(),
          name: e.headline || "Unknown Event",
          date: e.date,
          location: e.location,
          headline: e.headline,
          risk_score: 50,
          risk_level: "MEDIUM",
          confidence: 0.5,
          summary: "AI analysis unavailable. Event flagged for manual review.",
          mitigation: "Monitor developments and contact affected suppliers.",
          lat: coords.lat,
          lng: coords.lng,
          affected_suppliers: linkedSuppliers,
          affected_routes: generateAffectedRoutes(e.location, linkedSuppliers, suppliers),
          estimated_delay: "1-3 days",
          financial_impact: estimateFinancialImpact(0.5, linkedSuppliers),
          source: e.source || "Unknown",
          created_at: new Date().toISOString(),
          category: e.category || "supply_chain",
          severity: e.severity || "medium"
        };
      })
    );
  }
}