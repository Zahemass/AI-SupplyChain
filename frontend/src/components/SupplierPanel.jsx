//SupplierPanel
import { X, MapPin, Package, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Users } from "lucide-react";

export default function SupplierPanel({ supplier, risks = [], onClose }) {
  if (!supplier) {
    return null;
  }

  // Find active risks for this supplier
  const activeRisks = supplier.active_risks || [];
  const riskScore = supplier.risk_score || 0;
  const riskLevel = supplier.current_risk_level || "LOW";

  // Risk gauge color
  const getRiskColor = (score) => {
    if (score >= 70) return "#ef4444";
    if (score >= 40) return "#f59e0b";
    return "#10b981";
  };

  const riskColor = getRiskColor(riskScore);

  // Generate recommendations based on risk level
  const getRecommendations = () => {
    if (riskLevel === "HIGH") {
      return [
        "Immediately contact supplier to assess situation",
        "Activate backup suppliers: " + (supplier.backup_suppliers?.join(", ") || "N/A"),
        "Review inventory levels and consider safety stock increase",
        "Monitor weather and logistics updates hourly"
      ];
    } else if (riskLevel === "MEDIUM") {
      return [
        "Monitor supplier status daily",
        "Prepare contingency plans with backup suppliers",
        "Review alternative shipping routes",
        "Increase communication frequency with supplier"
      ];
    } else {
      return [
        "Continue regular monitoring schedule",
        "Maintain strong relationship with supplier",
        "Review quarterly performance metrics",
        "Explore opportunities for increased collaboration"
      ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(6, 182, 212, 0.2)",
        overflow: "hidden",
        animation: "slideInRight 0.4s ease-out",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)",
      }}
    >
      {/* Animated Background Gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: `linear-gradient(135deg, ${riskColor}20 0%, transparent 100%)`,
          opacity: 0.3,
          animation: "pulse 3s ease-in-out infinite",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
          background: "rgba(15, 23, 42, 0.5)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(148, 163, 184, 0.1)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(148, 163, 184, 0.1)";
            e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
          }}
        >
          <X size={18} color="#94a3b8" />
        </button>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px",
            paddingRight: "40px",
          }}
        >
          {supplier.supplier_name}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "13px" }}>
          <MapPin size={14} />
          <span>{supplier.location}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", position: "relative" }}>
        
        {/* Risk Score Gauge */}
        <div
          style={{
            marginBottom: "24px",
            padding: "20px",
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: "12px",
            border: `1px solid ${riskColor}30`,
          }}
        >
          <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px", fontWeight: "600" }}>
            Current Risk Score
          </div>

          {/* Circular Gauge */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: "relative", width: "100px", height: "100px" }}>
              <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={riskColor}
                  strokeWidth="8"
                  strokeDasharray={`${(riskScore / 100) * 264} 264`}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dasharray 1s ease-out",
                    filter: `drop-shadow(0 0 8px ${riskColor}60)`,
                  }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: "700", color: riskColor }}>
                  {riskScore}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>/ 100</div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: `${riskColor}20`,
                  border: `1px solid ${riskColor}40`,
                  fontSize: "12px",
                  fontWeight: "600",
                  color: riskColor,
                  marginBottom: "8px",
                }}
              >
                {riskLevel} RISK
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
                {riskLevel === "HIGH" && "Immediate attention required"}
                {riskLevel === "MEDIUM" && "Monitor closely for changes"}
                {riskLevel === "LOW" && "Operating within normal parameters"}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            background: "rgba(6, 182, 212, 0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(6, 182, 212, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Package size={16} color="#06b6d4" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>Product Information</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
            <div>
              <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Product</div>
              <div style={{ color: "#e2e8f0", fontWeight: "600" }}>{supplier.product}</div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Category</div>
              <div style={{ color: "#e2e8f0", fontWeight: "600", textTransform: "capitalize" }}>
                {supplier.category}
              </div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Lead Time</div>
              <div style={{ color: "#e2e8f0", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} color="#06b6d4" />
                {supplier.lead_time_days} days
              </div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Monthly Volume</div>
              <div style={{ color: "#e2e8f0", fontWeight: "600" }}>{supplier.monthly_volume}</div>
            </div>
          </div>
        </div>

        {/* Contract Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <div
            style={{
              padding: "16px",
              background: "rgba(16, 185, 129, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(16, 185, 129, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <DollarSign size={14} color="#10b981" />
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Annual Value</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981" }}>
              {supplier.annual_contract_value}
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              background: "rgba(245, 158, 11, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(245, 158, 11, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <TrendingUp size={14} color="#f59e0b" />
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Criticality</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b", textTransform: "capitalize" }}>
              {supplier.criticality}
            </div>
          </div>
        </div>

        {/* Active Risks */}
        {activeRisks.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <AlertTriangle size={16} color="#ef4444" />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                Active Risks ({activeRisks.length})
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeRisks.map((risk, index) => (
                <div
                  key={risk.id || index}
                  style={{
                    padding: "14px",
                    background: "rgba(239, 68, 68, 0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#e2e8f0", marginBottom: "8px", fontWeight: "600" }}>
                    {risk.summary}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
                    {risk.mitigation}
                  </div>
                  {risk.financial_impact && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#ef4444",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <DollarSign size={12} />
                      Impact: ${(risk.financial_impact.min_usd / 1000000).toFixed(1)}M - $
                      {(risk.financial_impact.max_usd / 1000000).toFixed(1)}M
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <CheckCircle size={16} color="#06b6d4" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
              Recommended Actions
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  background: "rgba(6, 182, 212, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(6, 182, 212, 0.15)",
                  fontSize: "12px",
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`,
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#06b6d4",
                    marginTop: "6px",
                    flexShrink: 0,
                  }}
                />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Backup Suppliers */}
        {supplier.backup_suppliers && supplier.backup_suppliers.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "rgba(148, 163, 184, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Users size={14} color="#94a3b8" />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>Backup Suppliers</span>
            </div>
            <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
              {supplier.backup_suppliers.join(" • ")}
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}