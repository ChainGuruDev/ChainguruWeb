import React, { Component } from "react";
import Chart from "react-apexcharts";

import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";

import {
  COIN_DATA_RETURNED,
  COIN_PRICECHART_RETURNED,
  GET_COIN_PRICECHART,
  DARKMODE_SWITCH_RETURN,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    marginTop: 10,
  },
});

class CompareChart extends Component {
  constructor(props) {
    super(props);

    let colorMode = store.getStore("theme");
    this.state = {
      options: {
        theme: {
          mode: colorMode,
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          position: "top",
        },
        stroke: {
          width: 2,
          curve: "smooth",
        },
        colors: [colors.cgGreen, colors.cgRed],
        chart: {
          id: "",
          background: "rgba(0, 0, 0, 0.0)",
        },
        xaxis: {
          type: "datetime",
          tickAmount: 5,
          categories: [],
        },
        yaxis: [
          {
            seriesName: this.props.coinIDA,
            decimalsInFloat: 4,
            forceNiceScale: true,
            axisBorder: {
              show: true,
              color: colors.cgGreen,
            },
            labels: {
              style: {
                colors: colors.cgGreen,
              },
            },
            title: {
              text: this.props.coinIDA,
              style: {
                color: colors.cgGreen,
              },
            },
          },
          {
            seriesName: this.props.coinIDB,
            decimalsInFloat: 4,
            forceNiceScale: true,
            opposite: true,
            axisBorder: {
              show: true,
              color: colors.cgRed,
            },
            labels: {
              style: {
                colors: colors.cgRed,
              },
            },
            title: {
              text: this.props.coinIDB,
              style: {
                color: colors.cgRed,
              },
            },
          },
        ],
      },
      series: [
        {
          name: this.props.coinIDA,
          data: [25, 50, 100],
        },
        {
          name: this.props.coinIDB,
          data: [100, 50, 25],
        },
      ],
    };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(COIN_PRICECHART_RETURNED, this.coinPriceChartReturned);
    if (this.props.coinIDA) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [
          this.props.coinIDA,
          this.props.idA,
          this.props.timeFrame,
          this.props.vsCoin,
        ],
      });
    }
    if (this.props.coinIDB) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [
          this.props.coinIDB,
          this.props.idB,
          this.props.timeFrame,
          this.props.vsCoin,
        ],
      });
    }
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(
      COIN_PRICECHART_RETURNED,
      this.coinPriceChartReturned
    );
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

  coinDataReturned = (data) => {
    if (data[1] === this.props.idA) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [
          this.props.coinIDA,
          this.props.idA,
          this.props.timeFrame,
          this.props.vsCoin,
        ],
      });
    } else if (data[1] === this.props.idB) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [
          this.props.coinIDB,
          this.props.idB,
          this.props.timeFrame,
          this.props.vsCoin,
        ],
      });
    }
  };

  coinPriceChartReturned = (data) => {
    let colorMode = store.getStore("theme");

    if (data[1] === this.props.idA) {
      let prices = data[0].prices.map(function (each_element) {
        return [each_element[1]];
      });
      let max = Math.max.apply(Math, prices);
      let min = Math.min.apply(Math, prices);

      this.setState({
        series: [
          {
            name: this.props.coinIDA,
            data: data[0].prices,
          },
          {
            name: this.props.coinIDB,
            data: this.state.series[1].data,
          },
        ],
        options: {
          tooltip: {
            enabled: true,
            shared: true,
            theme: colorMode,
          },
          legend: {
            position: "top",
          },
          xaxis: {
            type: "datetime",
            categories: [],
          },
          yaxis: [
            {
              seriesName: this.props.coinIDA,
              decimalsInFloat: 4,
              min: min - min / 50,
              max: max + max / 100,
              forceNiceScale: true,

              axisBorder: {
                show: true,
                color: colors.cgGreen,
              },
              labels: {
                style: {
                  colors: colors.cgGreen,
                },
              },
              title: {
                text: this.props.coinIDA,
                style: {
                  color: colors.cgGreen,
                },
              },
            },
            {
              seriesName: this.props.coinIDB,
              decimalsInFloat: 4,
              min: this.state.options.yaxis[1].min,
              max: this.state.options.yaxis[1].max,
              forceNiceScale: true,
              opposite: true,
              axisBorder: {
                show: true,
                color: colors.cgRed,
              },
              labels: {
                style: {
                  colors: colors.cgRed,
                },
              },
              title: {
                text: this.props.coinIDB,
                style: {
                  color: colors.cgRed,
                },
              },
            },
          ],
        },
      });
    } else if (data[1] === this.props.idB) {
      let prices = data[0].prices.map(function (each_element) {
        return [each_element[1]];
      });
      let max = Math.max.apply(Math, prices);
      let min = Math.min.apply(Math, prices);

      this.setState({
        series: [
          {
            name: this.props.coinIDA,
            data: this.state.series[0].data,
          },
          {
            name: this.props.coinIDB,
            data: data[0].prices,
          },
        ],
        options: {
          tooltip: {
            enabled: true,
            shared: true,
            theme: colorMode,
          },
          legend: {
            position: "top",
          },
          chart: {
            width: "100%",
            height: "100%",
          },
          xaxis: {
            type: "datetime",
            categories: [],
          },
          yaxis: [
            {
              seriesName: this.props.coinIDA,
              decimalsInFloat: 4,
              min: this.state.options.yaxis[0].min,
              max: this.state.options.yaxis[0].max,
              forceNiceScale: true,

              axisBorder: {
                show: true,
                color: colors.cgGreen,
              },
              labels: {
                style: {
                  colors: colors.cgGreen,
                },
              },
              title: {
                text: this.props.coinIDA,
                style: {
                  color: colors.cgGreen,
                },
              },
            },
            {
              seriesName: this.props.coinIDB,
              decimalsInFloat: 4,
              min: min - min / 50,
              max: max + max / 100,
              forceNiceScale: true,
              opposite: true,
              axisBorder: {
                show: true,
                color: colors.cgRed,
              },
              labels: {
                style: {
                  colors: colors.cgRed,
                },
              },
              title: {
                text: this.props.coinIDB,
                style: {
                  color: colors.cgRed,
                },
              },
            },
          ],
        },
      });
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Chart
          options={this.state.options}
          series={this.state.series}
          type="line"
        />
      </div>
    );
  }
}

export default withStyles(styles)(CompareChart);
