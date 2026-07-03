import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function ReynoldsSweep({ airfoils }) {
  const [selectedAirfoil, setSelectedAirfoil] = useState(0);
  const [reIndex, setReIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const airfoil = airfoils[selectedAirfoil];
  const sweep = airfoil.reynolds_sweep.sweep;
  const current = sweep[reIndex];
  const totalPoints = sweep.length;

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setReIndex((prev) => {
          if (prev >= totalPoints - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, totalPoints]);

  const handlePlay = () => {
    if (reIndex >= totalPoints - 1) {
      setReIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setReIndex(0);
  };

  return (
    <div className="reynolds-sweep">
      <div className="sweep-header">
        <h2>🌀 Reynolds Number Sweep</h2>
        <p className="sweep-subtitle">Watch how airfoil performance changes with Reynolds number</p>
      </div>

      {/* Airfoil selector */}
      <div className="sweep-airfoil-selector">
        <label>Airfoil:</label>
        {airfoils.map((af, idx) => (
          <button
            key={af.name}
            className={`selector-btn ${selectedAirfoil === idx ? "active" : ""}`}
            onClick={() => {
              setSelectedAirfoil(idx);
              setReIndex(0);
              setIsPlaying(false);
            }}
          >
            {af.name}
          </button>
        ))}
      </div>

      {/* Current Reynolds display */}
      <div className="sweep-current">
        <div className="sweep-re-display">
          <span className="sweep-re-label">Current Re</span>
          <span className="sweep-re-value">{current.reynolds.toLocaleString()}</span>
        </div>
        <div className="sweep-metrics-inline">
          <div className="sweep-metric">
            <span className="sweep-metric-label">Cl max</span>
            <span className="sweep-metric-value">{current.cl_max}</span>
          </div>
          <div className="sweep-metric">
            <span className="sweep-metric-label">Cd min</span>
            <span className="sweep-metric-value">{current.cd_min.toFixed(5)}</span>
          </div>
          <div className="sweep-metric">
            <span className="sweep-metric-label">Best L/D</span>
            <span className="sweep-metric-value">{current.best_ld}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="sweep-controls">
        <button className="sweep-play-btn" onClick={handlePlay}>
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <button className="sweep-reset-btn" onClick={handleReset}>
          ↻ Reset
        </button>
        <input
          type="range"
          className="sweep-slider"
          min={0}
          max={totalPoints - 1}
          step={1}
          value={reIndex}
          onChange={(e) => {
            setReIndex(parseInt(e.target.value));
            setIsPlaying(false);
          }}
        />
        <div className="sweep-slider-labels">
          <span>Re {sweep[0].reynolds.toLocaleString()}</span>
          <span>Re {sweep[totalPoints - 1].reynolds.toLocaleString()}</span>
        </div>
      </div>

      {/* Animated chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={450}>
          <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
            <XAxis
              type="number"
              dataKey="cd"
              stroke="#888"
              label={{ value: "Cd (Drag)", position: "bottom", fill: "#00d9ff", offset: 20 }}
              domain={[0, 0.05]}
              tickFormatter={(v) => v.toFixed(4)}
            />
            <YAxis
              type="number"
              dataKey="cl"
              stroke="#888"
              label={{ value: "Cl (Lift)", angle: -90, position: "left", fill: "#00d9ff", offset: 10 }}
              domain={[-0.5, 1.6]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 14, 30, 0.95)",
                border: "1px solid rgba(0, 217, 255, 0.3)",
                borderRadius: "8px"
              }}
              labelStyle={{ color: "#00d9ff" }}
              formatter={(value) => value.toFixed(4)}
            />
            <Line
              type="monotone"
              data={current.curve}
              dataKey="cl"
              stroke="#00d9ff"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation */}
      <div className="sweep-explanation">
        <p><strong>What you're seeing:</strong> As Reynolds number increases (larger aircraft or faster flight), airfoils generate more lift with less drag. The curve shifts <strong>left</strong> (lower drag) and <strong>up</strong> (higher max lift). This is why full-scale aircraft outperform small RC models — Reynolds number matters.</p>
      </div>
    </div>
  );
}

export default ReynoldsSweep;