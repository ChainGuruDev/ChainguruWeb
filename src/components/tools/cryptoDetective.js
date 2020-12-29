import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2,
} from "react-html-parser";

//IMPORT COMPONENTS
import CoinSearchBar from "../components/CoinSearchBar.js";

//IMPORT MaterialUI
import {
  Card,
  Grid,
  IconButton,
  Divider,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";

//IMPORT ICONS
import BigChart from "../components/BigChart.js";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import AspectRatioRoundedIcon from "@material-ui/icons/AspectRatioRounded";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";

import {
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
  GET_COIN_DATA,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;
const dispatcher = Store.dispatcher;

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
    // alignItems: "stretch",
    background: "rgba(255,255,255,0.05)",
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  section: {
    minWidth: "90%",
    minHeight: "90%",
    display: "flex",
    margin: 5,
  },
});

class CryptoDetective extends Component {
  constructor(props) {
    super(props);

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      coinList: [],
      valueTab: 0,
      dataLoaded: false,
    };
  }
  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    if (this.props.coinID) {
      dispatcher.dispatch({
        type: GET_COIN_DATA,
        content: this.props.coinID,
      });
    }
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    console.log(data);
    this.setState({ coinData: data[0], dataLoaded: true });
  };

  dataDisplaySide = () => {
    const { classes } = this.props;
    const { bigChart, selectA, selectB, dataLoaded, coinData } = this.state;

    return (
      <div>
        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="flex-start"
          style={{ marginTop: 10 }}
        >
          <Grid item xs={2}>
            <div className={classes.image}>
              <img
                className={classes.img}
                alt="coin-icon"
                src={coinData.image.small}
              />
            </div>
          </Grid>
          <Grid item xs={6}>
            <Grid
              container
              direction="column"
              alignItems="flex-start"
              item
              xs={12}
            >
              <Typography variant="body1">{coinData.name}</Typography>
              <Typography variant="subtitle1">{coinData.symbol}</Typography>
            </Grid>
          </Grid>
          <Grid
            item
            container
            direction="row"
            justify="flex-end"
            alignItems="flex-end"
            xs={2}
          >
            <Typography color="textSecondary" align="right" variant="h2">
              {coinData.market_data.current_price.usd}
            </Typography>
            <Typography color="textPrimary" align="right" variant="subtitle1">
              USD
            </Typography>
          </Grid>
        </Grid>
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
            <Grid container alignItems="center" justify="center" item xs={12}>
              <Chip
                variant="outlined"
                color={
                  coinData.market_data.market_cap_change_percentage_24h > 0
                    ? "primary"
                    : "secondary"
                }
                icon={
                  coinData.market_data.market_cap_change_percentage_24h > 0 ? (
                    <ArrowDropUpRoundedIcon />
                  ) : (
                    <ArrowDropDownRoundedIcon />
                  )
                }
                label={`${coinData.market_data.market_cap_change_percentage_24h}% - Marketcap 24hs`}
              />
            </Grid>
            <Grid
              direction="row"
              container
              justify="space-around"
              alignItems="flex-start"
              item
            >
              <Grid
                style={{
                  marginTop: 10,
                }}
                direction="column"
                container
                justify="space-around"
                alignItems="flex-start"
                item
                xs={6}
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
                      />
                    </Grid>
                  </Grid>
                </Grid>
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
                      />
                    </Grid>
                  </Grid>
                </Grid>
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
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid
                  direction="column"
                  spacing={1}
                  style={{ marginTop: 10 }}
                  container
                >
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color="primary"
                      label={`Developer Score: ${coinData.developer_score}`}
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color="primary"
                      label={`Liquidity Score: ${coinData.liquidity_score}`}
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      variant="outlined"
                      color="primary"
                      label={`Community Score: ${coinData.community_score}`}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  };

  dataDisplayMain = () => {
    const { classes } = this.props;
    const { bigChart, selectA, selectB, dataLoaded, coinData } = this.state;

    return (
      <div>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h4">Description</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle1">
              <div style={{ textAlign: "left" }}>
                {ReactHtmlParser(
                  coinData.description.es.replaceAll(
                    "https://www.coingecko.com/en/coins/",
                    "http://chainguru.herokuapp.com/short/detective/"
                  )
                )}
              </div>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  };

  render() {
    const { classes } = this.props;
    const { bigChart, selectA, selectB, dataLoaded, coinData } = this.state;

    return (
      <div className={classes.background}>
        <Grid className={classes.compareGrid} spacing={3} container>
          <Card className={classes.compareCard} elevation={3}>
            <Grid
              container
              direction="row"
              justify="space-evenly"
              alignItems="stretch"
              spacing={3}
            >
              <Grid item xs={3}>
                <CoinSearchBar />
                {dataLoaded && this.dataDisplaySide(coinData)}
              </Grid>
              <Divider
                style={{ marginLeft: 10 }}
                orientation="vertical"
                flexItem
                xs={1}
              />
              <Grid item xs={8}>
                {dataLoaded && this.dataDisplayMain(coinData)}
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(CryptoDetective));
