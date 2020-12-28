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
    maxWidth: "75%",
    minHeight: "100%",
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
    background: "rgba(255,255,255,0.25)",
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

    const account = store.getStore("account");
    this.state = {
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
    };
  }
  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeframeChanged);
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(GRAPH_TIMEFRAME_CHANGED, this.graphTimeframeChanged);
  }

  graphTimeframeChanged = (data) => {
    console.log(data);
    this.setState({ timeFrame: data });
  };

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    if (data[1] === "A") {
      this.setState({ coinDataA: data[0] });
      this.setState({ selectA: true });
    } else if (data[1] === "B") {
      this.setState({ coinDataB: data[0] });
      this.setState({ selectB: true });
    }
  };

  handleBigChart = () => {
    this.setState({ bigChart: !this.state.bigChart });
  };

  render() {
    const { classes } = this.props;
    const { bigChart, selectA, selectB, timeFrame } = this.state;

    return (
      <div className={classes.background}>
        <Grid
          className={classes.compareGrid}
          style={{
            display: !bigChart ? "flex" : "none",
          }}
          spacing={3}
          container
        >
          <Card className={classes.compareCard} elevation={3}>
            <Grid item xs={6} style={{ marginRight: 10 }}>
              <CoinCompare id={"A"} />
            </Grid>
            <Grid item xs={6}>
              <CoinCompare id={"B"} />
            </Grid>
            <Grid item style={{ padding: 10 }}>
              <IconButton className={classes.swapBTN} aria-label="swap">
                <SwapHorizIcon size="large" />
              </IconButton>
              {selectA && selectB && (
                <IconButton className={classes.swapBTN} aria-label="merge">
                  <AspectRatioRoundedIcon
                    onClick={() => {
                      this.handleBigChart();
                    }}
                    size="large"
                  />
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
                  coinDataA={this.state.coinDataA}
                  coinDataB={this.state.coinDataB}
                  timeFrame={this.state.timeFrame}
                />
              </Grid>
              <Grid item style={{ padding: 10 }}>
                <IconButton className={classes.swapBTN} aria-label="swap">
                  <SwapHorizIcon size="large" />
                </IconButton>
                <IconButton className={classes.swapBTN} aria-label="merge">
                  <AspectRatioRoundedIcon
                    onClick={() => {
                      this.handleBigChart();
                    }}
                    size="large"
                  />
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
