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
import PriceChart from "../components/Chart.js";

//IMPORT MaterialUI elements
import {
  Card,
  Grid,
  Button,
  Divider,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Link,
} from "@material-ui/core";

//IMPORT ICONS
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import AspectRatioRoundedIcon from "@material-ui/icons/AspectRatioRounded";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";

//WEB LINKS ICONS
import TelegramIcon from "@material-ui/icons/Telegram";
import TwitterIcon from "@material-ui/icons/Twitter";
import RedditIcon from "@material-ui/icons/Reddit";
import CompassCalibrationIcon from "@material-ui/icons/CompassCalibration";
import GitHubIcon from "@material-ui/icons/GitHub";
import ChatIcon from "@material-ui/icons/Chat";

import {
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
  GET_COIN_DATA,
  GRAPH_TIMEFRAME_CHANGED,
  SWITCH_VS_COIN_RETURNED,
  GET_COIN_PRICECHART,
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
    maxWidth: "85%",
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
  MarketcapChips: {
    minWidth: "100%",
    borderRadius: 10,
    padding: 10,
    background: "rgba(255,255,255,0.00)",
  },
});

class CryptoDetective extends Component {
  constructor(props) {
    super(props);
    let vsCoin = store.getStore("vsCoin");

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      coinList: [],
      valueTab: 0,
      dataLoaded: false,
      vs: vsCoin,
      timeFrame: "max",
      coinData: [],
    };
  }
  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);

    if (this.props.coinID) {
      dispatcher.dispatch({
        type: GET_COIN_DATA,
        content: this.props.coinID,
      });
    }
    if (!this.state.vs) {
      this.getVsCoin();
    }
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
  }

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    console.log(data);
    this.setState({ coinData: data[0], dataLoaded: true });
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
    var x = document.getElementById("coinChart");
    if (window.getComputedStyle(x).display !== "none") {
      console.log("triggered");
      if (this.state.coinData.id) {
        dispatcher.dispatch({
          type: GET_COIN_PRICECHART,
          content: [
            this.state.coinData.id,
            this.props.id,
            this.state.timeFrame,
            vsCoin,
          ],
        });
      }
    }
    this.setState({ vs: vsCoin });
  };

  graphTimeFrameChanged = (data) => {
    const { coinData, loading, vs } = this.state;
    this.setState({ timeFrame: data });
    if (coinData.id) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinData.id, this.props.id, data, vs],
      });
    }
  };

  dataDisplaySide = () => {
    const { classes } = this.props;
    const { selectA, dataLoaded, coinData, vs } = this.state;
    const preventDefault = (event) => event.preventDefault();

    return (
      <div>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch"
        >
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="flex-start"
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <Grid item container direction="row" xs={6}>
              <Grid item xs={6}>
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
            </Grid>
            <Grid item container direction="row" xs={12} sm={6}>
              <Grid item xs={11}>
                <Typography
                  color="textSecondary"
                  align="right"
                  noWrap
                  variant="h2"
                >
                  {coinData.market_data.current_price[vs]}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography
                  color="textPrimary"
                  align="right"
                  variant="subtitle1"
                >
                  {vs}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="stretch"
        >
          <Grid
            container
            justify="space-evenly"
            alignItems="stretch"
            direction="row"
          >
            <Card
              className={classes.MarketcapChips}
              elevation={1}
              variant="outlined"
            >
              <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
                item
                xs={12}
              >
                <Grid item>
                  <Typography variant="subtitle1">Market Data</Typography>
                  <Grid
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="stretch"
                    item
                    xs={12}
                    padding={5}
                  >
                    <Grid item container direction="row">
                      <Typography>Marketcap: </Typography>
                      <Typography variant="subtitle1">
                        {coinData.market_data.market_cap[vs]} {[vs]}
                      </Typography>
                    </Grid>
                    <Grid item container direction="row">
                      <Typography>Fully diluted: </Typography>
                      <Typography variant="subtitle1">
                        {coinData.market_data.fully_diluted_valuation[vs]}{" "}
                        {[vs]}
                      </Typography>
                    </Grid>
                    <Grid item container direction="row">
                      <Typography>Max Supply: </Typography>
                      <Typography variant="subtitle1">
                        {coinData.market_data.max_supply}
                      </Typography>
                    </Grid>
                    <Grid item container direction="row">
                      <Typography>Circulating Supply: </Typography>
                      <Typography variant="subtitle1">
                        {parseFloat(
                          coinData.market_data.circulating_supply
                        ).toFixed(4)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                    direction="row"
                    container
                    justify="space-around"
                    alignItems="flex-start"
                    item
                    xs={12}
                    padding={5}
                  >
                    <Chip
                      variant="outlined"
                      color={
                        coinData.market_data
                          .market_cap_change_percentage_24h_in_currency[vs] > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinData.market_data
                          .market_cap_change_percentage_24h_in_currency[vs] >
                        0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      label={`${coinData.market_data.market_cap_change_percentage_24h_in_currency[vs]} % 24hs`}
                    />
                    <Chip
                      variant="outlined"
                      color={
                        coinData.market_data.market_cap_rank > 0
                          ? "primary"
                          : "secondary"
                      }
                      icon={
                        coinData.market_data.market_cap_rank > 0 ? (
                          <ArrowDropUpRoundedIcon />
                        ) : (
                          <ArrowDropDownRoundedIcon />
                        )
                      }
                      label={`Rank ${coinData.market_data.market_cap_rank}`}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Card>
            <Card
              style={{ marginTop: 10 }}
              className={classes.MarketcapChips}
              elevation={1}
              variant="outlined"
            >
              <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
                item
                xs={12}
                padding={3}
              >
                <Grid item>
                  <Typography variant="subtitle1">Links</Typography>
                  <Grid
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="stretch"
                    item
                    xs={12}
                    padding={5}
                  >
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="center"
                      spacing={1}
                    >
                      {coinData.links.homepage[0] && (
                        <Grid item>
                          <Typography variant="subtitle1">
                            <Link
                              target="_blank"
                              href={coinData.links.homepage[0]}
                            >
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                className={classes.button}
                                startIcon={<CompassCalibrationIcon />}
                              >
                                Homepage
                              </Button>
                            </Link>
                          </Typography>
                        </Grid>
                      )}
                      {coinData.links.announcement_url[0] && (
                        <Grid item>
                          <Typography variant="subtitle1">
                            <Link
                              target="_blank"
                              href={coinData.links.announcement_url[0]}
                            >
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                className={classes.button}
                                startIcon={<CompassCalibrationIcon />}
                              >
                                Blog
                              </Button>
                            </Link>
                          </Typography>
                        </Grid>
                      )}
                      {coinData.links.blockchain_site[0] && (
                        <Grid item>
                          <Typography variant="subtitle1">
                            <Link
                              target="_blank"
                              href={coinData.links.blockchain_site[0]}
                            >
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                className={classes.button}
                                startIcon={<CompassCalibrationIcon />}
                              >
                                Blockchain
                              </Button>
                            </Link>
                          </Typography>
                        </Grid>
                      )}
                      {coinData.links.repos_url.github[0] && (
                        <Grid item>
                          <Typography variant="subtitle1">
                            <Link
                              target="_blank"
                              href={coinData.links.repos_url.github[0]}
                            >
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                className={classes.button}
                                startIcon={<GitHubIcon />}
                              >
                                GitHub
                              </Button>
                            </Link>
                          </Typography>
                        </Grid>
                      )}
                      {coinData.links.chat_url[0] && (
                        <Grid item>
                          <Typography variant="subtitle1">
                            <Link
                              target="_blank"
                              href={coinData.links.chat_url[0]}
                            >
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                className={classes.button}
                                startIcon={<ChatIcon />}
                              >
                                Chat
                              </Button>
                            </Link>
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Card>
            <Grid
              direction="row"
              container
              justify="space-around"
              alignItems="flex-start"
              item
            >
              <Grid item xs={12}>
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
    const { selectA, dataLoaded, coinData, vs } = this.state;

    return (
      <div>
        <Grid item xs={12}>
          <Card
            className={classes.MarketcapChips}
            elevation={1}
            variant="outlined"
          >
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="stretch"
              item
              xs={12}
            >
              <Grid item>
                <Typography variant="subtitle1">Price Performance</Typography>
                <Grid
                  style={{
                    marginTop: 10,
                  }}
                  direction="row"
                  container
                  justify="space-around"
                  alignItems="flex-start"
                  item
                  xs={12}
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
                            coinData.market_data
                              .price_change_percentage_24h_in_currency[vs] > 0
                              ? "primary"
                              : "secondary"
                          }
                          icon={
                            coinData.market_data
                              .price_change_percentage_24h_in_currency[vs] >
                            0 ? (
                              <ArrowDropUpRoundedIcon />
                            ) : (
                              <ArrowDropDownRoundedIcon />
                            )
                          }
                          label={`${coinData.market_data.price_change_percentage_24h_in_currency[vs]}%`}
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
                            coinData.market_data
                              .price_change_percentage_7d_in_currency[vs] > 0
                              ? "primary"
                              : "secondary"
                          }
                          icon={
                            coinData.market_data
                              .price_change_percentage_7d_in_currency[vs] >
                            0 ? (
                              <ArrowDropUpRoundedIcon />
                            ) : (
                              <ArrowDropDownRoundedIcon />
                            )
                          }
                          label={`${coinData.market_data.price_change_percentage_7d_in_currency[vs]}%`}
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
                            coinData.market_data
                              .price_change_percentage_30d_in_currency[vs] > 0
                              ? "primary"
                              : "secondary"
                          }
                          icon={
                            coinData.market_data
                              .price_change_percentage_30d_in_currency[vs] >
                            0 ? (
                              <ArrowDropUpRoundedIcon />
                            ) : (
                              <ArrowDropDownRoundedIcon />
                            )
                          }
                          label={`${coinData.market_data.price_change_percentage_30d_in_currency[vs]}%`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" container>
                      <Grid item>
                        <Typography variant="subtitle2">60d</Typography>
                      </Grid>
                      <Grid item>
                        <Chip
                          variant="outlined"
                          color={
                            coinData.market_data
                              .price_change_percentage_60d_in_currency[vs] > 0
                              ? "primary"
                              : "secondary"
                          }
                          icon={
                            coinData.market_data
                              .price_change_percentage_60d_in_currency[vs] >
                            0 ? (
                              <ArrowDropUpRoundedIcon />
                            ) : (
                              <ArrowDropDownRoundedIcon />
                            )
                          }
                          label={`${coinData.market_data.price_change_percentage_60d_in_currency[vs]}%`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" container>
                      <Grid item>
                        <Typography variant="subtitle2">1Y</Typography>
                      </Grid>
                      <Grid item>
                        <Chip
                          variant="outlined"
                          color={
                            coinData.market_data
                              .price_change_percentage_1y_in_currency[vs] > 0
                              ? "primary"
                              : "secondary"
                          }
                          icon={
                            coinData.market_data
                              .price_change_percentage_1y_in_currency[vs] >
                            0 ? (
                              <ArrowDropUpRoundedIcon />
                            ) : (
                              <ArrowDropDownRoundedIcon />
                            )
                          }
                          label={`${coinData.market_data.price_change_percentage_1y_in_currency[vs]}%`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={12} id="coinChart">
          <PriceChart
            id={this.props.id}
            coinID={coinData.id}
            vsCoin={vs}
            timeFrame={this.state.timeFrame}
          />
        </Grid>
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
                    "http://chainguru.app/short/detective/"
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
    const { selectA, dataLoaded, coinData } = this.state;

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
