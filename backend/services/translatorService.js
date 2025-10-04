export function translateToEnglish(text, lang = "en") {
  if (lang !== "en") {
    return `[Translated from ${lang}] ${text}`;
  }
  return text;
}
