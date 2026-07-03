function SliderInput({ label, value, setValue, min, max, step, unit }) {
  return (
    <div className="slider-group">
      <div className="slider-header">
        <label>{label}</label>
        <div className="slider-value-wrap">
          <input
            type="number"
            className="slider-number"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            min={min}
            max={max}
            step={step}
          />
          <span className="slider-unit">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        className="slider-range"
        value={value || min}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
      />
      <div className="slider-range-labels">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default SliderInput;