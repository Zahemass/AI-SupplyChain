import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import './index.css';

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔄 Fetching data from backend...");

        // ✅ Do requests separately so we can log raw responses
        const suppliersRes = await fetch("/api/suppliers");
        const risksRes = await fetch("/api/risk");

        console.log("📦 Raw /api/suppliers response:", suppliersRes);
        console.log("📦 Raw /api/risk response:", risksRes);

        const suppliersJson = suppliersRes.ok ? await suppliersRes.json() : [];
        const risksJson = risksRes.ok ? await risksRes.json() : [];

        console.log("✅ /api/suppliers parsed:", suppliersJson.length, "items");
        console.log("✅ /api/risk parsed:", risksJson.length, "items");

        if (risksJson.length > 0) {
          console.log("⚡ First risk item sample:", risksJson[0]);
        } else {
          console.warn("⚠️ No risks returned from /api/risk");
        }

        setSuppliers(suppliersJson);
        setRisks(risksJson);
      } catch (err) {
        console.error("❌ App data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000); // 🔄 refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* ✅ Pass suppliers & risks & loading as props */}
        <Navbar suppliers={suppliers} risks={risks} loading={loading} />
        <Sidebar suppliers={suppliers} risks={risks} loading={loading} />
        
        <div className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard suppliers={suppliers} risks={risks} loading={loading} />} 
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
