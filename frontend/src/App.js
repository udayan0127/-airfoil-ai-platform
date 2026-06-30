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
            <h2>📊 Recommended Airfoils</h2>
            <div className="specs">
              <p><strong>Weight:</strong> {result.weight_g}g</p>
              <p><strong>Max Speed:</strong> {result.max_speed_kmh} km/h</p>
              <p><strong>Payload:</strong> {result.payload_g}g</p>
            </div>

            <div className="airfoils">
              {result.airfoils.map((airfoil, idx) => (
                <div key={idx} className="airfoil-card">
                  <h3>{airfoil.name}</h3>
                  <p>{airfoil.description}</p>
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
