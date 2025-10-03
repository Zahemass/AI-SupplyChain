import { analyzeEventsBatch } from "../services/aiRiskService.js";
import { v4 as uuidv4 } from "uuid";

// Store simulated events in memory for now
let simulatedEvents = [];

export const simulateEvent = async (req, res) => {
  try {
    const { headline, location, severity = "medium", category = "simulated" } = req.body;

    if (!headline || !location) {
      return res.status(400).json({ error: "headline and location are required" });
    }

    // Create a fake "news event"
    const fakeEvent = {
      id: uuidv4(),
      date: new Date().toISOString(),
      location,
      headline,
      description: headline,
      source: "Simulated",
      url: "",
      source_language: "en",
      category,
      severity,
      relevance_score: 1.0 // ensure it always processes
    };

    // Save it in memory
    simulatedEvents.push(fakeEvent);

    // Analyze with AI risk pipeline
    const risks = await analyzeEventsBatch([fakeEvent]);

    res.json({
      success: true,
      message: "Simulated event injected and analyzed",
      event: fakeEvent,
      risks
    });
  } catch (err) {
    console.error("❌ Simulation error:", err.message);
    res.status(500).json({ error: "Failed to simulate event", details: err.message });
  }
};

// Export simulated events for merging later
export function getSimulatedEvents() {
  return simulatedEvents;
}
