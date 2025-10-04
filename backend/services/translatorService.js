// backend/services/translatorService.js
import { callMetaLlama } from "./metaLlamaClient.js";
import * as francModule from "franc";
const franc = francModule.default || francModule.franc || francModule;


/**
 * Detect language quickly (franc) and confirm/translate with Meta LLaMA if needed
 */
export async function translateToEnglish(text) {
  if (!text) return text;

  // detect language locally first
  let lang = franc(text, { minLength: 10 });
  if (lang === "und" || !lang) lang = "en";
  const map = { eng: "en", tam: "ta", zho: "zh", spa: "es", hin: "hi", fra: "fr" };
  const language = map[lang] || lang.slice(0, 2);

  if (language === "en") return text; // ✅ already English

  console.log(`🌐 Translating from ${language} → English`);

  const translationPrompt = `Translate the following ${language} text to English for supply-chain risk analysis.
Keep company, port, and region names unchanged.
Return only the translated text.

${text}`;

  try {
    const translation = await callMetaLlama(translationPrompt, {
      system: "Professional supply-chain translation assistant",
    });
    return translation || text;
  } catch (err) {
    console.warn("⚠️ Translation failed, returning original text:", err.message);
    return text;
  }
}
