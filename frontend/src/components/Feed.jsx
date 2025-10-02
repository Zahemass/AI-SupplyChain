import { useEffect, useState } from "react";

export default function Feed() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  useEffect(() => {
    let interval;
    async function loadNews() {
      try {
        const res = await fetch("/api/news"); // ✅ now from backend
        const data = await res.json();
        setNewsFeed(data);
      } catch (err) {
        console.error("News API fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNews(); // initial load
    interval = setInterval(loadNews, 30000); // 🔄 auto-refresh every 30s

    return () => clearInterval(interval);
  }, []);

  const getRiskLevel = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('strike') || lowerTitle.includes('shutdown') || 
        lowerTitle.includes('disaster') || lowerTitle.includes('critical')) {
      return 'HIGH';
    }
    if (lowerTitle.includes('delay') || lowerTitle.includes('warning') || 
        lowerTitle.includes('concern')) {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  const getTimeAgo = (index) => {
    const times = ['2m ago', '15m ago', '1h ago', '3h ago', '5h ago'];
    return times[index % times.length];
  };

  const filteredNews = filter === 'all' 
    ? newsFeed 
    : newsFeed.filter(n => getRiskLevel(n.title || n.headline) === filter.toUpperCase());

  if (loading) {
    return (
      <div className="card">
        <h3>📰 Live Feed</h3>
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0 }}>📰 Live Feed</h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: filter === 'all' ? '1px solid #06b6d4' : '1px solid rgba(148, 163, 184, 0.2)',
              background: filter === 'all' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: filter === 'all' ? '#06b6d4' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('high')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: filter === 'high' ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.2)',
              background: filter === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: filter === 'high' ? '#ef4444' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            High
          </button>
        </div>
      </div>
      
      <div style={{ 
        maxHeight: '350px', 
        overflowY: 'auto',
        paddingRight: '5px'
      }}>
        {filteredNews.map((news, idx) => {
          const riskLevel = getRiskLevel(news.title || news.headline);
          return (
            <div 
              key={idx}
              className="feed-item"
              style={{ 
                animationDelay: `${idx * 0.1}s`,
                borderLeftColor: 
                  riskLevel === 'HIGH' ? '#ef4444' : 
                  riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <b style={{ flex: 1 }}>{news.title || news.headline}</b>
                <span 
                  className={`risk-badge ${riskLevel.toLowerCase()}`}
                  style={{ marginLeft: '10px' }}
                >
                  {riskLevel}
                </span>
              </div>
              
              <p style={{ margin: '8px 0' }}>{news.summary || news.description}</p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px'
              }}>
                <span className="feed-timestamp">
                  🕒 {getTimeAgo(idx)}
                </span>
                {news.source?.name && (
                  <span style={{ 
                    fontSize: '11px', 
                    color: '#06b6d4',
                    fontWeight: '500'
                  }}>
                    {news.source.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredNews.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          No news items found for this filter
        </div>
      )}
      
      <div style={{
        marginTop: '15px',
        padding: '12px',
        background: 'rgba(6, 182, 212, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#06b6d4',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        🔄 Auto-refreshing every 30 seconds
      </div>
    </div>
  );
}
