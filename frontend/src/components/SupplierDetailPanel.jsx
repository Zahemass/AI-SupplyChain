import { useState, useEffect } from "react";
import "../styles/SupplierDetailPanel.css";

export default function SupplierDetailPanel({ supplier, risks = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [supplierData, setSupplierData] = useState(null);

  useEffect(() => {
    if (!supplier) return;

    const supplierRisks = risks.filter((r) =>
      r.linked_supplier_ids?.some(
        (id) => id.toString().toLowerCase() === supplier.id.toString().toLowerCase()
      )
    );

    const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    supplierRisks.sort(
      (a, b) => (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0)
    );

    const topRisk = supplierRisks[0];

    const recommendations = [];
    if (topRisk?.mitigation) recommendations.push(topRisk.mitigation);
    if (topRisk?.recommendations) {
      if (Array.isArray(topRisk.recommendations)) {
        recommendations.push(...topRisk.recommendations);
      } else if (typeof topRisk.recommendations === "string") {
        recommendations.push(topRisk.recommendations);
      }
    }
    if (recommendations.length === 0 && !topRisk) {
      recommendations.push(
        "Monitor situation closely",
        "Diversify supply chain where possible",
        "Review logistics for resilience"
      );
    }

    const supplierName = supplier.name || supplier.supplier_name || "Unknown Supplier";
    const supplierLocation = supplier.location || supplier.region || "Unknown Location";

    // ✅ Improved trend logic
    let trend = "stable"; // default fallback
    if (supplier.risk_trend) trend = supplier.risk_trend;
    else if (supplier.trend) trend = supplier.trend;
    else if (supplier.risk_score !== undefined) {
      if (supplier.risk_score >= 75) trend = "up";
      else if (supplier.risk_score <= 40) trend = "down";
      else trend = "stable";
    } else if (topRisk?.risk_score !== undefined) {
      if (topRisk.risk_score >= 75) trend = "up";
      else if (topRisk.risk_score <= 40) trend = "down";
      else trend = "stable";
    }

    const builtData = {
      riskScore: supplier.risk_score || topRisk?.risk_score || 0,
      trend,
      summary: topRisk?.summary || `No active risk reports for ${supplierName}.`,
      recommendations,
      why:
        topRisk?.reasoning ||
        topRisk?.financial_impact?.reasoning ||
        topRisk?.affected_routes?.[0]?.reasoning ||
        `No major disruptions reported for ${supplierName}.`,
      name: supplierName,
      location: supplierLocation,
      headline: topRisk?.headline,
      category: topRisk?.category,
      source: topRisk?.source,
      affectedSuppliers: topRisk?.affected_suppliers || [],
      affectedRoutes: topRisk?.affected_routes || [],
      financialImpact: topRisk?.financial_impact || null,
    };

    setSupplierData(builtData);
  }, [supplier, risks]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [expanded]);

  if (!supplier || !supplierData) return null;

  return (
    <>
      {/* Compact card (sidebar view) */}
      {!expanded && (
        <div
          className="supplier-card-compact"
          onClick={() => setExpanded(true)}
        >
          <div className="compact-label">⚡ Live Status</div>
          <div className="compact-name">{supplierData.name}</div>
          <div className="compact-location">📍 {supplierData.location}</div>
        </div>
      )}

      {/* Expanded modal overlay */}
      {expanded && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal-content">
            {/* Header */}
            <div className="modal-header">
              <div className="header-info">
                <div className="header-label">⚡ Live Status</div>
                <div className="header-name">{supplierData.name}</div>
                <div className="header-location">📍 {supplierData.location}</div>
              </div>

              <button
                onClick={() => setExpanded(false)}
                className="close-button"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Main Grid */}
            <div className="modal-grid">
              {/* Risk Score */}
              <div className="risk-score-card">
                <div className="card-label">Risk Score</div>
                <div
                  className={`risk-score ${
                    supplierData.riskScore > 50 ? "high" : "low"
                  }`}
                >
                  {supplierData.riskScore}
                  <span className="score-max">/100</span>
                </div>
                <div className="trend-label">Trend</div>
                <div
                  className={`trend-value ${
                    supplierData.trend === "down"
                      ? "improving"
                      : supplierData.trend === "up"
                      ? "worsening"
                      : "stable"
                  }`}
                >
                  {supplierData.trend === "down"
                    ? "↗ Improving"
                    : supplierData.trend === "up"
                    ? "↘ Worsening"
                    : "→ Stable"}
                </div>
              </div>

              {/* Right Column */}
              <div className="info-column">
                {/* Headline */}
                {supplierData.headline && (
                  <div className="info-card headline-card">
                    <div className="info-card-label">📰 Headline</div>
                    <div className="info-card-content">
                      {supplierData.headline}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                <div className="info-card summary-card">
                  <div className="info-card-label">✨ AI Summary</div>
                  <div className="info-card-content">
                    {supplierData.summary}
                  </div>
                </div>

                {/* Why & Recommendations */}
                <div className="two-column-grid">
                  {/* Why */}
                  <div className="info-card why-card">
                    <div className="info-card-label">⚠️ Why this risk?</div>
                    <div className="info-card-content">
                      {supplierData.why}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="info-card recommendations-card">
                    <div className="info-card-label">💡 Recommendations</div>
                    <ul className="recommendations-list">
                      {supplierData.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Affected Suppliers */}
                {supplierData.affectedSuppliers?.length > 0 && (
                  <div className="info-card suppliers-card">
                    <div className="info-card-label">🏭 Affected Suppliers</div>
                    <ul className="simple-list">
                      {supplierData.affectedSuppliers.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Affected Routes */}
                {supplierData.affectedRoutes?.length > 0 && (
                  <div className="info-card routes-card">
                    <div className="info-card-label">🚢 Affected Routes</div>
                    <div className="routes-list">
                      {supplierData.affectedRoutes.map((route, i) => (
                        <div key={i} className="route-item">
                          <strong className="route-name">{route.route}</strong>
                          <div className="route-details">
                            Delay: {route.delay_hours} hrs | Disruption:{" "}
                            {Math.round(route.disruption_prob * 100)}%
                          </div>
                          {route.alternative && (
                            <div className="route-alternative">
                              Alternative: {route.alternative}
                            </div>
                          )}
                          {route.reasoning && (
                            <div className="route-reasoning">
                              {route.reasoning}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Impact */}
                {supplierData.financialImpact && (
                  <div className="info-card financial-card">
                    <div className="info-card-label">💰 Financial Impact</div>
                    <div className="financial-content">
                      <div className="financial-range">
                        Range: $
                        {supplierData.financialImpact.min_usd.toLocaleString()}{" "}
                        - $
                        {supplierData.financialImpact.max_usd.toLocaleString()}
                      </div>
                      <div className="financial-confidence">
                        Confidence:{" "}
                        {Math.round(
                          supplierData.financialImpact.confidence * 100
                        )}
                        %
                      </div>
                      {supplierData.financialImpact.breakdown && (
                        <ul className="financial-breakdown">
                          {Object.entries(
                            supplierData.financialImpact.breakdown
                          ).map(([key, value], i) => (
                            <li key={i}>
                              {key}: ${value.toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      )}
                      {supplierData.financialImpact.reasoning && (
                        <div className="financial-reasoning">
                          {supplierData.financialImpact.reasoning}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
