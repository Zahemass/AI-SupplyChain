// backend/services/cerebrasClient.js
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import dotenv from "dotenv";
import crypto from "crypto";
import pLimit from "p-limit";

dotenv.config();

// ---- Initialize Cerebras SDK client
const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

const CEREBRAS_MODEL =
  process.env.CEREBRAS_MODEL || "llama-4-scout-17b-16e-instruct";

// ---- Concurrency limiter (to prevent API overload)
// Adjust based on your Cerebras plan tier: 3–5 is usually safe
const limit = pLimit(3);

// ---- In-memory cache
const cerebrasCache = new Map();
function cacheKey(prompt, opts) {
  return crypto
    .createHash("sha256")
    .update(prompt + JSON.stringify(opts || {}))
    .digest("hex");
}

// ---- Metrics tracking
let cerebrasStats = {
  totalCalls: 0,
  failedCalls: 0,
  cacheHits: 0,
  avgLatencyMs: 0,
  lastLatencyMs: 0,
  lastPromptPreview: "",
  tokensUsed: {
    prompt: 0,
    completion: 0,
    total: 0,
  },
};

/**
 * 🧠 Get Cerebras SDK performance metrics
 */
export function getCerebrasMetrics() {
  return {
    ...cerebrasStats,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 🚀 analyzeWithCerebras(prompt, opts)
 * Calls Cerebras SDK for inference with caching, retries, and metrics
 */
export async function analyzeWithCerebras(prompt, opts = {}) {
  return limit(async () => {
    const model = opts.model || CEREBRAS_MODEL;
    const temperature = opts.temperature ?? 0.2;
    const max_tokens = opts.max_tokens ?? 512;
    const maxAttempts = opts.maxAttempts ?? 3;

    const key = cacheKey(prompt, { model, temperature, max_tokens });

    // ✅ Cache hit check
    if (cerebrasCache.has(key)) {
      cerebrasStats.cacheHits++;
      console.log(`✨ Cache hit for Cerebras [${model}]`);
      return cerebrasCache.get(key);
    }

    cerebrasStats.totalCalls++;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const start = Date.now();

        const completion = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an AI risk analyzer for supply chain disruptions. Return ONLY JSON output.",
            },
            { role: "user", content: prompt },
          ],
          temperature,
          max_tokens,
        });

        const content = completion.choices?.[0]?.message?.content?.trim();
        if (!content) throw new Error("Empty content from Cerebras");

        // ✅ Save to cache
        cerebrasCache.set(key, content);

        // ✅ Update metrics
        const latency = Date.now() - start;
        const usage = completion.usage || {};
        cerebrasStats.lastLatencyMs = latency;
        cerebrasStats.avgLatencyMs =
          (cerebrasStats.avgLatencyMs * (cerebrasStats.totalCalls - 1) +
            latency) /
          cerebrasStats.totalCalls;
        cerebrasStats.tokensUsed.prompt += usage.prompt_tokens || 0;
        cerebrasStats.tokensUsed.completion += usage.completion_tokens || 0;
        cerebrasStats.tokensUsed.total += usage.total_tokens || 0;
        cerebrasStats.lastPromptPreview = prompt.slice(0, 120);

        console.log(
          `✅ Cerebras [${model}] success in ${latency}ms | tokens: ${
            usage.total_tokens ?? "?"
          }`
        );

        return content;
      } catch (err) {
        console.warn(
          `⚠️ Cerebras attempt ${attempt}/${maxAttempts} failed: ${
            err.message || err
          }`
        );

        if (attempt < maxAttempts) {
          const delay = Math.min(1000 * attempt, 3000);
          console.log(`⏳ Retrying after ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        cerebrasStats.failedCalls++;
        console.error("❌ Cerebras SDK error:", err);
        throw err;
      }
    }
  });
}
