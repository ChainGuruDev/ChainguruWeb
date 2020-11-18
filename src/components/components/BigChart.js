import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Card,
  Typography,
  Grid,
  Button,
  Divider,
  Chip,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import CoinSearchBar from "../components/CoinSearchBar.js";
import CompareChart from "../components/CompareChart.js";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";

import {
  COIN_DATA_RETURNED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_COIN_PRICECHART,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

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
    };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  coinDataReturned = (data) => {
    if (data[1] == this.props.idA) {
      this.setState({ coinDataA: data[0], loading: false });
    } else if (data[1] == this.props.idB) {
      this.setState({ coinDataB: data[0], loading: false });
    } else {
      console.log("bad ID");
    }
  };

  render() {
    const { classes, t, location, coinDataA, coinDataB } = this.props;
    const { loading } = this.state;

    return (
      <Card className={classes.cryptoCard} spacing={3} variant="outlined">
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="stretch"
          spacing={1}
        >
          <Grid item xs={12}>
            <CompareChart
              idA={this.props.idA}
              idB={this.props.idB}
              coinIDA={coinDataA.id}
              coinIDB={coinDataB.id}
            />
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
