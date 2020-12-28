import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";

import { colors } from "../../theme";

import {
  COIN_DATA_RETURNED,
  COIN_PRICECHART_RETURNED,
  GET_COIN_PRICECHART,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    marginTop: 10,
  },
});

class PriceChart extends Component {
  constructor(props) {
    super(props);

    let color;
    if (props.id == "A") {
      color = [colors.cgGreen];
    } else {
      color = [colors.cgRed];
    }

    this.state = {
      options: {
        stroke: {
          width: 2,
          curve: "straight",
        },

        colors: color,
        chart: {
          id: "",
        },
        xaxis: {
          type: "datetime",
          tickAmount: 1,
        },
        yaxis: {
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
    dispatcher.dispatch({
      type: GET_COIN_PRICECHART,
      content: [this.props.coinID, this.props.id],
    });
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(
      COIN_PRICECHART_RETURNED,
      this.coinPriceChartReturned
    );
  }

  coinDataReturned = (data) => {
    if (data[1] === this.props.id) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [this.props.coinID, this.props.id],
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
        <div className="row">
          <div className="chart">
            <Chart
              options={this.state.options}
              series={this.state.series}
              type="line"
              width="100%"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(PriceChart);
