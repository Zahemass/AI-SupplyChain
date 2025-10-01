import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/about', icon: 'ℹ️', label: 'About' },
  ];

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
            background: '#10b981',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{ fontSize: '13px', color: '#06b6d4', fontWeight: '600' }}>
            All Systems Operational
          </span>
        </div>
      </div>
    </div>
  );
}