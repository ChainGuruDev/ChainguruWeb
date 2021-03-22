import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";

import { colors } from "../../theme";

import {
  DARKMODE_SWITCH_RETURN,
  SWITCH_VS_COIN_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    marginTop: 10,
    display: "flexGrow",
    minHeight: "100%",
    height: "66vh",
  },
});

class HeatMapChart extends Component {
  constructor(props) {
    super(props);

    const tema = store.getStore("theme");

    this.state = {
      options: {
        theme: {
          mode: tema,
        },
        stroke: {
          show: true,
          curve: "smooth",
          lineCap: "butt",
          colors: ["#333"],
          width: 2,
        },
        chart: {
          type: "treemap",
          foreColor: "#333",
          stroke: "#333",
        },
        tooltip: {
          enabled: true,
          x: {
            show: true,
          },
          y: [
            {
              formatter: function (x, seriesName) {
                // console.log(x);
                // console.log(seriesName);
                // console.log(
                //   seriesName.w.globals.initialSeries[0].data[
                //     seriesName.dataPointIndex
                //   ].change24hs
                // );
                if (typeof x !== "undefined") {
                  return [
                    seriesName.w.globals.initialSeries[0].data[
                      seriesName.dataPointIndex
                    ].change +
                      "%" +
                      seriesName.w.globals.initialSeries[0].data[
                        seriesName.dataPointIndex
                      ].changeText,
                  ];
                }
                return [];
              },
              title: {
                formatter: (seriesName) => seriesName,
              },
            },
          ],
        },
        dataLabels: {
          enabled: true,
          offsetY: -10,
          style: {
            fontSize: "18px",
            colors: ["#333"],
            fontWeight: "bold",
          },
          formatter: function (text, op) {
            console.log(text);
            let indexPosition = op.dataPointIndex;
            let initialData = op.w.globals.initialSeries[0].data;
            return [
              initialData[indexPosition].symbol.toUpperCase(),
              `holdings: $ ${op.value}`,
              `${initialData[indexPosition].change}%`,
              `Price: $ ${initialData[indexPosition].curPrice}`,
            ];
          },
        },

        plotOptions: {
          foreColor: "#333",
          treemap: {
            enableShades: true,
            shadeIntensity: 0.6,
            reverseNegativeShade: true,
            useFillColorAsStroke: false,
          },
          style: {
            foreColor: ["#333"],
          },
        },
      },
      series: [
        {
          data: this.props.data,
        },
      ],
    };
  }

  componentDidMount() {
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentDidUpdate(prevProps) {
    if (this.props.data != prevProps.data) {
      this.setState({
        series: [
          {
            data: this.props.data,
          },
        ],
        options: {
          ...this.state.options,
          tooltip: {
            enabled: true,
            x: {
              show: true,
            },
            y: [
              {
                formatter: function (x, seriesName) {
                  // console.log(x);
                  // console.log(seriesName);
                  // console.log(
                  //   seriesName.w.globals.initialSeries[0].data[
                  //     seriesName.dataPointIndex
                  //   ].change24hs
                  // );
                  if (typeof x !== "undefined") {
                    return [
                      seriesName.w.globals.initialSeries[0].data[
                        seriesName.dataPointIndex
                      ].change +
                        "%" +
                        seriesName.w.globals.initialSeries[0].data[
                          seriesName.dataPointIndex
                        ].changeText,
                    ];
                  }
                  return [
                    x,
                    seriesName.w.globals.initialSeries[0].data[
                      seriesName.dataPointIndex
                    ].change +
                      "%" +
                      seriesName.w.globals.initialSeries[0].data[
                        seriesName.dataPointIndex
                      ].changeText,
                  ];
                },
                title: {
                  formatter: (seriesName) => seriesName,
                },
              },
            ],
          },
          dataLabels: {
            enabled: true,
            offsetY: -10,
            style: {
              fontSize: "18px",
              fontWeight: "bold",
            },
            formatter: function (text, op) {
              console.log(text);
              let indexPosition = op.dataPointIndex;
              let initialData = op.w.globals.initialSeries[0].data;
              return [
                initialData[indexPosition].symbol.toUpperCase(),
                `holdings: $ ${op.value}`,
                `${initialData[indexPosition].change}%`,
                `Price: $ ${initialData[indexPosition].curPrice}`,
              ];
            },
          },
        },
      });
    } else {
    }
  }

  darkModeSwitchReturned = (theme) => {
    let colorMode = theme ? "dark" : "light";
    this.setState({
      options: {
        ...this.state.options,
        theme: {
          mode: colorMode,
        },
      },
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Chart
          options={this.state.options}
          series={this.state.series}
          width="100%"
          height="100%"
          type="treemap"
        />
      </div>
    );
  }
}

export default withStyles(styles)(HeatMapChart);
