import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";
import TabNav from "./components/TabNav";
import InputForm from "./components/InputForm";
import PhysicsPanel from "./components/PhysicsPanel";
import AirfoilCards from "./components/AirfoilCards";
import AirfoilViewer3D from "./components/AirfoilViewer3D";
import PolarPlot from "./components/PolarPlot";
import ComparisonMode from "./components/ComparisonMode";
import ReynoldsSweep from "./components/ReynoldsSweep";
function App() {
  const [weight, setWeight] = useState("");
  const [speed, setSpeed] = useState("");
  const [payload, setPayload] = useState("");
  const [wingspan, setWingspan] = useState(1.01);
  const [aspectRatio, setAspectRatio] = useState(5.18);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("input");
  const fetchRecommendation = useCallback(async () => {
    if (!weight || !speed || payload === "" || payload === null) return;
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/recommend-airfoil?weight=${weight}&max_speed=${speed}&payload=${payload}&wingspan=${wingspan}&aspect_ratio=${aspectRatio}`
      );
      setResult(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    }
    setLoading(false);
  }, [weight, speed, payload, wingspan, aspectRatio]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchRecommendation();
  };
  useEffect(() => {
    if (!weight || !speed || payload === "" || payload === null) return;
    const timer = setTimeout(() => {
      fetchRecommendation();
    }, 400);
    return () => clearTimeout(timer);
  }, [weight, speed, payload, wingspan, aspectRatio, fetchRecommendation]);
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
          {activeTab === "input" && (
            <>
              <InputForm
                weight={weight} setWeight={setWeight}
                speed={speed} setSpeed={setSpeed}
                payload={payload} setPayload={setPayload}
                wingspan={wingspan} setWingspan={setWingspan}
                aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
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
          {activeTab === "3d" && result && (
            <AirfoilViewer3D airfoils={result.airfoils} />
          )}
          {activeTab === "polar" && result && (
            <PolarPlot airfoils={result.airfoils} />
          )}
          {activeTab === "compare" && result && (
            <ComparisonMode airfoils={result.airfoils} />
          )}
          {activeTab === "sweep" && result && (
            <ReynoldsSweep airfoils={result.airfoils} />
          )}
        </div>
      </main>
    </div>
  );
}
export default App;