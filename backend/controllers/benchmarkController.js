import { analyzeBatchWithCerebras, analyzeBatchWithStandard } from "../services/benchmarkService.js";
import { fetchNews } from "../services/newsService.js";

export const runBenchmark = async (req, res) => {
  try {
    console.log("🏁 Starting benchmark...");
    
    // Get sample events for testing
    const sampleSize = req.body.sampleSize || 5;
    const news = await fetchNews();
    const testEvents = news.slice(0, sampleSize).filter(n => 
      n.location && 
      n.location !== "Global" && 
      n.relevance_score >= 0.5
    );

    if (testEvents.length === 0) {
      return res.status(400).json({ 
        error: "No suitable test events available" 
      });
    }

    console.log(`📊 Benchmarking with ${testEvents.length} events`);

    // ⚡ Run Cerebras
    const cerebrasStart = Date.now();
    let cerebrasResults;
    let cerebrasError = null;
    
    try {
      cerebrasResults = await analyzeBatchWithCerebras(testEvents);
    } catch (err) {
      cerebrasError = err.message;
      cerebrasResults = [];
    }
    const cerebrasTime = Date.now() - cerebrasStart;

    // 🐌 Run Standard (simulated or real)
    const standardStart = Date.now();
    let standardResults;
    let standardError = null;
    
    try {
      standardResults = await analyzeBatchWithStandard(testEvents);
    } catch (err) {
      standardError = err.message;
      standardResults = [];
    }
    const standardTime = Date.now() - standardStart;

    // Calculate metrics
    const speedup = standardTime / cerebrasTime;
    const timeSaved = standardTime - cerebrasTime;
    const efficiency = ((timeSaved / standardTime) * 100).toFixed(1);

    const response = {
      success: true,
      benchmark: {
        events_tested: testEvents.length,
        cerebras: {
          time_ms: cerebrasTime,
          time_seconds: (cerebrasTime / 1000).toFixed(2),
          results_count: cerebrasResults.length,
          error: cerebrasError,
          avg_time_per_event: (cerebrasTime / testEvents.length).toFixed(0)
        },
        OpenAI: {
          time_ms: standardTime,
          time_seconds: (standardTime / 1000).toFixed(2),
          results_count: standardResults.length,
          error: standardError,
          avg_time_per_event: (standardTime / testEvents.length).toFixed(0)
        },
        comparison: {
          speedup: `${speedup.toFixed(1)}x faster`,
          time_saved_ms: timeSaved,
          time_saved_seconds: (timeSaved / 1000).toFixed(2),
          efficiency_gain: `${efficiency}%`,
          winner: cerebrasTime < standardTime ? "🏆 Cerebras" : "OpenAI"
        }
      },
      sample_events: testEvents.map(e => ({
        headline: e.headline,
        location: e.location
      })),
      timestamp: new Date().toISOString()
    };

    console.log("✅ Benchmark complete:", response.benchmark.comparison);
    res.json(response);

  } catch (error) {
    console.error("❌ Benchmark error:", error);
    res.status(500).json({ 
      error: "Benchmark failed", 
      details: error.message 
    });
  }
};