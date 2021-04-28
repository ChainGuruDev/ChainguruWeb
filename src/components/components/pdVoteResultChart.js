import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";

import { DARKMODE_SWITCH_RETURN } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.0)",
  },
});

class PDVoteResultChart extends Component {
  constructor(props) {
    super(props);

    const tema = store.getStore("theme");
    let categories = [];
    let count = [];
    for (var [key, value] of Object.entries(props.voting)) {
      categories.push(value.vote);
      count.push(value.result);
    }
    console.log(categories);
    console.log(count);
    this.state = {
      series: [
        {
          name: "Pump",
          data: [count[0]],
        },
        {
          name: "Dump",
          data: [-count[1]],
        },
      ],
      options: {
        theme: {
          mode: tema,
        },
        colors: ["#008FFB", "#FF4560"],
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        grid: {
          xaxis: {
            show: false,
            enabled: false,
            title: {
              // text: 'Age',
            },
          },
          yaxis: {
            show: false,
            enabled: false,
            title: {
              // text: 'Age',
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        tooltip: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        chart: {
          toolbar: {
            show: false,
          },
          redrawOnParentResize: true,
          redrawOnParentResize: false,
          type: "bar",
          background: "transparent",
          stacked: true,
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
          type="bar"
          width="100%"
          height="auto"
        />
      </div>
    );
  }
}

export default withStyles(styles)(PDVoteResultChart);
