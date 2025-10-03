import { analyzeWithCerebras } from "./cerebrasClient.js";
import { translateToEnglish } from "./translatorService.js";
import { geocodeLocationWithCache } from "./geoService.js";
import { v4 as uuidv4 } from "uuid";

/**
 * ✅ Safe JSON Parse (cleans common AI issues)
 */
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    try {
      let fixed = str
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\$/g, "")          // remove $
        .replace(/,\s*}/g, "}")      // remove trailing commas
        .replace(/,\s*]/g, "]");     // remove trailing commas in arrays
      return JSON.parse(fixed);
    } catch (err2) {
      console.error("❌ Failed to recover JSON:", err2.message);
      return null;
    }
  }
}

/**
 * 🔥 AI Supplier Matching
 */
async function intelligentSupplierMatching(event, suppliers) {
  const prompt = `Event: "${event.headline}" in ${event.location}

Available suppliers:
${suppliers.slice(0, 20).map(s => `- ${s.supplier_name} (${s.location}, produces: ${s.product})`).join('\n')}

Return ONLY valid JSON array of supplier names.`;

  const response = await analyzeWithCerebras(prompt, { max_tokens: 200 });
  return safeJsonParse(response) || [];
}

/**
 * 🔥 AI Route Impact Analysis
 */
async function analyzeRouteImpact(event, routes) {
  const prompt = `Event: "${event.headline}" in ${event.location}

Routes:
${routes.map(r => `- ${r.origin} → ${r.destination} (${r.mode})`).join('\n')}

Return ONLY valid JSON array with {route, disruption_prob, delay_hours, alternative, reasoning}.`;

  const response = await analyzeWithCerebras(prompt, { max_tokens: 800 });
  return safeJsonParse(response) || [];
}

/**
 * 🔥 AI Financial Impact Estimation
 */
async function estimateFinancialImpactAI(event, suppliers, routes) {
  const prompt = `Event: "${event.headline}" in ${event.location}
Severity: ${event.severity || "unknown"}

Suppliers affected: ${suppliers.length}
Routes affected: ${routes.length}

Return ONLY valid JSON like:
{
  "min_usd": 250000,
  "max_usd": 1500000,
  "confidence": 0.75,
  "breakdown": {
    "direct_costs": 800000,
    "opportunity_costs": 400000,
    "recovery_costs": 300000
  },
  "reasoning": "..."
}`;

  const response = await analyzeWithCerebras(prompt, { max_tokens: 400 });
  return safeJsonParse(response);
}

/**
 * Batch event analysis
 */
/**
 * Batch event analysis
 */
export async function analyzeEventsBatch(events) {
  console.log("⚡ analyzeEventsBatch called with", events.length, "events");

  let suppliers = [];
  try {
    const { getSuppliers } = await import("./supplierService.js");
    suppliers = await getSuppliers();
  } catch (err) {
    console.warn("⚠️ Could not load suppliers:", err.message);
  }

  const relevantEvents = events.filter(e => e.headline && e.location && e.location !== "Global");
  console.log(`📊 Processing ${relevantEvents.length}/${events.length} relevant events`);

  if (!relevantEvents.length) return [];

  // ✅ Only take the first batch
  const BATCH_SIZE = 10;
  const firstBatch = relevantEvents.slice(0, BATCH_SIZE);
  console.log(`🔄 Processing batch 1/1 (only first batch)`);

  const batchResults = await processBatch(firstBatch, suppliers);

  // ✅ Return immediately after first batch
  return batchResults;
}


/**
 * Process one batch
 */
async function processBatch(batch, suppliers) {
  const translatedEvents = batch.map(e => ({
    ...e,
    headline: translateToEnglish ? translateToEnglish(e.headline, e.lang || "en") : e.headline,
  }));

  const prompt = `Analyze these events and return ONLY JSON array:
[
  { "risk_score": 0.75, "risk_level": "HIGH", "confidence": 0.9,
    "summary": "Impact sentence", "mitigation": "Action", "source": "Reuters" }
]`;

  try {
    const rawOutput = await analyzeWithCerebras(prompt, { max_tokens: 700 });
    let parsed = safeJsonParse(rawOutput) || [];

    if (!Array.isArray(parsed)) parsed = [parsed];

    const enriched = [];

    for (let i = 0; i < translatedEvents.length; i++) {
      const e = translatedEvents[i];
      const aiResult = parsed[i] || {};

      let normalizedScore = aiResult.risk_score || 0.5;
      if (normalizedScore > 1) normalizedScore = normalizedScore / 100;

      let riskLevel = aiResult.risk_level || (normalizedScore >= 0.7 ? "HIGH" : normalizedScore >= 0.4 ? "MEDIUM" : "LOW");

      const coords = await geocodeLocationWithCache(e.location);

      // Run AI helpers
      // If no real routes dataset, generate defaults
const MockRoutes = [
  { origin: e.location.split(",")[0], destination: "Singapore", mode: "sea" },
  { origin: e.location.split(",")[0], destination: "Dubai", mode: "sea" },
  { origin: e.location.split(",")[0], destination: "Los Angeles", mode: "sea" },
  { origin: e.location.split(",")[0], destination: "Hamburg", mode: "sea" }
];

const [linkedSuppliers, routes, financialImpact] = await Promise.all([
  intelligentSupplierMatching(e, suppliers),
  analyzeRouteImpact(e, MockRoutes),   // ✅ use fallback routes instead of suppliers
  estimateFinancialImpactAI(e, suppliers, MockRoutes)
]);


      enriched.push({
        id: uuidv4(),
        headline: e.headline,
        location: e.location,
        date: e.date,
        risk_score: Math.round(normalizedScore * 100),
        risk_level: riskLevel,
        confidence: aiResult.confidence || 0.7,
        summary: aiResult.summary || `Supply chain disruption in ${e.location}`,
        mitigation: aiResult.mitigation || "Monitor situation.",
        lat: coords.lat,
        lng: coords.lng,

        affected_suppliers: linkedSuppliers,
        linked_supplier_ids: suppliers.filter(s => linkedSuppliers.includes(s.supplier_name)).map(s => s.id),

        affected_routes: routes,
        financial_impact: financialImpact,

        source: aiResult.source || e.source || "Unknown",
        created_at: new Date().toISOString(),
        category: e.category || "supply_chain",
        severity: e.severity || "medium",
      });

      if (i < translatedEvents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return enriched.filter(r => r.risk_score >= 20);
  } catch (err) {
    console.error("❌ AI Risk Batch Error:", err.message);
    return [];
  }
}
