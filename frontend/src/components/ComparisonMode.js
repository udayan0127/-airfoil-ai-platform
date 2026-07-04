import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function ComparisonMode({ airfoils }) {
  const [airfoilA, setAirfoilA] = useState(0);
  const [airfoilB, setAirfoilB] = useState(1);

  const A = airfoils[airfoilA];
  const B = airfoils[airfoilB];

  const isWinner = (metric, higherIsBetter = true) => {
    const valA = A[metric];
    const valB = B[metric];
    if (valA === valB) return { A: false, B: false };
    if (higherIsBetter) {
      return { A: valA > valB, B: valB > valA };
    } else {
      return { A: valA < valB, B: valB < valA };
    }
  };

  const clMaxWinner = isWinner("cl_max", true);
  const cdMinWinner = isWinner("cd_min", false);
  const ldWinner = isWinner("best_cl_cd", true);
  const scoreWinner = isWinner("match_score", true);

  return (
    <div className="comparison-mode">
      <div className="comparison-header">
        <h2>⚖️ Airfoil Comparison</h2>
        <p className="comparison-subtitle">Side-by-side performance analysis</p>
      </div>

      <div className="comparison-selectors">
        <div className="selector-group">
          <label>Airfoil A:</label>
          {airfoils.map((af, idx) => (
            <button
              key={`a-${idx}`}
              className={`selector-btn ${airfoilA === idx ? "active" : ""}`}
              onClick={() => setAirfoilA(idx)}
              disabled={airfoilB === idx}
            >
              {af.name}
            </button>
          ))}
        </div>
        <div className="selector-group">
          <label>Airfoil B:</label>
          {airfoils.map((af, idx) => (
            <button
              key={`b-${idx}`}
              className={`selector-btn ${airfoilB === idx ? "active" : ""}`}
              onClick={() => setAirfoilB(idx)}
              disabled={airfoilA === idx}
            >
              {af.name}
            </button>
          ))}
        </div>
      </div>

      <div className="comparison-grid">
        <div className="comparison-card comparison-card-a">
          <div className="comparison-card-header">
            <h3>{A.name}</h3>
            <span className="comparison-badge-a">A</span>
          </div>
          <p className="comparison-description">{A.description}</p>

          <div className="comparison-metrics">
            <div className={`metric-row ${scoreWinner.A ? "winner" : ""}`}>
              <span className="metric-label">Match Score</span>
              <span className="metric-value">{A.match_score}</span>
            </div>
            <div className={`metric-row ${clMaxWinner.A ? "winner" : ""}`}>
              <span className="metric-label">Cl max</span>
              <span className="metric-value">{A.cl_max}</span>
            </div>
            <div className={`metric-row ${cdMinWinner.A ? "winner" : ""}`}>
              <span className="metric-label">Cd min</span>
              <span className="metric-value">{A.cd_min}</span>
            </div>
            <div className={`metric-row ${ldWinner.A ? "winner" : ""}`}>
              <span className="metric-label">Best L/D</span>
              <span className="metric-value">{A.best_cl_cd}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Use Case</span>
              <span className="metric-value">{A.use_case}</span>
            </div>
          </div>
        </div>

        <div className="comparison-vs">VS</div>

        <div className="comparison-card comparison-card-b">
          <div className="comparison-card-header">
            <h3>{B.name}</h3>
            <span className="comparison-badge-b">B</span>
          </div>
          <p className="comparison-description">{B.description}</p>

          <div className="comparison-metrics">
            <div className={`metric-row ${scoreWinner.B ? "winner" : ""}`}>
              <span className="metric-label">Match Score</span>
              <span className="metric-value">{B.match_score}</span>
            </div>
            <div className={`metric-row ${clMaxWinner.B ? "winner" : ""}`}>
              <span className="metric-label">Cl max</span>
              <span className="metric-value">{B.cl_max}</span>
            </div>
            <div className={`metric-row ${cdMinWinner.B ? "winner" : ""}`}>
              <span className="metric-label">Cd min</span>
              <span className="metric-value">{B.cd_min}</span>
            </div>
            <div className={`metric-row ${ldWinner.B ? "winner" : ""}`}>
              <span className="metric-label">Best L/D</span>
              <span className="metric-value">{B.best_cl_cd}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Use Case</span>
              <span className="metric-value">{B.use_case}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="comparison-chart-section">
        <h3>Drag Polar Comparison</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
              <XAxis
                type="number"
                dataKey="cd"
                stroke="#888"
                label={{ value: "Cd (Drag)", position: "insideBottom", fill: "#00d9ff", offset: -5 }}
                domain={["auto", "auto"]}
                tickFormatter={(v) => v.toFixed(4)}
              />
              <YAxis
                type="number"
                dataKey="cl"
                stroke="#888"
                label={{ value: "Cl (Lift)", angle: -90, position: "left", fill: "#00d9ff", offset: 10 }}
                domain={["auto", "auto"]}
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
              <Legend wrapperStyle={{ paddingTop: 40 }} />
              <Line
                type="monotone"
                data={A.polar.curve}
                dataKey="cl"
                stroke="#00d9ff"
                strokeWidth={2.5}
                dot={false}
                name={`${A.name} (A)`}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Line
                type="monotone"
                data={B.polar.curve}
                dataKey="cl"
                stroke="#ff006e"
                strokeWidth={2.5}
                dot={false}
                name={`${B.name} (B)`}
                isAnimationActive={true}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="comparison-verdict">
        <h3>Verdict</h3>
        <p>
          <strong>{A.match_score > B.match_score ? A.name : B.name}</strong> is the better match for your aircraft with a score of <strong>{Math.max(A.match_score, B.match_score)}</strong> vs {Math.min(A.match_score, B.match_score)}.
        </p>
      </div>
    </div>
  );
}

export default ComparisonMode;