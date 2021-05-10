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
    flex: 1,
    display: "flexGrow",
    minHeight: "100px",
    height: "100%",
    justify: "flex-start",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});

class LS_ResultDonutChart extends Component {
  constructor(props) {
    super(props);

    const tema = store.getStore("theme");
    let categories = [];
    let count = [];
    for (var [key, value] of Object.entries(props.data)) {
      categories.push(key);
      count.push(value);
    }

    this.state = {
      series: count,
      options: {
        series: count,
        labels: categories,
        chart: {
          type: "donut",
          toolbar: {
            show: false,
          },
          selection: {
            enabled: false,
            type: "x",
          },
        },
        selection: {
          enabled: false,
        },

        colors: [colors.cgGreen, colors.cgRed],
        stroke: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        states: {
          normal: {
            filter: {
              type: "none",
              value: 0,
            },
          },
          hover: {
            filter: {
              type: "none",
              value: 0,
            },
          },
          active: {
            allowMultipleDataPointsSelection: false,
            filter: {
              type: "none",
              value: 0,
            },
          },
        },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: "65%",
              background: "transparent",
              labels: {
                show: false,
              },
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
    };
  }

  componentDidMount() {
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentDidUpdate(prevProps) {
    if (this.props.data) {
      if (prevProps.data !== this.props.data) {
        let categories = [];
        let count = [];
        for (var [key, value] of Object.entries(this.props.data)) {
          categories.push(key);
          count.push(value);
        }
        this.setState({
          series: count,
          options: {
            ...this.state.options,
            series: count,
            labels: categories,
          },
        });
      }
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
          type="donut"
        />
      </div>
    );
  }
}

export default withStyles(styles)(LS_ResultDonutChart);
