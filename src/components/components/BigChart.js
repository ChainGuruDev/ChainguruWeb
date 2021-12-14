import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography, Grid, Divider, Chip } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import CompareChart from "../components/CompareChart.js";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import CoinSearchBar from "../components/CoinSearchBar.js";

import { getVsSymbol, formatMoney } from "../helpers";
import { colors } from "../../theme";

import {
  COIN_DATA_RETURNED,
  GET_COIN_PRICECHART,
  SWITCH_VS_COIN_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  cryptoCard: {
    padding: 10,
    minHeight: "100%",
    backgroundColor: "rgba(0, 0, 0, 0);",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
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

class BigChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      coinDataA: this.coinDataA,
      coinDataB: this.coinDataB,
      loading: true,
      timeFrame: this.props.timeFrame,
      vsCoin: this.props.vsCoin,
    };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
  }

  coinDataReturned = (data) => {
    if (data[1] === this.props.idA) {
      this.setState({ coinDataA: data[0], loading: false });
    } else if (data[1] === this.props.idB) {
      this.setState({ coinDataB: data[0], loading: false });
    } else {
      console.log("bad ID");
    }
  };

  vsCoinReturned = (vsCoin) => {
    const { coinDataA, coinDataB, idA, idB } = this.props;

    dispatcher.dispatch({
      type: GET_COIN_PRICECHART,
      content: [coinDataA.id, idA, this.state.timeFrame, vsCoin],
    });
    dispatcher.dispatch({
      type: GET_COIN_PRICECHART,
      content: [coinDataB.id, idB, this.state.timeFrame, vsCoin],
    });
  };

  render() {
    const { classes, coinDataA, coinDataB, vsCoin } = this.props;
    const { timeFrame } = this.state;
    const handleClick = (timeFrame) => {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinDataA.id, this.props.idA, timeFrame, vsCoin],
      });
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinDataB.id, this.props.idB, timeFrame, vsCoin],
      });
      this.setState({ timeFrame: timeFrame });
    };
    return (
      <Card className={classes.cryptoCard} spacing={3} variant="outlined">
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="stretch"
          spacing={1}
        >
          <Grid
            style={{
              marginTop: 10,
            }}
            direction="row"
            container
            justify="space-around"
            alignItems="flex-start"
            item
            spacing={3}
          >
            <Grid
              direction="row"
              container
              justify="space-around"
              alignItems="flex-start"
              item
              xs={12}
            >
              <Grid value={coinDataA.id} item xs={5}>
                <CoinSearchBar id="A" />
              </Grid>
              <Grid value={coinDataB.id} item xs={5}>
                <CoinSearchBar id="B" />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            direction="row"
            container
            justify="space-around"
            alignItems="flex-start"
            item
            xs={12}
          >
            <Grid
              style={{
                marginTop: 10,
                width: "auto",
              }}
              direction="column"
              container
              justify="space-around"
              alignItems="center"
              item
              xs={1}
              spacing={2}
            >
              <Grid item>
                <div className={classes.image}>
                  <img
                    className={classes.img}
                    alt="coin-icon"
                    src={coinDataA.image.small}
                  />
                  {coinDataA.name}
                </div>
                <Typography variant={"h3"}>
                  {`${formatMoney(
                    coinDataA.market_data.current_price[vsCoin]
                  )} ${getVsSymbol(vsCoin)}
                  `}
                </Typography>
              </Grid>
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">24hs</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataA.market_data
                          .market_cap_change_percentage_24h_in_currency[
                          vsCoin
                        ] > 0
                          ? "primary"
                          : "secondary"
                      }
                      style={
                        this.state.timeFrame === 1
                          ? {
                              background:
                                coinDataA.market_data
                                  .price_change_percentage_24h_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      icon={
                        coinDataA.market_data
                          .market_cap_change_percentage_24h_in_currency[
                          vsCoin
                        ] > 0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      label={`${formatMoney(
                        coinDataA.market_data
                          .market_cap_change_percentage_24h_in_currency[vsCoin]
                      )}%`}
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
                        coinDataA.market_data
                          .price_change_percentage_7d_in_currency[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataA.market_data
                          .price_change_percentage_7d_in_currency[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      label={`${formatMoney(
                        coinDataA.market_data
                          .price_change_percentage_7d_in_currency[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(7);
                      }}
                      style={
                        this.state.timeFrame === 7
                          ? {
                              background:
                                coinDataA.market_data
                                  .price_change_percentage_7d_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
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
                        coinDataA.market_data
                          .price_change_percentage_30d_in_currency[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataA.market_data
                          .price_change_percentage_30d_in_currency[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 30
                          ? {
                              background:
                                coinDataA.market_data
                                  .price_change_percentage_30d_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataA.market_data
                          .price_change_percentage_30d_in_currency[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(30);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider light flexItem orientation="vertical" />
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">60d</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataA.market_data
                          .price_change_percentage_60d_in_currency[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataA.market_data
                          .price_change_percentage_60d_in_currency[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 60
                          ? {
                              background:
                                coinDataA.market_data
                                  .price_change_percentage_60d_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataA.market_data
                          .price_change_percentage_60d_in_currency[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(60);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider light flexItem orientation="vertical" />
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">1y</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataA.market_data
                          .price_change_percentage_1y_in_currency[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataA.market_data
                          .price_change_percentage_1y_in_currency[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 365
                          ? {
                              background:
                                coinDataA.market_data
                                  .price_change_percentage_1y_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataA.market_data
                          .price_change_percentage_1y_in_currency[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(365);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider light flexItem orientation="vertical" />
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">ATL %</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataA.market_data.atl_change_percentage[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataA.market_data.atl_change_percentage[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 730
                          ? {
                              background:
                                coinDataA.market_data.atl_change_percentage[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataA.market_data.atl_change_percentage[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(730);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={10} style={{ height: "100%" }}>
              <CompareChart
                idA={this.props.idA}
                idB={this.props.idB}
                coinIDA={coinDataA.id}
                coinIDB={coinDataB.id}
                timeFrame={this.state.timeFrame}
                vsCoin={this.props.vsCoin}
              />
            </Grid>
            <Grid
              style={{
                marginTop: 10,
                width: "auto",
              }}
              direction="column"
              container
              justify="space-around"
              alignItems="center"
              item
              xs={1}
              spacing={2}
            >
              <Grid item>
                <div className={classes.image}>
                  <img
                    className={classes.img}
                    alt="coin-icon"
                    src={coinDataB.image.small}
                  />
                  {coinDataB.name}
                </div>
                <Typography variant={"h3"}>
                  {`${formatMoney(
                    coinDataB.market_data.current_price[vsCoin]
                  )} ${getVsSymbol(vsCoin)}`}
                </Typography>
              </Grid>
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">24hs</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataB.market_data.price_change_percentage_24h > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataB.market_data.price_change_percentage_24h >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 1
                          ? {
                              background:
                                coinDataB.market_data
                                  .price_change_percentage_24h_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataB.market_data.price_change_percentage_24h
                      )}%`}
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
                        coinDataB.market_data.price_change_percentage_7d > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataB.market_data.price_change_percentage_7d > 0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 7
                          ? {
                              background:
                                coinDataB.market_data
                                  .price_change_percentage_7d_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataB.market_data.price_change_percentage_7d
                      )}%`}
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
                        coinDataB.market_data.price_change_percentage_30d > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataB.market_data.price_change_percentage_30d >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 30
                          ? {
                              background:
                                coinDataB.market_data
                                  .price_change_percentage_30d_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataB.market_data.price_change_percentage_30d
                      )}%`}
                      onClick={() => {
                        handleClick(30);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider light flexItem orientation="vertical" />
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">60d</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataB.market_data
                          .price_change_percentage_60d_in_currency[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataB.market_data
                          .price_change_percentage_60d_in_currency[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 60
                          ? {
                              background:
                                coinDataB.market_data
                                  .price_change_percentage_60d_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataB.market_data
                          .price_change_percentage_60d_in_currency[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(60);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider light flexItem orientation="vertical" />
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">1y</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataB.market_data
                          .price_change_percentage_1y_in_currency[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      style={
                        this.state.timeFrame === 365
                          ? {
                              background:
                                coinDataB.market_data
                                  .price_change_percentage_1y_in_currency[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      icon={
                        coinDataB.market_data
                          .price_change_percentage_1y_in_currency[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      label={`${formatMoney(
                        coinDataB.market_data
                          .price_change_percentage_1y_in_currency[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(365);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider light flexItem orientation="vertical" />
              <Grid item>
                <Grid direction="column" container>
                  <Grid item>
                    <Typography variant="subtitle2">ATL %</Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color={
                        coinDataB.market_data.atl_change_percentage[vsCoin] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinDataB.market_data.atl_change_percentage[vsCoin] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      style={
                        this.state.timeFrame === 730
                          ? {
                              background:
                                coinDataB.market_data.atl_change_percentage[
                                  vsCoin
                                ] > 0
                                  ? colors.cgGreen
                                  : colors.cgOrange,
                              color: "#000",
                              fontSize: "16px",
                            }
                          : {}
                      }
                      label={`${formatMoney(
                        coinDataB.market_data.atl_change_percentage[vsCoin]
                      )}%`}
                      onClick={() => {
                        handleClick(730);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(BigChart)));
