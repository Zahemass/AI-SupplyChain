// Benchmark.jsx
import { useState } from "react";
import axios from "axios";

export default function Benchmark() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runBenchmark = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post("http://localhost:4000/api/benchmark", {
        sampleSize: 3,
        taskType: "risk_analysis",
      });
      setResult(res.data.benchmark);
    } catch (err) {
      setError("Failed to fetch benchmark data. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="benchmark-container">
      <h2>⚡ Benchmark Comparison</h2>
      <p style={{ color: "#6b7280" }}>
        Compare AI performance for <b>Supply Chain Risk Analysis</b>
      </p>

      <button
        onClick={runBenchmark}
        disabled={loading}
        className="benchmark-btn"
      >
        {loading ? "Running Benchmark..." : "Run Benchmark Test"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="benchmark-result">
          <section className="summary-section">
            <h3>📋 Executive Summary</h3>
            <p><b>Claim:</b> {result.executive_summary.claim}</p>
            <p><b>Impact:</b> {result.executive_summary.impact}</p>
            <p><b>Cost Benefit:</b> {result.executive_summary.cost_benefit}</p>
          </section>

          <section className="results-section">
            <h3>⚙️ Model Results</h3>
            <div className="results-grid">
              <div className="card">
                <h4>{result.results.cerebras.provider}</h4>
                <p><b>Model:</b> {result.results.cerebras.model}</p>
                <p><b>Time/Event:</b> {result.results.cerebras.avg_time_per_event_ms} ms</p>
                <p><b>Cost/Event:</b> {result.results.cerebras.cost_per_event}</p>
              </div>
              <div className="card">
                <h4>{result.results.openai.provider}</h4>
                <p><b>Model:</b> {result.results.openai.model}</p>
                <p><b>Time/Event:</b> {result.results.openai.avg_time_per_event_ms} ms</p>
                <p><b>Cost/Event:</b> {result.results.openai.cost_per_event}</p>
              </div>
            </div>
          </section>

          <section className="comparison-section">
            <h3>🏁 Comparison Summary</h3>
            <div className="comparison-cards">
              <div className="compare-card">
                <h4>Speed</h4>
                <p><b>Winner:</b> {result.comparison.speed.winner}</p>
                <p><b>Advantage:</b> {result.comparison.speed.advantage}</p>
                <p><b>Faster by:</b> {result.comparison.speed.time_saved_per_event}</p>
              </div>
              <div className="compare-card">
                <h4>Cost</h4>
                <p><b>Winner:</b> {result.comparison.cost.winner}</p>
                <p><b>Advantage:</b> {result.comparison.cost.advantage}</p>
                <p><b>Savings/Event:</b> {result.comparison.cost.savings_per_event}</p>
              </div>
            </div>
          </section>

          <section className="impact-section">
            <h3>💼 Business Impact</h3>
            <table className="impact-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Total Time</th>
                  <th>Total Cost</th>
                  <th>Decision Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cerebras</td>
                  <td>{result.business_impact.cerebras.total_time}</td>
                  <td>{result.business_impact.cerebras.total_cost}</td>
                  <td>{result.business_impact.cerebras.decision_speed}</td>
                </tr>
                <tr>
                  <td>OpenAI</td>
                  <td>{result.business_impact.openai.total_time}</td>
                  <td>{result.business_impact.openai.total_cost}</td>
                  <td>{result.business_impact.openai.decision_speed}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="sample-output">
            <h3>🧠 Sample Output</h3>
            {result.sample_outputs.map((s, i) => (
              <div key={i} className="output-card">
                <p><b>Event:</b> {s.event}</p>
                <p><b>Cerebras:</b> {s.cerebras_output}</p>
                <p><b>OpenAI:</b> {s.openai_output}</p>
              </div>
            ))}
          </section>
        </div>
      )}

      <style jsx>{`
        .benchmark-container {
          padding: 20px;
          max-width: 900px;
          margin: auto;
        }
        h2 {
          font-size: 1.8rem;
          color: #0ea5e9;
          margin-bottom: 5px;
        }
        .benchmark-btn {
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin: 20px 0;
          font-weight: 600;
        }
        .benchmark-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .card {
          background: #09233eff;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .comparison-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .compare-card {
          background: #082746ff;
          border-left: 4px solid #06b6d4;
          padding: 15px;
          border-radius: 8px;
        }
        .impact-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .impact-table th, .impact-table td {
          padding: 10px;
          border: 1px solid #e5e7eb;
          text-align: center;
        }
        .output-card {
          background: #0b1825ff;
          padding: 10px;
          border-radius: 8px;
          margin-top: 10px;
        }
        .error-text {
          color: red;
          margin-top: 10px;
        }
        @media (max-width: 600px) {
          .benchmark-container {
            padding: 15px;
          }
          h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
