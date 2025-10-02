export function scoreEvent(event) {
  const highRisk = ["strike", "flood", "fire", "earthquake"];
  const mediumRisk = ["delay", "minor weather", "protest"];

  if (highRisk.includes(event.category.toLowerCase())) return "HIGH";
  if (mediumRisk.includes(event.category.toLowerCase())) return "MEDIUM";
  return "LOW";
}
