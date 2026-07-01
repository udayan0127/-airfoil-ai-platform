import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [weight, setWeight] = useState("");
  const [speed, setSpeed] = useState("");
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8000/recommend-airfoil?weight=${weight}&max_speed=${speed}&payload=${payload}`
      );
      setResult(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🛩️ Airfoil AI Platform</h1>
        <p>Intelligent aerodynamic design powered by AI</p>
      </header>

      <main className="container">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Drone Weight (grams)</label>
            <input
              type="number"
              placeholder="e.g., 990"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Max Speed (km/h)</label>
            <input
              type="number"
              placeholder="e.g., 40"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Payload (grams)</label>
            <input
              type="number"
              placeholder="e.g., 100"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Analyzing..." : "Get Airfoil Recommendation"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="results">
            <div className="specs">
              <p><strong>Weight:</strong> {result.input.weight_g}g</p>
              <p><strong>Max Speed:</strong> {result.input.max_speed_kmh} km/h</p>
              <p><strong>Payload:</strong> {result.input.payload_g}g</p>
            </div>

            <h2>🔬 Aerodynamic Analysis</h2>
            <div className="physics-grid">
              <div className="physics-card">
                <div className="physics-label">Reynolds Number</div>
                <div className="physics-value">{result.physics.reynolds_number.toLocaleString()}</div>
              </div>
              <div className="physics-card">
                <div className="physics-label">Required Cl</div>
                <div className="physics-value">{result.physics.required_cl}</div>
              </div>
              <div className="physics-card">
                <div className="physics-label">Wing Loading</div>
                <div className="physics-value">{result.physics.wing_loading_n_m2} N/m²</div>
              </div>
              <div className="physics-card">
                <div className="physics-label">Flight Regime</div>
                <div className="physics-value">{result.physics.flight_regime}</div>
              </div>
              <div className="physics-card">
                <div className="physics-label">Est. Wing Area</div>
                <div className="physics-value">{result.physics.estimated_wing_area_m2} m²</div>
              </div>
              <div className="physics-card">
                <div className="physics-label">Est. Chord Length</div>
                <div className="physics-value">{result.physics.estimated_chord_m} m</div>
              </div>
            </div>

            <h2>📊 Recommended Airfoils</h2>
            <div className="airfoils">
              {result.airfoils.map((airfoil, idx) => (
                <div key={idx} className="airfoil-card">
                  <div className="airfoil-header">
                    <h3>{airfoil.name}</h3>
                    <span className="match-score">Score: {airfoil.match_score}</span>
                  </div>
                  <p className="airfoil-desc">{airfoil.description}</p>

                  <div className="ai-explanation">
                    <span className="ai-badge">🤖 AI Analysis</span>
                    <p>{airfoil.ai_explanation}</p>
                  </div>

                  <div className="airfoil-stats">
                    <div className="stat">
                      <span className="stat-label">Cl max</span>
                      <span className="stat-value">{airfoil.cl_max}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Cd min</span>
                      <span className="stat-value">{airfoil.cd_min}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Best L/D</span>
                      <span className="stat-value">{airfoil.best_cl_cd}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Use case</span>
                      <span className="stat-value">{airfoil.use_case}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="recommendation">
              <p>{result.recommendation}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
