// backend/controllers/suppliersController.js
import { getSuppliers as loadBaseSuppliers } from "../services/supplierService.js";
import { fetchNews } from "../services/newsService.js";
import { analyzeEventsBatch } from "../services/aiRiskService.js";
import { getSimulatedEvents } from "./simulateEventController.js"; // 👈 Import simulated events

/**
 * ✅ Get suppliers with real-time risk integration
 * Chains: news + simulated events → risk analysis → supplier merge
 */
export const getSuppliersWithRisks = async (req, res) => {
  try {
    console.log("🏭 getSuppliersWithRisks: Starting...");

    // Step 1: Fetch latest news
    console.log("📰 Step 1: Fetching news...");
    const news = await fetchNews();
    console.log(`📰 Fetched ${news.length} news items`);

    // Step 1.5: Add simulated events
    const simulated = getSimulatedEvents();
    console.log(`🎭 Adding ${simulated.length} simulated events`);
    const allEvents = [...news, ...simulated];

    // Step 2: Analyze risks (if events available)
    let risks = [];
    if (allEvents.length > 0) {
      const filteredEvents = allEvents.filter(n => {
        const isValid =
          n.location &&
          n.location !== "Global" &&
          (!n.relevance_score || n.relevance_score >= 0.5);

        if (!isValid) {
          console.log(
            `🗑️ Filtering out: "${n.headline}" (location: ${n.location}, relevance: ${n.relevance_score})`
          );
        }
        return isValid;
      });

      console.log(
        `✅ Filtered to ${filteredEvents.length}/${allEvents.length} relevant events`
      );

      if (filteredEvents.length > 0) {
        console.log("🧠 Step 2: Analyzing risks with Cerebras...");
        risks = await analyzeEventsBatch(filteredEvents);
        console.log(`🧠 Analyzed ${risks.length} risks`);
      } else {
        console.log("⚠️ No relevant events to analyze");
      }
    } else {
      console.log("⚠️ No news/events available");
    }

    // Step 3: Merge risks into suppliers
    console.log("🏭 Step 3: Merging risks into suppliers...");
    const suppliers = await loadBaseSuppliers(risks);
    console.log(`✅ Returning ${suppliers.length} suppliers with risk data`);

    // Log risk distribution
    const riskCounts = {
      HIGH: suppliers.filter(s => s.current_risk_level === "HIGH").length,
      MEDIUM: suppliers.filter(s => s.current_risk_level === "MEDIUM").length,
      LOW: suppliers.filter(s => s.current_risk_level === "LOW").length,
    };
    console.log("📊 Risk distribution:", riskCounts);

    res.json(suppliers);
  } catch (error) {
    console.error("❌ getSuppliersWithRisks error:", error.message);
    console.error("Stack:", error.stack);

    // Fallback: Return suppliers without risk data
    try {
      console.log("⚠️ Attempting fallback: loading basic suppliers...");
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
        `✅ Fallback: Returning ${basicSuppliers.length} suppliers without risk data`
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
