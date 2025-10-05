import { useEffect, useState } from "react";

export default function Navbar({ suppliers = [], risks = [], loading, onMenuClick, isMobile }) {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    monitoring: 0,
    riskLevel: 'LOW'
  });

  useEffect(() => {
    if (loading) return;

    const highRisk = risks.filter(r => r.risk_level === 'HIGH').length;
    const mediumRisk = risks.filter(r => r.risk_level === 'MEDIUM').length;
    const totalRisk = highRisk + mediumRisk;
    
    let level = 'LOW';
    if (highRisk > 0) level = 'HIGH';
    else if (mediumRisk > 0) level = 'MEDIUM';
    
    setStats({
      activeAlerts: totalRisk,
      monitoring: suppliers.length,
      riskLevel: level
    });
  }, [suppliers, risks, loading]);

  const getRiskColor = (level) => {
    if (level === 'HIGH') return '#ef4444';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="navbar">
      {isMobile && (
        <button 
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      )}
      
      <h2>
        <span className="hide-mobile">🌍</span>
        Supply Chain Risk Radar
      </h2>
      
      <div className="navbar-stats">
        <div className="stat-item">
          <span className="stat-value" style={{ color: getRiskColor(stats.riskLevel) }}>
            {stats.riskLevel}
          </span>
          <span className="stat-label">Risk Level</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-value">{stats.activeAlerts}</span>
          <span className="stat-label">Active Alerts</span>
        </div>
        
        <div className="stat-item hide-mobile">
          <span className="stat-value">{stats.monitoring}</span>
          <span className="stat-label">Monitoring</span>
        </div>
      </div>
    </div>
  );
}