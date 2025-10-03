// backend/controllers/riskController.js
import { fetchNews } from "../services/newsService.js";
import { analyzeEventsBatch } from "../services/aiRiskService.js";

export const getRisk = async (req, res) => {
  try {
    console.log("🔍 getRisk: Fetching news...");
    const news = await fetchNews();
    console.log("📰 fetchNews returned:", news.length, "events");

    if (!news.length) {
      console.warn("⚠️ No news returned from News API");
      return res.json([]);
    }

    // ✅ ENHANCED FILTERING: Remove junk/irrelevant content
    const filteredNews = news.filter(n => {
      // Must have a real location (not "Global")
      if (!n.location || n.location === "Global") {
        console.log(`🗑️ Dropping: No specific location - "${n.headline}"`);
        return false;
      }

      // Must have sufficient relevance score
      if (typeof n.relevance_score === "number" && n.relevance_score < 0.5) {
        console.log(`🗑️ Dropping: Low relevance (${n.relevance_score}) - "${n.headline}"`);
        return false;
      }

      // Filter out generic market reports
      const lower = n.headline.toLowerCase();
      const junkKeywords = [
        "market size",
        "forecast to",
        "cagr",
        "market report",
        "research report",
        "market analysis",
        "industry outlook",
        "projected to grow",
        "market share"
      ];

      if (junkKeywords.some(kw => lower.includes(kw))) {
        console.log(`🗑️ Dropping: Market report - "${n.headline}"`);
        return false;
      }

      // Filter out cryptocurrency/stock market unless related to supply chain
      const cryptoKeywords = ["bitcoin", "crypto", "cryptocurrency", "ethereum", "nft"];
      const hasSupplyChain = lower.includes("supply chain") || 
                             lower.includes("logistics") || 
                             lower.includes("shipping");
      
      if (cryptoKeywords.some(kw => lower.includes(kw)) && !hasSupplyChain) {
        console.log(`🗑️ Dropping: Crypto/finance news - "${n.headline}"`);
        return false;
      }

      return true;
    });

    console.log(`✅ Filtered news: ${filteredNews.length}/${news.length} passed relevance checks`);

    if (!filteredNews.length) {
      console.warn("⚠️ No relevant news after filtering");
      return res.json([]);
    }

    // ✅ Analyze with AI
    console.log("🧠 Sending to Cerebras for risk analysis...");
    const risks = await analyzeEventsBatch(filteredNews);
    console.log("✅ Cerebras returned:", risks.length, "risk assessments");

    // ✅ Final quality check: Only return high-quality risks
    const qualityRisks = risks.filter(r => {
      // Must have minimum risk score
      if (r.risk_score < 30) {
        console.log(`🗑️ Dropping low-impact risk (score ${r.risk_score}): "${r.name}"`);
        return false;
      }

      // Must have coordinates
      if (!r.lat || !r.lng || (r.lat === 0 && r.lng === 0)) {
        console.log(`🗑️ Dropping: Invalid coordinates - "${r.name}"`);
        return false;
      }

      return true;
    });

    console.log(`✅ Final output: ${qualityRisks.length} high-quality risks`);

    res.json(qualityRisks);
  } catch (error) {
    console.error("❌ getRisk error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      error: "Failed to calculate risks", 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};