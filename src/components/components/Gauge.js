import React, { useEffect, useRef } from "react";
import SvgGauge from "svg-gauge";
import { ReactComponent as BullIcon } from "../../assets/bull.svg";
import { ReactComponent as BearIcon } from "../../assets/bear.svg";

//import materialUI elements
import { Typography } from "@material-ui/core";

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
    <div
      ref={gaugeEl}
      className="gauge-container"
      style={{ position: "relative" }}
    >
      <Typography variant={"h4"} style={{ marginTop: 10 }}>
        {props.title}
      </Typography>
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-15%",
          transform: "scale(0.6)",
        }}
      >
        <BullIcon
          fill={props.value > 60 ? "rgb(121, 216, 162)" : "#fafafa20"}
        />
      </div>
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          top: "60%",
          left: "40%",
        }}
      >
        <Typography varaint={"body1"}>{props.totalVotes}</Typography>
        <Typography varaint={"body1"}>Votes</Typography>
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "-15%",
          transform: "scale(0.6)",
        }}
      >
        <BearIcon
          fill={props.value < 40 ? "rgb(237, 134, 124)" : "#fafafa20"}
        />
      </div>
    </div>
  );
};

export default Gauge;
