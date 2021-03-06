import React, { useEffect, useRef } from "react";
import SvgGauge from "svg-gauge";
import { ReactComponent as BullIcon } from "../../assets/bull.svg";
import { ReactComponent as BearIcon } from "../../assets/bear.svg";

//import materialUI elements
import { Typography, Tooltip } from "@material-ui/core";

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
        <Tooltip
          title={
            <>
              <Typography
                variant="h3"
                style={{ textAlign: "center" }}
                color="primary"
              >
                {props.votes[0]}
              </Typography>
              <Typography style={{ textAlign: "center" }} color="primary">
                Long Forecasts
              </Typography>
            </>
          }
        >
          <BullIcon
            fill={props.value > 60 ? "rgb(121, 216, 162)" : "#fafafa20"}
          />
        </Tooltip>
      </div>
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          top: "60%",
          left: "30%",
        }}
      >
        <Typography variant={"body1"}>{props.totalVotes}</Typography>
        <Typography variant={"body1"}>Active</Typography>
        <Typography variant={"body1"}>Forecasts</Typography>
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "-15%",
          transform: "scale(0.6)",
        }}
      >
        <Tooltip
          title={
            <>
              <Typography
                variant="h3"
                style={{ textAlign: "center" }}
                color="secondary"
              >
                {props.votes[1]}
              </Typography>
              <Typography style={{ textAlign: "center" }} color="secondary">
                Short Forecasts
              </Typography>
            </>
          }
        >
          <BearIcon
            fill={props.value < 40 ? "rgb(237, 134, 124)" : "#fafafa20"}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default Gauge;
