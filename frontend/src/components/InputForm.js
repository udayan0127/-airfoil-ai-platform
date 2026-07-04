import SliderInput from "./SliderInput";

function InputForm({
  weight, setWeight,
  speed, setSpeed,
  payload, setPayload,
  wingspan, setWingspan,
  aspectRatio, setAspectRatio,
  onSubmit,
  loading,
  liveUpdate
}) {
  // Aircraft presets (wingspan + AR)
  const presets = {
    "Small RC": { wingspan: 1.01, aspectRatio: 5.18 },
    "Racing Drone": { wingspan: 0.8, aspectRatio: 4.0 },
  };

  const applyPreset = (presetName) => {
    const preset = presets[presetName];
    setWingspan(preset.wingspan);
    setAspectRatio(preset.aspectRatio);
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <div className="form-mode-banner">
        <span className="live-badge">
          {liveUpdate && <span className="live-dot"></span>}
          {liveUpdate ? "LIVE" : "MANUAL"}
        </span>
        <p>Drag sliders to explore designs. Recommendations update automatically.</p>
      </div>

      {/* Aircraft Specs */}
      <div className="form-section-title">Aircraft Specs</div>

      <SliderInput
        label="Weight"
        value={weight}
        setValue={setWeight}
        min={100}
        max={5000}
        step={10}
        unit="g"
      />

      <SliderInput
        label="Speed"
        value={speed}
        setValue={setSpeed}
        min={10}
        max={150}
        step={1}
        unit="km/h"
      />

      <SliderInput
        label="Payload"
        value={payload}
        setValue={setPayload}
        min={0}
        max={2000}
        step={10}
        unit="g"
      />

      {/* Wing Geometry */}
      <div className="form-section-divider"></div>
      <div className="form-section-title">Wing Geometry</div>

      {/* Presets */}
      <div className="preset-buttons">
        <label>Quick Presets:</label>
        {Object.keys(presets).map((name) => (
          <button
            key={name}
            type="button"
            className="preset-btn"
            onClick={() => applyPreset(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <SliderInput
        label="Wingspan"
        value={wingspan}
        setValue={setWingspan}
        min={0.3}
        max={2.5}
        step={0.05}
        unit="m"
      />

      <SliderInput
        label="Aspect Ratio"
        value={aspectRatio}
        setValue={setAspectRatio}
        min={2.0}
        max={8.0}
        step={0.5}
        unit=""
      />

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? (
          <>
            <span className="spinner">⚙️</span>
            Analyzing...
          </>
        ) : (
          "Get Airfoil Recommendation"
        )}
      </button>
    </form>
  );
}

export default InputForm;