function PhysicsPanel({ input, physics }) {
  return (
    <>
      <div className="specs">
        <p><strong>Weight:</strong> {input.weight_g}g</p>
        <p><strong>Max Speed:</strong> {input.max_speed_kmh} km/h</p>
        <p><strong>Payload:</strong> {input.payload_g}g</p>
      </div>

      <h2>🔬 Aerodynamic Analysis</h2>
      <div className="physics-grid">
        <div className="physics-card">
          <div className="physics-label">Reynolds Number</div>
          <div className="physics-value">{physics.reynolds_number.toLocaleString()}</div>
        </div>
        <div className="physics-card">
          <div className="physics-label">Required Cl</div>
          <div className="physics-value">{physics.required_cl}</div>
        </div>
        <div className="physics-card">
          <div className="physics-label">Wing Loading</div>
          <div className="physics-value">{physics.wing_loading_n_m2} N/m²</div>
        </div>
        <div className="physics-card">
          <div className="physics-label">Flight Regime</div>
          <div className="physics-value">{physics.flight_regime}</div>
        </div>
        <div className="physics-card">
          <div className="physics-label">Est. Wing Area</div>
          <div className="physics-value">{physics.estimated_wing_area_m2} m²</div>
        </div>
        <div className="physics-card">
          <div className="physics-label">Est. Chord Length</div>
          <div className="physics-value">{physics.estimated_chord_m} m</div>
        </div>
      </div>
    </>
  );
}

export default PhysicsPanel;
