export default function RiskPanel({ risks = [], loading }) {
  const getRiskIcon = (level) => {
    if (level === "HIGH") return "⚠️";
    if (level === "MEDIUM") return "⚡";
    return "✅";
  };

  const getActionMessage = (risk) => {
    if (risk.mitigation) return risk.mitigation;
    if (risk.risk_level === "HIGH") 
      return `High risk at ${risk.location || 'Unknown Location'} - ${risk.headline || 'Immediate action required!'}`;
    if (risk.risk_level === "MEDIUM")
      return `Monitor ${risk.location || "this event"} closely - ${risk.summary || 'Potential disruption detected'}`;
    return `${risk.location || "This location"} is operating normally.`;
  };

  if (loading) {
    return (
      <div className="card">
        <h3>⚡ Recommended Actions</h3>
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sortedRisks = [...risks].sort(
    (a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]
  ).slice(0, 10); // Show top 10 risks

  return (
    <div className="card">
      <h3>⚡ Recommended Actions</h3>
      <div style={{ marginBottom: "15px", fontSize: "13px", color: "#94a3b8" }}>
        AI-powered risk mitigation suggestions
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {sortedRisks.map((risk, idx) => (
          <div
            key={risk.id || idx}
            className="risk-item"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={`risk-icon ${risk.risk_level?.toLowerCase()}`}>
              {getRiskIcon(risk.risk_level)}
            </div>
            <div className="risk-text">
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                {risk.location || "Global Event"}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                {getActionMessage(risk)}
              </div>
              {risk.affected_suppliers?.length > 0 && (
                <div style={{ fontSize: "11px", marginTop: "4px", color: "#64748b" }}>
                  Affects: {risk.affected_suppliers.slice(0, 3).join(", ")}
                  {risk.affected_suppliers.length > 3 && ` +${risk.affected_suppliers.length - 3} more`}
                </div>
              )}
            </div>
            <div className={`risk-badge ${risk.risk_level?.toLowerCase()}`}>
              {risk.risk_level}
            </div>
          </div>
        ))}
      </div>

      {sortedRisks.filter((r) => r.risk_level === "HIGH").length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "10px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            fontSize: "13px",
            color: "#ef4444",
          }}
        >
          <strong>⚠️ Urgent Action Required:</strong>{" "}
          {sortedRisks.filter((r) => r.risk_level === "HIGH").length} high-risk
          event(s) detected. Review mitigation strategies immediately.
        </div>
      )}
    </div>
  );
}