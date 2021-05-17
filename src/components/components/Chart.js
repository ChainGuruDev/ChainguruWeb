import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";

import { colors } from "../../theme";

import {
  COIN_DATA_RETURNED,
  COIN_PRICECHART_RETURNED,
  GET_COIN_PRICECHART,
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
    minHeight: "50vh",
    marginBottom: 20,
  },
});

class PriceChart extends Component {
  constructor(props) {
    super(props);

    let color;
    if (props.id === "A") {
      color = [colors.cgGreen];
    } else {
      color = [colors.cgRed];
    }

    const tema = store.getStore("theme");
    //console.log(tema);

    this.state = {
      options: {
        theme: {
          mode: tema,
        },
        stroke: {
          width: 2,
          curve: "straight",
        },

        colors: color,
        chart: {
          id: "",
          background: "rgba(0, 0, 0, 0.0)",
        },
        xaxis: {
          type: "datetime",
          tickAmount: 1,
        },
        yaxis: {
          crosshairs: {
            show: true,
            position: "back",
            stroke: {
              color: colors.cgOrange,
              width: 2,
              dashArray: 1,
            },
          },
          tooltip: {
            enabled: true,
          },
          type: "numeric",
          decimalsInFloat: 4,
          forceNiceScale: true,
        },
      },
      series: [
        {
          name: "",
          data: [],
        },
      ],
    };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(COIN_PRICECHART_RETURNED, this.coinPriceChartReturned);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    dispatcher.dispatch({
      type: GET_COIN_PRICECHART,
      content: [
        this.props.coinID,
        this.props.id,
        this.props.timeFrame,
        this.props.vsCoin,
      ],
    });
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(
      COIN_PRICECHART_RETURNED,
      this.coinPriceChartReturned
    );
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
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

  vsCoinReturned = (vsCoin) => {
    var x = document.getElementById("cryptoCompSmall");
    if (window.getComputedStyle(x).display !== "none") {
      console.log("triggered");
      if (this.props.id) {
        dispatcher.dispatch({
          type: GET_COIN_PRICECHART,
          content: [
            this.props.coinID,
            this.props.id,
            this.props.timeFrame,
            vsCoin,
          ],
        });
      }
    }
  };

  coinDataReturned = (data) => {
    if (data[1] === this.props.id) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [
          this.props.coinID,
          this.props.id,
          this.props.timeFrame,
          this.props.vsCoin,
        ],
      });
    }
  };

  coinPriceChartReturned = (data) => {
    if (data[1] === this.props.id) {
      // let roundedPrices = data[0].prices.map(function (each_element) {
      //   return [each_element[0], Number(each_element[1]).toFixed(3)];
      // });

      this.setState({
        series: [{ name: this.props.id, data: data[0].prices }],
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
          width="100%"
          height="100%"
        />
      </div>
    );
  }
}

export default withStyles(styles)(PriceChart);
