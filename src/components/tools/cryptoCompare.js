import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

//IMPORT COMPONENTS
import CoinCompare from "../components/CoinCompare.js";

//IMPORT MaterialUI
import { Card, Grid, IconButton } from "@material-ui/core";

//IMPORT ICONS
import BigChart from "../components/BigChart.js";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import AspectRatioRoundedIcon from "@material-ui/icons/AspectRatioRounded";

import {
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
  GRAPH_TIMEFRAME_CHANGED,
  SWITCH_VS_COIN_RETURNED,
  DARKMODE_SWITCH_RETURN,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  rootTabs: {
    flexGrow: 1,
    width: "100%",
    background: "linear-gradient(to top, #F37335, #FDC830)",
  },
  background: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  compareGrid: {
    maxWidth: "95%",
    maxHeight: "80%",
    textAlign: "center",
    justifyContent: "space-evenly",
  },
  compareCard: {
    padding: 10,
    minHeight: "70%",
    marginTop: 10,
    marginBottom: 10,
    display: "flex",
    flex: 1,
    textAlign: "center",
    justifyContent: "space-between",
    direction: "row",
    alignItems: "stretch",
  },
  compareCardDarkMode: {
    padding: 10,
    minHeight: "70%",
    marginTop: 10,
    marginBottom: 10,
    display: "flex",
    flex: 1,
    textAlign: "center",
    justifyContent: "space-between",
    direction: "row",
    alignItems: "stretch",
  },
  divider: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  swapBTN: {
    width: "50px",
    height: "50px",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
});

class CryptoCompare extends Component {
  constructor() {
    super();

    let vsCoin = store.getStore("vsCoin");

    const account = store.getStore("account");
    const theme = store.getStore("theme");
    this.state = {
      theme: theme,
      account: account,
      loading: false,
      coinList: [],
      bigChart: false,
      coinDataA: [],
      coinDataB: [],
      valueTab: 0,
      selectA: false,
      selectB: false,
      timeFrame: 7,
      vs: vsCoin,
      tradeableA: false,
      tradeableB: false,
      darkMode: theme === "dark" ? true : false,
    };
  }
  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeframeChanged);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);

    if (!this.state.vs) {
      this.getVsCoin();
    }
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(GRAPH_TIMEFRAME_CHANGED, this.graphTimeframeChanged);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
  }

  darkModeSwitch = (mode) => {
    this.setState({ darkMode: mode });
  };

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
    this.setState({ vs: vsCoin });
  };

  graphTimeframeChanged = (data) => {
    this.setState({ timeFrame: data });
  };

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    let tradeable = false;
    if (data[0].contract_address || data[0].id === "ethereum") {
      tradeable = true;
    }
    if (data[1] === "A") {
      this.setState({
        coinDataA: data[0],
        selectA: true,
        tradeableA: tradeable,
      });
    } else if (data[1] === "B") {
      this.setState({
        coinDataB: data[0],
        selectB: true,
        tradeableB: tradeable,
      });
    }
  };

  handleBigChart = () => {
    this.setState({ bigChart: !this.state.bigChart });
  };

  render() {
    const { classes, toolTimeframe } = this.props;
    const {
      bigChart,
      selectA,
      selectB,
      coinDataA,
      coinDataB,
      timeFrame,
      vs,
      tradeableA,
      tradeableB,
      darkMode,
    } = this.state;

    return (
      <div className={classes.background}>
        <Grid
          className={classes.compareGrid}
          style={{
            display: !bigChart ? "flex" : "none",
          }}
          spacing={3}
          container
          id="cryptoCompSmall"
        >
          <Card
            className={
              darkMode ? classes.compareCardDarkMode : classes.compareCard
            }
            elevation={3}
          >
            <Grid item xs={6} style={{ marginRight: 10 }}>
              <CoinCompare id={"A"} toolTimeframe={toolTimeframe} />
            </Grid>
            <Grid item xs={6}>
              <CoinCompare id={"B"} toolTimeframe={toolTimeframe} />
            </Grid>
            <Grid item style={{ padding: 10 }}>
              {tradeableA === true && tradeableB === true && (
                <IconButton className={classes.swapBTN} aria-label="swap">
                  <SwapHorizIcon size="large" />
                </IconButton>
              )}
              {selectA && selectB && (
                <IconButton
                  onClick={() => {
                    this.handleBigChart();
                  }}
                  className={classes.swapBTN}
                  aria-label="merge"
                >
                  <AspectRatioRoundedIcon size="large" />
                </IconButton>
              )}
            </Grid>
          </Card>
        </Grid>
        {bigChart && (
          <Grid
            className={classes.compareGrid}
            style={{
              display: bigChart ? "flex" : "none",
            }}
            spacing={3}
            container
          >
            <Card className={classes.compareCard} elevation={3}>
              <Grid item xs={12}>
                <BigChart
                  idA={"A"}
                  idB={"B"}
                  coinDataA={coinDataA}
                  coinDataB={coinDataB}
                  timeFrame={timeFrame}
                  vsCoin={vs}
                />
              </Grid>
              <Grid item style={{ padding: 10 }}>
                {tradeableA === true && tradeableB === true && (
                  <IconButton className={classes.swapBTN} aria-label="swap">
                    <SwapHorizIcon size="large" />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => {
                    this.handleBigChart();
                  }}
                  className={classes.swapBTN}
                  aria-label="merge"
                >
                  <AspectRatioRoundedIcon size="large" />
                </IconButton>
              </Grid>
            </Card>
          </Grid>
        )}
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(CryptoCompare));
