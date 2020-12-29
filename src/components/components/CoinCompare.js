import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography, Grid, Divider, Chip } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import CoinSearchBar from "../components/CoinSearchBar.js";
import PriceChart from "../components/Chart.js";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";

import {
  COIN_DATA_RETURNED,
  GET_COIN_PRICECHART,
  GRAPH_TIMEFRAME_CHANGED,
} from "../../constants";

import Store from "../../stores";
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
    super();

    this.state = { coinData: [], loading: true };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
  }

  graphTimeFrameChanged = (data) => {
    const { coinData, loading } = this.state;

    dispatcher.dispatch({
      type: GET_COIN_PRICECHART,
      content: [coinData.id, this.props.id, data],
    });
  };

  coinDataReturned = (data) => {
    console.log(data);
    if (data[1] === this.props.id) {
      this.setState({ coinData: data[0], loading: false });
    }
  };

  nav = (screen) => {
    console.log(screen);
    this.props.history.push(screen);
  };

  detective = (id) => {
    this.nav("/short/detective/" + id);
  };

  render() {
    const { classes, t } = this.props;
    const { coinData, loading } = this.state;

    const handleClick = (timeFrame) => {
      return emitter.emit(GRAPH_TIMEFRAME_CHANGED, timeFrame);
    };

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
                  {coinData.market_data.current_price.usd}
                </Typography>
                <Typography
                  color="textPrimary"
                  align="right"
                  variant="subtitle1"
                  component={"span"}
                >
                  USD
                </Typography>
              </Grid>
              <Grid container alignItems="center" justify="center" item xs={12}>
                <Chip
                  variant="outlined"
                  color={
                    coinData.market_data.market_cap_change_percentage_24h > 0
                      ? "primary"
                      : "secondary"
                  }
                  icon={
                    coinData.market_data.market_cap_change_percentage_24h >
                    0 ? (
                      <ArrowDropUpRoundedIcon />
                    ) : (
                      <ArrowDropDownRoundedIcon />
                    )
                  }
                  label={`${coinData.market_data.market_cap_change_percentage_24h}% - Marketcap 24hs`}
                />
              </Grid>
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
                          coinData.market_data.price_change_percentage_24h > 0
                            ? "primary"
                            : "secondary"
                        }
                        icon={
                          coinData.market_data.price_change_percentage_24h >
                          0 ? (
                            <ArrowDropUpRoundedIcon />
                          ) : (
                            <ArrowDropDownRoundedIcon />
                          )
                        }
                        label={`${coinData.market_data.price_change_percentage_24h}%`}
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
                          coinData.market_data.price_change_percentage_7d > 0
                            ? "primary"
                            : "secondary"
                        }
                        icon={
                          coinData.market_data.price_change_percentage_7d >
                          0 ? (
                            <ArrowDropUpRoundedIcon />
                          ) : (
                            <ArrowDropDownRoundedIcon />
                          )
                        }
                        label={`${coinData.market_data.price_change_percentage_7d}%`}
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
                          coinData.market_data.price_change_percentage_30d > 0
                            ? "primary"
                            : "secondary"
                        }
                        icon={
                          coinData.market_data.price_change_percentage_30d >
                          0 ? (
                            <ArrowDropUpRoundedIcon />
                          ) : (
                            <ArrowDropDownRoundedIcon />
                          )
                        }
                        label={`${coinData.market_data.price_change_percentage_30d}%`}
                        onClick={() => {
                          handleClick(30);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <PriceChart id={this.props.id} coinID={coinData.id} />
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
