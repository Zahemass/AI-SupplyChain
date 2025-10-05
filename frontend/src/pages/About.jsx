//About.jsx
//og
export default function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>AI Supply Chain Risk Radar</h1>
        <h4>Powerd By Cerebras, Meta and Docker</h4>
        <p>
          Predicting disruptions before they happen with real-time AI-powered intelligence
        </p>
      </div>

      <div className="about-section">
        <h2>🎯 Our Mission</h2>
        <p>
          Supply Chain Risk Radar revolutionizes how companies manage supply chain disruptions. 
          We don't wait for shipments to fail — we predict, score, and guide you before disaster 
          strikes. Our AI-powered system monitors thousands of global and local signals in real-time, 
          providing actionable insights that keep your operations running smoothly.
        </p>
      </div>

      <div className="about-section">
        <h2>🚀 Core Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>🌍 Real-Time Monitoring</h4>
            <p>
              Continuous monitoring of news, weather, social media, and IoT sensor data from 
              around the globe. Our system ingests multilingual sources to catch disruptions 
              in any language.
            </p>
          </div>
          
          <div className="feature-card">
            <h4>🤖 AI Risk Scoring</h4>
            <p>
              Advanced LLaMA-powered AI engine summarizes events and assigns risk scores 
              (HIGH/MEDIUM/LOW) to suppliers, routes, and shipments with unprecedented accuracy.
            </p>
          </div>
          
          <div className="feature-card">
            <h4>📊 Interactive Dashboard</h4>
            <p>
              Beautiful, intuitive visualization with color-coded risk heatmaps, live event 
              feeds, and suggested mitigation actions. See your entire supply network at a glance.
            </p>
          </div>
          
          <div className="feature-card">
            <h4>⚡ Instant Alerts</h4>
            <p>
              Receive real-time notifications the moment a high-risk event is detected. 
              Stay ahead of disruptions with proactive warnings and recommendations.
            </p>
          </div>
          
          <div className="feature-card">
            <h4>🐳 Dockerized Architecture</h4>
            <p>
              Built with modern microservices architecture. Easy deployment per warehouse, 
              factory, or enterprise. Scale effortlessly as your operations grow.
            </p>
          </div>
          
          <div className="feature-card">
            <h4>🎯 Smart Recommendations</h4>
            <p>
              AI-generated mitigation strategies including alternate suppliers, rerouting 
              suggestions, and risk prevention measures tailored to your specific situation.
            </p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>💡 The Problem We Solve</h2>
        <p>
          Supply chains are fragile and unpredictable. Disruptions from weather events, strikes, 
          port closures, geopolitical issues, or natural disasters cause delays and massive financial 
          loss. Traditional tools either track shipments after the fact (providing late alerts) or are 
          expensive enterprise SaaS solutions that are difficult to deploy and customize.
        </p>
        <p style={{ marginTop: '12px' }}>
          Small and medium enterprises especially cannot monitor thousands of data sources in real-time. 
          They need an affordable, intelligent solution that predicts problems before they occur — and 
          that's exactly what we provide.
        </p>
      </div>

      <div className="about-section">
        <h2>🏆 Competitive Advantages</h2>
        <div style={{ 
          display: 'grid', 
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{
            padding: '20px',
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <h4 style={{ 
              color: '#06b6d4', 
              marginBottom: '10px',
              fontSize: '16px'
            }}>
              ⚡ Real-Time Prediction vs Post-Event Tracking
            </h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94a3b8' }}>
              Unlike competitors like Everstream, Interos, and Resilinc that mostly track events 
              after they occur, we predict disruptions before they impact your operations.
            </p>
          </div>
          
          
          
          <div style={{
            padding: '20px',
            background: 'rgba(14, 165, 233, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}>
            <h4 style={{ 
              color: '#0ea5e9', 
              marginBottom: '10px',
              fontSize: '16px'
            }}>
              💰 SME-Friendly Pricing
            </h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94a3b8' }}>
              Dockerized microservices architecture means flexible, affordable deployment. 
              No expensive enterprise licensing or complex integration required.
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <h4 style={{ 
              color: '#f59e0b', 
              marginBottom: '10px',
              fontSize: '16px'
            }}>
              🚀 Fast Processing with Cerebras
            </h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94a3b8' }}>
              Cerebras chip acceleration enables real-time inference at unprecedented speeds. 
              Process thousands of events per second without latency.
            </p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>🛠️ Technology Stack</h2>
        <p>
          Built with cutting-edge technologies including React for the frontend, Cerebras for AI 
          summarization and risk scoring,  accelerated inference, and Docker for 
          containerized microservices. Our architecture is designed for scalability, reliability, 
          and ease of deployment.
        </p>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '24px',
          marginBottom: '15px',
          color: '#06b6d4'
        }}>
          Connect With US Titan Team
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          marginBottom: '20px'
        }}>
          Join the future of predictive supply chain management
        </p>
        <button style={{
          padding: '12px 30px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 30px rgba(6, 182, 212, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 20px rgba(6, 182, 212, 0.3)';
        }}>
          Connect
        </button>
      </div>
    </div>
  );
}