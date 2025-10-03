// backend/services/cerebrasClient.js
import axios from "axios";
import pLimit from "p-limit";
import dotenv from "dotenv";

dotenv.config();

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "llama3.1-8b";
const BASE_URL = process.env.CEREBRAS_BASE_URL || "https://api.cerebras.ai/v1";

if (!CEREBRAS_API_KEY) {
  console.warn("⚠️ Warning: CEREBRAS_API_KEY not set. Cerebras calls will fail.");
}

// ---- Rate limit config
const REQUESTS_PER_MINUTE = parseInt(process.env.CEREBRAS_RPM || "60", 10); // default 60/min
const MIN_DELAY = Math.ceil(60000 / REQUESTS_PER_MINUTE); // ms between calls
let lastRequestTime = 0;

// Axios client
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${CEREBRAS_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

// ---- Metrics
let cerebrasInFlight = 0;
let cerebrasTotalCalls = 0;
let cerebrasFailedCalls = 0;
let cerebrasTokenUsage = {
  prompt_tokens: 0,
  completion_tokens: 0,
  total_tokens: 0,
};
let lastCall = null;

/**
 * 📊 Metrics
 */
export function getCerebrasMetrics() {
  return {
    inFlight: cerebrasInFlight,
    totalCalls: cerebrasTotalCalls,
    failedCalls: cerebrasFailedCalls,
    tokens: { ...cerebrasTokenUsage },
    lastCall,
    timestamp: new Date().toISOString(),
  };
}

// Sleep helper
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Only 1 concurrent request
const limit = pLimit(1);

/**
 * analyzeWithCerebras(prompt, opts)
 */
export async function analyzeWithCerebras(prompt, opts = {}) {
  return limit(async () => {
    const model = opts.model || CEREBRAS_MODEL;
    const temperature = typeof opts.temperature === "number" ? opts.temperature : 0.2;
    const max_tokens = opts.max_tokens || 512;
    const maxAttempts = opts.maxAttempts || 4;

    cerebrasTotalCalls += 1;
    cerebrasInFlight += 1;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const start = Date.now();

          // ✅ Enforce RPM limit
          const now = Date.now();
          const elapsed = now - lastRequestTime;
          if (elapsed < MIN_DELAY) {
            const wait = MIN_DELAY - elapsed;
            console.log(`⏳ Rate limiting: waiting ${wait}ms to respect RPM`);
            await sleep(wait);
          }
          lastRequestTime = Date.now();

          const resp = await client.post("/chat/completions", {
            model,
            messages: [
              { role: "system", content: "You are an AI risk analyzer for supply chain disruptions. Return ONLY JSON." },
              { role: "user", content: prompt },
            ],
            temperature,
            max_tokens,
          });

          const content = resp.data?.choices?.[0]?.message?.content?.trim();
          if (!content) {
            console.warn(`⚠️ Empty content from Cerebras (attempt ${attempt})`);
            throw { transient: true, message: "Empty content" };
          }

          // Track token usage
          const usage = resp.data?.usage || {};
          cerebrasTokenUsage.prompt_tokens += usage.prompt_tokens || 0;
          cerebrasTokenUsage.completion_tokens += usage.completion_tokens || 0;
          cerebrasTokenUsage.total_tokens += usage.total_tokens || 0;

          lastCall = {
            model,
            promptPreview: prompt.slice(0, 120) + (prompt.length > 120 ? "...": ""),
            tokens: usage,
            latency_ms: Date.now() - start,
            timestamp: new Date().toISOString(),
          };

          console.log(`✅ Cerebras [${model}] success in ${Date.now() - start}ms | tokens: ${usage.total_tokens || "?"}`);
          console.log(`✅ Cerebras [${model}] response:`, content);
          return content;
        } catch (err) {
          const status = err.response?.status;
          const code = err.response?.data?.code;
          const isRate = code === "request_quota_exceeded" || status === 429;
          const isServerErr = status >= 500 && status < 600;

          if ((err.transient || isRate || isServerErr) && attempt < maxAttempts) {
            const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000) + Math.floor(Math.random() * 200);
            console.warn(`⚠️ Cerebras retry ${attempt}/${maxAttempts}:`, err.message || err);
            console.warn(`⏳ Retrying after ${delay}ms`);
            await sleep(delay);
            continue;
          }

          throw err;
        }
      }
      throw new Error("Cerebras analysis failed after retries");
    } catch (err) {
      cerebrasFailedCalls += 1;
      console.error("❌ Cerebras API error:", err.response?.data || err.message || err);
      throw err;
    } finally {
      cerebrasInFlight = Math.max(0, cerebrasInFlight - 1);
    }
  });
}
