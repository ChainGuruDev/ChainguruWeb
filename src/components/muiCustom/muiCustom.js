import React from "react";
import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import { colors } from "../../theme";
import Store from "../../stores";

const store = Store.store;

const cleanPercentage = (percentage) => {
  const tooLow = !Number.isFinite(+percentage) || percentage < 0;
  const tooHigh = percentage > 100;
  return tooLow ? 0 : tooHigh ? 100 : +percentage;
};

const Circle = ({ colour, pct, size }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - pct) * circ) / 100;
  return (
    <circle
      r={r}
      cx={size / 2}
      cy={size / 2}
      fill="transparent"
      stroke={strokePct !== circ ? colour : ""} // remove colour as 0% sets full circumference
      strokeWidth={"0.5rem"}
      strokeDasharray={circ}
      strokeDashoffset={pct ? strokePct : 0}
      strokeLinecap="round"
    ></circle>
  );
};

const Text = ({ percentage }) => {
  const textFill = store.getStore("theme") === "dark" ? "white" : "black";
  return (
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fontSize={".9em"}
      fill={textFill}
    >
      {Math.round(percentage)}%
    </text>
  );
};

const CircularProgressLabel = ({ percentage, colour, size }) => {
  const pct = cleanPercentage(percentage);

  return (
    <svg width={size} height={size}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <Circle colour="#5555" size={size} />
        <Circle colour={colour} pct={pct} size={size} />
      </g>
      <Text percentage={pct} />
    </svg>
  );
};

function drawPie(data, size, colours) {
  let offset = [0];
  for (var i = 0; i < data.length - 1; i++) {
    let prevOffset = 0;
    if (i > 0) {
      if (offset[i]) {
        prevOffset = offset[i];
      }
    }
    offset.push(prevOffset + data[i].portfolioShare);
  }
  function setColour(i) {
    if (i > colours.length - 1) {
      i = 0;
    }
    return colours[i];
  }
  return data.map((item, i) => (
    <CirclePie
      key={i}
      colors={setColour(i)}
      pct={item.portfolioShare}
      offset={offset[i]}
      size={size}
    />
  ));
}

const CirclePie = ({ colors, pct, offset, size }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - pct) * circ) / 100;
  return (
    <circle
      r={r}
      cx={size / 2}
      cy={size / 2}
      fill="transparent"
      stroke={strokePct !== circ ? colors : ""} // remove colour as 0% sets full circumference
      strokeWidth={"0.5rem"}
      strokeDasharray={circ}
      strokeDashoffset={pct ? strokePct : 0}
      strokeLinecap="round"
      transform={`rotate(-${((100 - offset) / 100) * 360} ${size / 2} ${
        size / 2
      })`}
    ></circle>
  );
};

const Pie = ({ data, colors, size }) => {
  // const pct = cleanPercentage(data);
  data.forEach((item, i) => {
    item.portfolioShare = Math.round(item.portfolioShare);
  });
  if (!size) {
    size = 50;
  }
  const circleData = drawPie(data, size, colors);
  return (
    <svg width={size} height={size}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {drawPie(data, size, colors)}
      </g>
    </svg>
  );
};

export { CircularProgressLabel, Pie };
