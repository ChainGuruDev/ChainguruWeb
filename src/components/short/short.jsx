import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography, Grid, Divider, IconButton } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import BarChartIcon from "@material-ui/icons/BarChart";
import PieChartIcon from "@material-ui/icons/PieChart";
import CoinSearchBar from "../components/CoinSearchBar.js";
import CoinCompare from "../components/CoinCompare.js";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  PING_COINGECKO,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_WALLET_TOKENS_BALANCE,
  COIN_DATA_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
    },
  },
  background: {
    flex: 1,
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    background: "linear-gradient(to top, #F37335, #FDC830)",
  },
  compareGrid: {
    maxWidth: "1200px",
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

class Short extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      coinList: [],
    };
  }

  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);

    dispatcher.dispatch({
      type: PING_COINGECKO,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
  }

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  render() {
    const { classes, t, location } = this.props;
    return (
      <div className={classes.background}>
        <div className={classes.root}>
          <Grid className={classes.compareGrid} spacing={3} container>
            <Card className={classes.compareCard} elevation={3}>
              <Grid item xs={6}>
                <CoinCompare id={"A"} />
              </Grid>
              <Grid
                item
                style={{ padding: 10, marginTop: "auto", marginBottom: "auto" }}
              >
                <IconButton className={classes.swapBTN} aria-label="swap">
                  <SwapHorizIcon size="large" />
                </IconButton>
              </Grid>
              <Grid item xs={6}>
                <CoinCompare id={"B"} />
              </Grid>
            </Card>
          </Grid>
        </div>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Short)));
