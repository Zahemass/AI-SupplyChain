import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

export default function RiskMap({ risks = [], suppliers = [], loading, onSelectSupplier }) {
  const [mapHeight, setMapHeight] = useState('500px');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setMapHeight('300px');
      } else if (window.innerWidth <= 767) {
        setMapHeight('350px');
      } else if (window.innerWidth <= 1023) {
        setMapHeight('400px');
      } else {
        setMapHeight('450px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getColor = (risk) => {
    if (risk === "HIGH") return "#ef4444";
    if (risk === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  const getRiskIcon = (risk) => {
    if (risk === "HIGH") return "🔴";
    if (risk === "MEDIUM") return "🟡";
    return "🟢";
  };

  if (loading) {
    return (
      <div className="card">
        <h3>🗺️ Global Risk Map</h3>
        <div className="loading" style={{ height: mapHeight, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="loading-spinner"></div>
          Loading map data...
        </div>
      </div>
    );
  }

  // Combine risks and suppliers for map display
  const mapMarkers = [
    ...risks.filter(r => r.lat && r.lng),
    ...suppliers.filter(s => s.lat && s.lng).map(s => ({
      ...s,
      risk_level: s.current_risk_level || s.risk_level || "LOW",
      headline: s.supplier_name || s.name,
      summary: `${s.product || 'Products'} - ${s.category || 'General'}`
    }))
  ];

  return (
    <div 
      className="card" 
      style={{ 
        padding: "0", 
        overflow: "hidden",
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03)"
      }}
    >
      <div
        style={{
          padding: window.innerWidth <= 767 ? "16px 20px" : "20px 25px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
          background: "linear-gradient(to bottom, rgba(6, 182, 212, 0.05), transparent)"
        }}
      >
        <h3 
          style={{ 
            margin: 0,
            fontSize: window.innerWidth <= 767 ? "16px" : "18px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          🗺️ Global Risk Map
        </h3>
        <div
          style={{
            display: "flex",
            gap: window.innerWidth <= 767 ? "10px" : "15px",
            marginTop: window.innerWidth <= 767 ? "10px" : "12px",
            fontSize: window.innerWidth <= 767 ? "11px" : "12px",
            color: "#94a3b8",
            flexWrap: "wrap"
          }}
        >
          <span style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            padding: window.innerWidth <= 767 ? "3px 8px" : "4px 10px",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "6px",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            <span style={{ color: "#ef4444", fontSize: window.innerWidth <= 767 ? "12px" : "14px" }}>●</span> High Risk
          </span>
          <span style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            padding: window.innerWidth <= 767 ? "3px 8px" : "4px 10px",
            background: "rgba(245, 158, 11, 0.1)",
            borderRadius: "6px",
            border: "1px solid rgba(245, 158, 11, 0.2)"
          }}>
            <span style={{ color: "#f59e0b", fontSize: window.innerWidth <= 767 ? "12px" : "14px" }}>●</span> Medium Risk
          </span>
          <span style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            padding: window.innerWidth <= 767 ? "3px 8px" : "4px 10px",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: "6px",
            border: "1px solid rgba(16, 185, 129, 0.2)"
          }}>
            <span style={{ color: "#10b981", fontSize: window.innerWidth <= 767 ? "12px" : "14px" }}>●</span> Low Risk
          </span>
        </div>
      </div>

      <div className="map-container" style={{ height: mapHeight, position: "relative" }}>
        <MapContainer
          center={[20, 0]}
          zoom={window.innerWidth <= 767 ? 1 : 2}
          style={{
            height: "100%",
            width: "100%",
            background: "#0f172a",
          }}
          zoomControl={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          {mapMarkers.map((item, idx) => (
            <CircleMarker
              key={item.id || idx}
              center={[item.lat, item.lng]}
              radius={window.innerWidth <= 767 ? 10 : 12}
              pathOptions={{
                fillColor: getColor(item.risk_level),
                color: getColor(item.risk_level),
                weight: window.innerWidth <= 767 ? 2 : 3,
                opacity: 1,
                fillOpacity: 0.6,
              }}
              eventHandlers={{
                click: () => {
                  if (item.supplier_name || item.id?.startsWith('supplier_')) {
                    const supplier = suppliers.find(s => s.id === item.id) || item;
                    onSelectSupplier && onSelectSupplier(supplier);
                  } else if (item.linked_supplier_ids?.length > 0) {
                    const linkedSupplier = suppliers.find(s => 
                      s.id === item.linked_supplier_ids[0]
                    );
                    if (linkedSupplier) {
                      onSelectSupplier && onSelectSupplier(linkedSupplier);
                    }
                  }
                }
              }}
            >
              <Popup>
                <div style={{ 
                  padding: window.innerWidth <= 767 ? "6px" : "8px", 
                  minWidth: window.innerWidth <= 767 ? "150px" : "200px" 
                }}>
                  <div
                    style={{
                      fontSize: window.innerWidth <= 767 ? "14px" : "16px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {getRiskIcon(item.risk_level)}{" "}
                    {item.supplier_name || item.headline || item.name || "Unknown Event"}
                  </div>
                  <div
                    style={{
                      fontSize: window.innerWidth <= 767 ? "12px" : "13px",
                      color: "#64748b",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>Location:</strong> {item.location || "Global"}
                  </div>
                  <div style={{ fontSize: window.innerWidth <= 767 ? "12px" : "13px", marginBottom: "8px" }}>
                    <strong>Risk Level:</strong>
                    <span
                      style={{
                        color: getColor(item.risk_level),
                        fontWeight: "bold",
                        marginLeft: "5px",
                      }}
                    >
                      {item.risk_level}
                    </span>
                  </div>
                  {item.risk_score !== undefined && (
                    <div style={{ fontSize: window.innerWidth <= 767 ? "12px" : "13px", marginBottom: "8px" }}>
                      <strong>Risk Score:</strong> {item.risk_score}/100
                    </div>
                  )}
                  {item.summary && (
                    <div
                      style={{
                        fontSize: window.innerWidth <= 767 ? "11px" : "12px",
                        color: "#64748b",
                        fontStyle: "italic",
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      {item.summary}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}