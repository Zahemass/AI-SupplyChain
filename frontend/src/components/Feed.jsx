import { useEffect, useState } from "react";

export default function Feed({ news = [], loading: propLoading }) {
  const [localNews, setLocalNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // ✅ Works both in dev (proxy) and Docker (env var)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

  // Auto refresh interval
  const REFRESH_INTERVAL = 30000; // 30s

  // ✅ Fetch News from backend
  const fetchNews = async () => {
    try {
      console.log("🔄 Fetching news from:", `${BASE_URL}/api/news`);
      const res = await fetch(`${BASE_URL}/api/news`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLocalNews(data);
    } catch (err) {
      console.error("❌ News API fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If data passed via props, use that
    if (news?.length > 0) {
      setLocalNews(news);
      setLoading(false);
    } else if (!propLoading) {
      fetchNews();
    }

    // Auto-refresh every 30s
    const interval = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [news, propLoading]);

  // ✅ Risk classification
  const getRiskLevel = (item) => {
    if (item.risk_level) return item.risk_level;

    const text = (item.title || item.headline || "").toLowerCase();
    if (
      text.includes("strike") ||
      text.includes("shutdown") ||
      text.includes("disaster") ||
      text.includes("critical") ||
      text.includes("severe")
    )
      return "HIGH";
    if (
      text.includes("delay") ||
      text.includes("warning") ||
      text.includes("concern") ||
      text.includes("disruption")
    )
      return "MEDIUM";
    return "LOW";
  };

  // ✅ Friendly time ago
  const getTimeAgo = (timestamp, index) => {
    if (timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    }

    const fallback = ["2m ago", "15m ago", "1h ago", "3h ago", "5h ago"];
    return fallback[index % fallback.length];
  };

  // ✅ Filter logic
  const filteredNews =
    filter === "all"
      ? localNews
      : localNews.filter(
          (n) => getRiskLevel(n) === filter.toUpperCase()
        );

  // ✅ Loading state
  if (loading || propLoading) {
    return (
      <div className="card">
        <h3>📰 Live Feed</h3>
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading news...
        </div>
      </div>
    );
  }

  // ✅ Main render
  return (
    <div className="card">
      {/* Header + Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: 0 }}>📰 Live Feed</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "high", "medium"].map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border:
                  filter === level
                    ? `1px solid ${
                        level === "high"
                          ? "#ef4444"
                          : level === "medium"
                          ? "#f59e0b"
                          : "#06b6d4"
                      }`
                    : "1px solid rgba(148, 163, 184, 0.2)",
                background:
                  filter === level
                    ? `rgba(${
                        level === "high"
                          ? "239, 68, 68"
                          : level === "medium"
                          ? "245, 158, 11"
                          : "6, 182, 212"
                      }, 0.2)`
                    : "transparent",
                color:
                  filter === level
                    ? level === "high"
                      ? "#ef4444"
                      : level === "medium"
                      ? "#f59e0b"
                      : "#06b6d4"
                    : "#94a3b8",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div
        style={{
          maxHeight: "350px",
          overflowY: "auto",
          paddingRight: "5px",
        }}
      >
        {filteredNews.length > 0 ? (
          filteredNews.slice(0, 20).map((item, idx) => {
            const riskLevel = getRiskLevel(item);
            return (
              <div
                key={item.id || idx}
                className="feed-item"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  borderLeft: "4px solid",
                  borderLeftColor:
                    riskLevel === "HIGH"
                      ? "#ef4444"
                      : riskLevel === "MEDIUM"
                      ? "#f59e0b"
                      : "#10b981",
                  paddingLeft: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "6px",
                  }}
                >
                  <b style={{ flex: 1 }}>
                    {item.title || item.headline || "Untitled Event"}
                  </b>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color:
                        riskLevel === "HIGH"
                          ? "#ef4444"
                          : riskLevel === "MEDIUM"
                          ? "#f59e0b"
                          : "#10b981",
                    }}
                  >
                    {riskLevel}
                  </span>
                </div>

                <p style={{ margin: "6px 0", fontSize: "13px" }}>
                  {item.description || item.summary || "No description available"}
                </p>

                {item.location && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "4px",
                    }}
                  >
                    📍 {item.location}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  <span>🕒 {getTimeAgo(item.date || item.created_at, idx)}</span>
                  {(item.source?.name || item.source) && (
                    <span style={{ color: "#06b6d4", fontWeight: "500" }}>
                      {item.source?.name || item.source}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            No news found for this filter
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "15px",
          padding: "12px",
          background: "rgba(6, 182, 212, 0.1)",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#06b6d4",
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        🔄 Auto-refreshing every 30 seconds
      </div>
    </div>
  );
}
