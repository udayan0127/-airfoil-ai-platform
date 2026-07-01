function AirfoilCards({ airfoils, recommendation }) {
  return (
    <>
      <h2>📊 Recommended Airfoils</h2>
      <div className="airfoils">
        {airfoils.map((airfoil, idx) => (
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
        <p>{recommendation}</p>
      </div>
    </>
  );
}

export default AirfoilCards;