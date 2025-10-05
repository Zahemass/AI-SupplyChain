import { useState, useEffect } from "react";
import RiskMap from "../components/RiskMap";
import RiskPanel from "../components/RiskPanel";
import Feed from "../components/Feed";
import SupplierPanel from "../components/SupplierPanel";
import SupplierDetailPanel from "../components/SupplierDetailPanel";

export default function Dashboard({ suppliers = [], risks = [], news = [], loading }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [weatherData, setWeatherData] = useState([]); // ✅ Weather state
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 767;
  const isTablet = windowWidth <= 1023 && windowWidth > 767;

  // ✅ Fetch weather data from backend
  useEffect(() => {
    async function fetchWeather() {
      try {
        setWeatherLoading(true);
        const res = await fetch("http://localhost:4000/api/weather");
        if (!res.ok) throw new Error("Weather API failed");
        const data = await res.json();

        // Backend might return a single object or array → normalize
        const weatherArray = Array.isArray(data) ? data : [data];
        setWeatherData(weatherArray.filter(Boolean));
      } catch (err) {
        console.error("❌ Weather fetch error:", err.message);
        setWeatherData([]);
      } finally {
        setWeatherLoading(false);
      }
    }

    fetchWeather();
  }, []);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: isMobile ? "15px" : "25px",
          animation: "fadeInUp 0.6s ease",
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? "24px" : isTablet ? "28px" : "32px",
            fontWeight: "700",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Supply Chain Dashboard
        </h1>
        <p
          style={{
            fontSize: isMobile ? "13px" : "15px",
            color: "#94a3b8",
          }}
        >
          Real-time monitoring and AI-powered risk analysis
          {!isMobile && " across your global supply network"}
        </p>
      </div>

      <div className="dashboard" style={{ position: "relative" }}>
        {/* Left side (supplier detail + map + feed) */}
        <div className="dashboard-left">
          {/* Supplier Detail Panel */}
          <div
            style={{
              marginBottom: isMobile ? "15px" : "20px",
              animation: "fadeInUp 0.6s ease",
            }}
          >
            <SupplierDetailPanel supplier={selectedSupplier} risks={risks} />
          </div>

          <RiskMap
            suppliers={suppliers}
            risks={risks}
            loading={loading}
            onSelectSupplier={(supplierIdOrObj) => {
              if (typeof supplierIdOrObj === "string") {
                const foundSupplier = suppliers.find((s) => s.id === supplierIdOrObj);
                setSelectedSupplier(foundSupplier);
              } else if (supplierIdOrObj?.linked_supplier_ids) {
                const linkedId = supplierIdOrObj.linked_supplier_ids[0];
                const foundSupplier = suppliers.find((s) => s.id === linkedId);
                setSelectedSupplier(foundSupplier);
              } else {
                setSelectedSupplier(supplierIdOrObj);
              }
            }}
          />

          <Feed news={news} loading={loading} />

          {/* 🌦️ Weather Widget */}
          <div className="card" style={{ animationDelay: "0.2s" }}>
            <h3>🌤️ Weather Alerts</h3>
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "15px",
              }}
            >
              Current weather conditions impacting supply routes
            </div>

            {weatherLoading && (
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                Loading weather data...
              </div>
            )}

            {!weatherLoading && weatherData.length === 0 && (
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                No weather alerts found.
              </div>
            )}

            {!weatherLoading &&
              weatherData.map((w, i) => (
                <div
                  key={w.id || i}
                  style={{
                    padding: "12px",
                    background:
                      w.severity === "severe"
                        ? "rgba(239, 68, 68, 0.1)"
                        : w.severity === "high"
                        ? "rgba(245, 158, 11, 0.1)"
                        : "rgba(16, 185, 129, 0.1)",
                    borderRadius: "8px",
                    border:
                      w.severity === "severe"
                        ? "1px solid rgba(239, 68, 68, 0.2)"
                        : w.severity === "high"
                        ? "1px solid rgba(245, 158, 11, 0.2)"
                        : "1px solid rgba(16, 185, 129, 0.2)",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>
                      {w.event_type.includes("Rain") && "🌧️"}
                      {w.event_type.includes("Storm") && "🌪️"}
                      {w.event_type.includes("Snow") && "❄️"}
                      {w.event_type.includes("Heat") && "☀️"}
                      {!["Rain", "Storm", "Snow", "Heat"].some(t => w.event_type.includes(t)) && "🌤️"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color:
                            w.severity === "severe"
                              ? "#ef4444"
                              : w.severity === "high"
                              ? "#f59e0b"
                              : "#10b981",
                        }}
                      >
                        {w.event_type} ({w.severity.toUpperCase()})
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {w.location} – {w.impact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right side - desktop only */}
        {!isMobile && !isTablet && (
          <div className="dashboard-right">
            {selectedSupplier && (
              <div
                style={{
                  marginBottom: "20px",
                  animation: "fadeInUp 0.6s ease",
                }}
              >
                <SupplierPanel
                  supplier={selectedSupplier}
                  risks={risks}
                  onClose={() => setSelectedSupplier(null)}
                />
              </div>
            )}
            <RiskPanel suppliers={suppliers} risks={risks} loading={loading} />
          </div>
        )}

        {/* Mobile/Tablet only - show below */}
        {(isMobile || isTablet) && (
          <>
            {selectedSupplier && (
              <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                <SupplierPanel
                  supplier={selectedSupplier}
                  risks={risks}
                  onClose={() => setSelectedSupplier(null)}
                />
              </div>
            )}
            <div style={{ marginTop: "15px" }}>
              <RiskPanel suppliers={suppliers} risks={risks} loading={loading} />
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
