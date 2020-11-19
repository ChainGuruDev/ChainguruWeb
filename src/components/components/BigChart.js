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

    const handleClick = (timeFrame) => {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinDataA.id, this.props.idA, timeFrame],
      });
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinDataB.id, this.props.idB, timeFrame],
      });
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
                      coinDataA.market_data.price_change_percentage_24h > 0
                        ? "primary"
                        : "secondary"
                    }
                    icon={
                      coinDataA.market_data.price_change_percentage_24h > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    label={`${coinDataA.market_data.price_change_percentage_24h}%`}
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
                      coinDataA.market_data.price_change_percentage_7d > 0
                        ? "primary"
                        : "secondary"
                    }
                    icon={
                      coinDataA.market_data.price_change_percentage_7d > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    label={`${coinDataA.market_data.price_change_percentage_7d}%`}
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
                      coinDataA.market_data.price_change_percentage_30d > 0
                        ? "primary"
                        : "secondary"
                    }
                    icon={
                      coinDataA.market_data.price_change_percentage_30d > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    label={`${coinDataA.market_data.price_change_percentage_30d}%`}
                    onClick={() => {
                      handleClick(30);
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <CompareChart
              idA={this.props.idA}
              idB={this.props.idB}
              coinIDA={coinDataA.id}
              coinIDB={coinDataB.id}
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
                      coinDataB.market_data.price_change_percentage_24h > 0
                        ? "primary"
                        : "secondary"
                    }
                    icon={
                      coinDataB.market_data.price_change_percentage_24h > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    label={`${coinDataB.market_data.price_change_percentage_24h}%`}
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
                    label={`${coinDataB.market_data.price_change_percentage_7d}%`}
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
                      coinDataB.market_data.price_change_percentage_30d > 0 ? (
                        <ArrowDropUpRoundedIcon />
                      ) : (
                        <ArrowDropDownRoundedIcon />
                      )
                    }
                    label={`${coinDataB.market_data.price_change_percentage_30d}%`}
                    onClick={() => {
                      handleClick(30);
                    }}
                  />
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
