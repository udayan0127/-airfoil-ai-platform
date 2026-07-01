import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";
import TabNav from "./components/TabNav";
import InputForm from "./components/InputForm";
import PhysicsPanel from "./components/PhysicsPanel";
import AirfoilCards from "./components/AirfoilCards";
import AirfoilViewer3D from "./components/AirfoilViewer3D";
import PolarPlot from "./components/PolarPlot";

function App() {
  const [weight, setWeight] = useState("");
  const [speed, setSpeed] = useState("");
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("input");

  // Fetch recommendation from backend
  const fetchRecommendation = useCallback(async () => {
    if (!weight || !speed || payload === "" || payload === null) return;

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
  }, [weight, speed, payload]);

  // Form submit handler (for button click / Enter key)
  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchRecommendation();
  };

  // Debounced auto-submit: wait 400ms after user stops changing values, then fetch
  useEffect(() => {
    if (!weight || !speed || payload === "" || payload === null) return;

    const timer = setTimeout(() => {
      fetchRecommendation();
    }, 400);

    return () => clearTimeout(timer);
  }, [weight, speed, payload, fetchRecommendation]);

  const hasResults = result !== null;

  return (
    <div className="App">
      <header className="header">
        <h1>🛩️ Airfoil AI Platform</h1>
        <p>Intelligent aerodynamic design powered by AI</p>
      </header>

      <main className="container">
        <TabNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasResults={hasResults}
        />

        <div className="tab-content">
          {/* TAB: INPUT & ANALYSIS */}
          {activeTab === "input" && (
            <>
              <InputForm
                weight={weight} setWeight={setWeight}
                speed={speed} setSpeed={setSpeed}
                payload={payload} setPayload={setPayload}
                onSubmit={handleSubmit}
                loading={loading}
                liveUpdate={loading}
              />

              {error && <div className="error">{error}</div>}

              {result && (
                <div className="results">
                  <PhysicsPanel input={result.input} physics={result.physics} />
                  <AirfoilCards airfoils={result.airfoils} recommendation={result.recommendation} />
                </div>
              )}
            </>
          )}

          {/* TAB: 3D VIEWER */}
          {activeTab === "3d" && result && (
            <AirfoilViewer3D airfoils={result.airfoils} />
          )}

          {/* TAB: DRAG POLAR */}
          {activeTab === "polar" && result && (
            <PolarPlot airfoils={result.airfoils} />
          )}

          {/* TAB: COMPARE */}
          {activeTab === "compare" && (
            <div className="empty-state">
              <h3>⚖️ Airfoil Comparison</h3>
              <p>Coming next</p>
            </div>
          )}

          {/* TAB: RE SWEEP */}
          {activeTab === "sweep" && (
            <div className="empty-state">
              <h3>🌀 Reynolds Number Sweep</h3>
              <p>Coming next</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
