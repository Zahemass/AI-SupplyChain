import { useEffect, useState } from "react";

export default function Navbar() {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    monitoring: 0,
    riskLevel: 'LOW'
  });

  useEffect(() => {
    // Fetch suppliers and calculate stats
    fetch("/data/suppliers.json")
      .then((res) => res.json())
      .then((data) => {
        const highRisk = data.filter(s => s.risk === 'HIGH').length;
        const mediumRisk = data.filter(s => s.risk === 'MEDIUM').length;
        const totalRisk = highRisk + mediumRisk;
        
        let level = 'LOW';
        if (highRisk > 0) level = 'HIGH';
        else if (mediumRisk > 0) level = 'MEDIUM';
        
        setStats({
          activeAlerts: totalRisk,
          monitoring: data.length,
          riskLevel: level
        });
      })
      .catch(err => console.log(err));
  }, []);

  const getRiskColor = (level) => {
    if (level === 'HIGH') return '#ef4444';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="navbar">
      <h2>
        <span>🌍</span>
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
        
        <div className="stat-item">
          <span className="stat-value">{stats.monitoring}</span>
          <span className="stat-label">Monitoring</span>
        </div>
      </div>
    </div>
  );
}