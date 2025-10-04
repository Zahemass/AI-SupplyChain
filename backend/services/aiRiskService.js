// backend/services/aiRiskService.js
import { analyzeWithCerebras } from "./cerebrasClient.js";
import { translateToEnglish } from "./translatorService.js";
import { geocodeLocationWithCache } from "./geoService.js";
import { v4 as uuidv4 } from "uuid";

/**
 * ✅ Safe JSON Parse
 */
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    try {
      let fixed = str
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\$/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
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
  const prompt = `You are analyzing supply chain risks.

Event: "${event.headline}" at ${event.location}, severity: ${event.severity || "unknown"}.

Available suppliers (sample up to 20):
${suppliers.slice(0, 20).map(s => `- ${s.supplier_name} (${s.location}, produces: ${s.product})`).join("\n")}

Which suppliers are DIRECTLY affected?
Return ONLY valid JSON array of supplier names.`;

  const response = await analyzeWithCerebras(prompt, { max_tokens: 300 });
  return safeJsonParse(response) || [];
}

/**
 * 🔥 AI Route Impact Analysis
 */
async function analyzeRouteImpact(event, routes) {
  const prompt = `You are analyzing transport disruptions.

Event: "${event.headline}" at ${event.location}, severity: ${event.severity || "unknown"}.

Routes to evaluate:
${routes.map(r => `- ${r.origin} → ${r.destination} (${r.mode})`).join("\n")}

Return ONLY valid JSON array:
[
  { "route": "A → B (mode)", "disruption_prob": 0.3, "delay_hours": 24, "alternative": "alt route", "reasoning": "..." }
]`;

  const response = await analyzeWithCerebras(prompt, { max_tokens: 800 });
  return safeJsonParse(response) || [];
}

/**
 * 🔥 AI Financial Impact Estimation
 */
async function estimateFinancialImpactAI(event, suppliers, routes) {
  const prompt = `Estimate financial disruption from supply chain event.

Event: "${event.headline}" at ${event.location}, severity: ${event.severity || "unknown"}.

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
  "reasoning": "Explain cost drivers clearly"
}`;

  const response = await analyzeWithCerebras(prompt, { max_tokens: 400 });
  return safeJsonParse(response);
}

/**
 * 🔥 Batch event analysis (PARALLEL with timing logs)
 */
export async function analyzeEventsBatch(events) {
  console.log("⚡ analyzeEventsBatch called with", events.length, "events");

  const t0 = Date.now();

  let suppliers = [];
  try {
    const { getSuppliers } = await import("./supplierService.js");
    suppliers = await getSuppliers();
  } catch (err) {
    console.warn("⚠️ Could not load suppliers:", err.message);
  }

  const relevantEvents = events.filter(
    e => e.headline && e.location && e.location !== "Global"
  );
  console.log(`📊 Processing ${relevantEvents.length}/${events.length} relevant events`);

  if (!relevantEvents.length) return [];

  const BATCH_SIZE = 5;
  const MAX_BATCHES = 3;
  const CONCURRENCY_LIMIT = 2; //

  const totalBatches = Math.ceil(relevantEvents.length / BATCH_SIZE);
  const batchesToProcess = Math.min(totalBatches, MAX_BATCHES);
  console.log(`🚀 Running ${batchesToProcess} batches in parallel (limit: ${CONCURRENCY_LIMIT})`);

  const batches = [];
  for (let i = 0; i < relevantEvents.length && i / BATCH_SIZE < MAX_BATCHES; i += BATCH_SIZE) {
    batches.push(relevantEvents.slice(i, i + BATCH_SIZE));
  }

  const parallelResults = [];

  for (let i = 0; i < batches.length; i += CONCURRENCY_LIMIT) {
    const slice = batches.slice(i, i + CONCURRENCY_LIMIT);
    const batchLabels = slice.map((_, idx) => `Batch ${i + idx + 1}`).join(", ");
    console.log(`⚡ Starting parallel group: ${batchLabels}`);

    const groupStart = Date.now();

    const results = await Promise.allSettled(
      slice.map(async (batch, idx) => {
        const label = `Batch ${i + idx + 1}`;
        const start = Date.now();
        console.log(`🟢 ${label} started (${batch.length} events)...`);
        const res = await processBatch(batch, suppliers);
        const end = Date.now();
        const duration = ((end - start) / 1000).toFixed(2);
        console.log(`✅ ${label} finished in ${duration}s`);
        return res;
      })
    );

    const groupEnd = Date.now();
    const groupDuration = ((groupEnd - groupStart) / 1000).toFixed(2);
    console.log(`🏁 Parallel group finished (${batchLabels}) in ${groupDuration}s`);

    for (const r of results) {
      if (r.status === "fulfilled") parallelResults.push(...r.value);
      else console.error("❌ Batch failed:", r.reason?.message);
    }

    if (i + CONCURRENCY_LIMIT < batches.length) {
      console.log("⏳ Cooling down 3s before next parallel group...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const t1 = Date.now();
  console.log(`✅ All ${batchesToProcess} batches done in ${((t1 - t0) / 1000).toFixed(2)}s`);
  console.log(`🧾 Total risk entries processed: ${parallelResults.length}`);

  return parallelResults;
}

/**
 * 🔥 Process one batch
 */
async function processBatch(batch, suppliers) {
  const translatedEvents = await Promise.all(
    batch.map(async e => ({
      ...e,
      headline: translateToEnglish
        ? await translateToEnglish(e.headline, e.lang || "en")
        : e.headline,
    }))
  );

  const prompt = `You are an AI supply chain risk analyzer.
Analyze the following events and assign risk scores.

Events:
${translatedEvents
  .map(
    (e, i) =>
      `${i + 1}. "${e.headline}" at ${e.location}, severity: ${
        e.severity || "medium"
      }, source: ${e.source || "unknown"}`
  )
  .join("\n")}

Return ONLY valid JSON array:
[
  { 
    "risk_score": 0.75, 
    "risk_level": "HIGH", 
    "confidence": 0.9,
    "summary": "Impact summary", 
    "mitigation": "Action", 
    "source": "Reuters"
  }
]`;

  try {
    const rawOutput = await analyzeWithCerebras(prompt, { max_tokens: 700 });
    let parsed = safeJsonParse(rawOutput) || [];
    if (!Array.isArray(parsed)) parsed = [parsed];

    const enriched = await Promise.all(
      translatedEvents.map(async (e, i) => {
        const aiResult = parsed[i] || {};
        let normalizedScore = aiResult.risk_score || 0.5;
        if (normalizedScore > 1) normalizedScore = normalizedScore / 100;

        const riskLevel =
          aiResult.risk_level ||
          (normalizedScore >= 0.7
            ? "HIGH"
            : normalizedScore >= 0.4
            ? "MEDIUM"
            : "LOW");

        const coords = await geocodeLocationWithCache(e.location);

        const MockRoutes = [
          { origin: e.location.split(",")[0], destination: "Singapore", mode: "sea" },
          { origin: e.location.split(",")[0], destination: "Dubai", mode: "sea" },
          { origin: e.location.split(",")[0], destination: "Los Angeles", mode: "sea" },
          { origin: e.location.split(",")[0], destination: "Hamburg", mode: "sea" },
        ];

        const [linkedSuppliers, routes, financialImpact] = await Promise.all([
          intelligentSupplierMatching(e, suppliers),
          analyzeRouteImpact(e, MockRoutes),
          estimateFinancialImpactAI(e, suppliers, MockRoutes),
        ]);

        return {
          id: uuidv4(),
          headline: e.headline,
          location: e.location,
          date: e.date,
          risk_score: Math.round(normalizedScore * 100),
          risk_level: riskLevel,
          confidence: aiResult.confidence || 0.7,
          summary: aiResult.summary || `Disruption in ${e.location}`,
          mitigation: aiResult.mitigation || "Monitor and prepare alternative routes.",
          lat: coords.lat,
          lng: coords.lng,
          affected_suppliers: linkedSuppliers,
          linked_supplier_ids: suppliers
            .filter(s => linkedSuppliers.includes(s.supplier_name))
            .map(s => s.id),
          affected_routes: routes,
          financial_impact: financialImpact,
          source: aiResult.source || e.source || "Unknown",
          created_at: new Date().toISOString(),
          category: e.category || "supply_chain",
          severity: e.severity || "medium",
        };
      })
    );

    return enriched.filter(r => r.risk_score >= 20);
  } catch (err) {
    console.error("❌ AI Risk Batch Error:", err.message);
    return [];
  }
}
