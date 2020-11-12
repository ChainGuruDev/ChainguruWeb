import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography, Grid, Button, Divider } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import CoinSearchBar from "../components/CoinSearchBar.js";

import {
  COIN_DATA_RETURNED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  cryptoCard: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5);",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
});

class CoinCompare extends Component {
  constructor(props) {
    super();

    this.state = { coinData: [] };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  coinDataReturned = (data) => {
    if (data[1] == this.props.id) {
      console.log(data[0]);
      this.setState({ coinData: data[0] });
    }
  };

  render() {
    const { classes, t, location } = this.props;
    const { coinData } = this.state;
    return (
      <Card className={classes.cryptoCard} spacing={3}>
        <CoinSearchBar id={this.props.id} />
        <Divider
          style={{
            marginTop: 10,
          }}
        />
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="stretch"
        >
          <Grid container justify="space-evenly" direction="row">
            <Grid item>
              <Typography>{coinData.name}</Typography>
            </Grid>
            <Grid item>
              <Typography>{coinData.symbol}</Typography>
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

export default withTranslation()(withRouter(withStyles(styles)(CoinCompare)));
