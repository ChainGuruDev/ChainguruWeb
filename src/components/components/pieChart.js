import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";

import { colors } from "../../theme";

import { DARKMODE_SWITCH_RETURN, PIE_CHART_SELECTED } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;

const styles = (theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    marginTop: 10,
    minHeight: "300px",
    backgroundColor: "rgba(255, 255, 255, 0.0)",
  },
});

class PieChart extends Component {
  constructor(props) {
    super(props);

    const tema = store.getStore("theme");
    // console.log(props.data);
    let categories = [];
    let count = [];
    for (var [key, value] of Object.entries(props.data)) {
      categories.push(value.categorie);
      count.push(value.amount);
    }
    // console.log(props.data);
    // console.log(categories);
    // console.log(count);
    this.state = {
      series: count,
      options: {
        theme: {
          mode: tema,
        },

        labels: categories,
        chart: {
          redrawOnWindowResize: true,
          redrawOnParentResize: false,
          donut: {
            labels: {
              show: false,
            },
          },
          toolbar: {
            show: false,
          },
          type: "donut",
          background: "transparent",
          events: {
            click: function (event, chartContext, config) {
              let selectedIndex = config.globals.selectedDataPoints[0];
              let selected = config.globals.seriesNames[selectedIndex];
              emitter.emit(PIE_CHART_SELECTED, selected);
              // The last parameter config contains additional information like `seriesIndex` and `dataPointIndex` for cartesian charts
            },
          },
        },
        dataLabels: {
          enabled: true,
        },
        xaxis: {
          labels: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
        },
        colors: [
          colors.cgGreen,
          colors.cgRed,
          colors.cgBlue,
          colors.cgYellow,
          colors.cgOrange,
        ],
      },
    };
  }

  componentDidMount() {
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
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
          width="650px"
          height="600px"
          type="donut"
        />
      </div>
    );
  }
}

export default withStyles(styles)(PieChart);
