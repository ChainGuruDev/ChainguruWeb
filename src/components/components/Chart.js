import React, { Component, Suspense } from "react";
// import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";

import { colors } from "../../theme";
import { CircularProgress, Card } from "@material-ui/core";
import { formatMoney } from "../helpers";
import {
  COIN_DATA_RETURNED,
  COIN_PRICECHART_RETURNED,
  GET_COIN_PRICECHART,
  DARKMODE_SWITCH_RETURN,
  SWITCH_VS_COIN_RETURNED,
  DB_GET_ASSETSTATS_RETURNED,
  GETTING_NEW_CHART_DATA,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const Chart = React.lazy(() => import("react-apexcharts"));

const styles = (theme) => ({
  root: {
    marginTop: 10,
    display: "flexGrow",
    minHeight: "385px",
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
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.8,
            opacityTo: 0.3,
          },
        },
        chart: {
          animations: {
            enabled: false,
          },
          id: "bigChart",
          background: "rgba(0, 0, 0, 0.0)",
        },
        xaxis: {
          type: "datetime",
          tickAmount: 1,
          labels: {
            style: {
              fontSize: "13px",
              fontWeight: 400,
              fontFamily:
                "Acumin Variable Concept Default ExtraCondensed UltraBlack",
            },
          },
        },
        dataLabels: {
          enabled: false,
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
          labels: {
            style: {
              fontSize: "13px",
              fontWeight: 400,
              fontFamily:
                "Acumin Variable Concept Default ExtraCondensed UltraBlack",
            },
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
    // emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(COIN_PRICECHART_RETURNED, this.coinPriceChartReturned);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(DB_GET_ASSETSTATS_RETURNED, this.db_getAssetStatsReturned);
    emitter.on(GETTING_NEW_CHART_DATA, this.newSearch);

    // dispatcher.dispatch({
    //   type: GET_COIN_PRICECHART,
    //   content: [
    //     this.props.coinID,
    //     this.props.id,
    //     this.props.timeFrame,
    //     this.props.vsCoin,
    //   ],
    // });
  }

  componentWillUnmount() {
    // emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(
      COIN_PRICECHART_RETURNED,
      this.coinPriceChartReturned
    );
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.removeListener(
      DB_GET_ASSETSTATS_RETURNED,
      this.db_getAssetStatsReturned
    );
    emitter.removeListener(GETTING_NEW_CHART_DATA, this.newSearch);
  }

  newSearch = () => {
    if (this.state.options) {
      this.setState({
        options: {
          ...this.state.options,
          annotations: {
            yaxis: [{}],
          },
        },
      });
    }
  };

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

  db_getAssetStatsReturned = (data) => {
    // console.log(data);
    if (data[0] && data[0].stats !== null) {
      // console.log(`average buy price ${data[0].stats.avg_buy_price_net}`);
      this.setState({
        options: {
          ...this.state.options,
          annotations: {
            yaxis: [
              {
                y:
                  data[0].stats.avg_sell_price_net !== null
                    ? data[0].stats.avg_sell_price_net
                    : data[0].stats.avg_sell_price,
                label: {
                  borderColor: "#ed867c",
                  style: {
                    background: "#ed867c",
                    fontSize: "14px",
                    fontWeight: 400,
                    fontFamily:
                      "Acumin Variable Concept Default ExtraCondensed UltraBlack",
                  },
                  text: `avg. SELL price ${formatMoney(
                    data[0].stats.avg_sell_price_net !== null
                      ? data[0].stats.avg_sell_price_net
                      : data[0].stats.avg_sell_price
                  )}`,
                },
              },
              {
                y:
                  data[0].stats.avg_buy_price_net !== null
                    ? data[0].stats.avg_buy_price_net
                    : data[0].stats.avg_buy_price,
                label: {
                  borderColor: "#569973",
                  style: {
                    background: "#569973",
                    fontSize: "14px",
                    fontWeight: 400,
                    fontFamily:
                      "Acumin Variable Concept Default ExtraCondensed UltraBlack",
                  },
                  text: `avg. BUY price ${formatMoney(
                    data[0].stats.avg_buy_price_net !== null
                      ? data[0].stats.avg_buy_price_net
                      : data[0].stats.avg_buy_price
                  )}`,
                },
              },
              {
                y:
                  data[0].stats.avg_buy_price_net !== null
                    ? data[0].stats.avg_buy_price_net * 2
                    : data[0].stats.avg_buy_price * 2,
                borderColor: "#fbba6a",
                label: {
                  borderColor: "#fbba6a",
                  style: {
                    background: "#fbba6a",
                    fontSize: "14px",
                    fontWeight: 400,
                    fontFamily:
                      "Acumin Variable Concept Default ExtraCondensed UltraBlack",
                  },
                  text: `~100% profit  ${formatMoney(
                    data[0].stats.avg_buy_price_net !== null
                      ? data[0].stats.avg_buy_price_net * 2
                      : data[0].stats.avg_buy_price * 2
                  )}`,
                },
              },
              {
                y:
                  data[0].stats.avg_buy_price_net !== null
                    ? data[0].stats.avg_buy_price_net * 5
                    : data[0].stats.avg_buy_price * 5,
                borderColor: "#f68e55",
                label: {
                  borderColor: "#f68e55",
                  style: {
                    background: "#f68e55",
                    fontSize: "14px",
                    fontWeight: 400,
                    fontFamily:
                      "Acumin Variable Concept Default ExtraCondensed UltraBlack",
                  },
                  text: `~5X profit  ${formatMoney(
                    data[0].stats.avg_buy_price_net !== null
                      ? data[0].stats.avg_buy_price_net * 5
                      : data[0].stats.avg_buy_price * 5
                  )}`,
                },
              },
              {
                y:
                  data[0].stats.avg_buy_price_net !== null
                    ? data[0].stats.avg_buy_price_net * 10
                    : data[0].stats.avg_buy_price * 10,
                borderColor: "#ed8278",
                label: {
                  borderColor: "#ed8278",
                  style: {
                    background: "#ed8278",
                    fontSize: "14px",
                    fontWeight: 400,
                    fontFamily:
                      "Acumin Variable Concept Default ExtraCondensed UltraBlack",
                  },
                  text: `~10X profit  ${formatMoney(
                    data[0].stats.avg_buy_price_net !== null
                      ? data[0].stats.avg_buy_price_net * 10
                      : data[0].stats.avg_buy_price * 10
                  )}`,
                },
              },
            ],
          },
        },
      });
    } else {
      this.setState({
        options: {
          ...this.state.options,
          annotations: {
            yaxis: [{}],
          },
        },
      });
    }
  };

  vsCoinReturned = (vsCoin) => {
    var x = document.getElementById("cryptoCompSmall");
    if (x) {
      if (window.getComputedStyle(x).display !== "none") {
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
    } else {
      // console.log(this.props.coinID);
      if (this.props.coinID) {
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

  // coinDataReturned = (data) => {
  //   if (data[1] === this.props.id) {
  //     console.log("calling from coinDataReturned");
  //
  //     dispatcher.dispatch({
  //       type: GET_COIN_PRICECHART,
  //       content: [
  //         this.props.coinID,
  //         this.props.id,
  //         this.props.timeFrame,
  //         this.props.vsCoin,
  //       ],
  //     });
  //   }
  // };

  coinPriceChartReturned = (data) => {
    if (data[1]) {
      if (data[1] === this.props.id) {
        // let roundedPrices = data[0].prices.map(function (each_element) {
        //   return [each_element[0], Number(each_element[1]).toFixed(3)];
        // });
        let priceDateMiliseconds = [];

        this.setState({
          series: [{ name: this.props.id, data: data[0].prices }],
        });
      }
    } else {
      this.setState({
        series: [{ name: "", data: data[0].prices }],
      });
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Suspense
          fallback={
            <div style={{ textAlign: "center" }}>
              <Card className={classes.favCard} elevation={3}>
                <CircularProgress />
              </Card>
            </div>
          }
        >
          <Chart
            options={this.state.options}
            series={this.state.series}
            type="area"
            width="100%"
            height="100%"
          />
        </Suspense>
      </div>
    );
  }
}

export default withStyles(styles)(PriceChart);
