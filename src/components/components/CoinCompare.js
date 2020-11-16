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
import PriceChart from "../components/Chart.js";
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

class CoinCompare extends Component {
  constructor(props) {
    super();

    this.state = { coinData: [], loading: true };
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
      this.setState({ coinData: data[0], loading: false });
    }
  };

  render() {
    const { classes, t, location } = this.props;
    const { coinData, loading } = this.state;

    const handleClick = (timeFrame) => {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinData.id, this.props.id, timeFrame],
      });
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
              direction="row"
            >
              <Grid item xs={1}>
                <div className={classes.image}>
                  <img
                    className={classes.img}
                    alt="coin-icon"
                    src={coinData.image.small}
                  />
                </div>
              </Grid>
              <Divider flexItem orientation="vertical" />
              <Grid item xs={5}>
                <Grid
                  container
                  direction="column"
                  alignItems="flex-start"
                  item
                  xs={10}
                >
                  <Typography variant="body1">{coinData.name}</Typography>
                  <Typography variant="subtitle1">{coinData.symbol}</Typography>
                </Grid>
              </Grid>
              <Grid
                container
                alignItems="flex-start"
                justify="flex-end"
                item
                xs={5}
              >
                <Typography variant="subtitle2">
                  Marketcap {coinData.market_data.market_cap.eur} eur
                </Typography>
                <Typography variant="subtitle2">
                  {coinData.market_data.market_cap_change_percentage_24h}% 24hs
                </Typography>
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
              <PriceChart id={this.props.id} coinID={coinData.id} />
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
