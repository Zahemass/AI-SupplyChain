import RiskMap from "../components/RiskMap";
import RiskPanel from "../components/RiskPanel";
import Feed from "../components/Feed";

export default function Dashboard({ suppliers = [], risks = [], news = [], loading }) {
  return (
    <div>
      <div style={{
        marginBottom: '25px',
        animation: 'fadeInUp 0.6s ease'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Supply Chain Dashboard
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#94a3b8'
        }}>
          Real-time monitoring and AI-powered risk analysis across your global supply network
        </p>
      </div>

      <div className="dashboard">
        <div className="dashboard-left">
          {/* ✅ Pass props instead of fetching inside */}
          <RiskMap suppliers={suppliers} risks={risks} loading={loading} />
          <Feed news={news} loading={loading} />
        </div>
        
        <div className="dashboard-right">
          <RiskPanel suppliers={suppliers} risks={risks} loading={loading} />
          
          {/* Weather Widget */}
          <div className="card" style={{ animationDelay: '0.2s' }}>
            <h3>🌤️ Weather Alerts</h3>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>
              Current weather conditions affecting supply routes
            </div>
            
            <div style={{
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              marginBottom: '10px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>🌪️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#f59e0b',
                    marginBottom: '4px'
                  }}>
                    Tropical Storm Warning
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Chennai, India - Expected landfall in 48hrs
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>☀️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#10b981',
                    marginBottom: '4px'
                  }}>
                    Clear Conditions
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Rotterdam, Netherlands - Optimal shipping
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card" style={{ animationDelay: '0.3s' }}>
            <h3>📈 Quick Stats</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginTop: '15px'
            }}>
              <div style={{
                padding: '15px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#06b6d4',
                  marginBottom: '5px'
                }}>
                  98.5%
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Uptime
                </div>
              </div>
              
              <div style={{
                padding: '15px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#10b981',
                  marginBottom: '5px'
                }}>
                  24/7
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Monitoring
                </div>
              </div>
              
              <div style={{
                padding: '15px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#f59e0b',
                  marginBottom: '5px'
                }}>
                  15ms
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Response Time
                </div>
              </div>
              
              <div style={{
                padding: '15px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#06b6d4',
                  marginBottom: '5px'
                }}>
                  1.2K
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Data Sources
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
