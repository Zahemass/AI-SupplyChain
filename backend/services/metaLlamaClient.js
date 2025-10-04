// backend/services/metaLlamaClient.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const META_LLAMA_URL =
  process.env.META_LLAMA_URL ||
  "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

/**
 * 🧠 callMetaLlama(prompt, opts)
 * Makes a call to Hugging Face Inference API with Meta LLaMA.
 */
export async function callMetaLlama(prompt, opts = {}) {
  const { temperature = 0.2, max_tokens = 512 } = opts;

  const headers = {
    Authorization: `Bearer ${HF_API_KEY}`,
    "Content-Type": "application/json",
  };

  const body = {
    inputs: prompt,
    parameters: {
      temperature,
      max_new_tokens: max_tokens,
      return_full_text: false,
    },
  };

  try {
    const start = Date.now();
    const response = await axios.post(META_LLAMA_URL, body, {
      headers,
      timeout: 180000,
    });

    const output =
      response.data?.[0]?.generated_text ||
      response.data?.generated_text ||
      response.data;

    console.log(`🧠 Meta LLaMA (HF) replied in ${Date.now() - start} ms`);
    return typeof output === "string"
      ? output.trim()
      : JSON.stringify(output, null, 2);
  } catch (err) {
    if (err.response?.status === 429)
      console.warn("⚠️ Hugging Face rate limit hit (429). Try again later.");
    else console.error("❌ Meta LLaMA (HF) error:", err.message);
    throw err;
  }
}
