// backend/controllers/suppliersController.js
import { getSuppliers as loadBaseSuppliers } from "../services/supplierService.js";
import { fetchNews } from "../services/newsService.js";
import { analyzeEventsBatch } from "../services/aiRiskService.js";
import { getSimulatedEvents } from "./simulateEventController.js";

/**
 * ✅ Optimized getSuppliersWithRisks (No Cache Version)
 * - Parallel fetch (news + simulated)
 * - Event filtering + deduplication
 * - Top 15 limit for fast AI run
 * - Clean, production-safe logging
 */
export const getSuppliersWithRisks = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log("🏭 getSuppliersWithRisks: Starting optimized (no cache) flow...");

    // Step 1: Fetch news + simulated events in parallel
    const step1Start = Date.now();
    console.log("📰 Step 1: Fetching news and simulated events in parallel...");
    const [news, simulated] = await Promise.all([
      fetchNews(),
      Promise.resolve(getSimulatedEvents())
    ]);
    console.log(
      `📰 Step 1 done in ${((Date.now() - step1Start) / 1000).toFixed(2)}s: got ${news.length} news + ${simulated.length} simulated`
    );

    const allEvents = [...news, ...simulated];

    // Step 2: Filter relevant events
    const step2Start = Date.now();
    const filteredEvents = allEvents.filter(n => {
      const valid =
        n.location &&
        n.location !== "Global" &&
        (!n.relevance_score || n.relevance_score >= 0.5);
      return valid;
    });

    console.log(
      `✅ Step 2 done in ${((Date.now() - step2Start) / 1000).toFixed(2)}s: ${filteredEvents.length}/${allEvents.length} relevant events`
    );

    if (!filteredEvents.length) {
      console.log("⚠️ No relevant events to analyze — returning base suppliers...");
      const suppliers = await loadBaseSuppliers([]);
      return res.json(suppliers);
    }

    // Step 3: Remove duplicate headlines
    const step3Start = Date.now();
    const uniqueEvents = [];
    const seen = new Set();
    for (const e of filteredEvents) {
      if (!seen.has(e.headline)) {
        seen.add(e.headline);
        uniqueEvents.push(e);
      }
    }
    console.log(
      `🧩 Step 3 done in ${((Date.now() - step3Start) / 1000).toFixed(2)}s: deduplicated to ${uniqueEvents.length} unique events`
    );

    // Step 4: Sort and limit top 15 high-relevance events
    const step4Start = Date.now();
    const topEvents = uniqueEvents
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, 15);
    console.log(
      `🎯 Step 4 done in ${((Date.now() - step4Start) / 1000).toFixed(2)}s: selected top ${topEvents.length} events`
    );

    // Step 5: AI risk analysis
    const step5Start = Date.now();
    console.log("🧠 Step 5: Running AI risk analysis with Cerebras...");
    const risks = await analyzeEventsBatch(topEvents);
    console.log(
      `🧠 Step 5 done in ${((Date.now() - step5Start) / 1000).toFixed(2)}s: analyzed ${risks.length} risks`
    );

    // Step 6: Merge risks into suppliers
    const step6Start = Date.now();
    console.log("🏭 Step 6: Merging risks into suppliers...");
    const suppliers = await loadBaseSuppliers(risks);
    console.log(
      `✅ Step 6 done in ${((Date.now() - step6Start) / 1000).toFixed(2)}s: ${suppliers.length} suppliers merged`
    );

    // Step 7: Risk summary
    const riskCounts = {
      HIGH: suppliers.filter(s => s.current_risk_level === "HIGH").length,
      MEDIUM: suppliers.filter(s => s.current_risk_level === "MEDIUM").length,
      LOW: suppliers.filter(s => s.current_risk_level === "LOW").length,
    };
    console.log("📊 Risk distribution:", riskCounts);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🏁 getSuppliersWithRisks completed in ${totalTime}s`);

    res.json(suppliers);
  } catch (error) {
    console.error("❌ getSuppliersWithRisks error:", error.message);
    console.error("Stack:", error.stack);

    // Fallback: Return base suppliers (no risk data)
    try {
      console.log("⚠️ Fallback: loading base suppliers...");
      const { loadSuppliers } = await import("../services/supplierService.js");
      const basicSuppliers = loadSuppliers().map(s => ({
        ...s,
        current_risk_level: "UNKNOWN",
        risk_score: 0,
        active_risks: [],
        id:
          s.id ||
          `supplier_${s.supplier_name.toLowerCase().replace(/\s/g, "_")}`,
      }));
      console.log(
        `✅ Fallback: Returning ${basicSuppliers.length} basic suppliers`
      );
      res.json(basicSuppliers);
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError.message);
      res.status(500).json({
        error: "Failed to fetch suppliers",
        details: error.message,
        fallbackError: fallbackError.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
};
