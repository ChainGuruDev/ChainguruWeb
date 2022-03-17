import React, { useEffect, useRef } from "react";
import SvgGauge from "svg-gauge";

const defaultOptions = {
  animDuration: 1,
  showValue: true,
  initialValue: 50,
  max: 100,
  min: 0,
  dialStartAngle: 180,
  dialEndAngle: 0,

  // Put any other defaults you want. e.g. dialStartAngle, dialEndAngle, radius, etc.
};

const Gauge = (props) => {
  const gaugeEl = useRef(null);
  const gaugeRef = useRef(null);
  useEffect(() => {
    if (!gaugeRef.current) {
      const options = { ...defaultOptions, ...props };
      gaugeRef.current = SvgGauge(gaugeEl.current, options);
      gaugeRef.current.setValue(options.initialValue);
    }
    gaugeRef.current.setValueAnimated(props.value, 1);
  }, [props]);

  return (
    <div ref={gaugeEl} className="gauge-container">
      <span class="label">{props.title}</span>
    </div>
  );
};

export default Gauge;
