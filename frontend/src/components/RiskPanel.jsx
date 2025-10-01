import { useEffect, useState } from "react";

export default function RiskPanel() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/suppliers.json")
      .then((res) => res.json())
      .then((data) => {
        setSuppliers(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const getRiskIcon = (risk) => {
    if (risk === "HIGH") return "⚠️";
    if (risk === "MEDIUM") return "⚡";
    return "✅";
  };

  const getActionMessage = (supplier) => {
    if (supplier.risk === "HIGH") {
      return `Switch from ${supplier.name} to alternate supplier`;
    }
    if (supplier.risk === "MEDIUM") {
      return `Monitor ${supplier.name} closely for next 24hrs`;
    }
    return `${supplier.name} is operating normally`;
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

  // Sort by risk level (HIGH first)
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return riskOrder[a.risk] - riskOrder[b.risk];
  });

  return (
    <div className="card">
      <h3>⚡ Recommended Actions</h3>
      
      <div style={{ marginBottom: '15px', fontSize: '13px', color: '#94a3b8' }}>
        AI-powered risk mitigation suggestions
      </div>
      
      <div>
        {sortedSuppliers.map((supplier, idx) => (
          <div 
            key={idx}
            className="risk-item"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={`risk-icon ${supplier.risk.toLowerCase()}`}>
              {getRiskIcon(supplier.risk)}
            </div>
            
            <div className="risk-text">
              {getActionMessage(supplier)}
            </div>
            
            <div className={`risk-badge ${supplier.risk.toLowerCase()}`}>
              {supplier.risk}
            </div>
          </div>
        ))}
      </div>
      
      {sortedSuppliers.filter(s => s.risk === 'HIGH').length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '13px',
          color: '#ef4444'
        }}>
          <strong>⚠️ Urgent Action Required:</strong> {sortedSuppliers.filter(s => s.risk === 'HIGH').length} supplier(s) 
          are at high risk. Immediate intervention recommended.
        </div>
      )}
    </div>
  );
}