import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";

import { DARKMODE_SWITCH_RETURN } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;

const styles = (theme) => ({
  root: {
    marginTop: 10,
    display: "flexGrow",
    minHeight: "100%",
    height: "66vh",
    paddingBottom: 10,
  },
});

class HeatMapChart extends Component {
  constructor(props) {
    super(props);

    const tema = store.getStore("theme");
    var self = this;

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
          background: "transparent",
          foreColor: "rgba(125,125,125,0.1)",
          stroke: "#333",
          events: {
            dataPointSelection: function (event, chartContext, config) {
              let index = config.dataPointIndex;
              let selectedID =
                config.w.globals.initialSeries[0].data[index].tokenID;
              self.detective(selectedID);
            },
          },
        },
        tooltip: {
          enabled: true,
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
                } else {
                  return [];
                }
              },
            },
          ],
        },
        dataLabels: {
          enabled: true,
          rotate: 0,
          offsetY: -15,
          style: {
            fontSize: "50px",
          },
          dropShadow: {
            enabled: true,
            top: 2,
            left: 2,
            blur: 2,
            color: "#000",
            opacity: 0.75,
          },
          formatter: function (text, op) {
            // console.log(text);
            let indexPosition = op.dataPointIndex;
            let initialData = op.w.globals.initialSeries[0].data;
            return [
              `${initialData[indexPosition].symbol.toUpperCase()}`,
              `$ ${initialData[indexPosition].curPrice}`,
              `${initialData[indexPosition].change}%`,
              `($ ${op.value})`,
            ];
          },
        },

        plotOptions: {
          foreColor: "rgba(125,125,125,0.1)",
          treemap: {
            enableShades: true,
            shadeIntensity: 0.6,
            reverseNegativeShade: true,
            useFillColorAsStroke: false,
          },
          style: {
            foreColor: ["rgba(125,125,125,0.1)"],
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

  detective = (id) => {
    console.log(id);
    this.nav("/short/detective/" + id);
  };

  componentDidMount() {
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentDidUpdate(prevProps) {
    var self = this;
    const colorMode = store.getStore("theme");

    if (this.props.data !== prevProps.data) {
      this.setState({
        series: [
          {
            data: this.props.data,
          },
        ],
        options: {
          ...this.state.options,
          theme: {
            mode: colorMode,
          },
          tooltip: {
            enabled: true,

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
                      `${
                        seriesName.w.globals.initialSeries[0].data[
                          seriesName.dataPointIndex
                        ].change
                      } %${
                        seriesName.w.globals.initialSeries[0].data[
                          seriesName.dataPointIndex
                        ].changeText
                      }`,
                    ];
                  } else {
                    return [];
                  }
                },
                title: {
                  formatter: (seriesName) => seriesName,
                },
              },
            ],
          },
          chart: {
            events: {
              dataPointSelection: function (event, chartContext, config) {
                let index = config.dataPointIndex;
                let selectedID =
                  config.w.globals.initialSeries[0].data[index].tokenID;
                self.detective(selectedID);
              },
            },
          },
          dataLabels: {
            enabled: true,
            rotate: 0,
            style: {
              fontSize: "50px",
              fontWeight: "bold",
            },
            formatter: function (text, op) {
              // console.log(text);
              let indexPosition = op.dataPointIndex;
              let initialData = op.w.globals.initialSeries[0].data;
              return [
                initialData[indexPosition].symbol.toUpperCase(),
                `$ ${initialData[indexPosition].curPrice}`,
                `${initialData[indexPosition].change}%`,
                `($ ${op.value})`,
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

  nav = (screen) => {
    console.log(screen);
    this.props.history.push(screen);
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

export default withRouter(withStyles(styles)(HeatMapChart));
