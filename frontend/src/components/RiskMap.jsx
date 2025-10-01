import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function RiskMap() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/suppliers.json")
      .then((res) => res.json())
      .then((data) => {
        setSuppliers(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
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
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading map data...
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
        <h3 style={{ margin: 0 }}>🗺️ Global Risk Map</h3>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginTop: '12px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#ef4444' }}>●</span> High Risk
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#f59e0b' }}>●</span> Medium Risk
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#10b981' }}>●</span> Low Risk
          </span>
        </div>
      </div>
      
      <div className="map-container" style={{ height: '450px' }}>
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ 
            height: "100%", 
            width: "100%",
            background: '#0f172a'
          }}
          zoomControl={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          {suppliers.map((supplier, idx) => (
            <CircleMarker
              key={idx}
              center={[supplier.lat, supplier.lng]}
              radius={12}
              pathOptions={{
                fillColor: getColor(supplier.risk),
                color: getColor(supplier.risk),
                weight: 3,
                opacity: 1,
                fillOpacity: 0.6
              }}
            >
              <Popup>
                <div style={{ 
                  padding: '8px',
                  minWidth: '200px'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {getRiskIcon(supplier.risk)} {supplier.name}
                  </div>
                  <div style={{ 
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '4px'
                  }}>
                    <strong>Location:</strong> {supplier.location}
                  </div>
                  <div style={{ 
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}>
                    <strong>Risk Level:</strong> 
                    <span style={{ 
                      color: getColor(supplier.risk),
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {supplier.risk}
                    </span>
                  </div>
                  {supplier.reason && (
                    <div style={{ 
                      fontSize: '12px',
                      color: '#64748b',
                      fontStyle: 'italic',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      {supplier.reason}
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