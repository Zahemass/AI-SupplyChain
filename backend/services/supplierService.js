import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ✅ Load suppliers from JSON file (base data)
 */
export function loadSuppliers() {
  const filePath = path.join(__dirname, "../data/supplier_data.json");
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return [];
}

/**
 * ✅ Get suppliers with real-time risk data merged
 * This function receives risks as parameter to avoid circular dependency
 */
export const getSuppliers = async (risks = []) => {
  const suppliers = loadSuppliers();

  console.log(`📦 Merging ${risks.length} risks into ${suppliers.length} suppliers`);

  // Merge risk data into suppliers
  return suppliers.map(s => {
    // Find all risks that affect this supplier's location
    const matched = risks.filter(r => {
      if (!r.location || !s.location) return false;
      
      const riskCity = r.location.toLowerCase().split(',')[0].trim();
      const supplierCity = s.location.toLowerCase().split(',')[0].trim();
      
      return riskCity === supplierCity || 
             r.affected_suppliers?.includes(s.supplier_name);
    });

    // Get highest risk for this supplier
    const highestRisk = matched.length > 0
      ? matched.sort((a, b) => b.risk_score - a.risk_score)[0]
      : null;

    return {
      id: s.id || `supplier_${s.supplier_name.toLowerCase().replace(/\s/g, '_')}`,
      supplier_name: s.supplier_name,
      location: s.location,
      lat: s.lat,
      lng: s.lng,
      product: s.product || "General Goods",
      category: s.category || "manufacturing",
      lead_time_days: s.lead_time_days || 7,
      monthly_volume: s.monthly_volume || "N/A",
      
      // ✅ Real-time risk status
      current_risk_level: highestRisk?.risk_level || "LOW",
      risk_score: highestRisk 
        ? (highestRisk.risk_score > 1 
            ? highestRisk.risk_score 
            : Math.round(highestRisk.risk_score * 100)) 
        : 0,

      // ✅ Active risk links
      active_risk_ids: matched.map(r => r.id),   // 👈 NEW: only IDs
      active_risks: matched.map(r => ({          // 👈 Still keep details
        id: r.id,
        name: r.name,
        summary: r.summary,
        mitigation: r.mitigation,
        estimated_delay: r.estimated_delay,
        financial_impact: r.financial_impact
      })),
      
      // ✅ Business context
      annual_contract_value: s.annual_contract_value || "N/A",
      criticality: s.criticality || (highestRisk ? "high" : "medium"),
      
      // ✅ Alternative options
      backup_suppliers: s.backup_suppliers || []
    };
  });
};

/**
 * Optional: Load suppliers from CSV
 */
export function loadSuppliersFromCSV(csvFile) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}
