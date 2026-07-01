import SliderInput from "./SliderInput";

function InputForm({
  weight, setWeight,
  speed, setSpeed,
  payload, setPayload,
  onSubmit,
  loading,
  liveUpdate
}) {
  return (
    <form onSubmit={onSubmit} className="form">
      <div className="form-mode-banner">
        <span className="live-badge">
          {liveUpdate && <span className="live-dot"></span>}
          {liveUpdate ? "LIVE" : "MANUAL"}
        </span>
        <p>Drag sliders to explore designs in real-time. Recommendations update automatically.</p>
      </div>

      <SliderInput
        label="Drone Weight"
        value={weight}
        setValue={setWeight}
        min={100}
        max={5000}
        step={10}
        unit="g"
      />

      <SliderInput
        label="Max Speed"
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

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Analyzing..." : "Get Airfoil Recommendation"}
      </button>
    </form>
  );
}

export default InputForm;