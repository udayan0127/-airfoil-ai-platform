import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#00d9ff", "#a855f7", "#ff006e"];

function PolarPlot({ airfoils }) {
  const [visibleAirfoils, setVisibleAirfoils] = useState(
    airfoils.reduce((acc, af) => ({ ...acc, [af.name]: true }), {})
  );

  const toggleAirfoil = (name) => {
    setVisibleAirfoils((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="polar-plot">
      <div className="polar-header">
        <div>
          <h2>📈 Drag Polar</h2>
          <p className="polar-subtitle">Cl vs Cd — the fundamental chart of airfoil performance</p>
        </div>
        <div className="airfoil-selector">
          {airfoils.map((af, idx) => (
            <button
              key={af.name}
              className={`airfoil-tab ${visibleAirfoils[af.name] ? "active" : ""}`}
              style={{
                borderColor: visibleAirfoils[af.name] ? COLORS[idx] : "transparent",
                color: visibleAirfoils[af.name] ? COLORS[idx] : "#666"
              }}
              onClick={() => toggleAirfoil(af.name)}
            >
              {af.name}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={500}>
          <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
            <XAxis
              type="number"
              dataKey="cd"
              stroke="#888"
              label={{ value: "Cd (Drag Coefficient)", position: "insideBottom", fill: "#00d9ff", offset: -5 }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => v.toFixed(4)}
            />
            <YAxis
              type="number"
              dataKey="cl"
              stroke="#888"
              label={{ value: "Cl (Lift Coefficient)", angle: -90, position: "left", fill: "#00d9ff", offset: 10 }}
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
            {airfoils.map((af, idx) => (
              visibleAirfoils[af.name] && (
                <Line
                  key={af.name}
                  type="monotone"
                  data={af.polar.curve}
                  dataKey="cl"
                  stroke={COLORS[idx]}
                  strokeWidth={2.5}
                  dot={false}
                  name={af.name}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="polar-legend">
        <p><strong>How to read this:</strong> Each curve shows the drag (Cd) an airfoil produces at different lift levels (Cl). The <strong>leftmost point</strong> of each curve is where the airfoil is most efficient — moving up gives more lift but costs more drag. <strong>Sharp rise at the top</strong> = stall region.</p>
      </div>
    </div>
  );
}

export default PolarPlot;