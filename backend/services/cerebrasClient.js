import axios from "axios";
import pLimit from "p-limit";
import dotenv from "dotenv";

dotenv.config();

// Load config from env

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "llama3.1-8b";
const BASE_URL = process.env.CEREBRAS_BASE_URL || "https://api.cerebras.ai/v1";

if (!CEREBRAS_API_KEY) {
  console.warn("Warning: CEREBRAS_API_KEY not set. Cerebras calls will fail if attempted.");
}

console.log("CEREBRAS_API_KEY loaded:", CEREBRAS_API_KEY ? "✅ present" : "❌ missing");

// Axios client
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${CEREBRAS_API_KEY}`,
    "Content-Type": "application/json"
  },
  timeout: 120000
});

// ---- Metrics (in-memory)
let cerebrasInFlight = 0;
let cerebrasTotalCalls = 0;
let cerebrasFailedCalls = 0;

export function getCerebrasMetrics() {
  return {
    inFlight: cerebrasInFlight,
    totalCalls: cerebrasTotalCalls,
    failedCalls: cerebrasFailedCalls,
    timestamp: new Date().toISOString()
  };
}

// sleep helper
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// 🔥 NEW: rate limit wrapper (max 1 concurrent request)
const limit = pLimit(1);

/**
 * analyzeWithCerebras(prompt, opts)
 */
export async function analyzeWithCerebras(prompt, opts = {}) {
  return limit(async () => {   // 👈 wraps call in limiter
    const model = opts.model || CEREBRAS_MODEL;
    const temperature = typeof opts.temperature === "number" ? opts.temperature : 0.2;
    const max_tokens = opts.max_tokens || 512;
    const maxAttempts = opts.maxAttempts || 4;

    cerebrasTotalCalls += 1;
    cerebrasInFlight += 1;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const resp = await client.post("/chat/completions", {
            model,
            messages: [
              { role: "system", content: "You are an AI risk analyzer for supply chain disruptions." },
              { role: "user", content: prompt }
            ],
            temperature,
            max_tokens
          });

          const content = resp.data?.choices?.[0]?.message?.content;
          if (!content) throw new Error("Empty content from Cerebras");
          return content;
        } catch (err) {
          const status = err.response?.status;
          const code = err.response?.data?.code;
          const isRate = code === "request_quota_exceeded" || status === 429;
          const isServerErr = status >= 500 && status < 600;

          if ((isRate || isServerErr) && attempt < maxAttempts) {
            const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000) + Math.floor(Math.random() * 200);
            console.warn(`Cerebras transient error attempt ${attempt}/${maxAttempts}:`, err.response?.data || err.message);
            console.warn(`Retrying after ${delay}ms`);
            await sleep(delay);
            continue;
          }

          throw err;
        }
      }
      throw new Error("Cerebras analysis failed after retries");
    } catch (err) {
      cerebrasFailedCalls += 1;
      console.error("Cerebras API error:", err.response?.data || err.message || err);
      throw err;
    } finally {
      cerebrasInFlight = Math.max(0, cerebrasInFlight - 1);
    }
  });
}
