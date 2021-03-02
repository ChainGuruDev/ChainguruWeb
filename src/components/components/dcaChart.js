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
    marginTop: 10,
    display: "flexGrow",
    minHeight: "50vh",
    marginBottom: 20,
  },
});

class DCAchart extends Component {
  constructor(props) {
    super(props);

    const tema = store.getStore("theme");

    let totalInvestedChartData = [];
    props.data.forEach((item, i) => {
      totalInvestedChartData.push([item.date * 1000, item.TotalInvested]);
    });

    let totalValueChartData = [];
    props.data.forEach((item, i) => {
      totalValueChartData.push([item.date * 1000, item.Total]);
    });

    let totalCoinChartData = [];
    props.data.forEach((item, i) => {
      totalCoinChartData.push([item.date * 1000, item.CoinAmount]);
    });
    //console.log(tema);

    this.state = {
      options: {
        theme: {
          mode: tema,
        },
        chart: {
          type: "area",
          height: 350,
          width: "100%",
          stacked: false,
          background: `rgba(255, 255, 255, 0)`,
        },
        colors: [colors.cgGreen, colors.cgBlue, colors.cgRed],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
        },
        fill: {
          type: "gradient",
          gradient: {
            opacityFrom: 0.6,
            opacityTo: 0.9,
          },
        },
        legend: {
          position: "top",
          horizontalAlign: "left",
        },
        xaxis: {
          type: "datetime",
        },
        yaxis: {
          type: "numeric",
          decimalsInFloat: 2,
          forceNiceScale: true,
        },
      },
      series: [
        {
          name: "Total Value",
          data: totalValueChartData,
        },
        {
          name: "Total Invested",
          data: totalInvestedChartData,
        },
        {
          name: "Total Amount in Coin",
          data: totalCoinChartData,
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
    if (prevProps.data !== this.props.data) {
      let totalInvestedChartData = [];
      this.props.data.forEach((item, i) => {
        totalInvestedChartData.push([item.date * 1000, item.TotalInvested]);
      });

      let totalValueChartData = [];
      this.props.data.forEach((item, i) => {
        totalValueChartData.push([item.date * 1000, item.Total]);
      });

      let totalCoinChartData = [];
      this.props.data.forEach((item, i) => {
        totalCoinChartData.push([item.date * 1000, item.CoinAmount]);
      });

      this.setState({
        series: [
          {
            name: "Total Value",
            data: totalValueChartData,
          },
          {
            name: "Total Invested",
            data: totalInvestedChartData,
          },
          {
            name: "Total Amount in Coin",
            data: totalCoinChartData,
          },
        ],
      });
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
          type="area"
          width="100%"
          height="100%"
        />
      </div>
    );
  }
}

export default withStyles(styles)(DCAchart);
