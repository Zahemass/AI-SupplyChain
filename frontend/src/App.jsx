import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Benchmark from "./pages/Benchmark";
import "./index.css";

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ Dynamically choose backend URL
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

  useEffect(() => {
    // Responsive sidebar behavior
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1023) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔄 Fetching data from backend:", BASE_URL || "(using proxy)");

        // ✅ Use full backend URL if defined; else fallback to proxy
        const suppliersRes = await fetch(`${BASE_URL}/api/suppliers`);
        const risksRes = await fetch(`${BASE_URL}/api/risk`);

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
  }, [BASE_URL]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const isMobile = windowWidth <= 1023;

  console.log("📤 Passing props → suppliers:", suppliers.length, "risks:", risks.length);

  return (
    <Router>
      <div className="app-container">
        {/* Mobile Menu Overlay */}
        {isMobile && (
          <div
            className={`mobile-menu-overlay ${sidebarOpen ? "active" : ""}`}
            onClick={closeSidebar}
          />
        )}

        <Navbar
          suppliers={suppliers}
          risks={risks}
          loading={loading}
          onMenuClick={toggleSidebar}
          isMobile={isMobile}
        />

        <Sidebar
          suppliers={suppliers}
          risks={risks}
          loading={loading}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />

        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  suppliers={suppliers}
                  risks={risks}
                  loading={loading}
                />
              }
            />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
