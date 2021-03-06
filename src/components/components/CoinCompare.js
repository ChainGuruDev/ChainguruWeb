import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography, Grid, Divider, Chip } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import CoinSearchBar from "../components/CoinSearchBar.js";
import PriceChart from "../components/Chart.js";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import { colors } from "../../theme";
import { getVsSymbol } from "../helpers";

import {
  COIN_DATA_RETURNED,
  GET_COIN_PRICECHART,
  GRAPH_TIMEFRAME_CHANGED,
  SWITCH_VS_COIN_RETURNED,
  GET_COIN_DATA,
} from "../../constants";

import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  cryptoCard: {
    padding: 10,
    minHeight: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.025);",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  timeFrameSelect: {
    width: "100%",
  },
  chart: {
    minHeight: "100px",
    maxHeight: "60vh",
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  divider: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
});

class CoinCompare extends Component {
  constructor(props) {
    super(props);
    if (props.id === "A") {
      if (props.match.params.coinID) {
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: props.match.params.coinID,
          BarID: props.id,
        });
      }
    } else {
      if (props.match.params.coinID_B) {
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: props.match.params.coinID_B,
          BarID: props.id,
        });
      }
    }
    let vsCoin = store.getStore("vsCoin");
    this.state = { coinData: [], loading: true, vs: vsCoin, timeFrame: 7 };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    if (!this.state.vs) {
      this.getVsCoin();
    }
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.coinID !== this.props.match.params.coinID) {
      if (this.props.id === "A") {
        if (this.props.match.params.coinID) {
          dispatcher.dispatch({
            type: GET_COIN_DATA,
            content: this.props.match.params.coinID,
            BarID: this.props.id,
          });
        }
      }
    }
    if (prevProps.match.params.coinID_B !== this.props.match.params.coinID_B) {
      if (this.props.id === "B") {
        if (this.props.match.params.coinID_B) {
          dispatcher.dispatch({
            type: GET_COIN_DATA,
            content: this.props.match.params.coinID_B,
            BarID: this.props.id,
          });
        }
      }
    }
  }

  getVsCoin = () => {
    let vsCoin;
    try {
      vsCoin = JSON.parse(localStorage.getItem("vsCoin"));
      if (!vsCoin) {
        vsCoin = "usd";
      }
      this.setState({ vs: vsCoin });
    } catch (err) {
      vsCoin = "usd";
      this.setState({ vs: vsCoin });
    }
  };

  vsCoinReturned = (vsCoin) => {
    var x = document.getElementById("cryptoCompSmall");
    if (window.getComputedStyle(x).display !== "none") {
      if (this.state.coinData.id) {
        dispatcher.dispatch({
          type: GET_COIN_PRICECHART,
          content: [
            this.state.coinData.id,
            this.props.id,
            this.state.timeFrame,
            vsCoin,
          ],
        });
      }
    }
    this.setState({ vs: vsCoin });
  };

  graphTimeFrameChanged = (data) => {
    const { coinData, vs } = this.state;
    this.setState({ timeFrame: data });
    if (coinData.id) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinData.id, this.props.id, data, vs],
      });
    }
  };

  coinDataReturned = (data) => {
    let vsCoin = store.getStore("vsCoin");

    if (data[1] === this.props.id) {
      if (data[0].id) {
        dispatcher.dispatch({
          type: GET_COIN_PRICECHART,
          content: [data[0].id, this.props.id, this.state.timeFrame, vsCoin],
        });
      }
      this.setState({ coinData: data[0], loading: false });
    }
  };

  detective = (id) => {
    this.nav(`/${this.props.toolTimeframe}/detective/` + id);
  };

  getTimeFrameBTN = () => {
    const { classes, toolTimeframe } = this.props;
    const { coinData, vs } = this.state;

    const handleClick = (newTimeframe) => {
      return emitter.emit(GRAPH_TIMEFRAME_CHANGED, newTimeframe);
    };

    const shortTimeframe = () => {
      return (
        <div className={classes.timeFrameSelect}>
          <Grid
            style={{
              marginTop: 10,
            }}
            direction="row"
            container
            justify="space-around"
            alignItems="flex-start"
            item
          >
            <Grid item>
              <Grid direction="column" container>
                <Grid item>
                  <Typography variant="subtitle2">24hs</Typography>
                </Grid>
                <Grid item>
                  <Chip
                    variant="outlined"
                    color={
                      coinData.market_data
                        .price_change_percentage_24h_in_currency[vs] > 0
                        ? "primary"
                        : "secondary"
                    }
                    icon={
                      coinData.market_data
                        .price_change_percentage_24h_in_currency[vs] > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    style={
                      this.state.timeFrame === 1
                        ? {
                            background:
                              coinData.market_data
                                .price_change_percentage_7d_in_currency[vs] > 0
                                ? colors.cgGreen
                                : colors.cgOrange,
                            color: "#000",
                            fontSize: "16px",
                          }
                        : {}
                    }
                    label={`${coinData.market_data.price_change_percentage_24h_in_currency[vs]}%`}
                    onClick={() => {
                      handleClick(1);
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Divider light orientation="vertical" flexItem />
            <Grid item>
              <Grid direction="column" container>
                <Typography variant="subtitle2">7d</Typography>
                <Grid item>
                  <Chip
                    variant="outlined"
                    color={
                      coinData.market_data
                        .price_change_percentage_7d_in_currency[vs] > 0
                        ? "primary"
                        : "secondary"
                    }
                    icon={
                      coinData.market_data
                        .price_change_percentage_7d_in_currency[vs] > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    label={`${coinData.market_data.price_change_percentage_7d_in_currency[vs]}%`}
                    style={
                      this.state.timeFrame === 7
                        ? {
                            background:
                              coinData.market_data
                                .price_change_percentage_7d_in_currency[vs] > 0
                                ? colors.cgGreen
                                : colors.cgOrange,
                            color: "#000",
                            fontSize: "16px",
                          }
                        : {}
                    }
                    onClick={() => {
                      handleClick(7);
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Divider light flexItem orientation="vertical" />
            <Grid item>
              <Grid direction="column" container>
                <Grid item>
                  <Typography variant="subtitle2">30d</Typography>
                </Grid>
                <Grid item>
                  <Chip
                    variant="outlined"
                    color={
                      coinData.market_data
                        .price_change_percentage_30d_in_currency[vs] > 0
                        ? "primary"
                        : "secondary"
                    }
                    icon={
                      coinData.market_data
                        .price_change_percentage_30d_in_currency[vs] > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    style={
                      this.state.timeFrame === 30
                        ? {
                            background:
                              coinData.market_data
                                .price_change_percentage_30d_in_currency[vs] > 0
                                ? colors.cgGreen
                                : colors.cgOrange,
                            color: "#000",
                            fontSize: "16px",
                          }
                        : {}
                    }
                    label={`${coinData.market_data.price_change_percentage_30d_in_currency[vs]}%`}
                    onClick={() => {
                      handleClick(30);
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      );
    };

    const mediumTimeframe = () => {
      return (
        <div className={classes.timeFrameSelect}>
          <Grid
            style={{
              marginTop: 10,
            }}
            direction="row"
            container
            justify="space-around"
            alignItems="center"
            item
          >
            <Grid item>
              {coinData.market_data.price_change_percentage_60d !== 0 && (
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">60d</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinData.market_data
                          .price_change_percentage_60d_in_currency[vs] > 0
                          ? "primary"
                          : "secondary"
                      }
                      style={
                        this.state.timeFrame === 60
                          ? {
                              background:
                                coinData.market_data
                                  .price_change_percentage_60d_in_currency[vs] >
                                0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      icon={
                        coinData.market_data
                          .price_change_percentage_60d_in_currency[vs] > 0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      label={`${coinData.market_data.price_change_percentage_60d_in_currency[vs]}%`}
                      onClick={() => {
                        handleClick(60);
                      }}
                    />
                  </Grid>
                </Grid>
              )}
              {coinData.market_data.price_change_percentage_60d === 0 && (
                <Grid direction="column" container>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={"primary"}
                      label={`60 days`}
                      onClick={() => {
                        handleClick(60);
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Divider light orientation="vertical" flexItem />
            <Grid item>
              {coinData.market_data.price_change_percentage_200d !== 0 && (
                <Grid direction="column" container>
                  <Typography variant="subtitle2">200d</Typography>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinData.market_data
                          .price_change_percentage_200d_in_currency[vs] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinData.market_data
                          .price_change_percentage_200d_in_currency[vs] > 0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 200
                          ? {
                              background:
                                coinData.market_data
                                  .price_change_percentage_200d_in_currency[
                                  vs
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${coinData.market_data.price_change_percentage_200d_in_currency[vs]}%`}
                      onClick={() => {
                        handleClick(200);
                      }}
                    />
                  </Grid>
                </Grid>
              )}
              {coinData.market_data.price_change_percentage_200d === 0 && (
                <Grid direction="column" container>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={"primary"}
                      label={`200 days`}
                      onClick={() => {
                        handleClick(200);
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Divider light flexItem orientation="vertical" />
            <Grid item>
              {coinData.market_data.price_change_percentage_1y !== 0 && (
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">1Y</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinData.market_data
                          .price_change_percentage_1y_in_currency[vs] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinData.market_data
                          .price_change_percentage_1y_in_currency[vs] > 0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 360
                          ? {
                              background:
                                coinData.market_data
                                  .price_change_percentage_1y_in_currency[vs] >
                                0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${coinData.market_data.price_change_percentage_1y_in_currency[vs]}%`}
                      onClick={() => {
                        handleClick(360);
                      }}
                    />
                  </Grid>
                </Grid>
              )}
              {coinData.market_data.price_change_percentage_1y === 0 && (
                <Grid direction="column" container>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={"primary"}
                      label={`1 Year`}
                      onClick={() => {
                        handleClick(360);
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </div>
      );
    };

    switch (toolTimeframe) {
      case "short":
        return shortTimeframe();
      case "medium":
        return mediumTimeframe();
      default:
        return shortTimeframe();
    }
  };

  render() {
    const { classes } = this.props;
    const { coinData, loading, vs } = this.state;

    return (
      <Card className={classes.cryptoCard} spacing={3} variant="outlined">
        <CoinSearchBar id={this.props.id} />
        {!loading && (
          <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="stretch"
          >
            <Grid
              style={{ marginTop: 10 }}
              container
              justify="space-evenly"
              alignItems="stretch"
              direction="row"
            >
              <Grid item xs={1}>
                <div
                  className={classes.image}
                  onClick={() => this.detective(coinData.id)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className={classes.img}
                    alt="coin-icon"
                    src={coinData.image.small}
                  />
                </div>
              </Grid>
              <Grid item xs={4}>
                <Grid
                  container
                  direction="column"
                  alignItems="flex-start"
                  item
                  xs={12}
                >
                  <Typography component={"span"} variant="body1">
                    {coinData.name}
                  </Typography>
                  <Typography component={"span"} variant="subtitle1">
                    {coinData.symbol}
                  </Typography>
                </Grid>
              </Grid>
              <Grid
                item
                container
                direction="row"
                justify="flex-end"
                alignItems="flex-end"
                xs={6}
              >
                <Typography
                  component={"span"}
                  color="textSecondary"
                  align="right"
                  variant="h2"
                >
                  {coinData.market_data.current_price[vs]}
                </Typography>
                <Typography
                  color="textPrimary"
                  align="right"
                  variant="subtitle1"
                  component={"span"}
                  style={{ fontSize: "1.5rem", marginLeft: 5 }}
                >
                  {getVsSymbol(vs)}
                </Typography>
              </Grid>
              <Grid container alignItems="center" justify="center" item xs={12}>
                <Chip
                  variant="outlined"
                  color={
                    coinData.market_data
                      .market_cap_change_percentage_24h_in_currency[vs] > 0
                      ? "primary"
                      : "secondary"
                  }
                  icon={
                    coinData.market_data
                      .market_cap_change_percentage_24h_in_currency[vs] > 0 ? (
                      <ArrowDropUpRoundedIcon />
                    ) : (
                      <ArrowDropDownRoundedIcon />
                    )
                  }
                  label={`${coinData.market_data.market_cap_change_percentage_24h_in_currency[vs]}% - Marketcap 24hs`}
                />
              </Grid>

              {this.getTimeFrameBTN()}

              <Grid className={classes.chart} item xs={12}>
                <PriceChart
                  id={this.props.id}
                  coinID={coinData.id}
                  vsCoin={vs}
                  timeFrame={this.state.timeFrame}
                />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Card>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(CoinCompare)));
