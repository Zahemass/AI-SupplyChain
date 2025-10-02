import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar({ suppliers = [], risks = [], loading }) {
  const location = useLocation();
  const [status, setStatus] = useState({
    message: "Loading system status...",
    color: "#94a3b8"
  });

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/about', icon: 'ℹ️', label: 'About' },
  ];

  useEffect(() => {
    if (loading) {
      setStatus({
        message: "Loading system status...",
        color: "#94a3b8"
      });
      return;
    }

    // Count high/medium risks
    const highRisk = risks.filter(r => r.risk_level === "HIGH").length;
    const mediumRisk = risks.filter(r => r.risk_level === "MEDIUM").length;

    if (highRisk > 0) {
      setStatus({
        message: `${highRisk} High Risk Alert${highRisk > 1 ? "s" : ""}`,
        color: "#ef4444"
      });
    } else if (mediumRisk > 0) {
      setStatus({
        message: `${mediumRisk} Medium Risk Alert${mediumRisk > 1 ? "s" : ""}`,
        color: "#f59e0b"
      });
    } else {
      setStatus({
        message: "All Systems Operational",
        color: "#10b981"
      });
    }
  }, [risks, loading]);

  return (
    <div className="sidebar">
      <h3>Navigation</h3>
      <ul>
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link 
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      <div style={{ 
        position: 'absolute', 
        bottom: '30px', 
        left: '25px', 
        right: '25px',
        padding: '15px',
        background: 'rgba(6, 182, 212, 0.1)',
        borderRadius: '10px',
        border: '1px solid rgba(6, 182, 212, 0.2)'
      }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>
          SYSTEM STATUS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: status.color,
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{ fontSize: '13px', color: '#06b6d4', fontWeight: '600' }}>
            {status.message}
          </span>
        </div>
      </div>
    </div>
  );
}
