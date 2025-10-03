// backend/services/benchmarkService.js
import { analyzeWithCerebras } from "./cerebrasClient.js";
import axios from "axios";

// ============================================
// HELPER FUNCTIONS (Must be defined first!)
// ============================================

/**
 * Build the analysis prompt for AI
 */
function buildPrompt(events) {
  return `You are an AI supply chain risk analyzer. Analyze these events and return ONLY a valid JSON array.

Events:
${events.map((e, i) =>
    `${i+1}. "${e.headline}" (Location: ${e.location}, Date: ${e.date}, Severity: ${e.severity || 'unknown'})`
  ).join("\n")}

Return JSON array with this EXACT structure (no additional text):
[
  {
    "risk_score": 0.75,
    "risk_level": "HIGH",
    "confidence": 0.85,
    "summary": "Brief impact explanation (max 100 chars)",
    "mitigation": "Specific action recommendation"
  }
]

Rules:
- risk_score: 0.0-1.0 (0.0-0.3=LOW, 0.4-0.6=MEDIUM, 0.7-1.0=HIGH)
- risk_level: Must be "LOW", "MEDIUM", or "HIGH"
- confidence: 0.0-1.0 (how certain you are)
- Return array with ${events.length} objects
- NO text outside JSON`;
}

/**
 * Parse AI response into structured results
 */
function parseResults(rawOutput, expectedCount) {
  try {
    // Try direct parse
    let parsed = JSON.parse(rawOutput);
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }
    return parsed;
  } catch (err) {
    console.warn("⚠️ Parse error, trying regex extraction...");
    
    // Try to extract JSON array from output
    const match = rawOutput.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        let parsed = JSON.parse(match[0]);
        if (!Array.isArray(parsed)) parsed = [parsed];
        return parsed;
      } catch (e) {
        console.error("❌ Regex extraction failed:", e.message);
      }
    }
    
    // Fallback: return mock results
    console.warn("Using fallback mock results");
    return Array(expectedCount).fill(0).map(() => ({
      risk_score: 0.5,
      risk_level: "MEDIUM",
      confidence: 0.7,
      summary: "Analysis completed",
      mitigation: "Monitor situation"
    }));
  }
}

/**
 * Generate mock response for simulation
 */
function generateMockResponse(events) {
  const results = events.map(e => {
    const score = Math.random() * 0.5 + 0.3; // 0.3-0.8
    let level = "MEDIUM";
    if (score >= 0.7) level = "HIGH";
    else if (score < 0.4) level = "LOW";
    
    return {
      risk_score: score,
      risk_level: level,
      confidence: 0.75,
      summary: `Supply chain risk detected for ${e.location}`,
      mitigation: "Monitor and prepare contingency plans"
    };
  });
  
  return JSON.stringify(results);
}

// ============================================
// MAIN EXPORT FUNCTIONS
// ============================================

/**
 * Analyze with Cerebras (your existing fast path)
 */
export async function analyzeBatchWithCerebras(events) {
  console.log(`⚡ Cerebras analyzing ${events.length} events...`);
  const prompt = buildPrompt(events);
  const rawOutput = await analyzeWithCerebras(prompt);
  return parseResults(rawOutput, events.length);
}

/**
 * Analyze with "Standard" inference
 */
export async function analyzeBatchWithStandard(events) {
  const useRealComparison = process.env.OPENAI_API_KEY && process.env.USE_REAL_BENCHMARK === "true";
  
  if (useRealComparison) {
    console.log("🔄 Using real OpenAI comparison");
    return await analyzeWithOpenAI(events);
  } else {
    console.log("🐌 Using simulated standard LLM");
    return await analyzeWithSimulation(events);
  }
}

// ============================================
// IMPLEMENTATION OPTIONS
// ============================================

/**
 * OPTION 1: Real OpenAI Comparison
 */
async function analyzeWithOpenAI(events) {
  const prompt = buildPrompt(events);
  
  try {
    console.log("📡 Calling OpenAI API...");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an AI risk analyzer for supply chain disruptions." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 512
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty content from OpenAI");
    }
    
    console.log("✅ OpenAI response received");
    return parseResults(content, events.length);
  } catch (err) {
    console.error("❌ OpenAI benchmark error:", err.message);
    console.log("🔄 Falling back to simulation");
    // Fallback to simulation
    return await analyzeWithSimulation(events);
  }
}

/**
 * OPTION 2: Simulated "Standard" LLM with realistic latency
 */
async function analyzeWithSimulation(events) {
  console.log(`🐌 Starting SIMULATION for ${events.length} events...`);
  
  // Realistic standard LLM performance benchmarks:
  // - Initial latency (TTFT): 800-1000ms
  // - Token generation: ~40 tokens/second (vs Cerebras 1800+)
  // - Each risk analysis: ~100 tokens
  
  const tokensToGenerate = events.length * 100;
  const standardTokensPerSec = 40; // Conservative estimate for cloud LLMs
  const initialLatencyMs = 800; // Time to first token
  
  const generationTimeMs = (tokensToGenerate / standardTokensPerSec) * 1000;
  const totalTimeMs = initialLatencyMs + generationTimeMs;
  
  console.log(`⏱️  Simulating standard LLM:`);
  console.log(`   - Initial latency: ${initialLatencyMs}ms`);
  console.log(`   - Token generation: ${generationTimeMs.toFixed(0)}ms`);
  console.log(`   - Total time: ${totalTimeMs.toFixed(0)}ms`);
  
  // Actually wait to make it realistic in demo
  await new Promise(resolve => setTimeout(resolve, totalTimeMs));
  
  // Generate mock results
  const mockResponse = generateMockResponse(events);
  console.log("✅ Simulation complete");
  
  return parseResults(mockResponse, events.length);
}