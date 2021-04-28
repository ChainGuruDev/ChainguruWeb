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
import PDVoteResultChart from "../components/pdVoteResultChart.js";
import PDvoteResultModal from "../components/pdVoteResultModal.js";

import { colors } from "../../theme";

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
  LinearProgress,
  Container,
} from "@material-ui/core";

//IMPORT ICONS
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import AspectRatioRoundedIcon from "@material-ui/icons/AspectRatioRounded";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";

import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";

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
  DB_GET_TOKEN_PD,
  DB_GET_TOKEN_PD_RETURNED,
  DB_GET_USER_TOKEN_PD,
  DB_GET_USER_TOKEN_PD_RETURNED,
  DB_CREATE_PD,
  DB_CREATE_PD_RETURNED,
  DB_CHECK_PD_RESULT,
  DB_CHECK_PD_RESULT_RETURNED,
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
      tokenPD: [],
      userTokenPD: [],
      pdEnabled: false,
      pdLoaded: false,
      modalOpen: false,
    };
  }

  componentDidMount() {
    const account = store.getStore("account");

    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(DB_GET_TOKEN_PD_RETURNED, this.db_GetTokenPDReturned);
    emitter.on(DB_GET_USER_TOKEN_PD_RETURNED, this.db_getUserTokenPDReturned);
    emitter.on(DB_CREATE_PD_RETURNED, this.db_createPDReturned);
    emitter.on(DB_CHECK_PD_RESULT_RETURNED, this.db_checkPDResultReturned);

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
    emitter.removeListener(
      DB_GET_TOKEN_PD_RETURNED,
      this.db_GetTokenPDReturned
    );
    emitter.removeListener(
      DB_GET_USER_TOKEN_PD_RETURNED,
      this.db_getUserTokenPDReturned
    );
    emitter.removeListener(DB_CREATE_PD_RETURNED, this.db_createPDReturned);
    emitter.removeListener(
      DB_CHECK_PD_RESULT_RETURNED,
      this.db_checkPDResultReturned
    );
  }

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    const account = store.getStore("account");

    dispatcher.dispatch({
      type: DB_GET_TOKEN_PD,
      tokenID: data[0].id,
    });
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

  formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i = parseInt(
        (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
      ).toString();
      let j = i.length > 3 ? i.length % 3 : 0;

      return (
        negativeSign +
        (j ? i.substr(0, j) + thousands : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount
          ? decimal +
            Math.abs(amount - i)
              .toFixed(decimalCount)
              .slice(2)
          : "")
      );
    } catch (e) {
      console.log(e);
    }
  };

  db_GetTokenPDReturned = async (data) => {
    dispatcher.dispatch({
      type: DB_GET_USER_TOKEN_PD,
      tokenID: this.state.coinData.id,
    });
    let results = await this.getVoteResults(data);
    this.setState({ tokenPD: data, voteResults: await results });
  };

  getVoteResults = async (data) => {
    let voteDump = 0;
    let votePump = 0;
    for (var i = 0; i < data.length; i++) {
      data[i].vote ? votePump++ : voteDump++;
    }
    let sharePump = ((votePump / (votePump + voteDump)) * 100).toString() + "%";
    let shareDump = ((voteDump / (votePump + voteDump)) * 100).toString() + "%";

    let voteResults = {
      pump: { result: votePump, percent: sharePump },
      dump: { result: voteDump, percent: shareDump },
    };
    return voteResults;
  };

  db_getUserTokenPDReturned = (data) => {
    if (data.length > 0) {
      //TODO CALCULATE REMAINING TIME UNTIL P&D is ready
      // console.log({ message: "user has active PD", data: data[0] });
      this.setState({ userTokenPD: data[0], pdEnabled: false, pdLoaded: true });
    } else {
      // console.log({ message: "user has no PD running", data: data });
      this.setState({ userTokenPD: data, pdEnabled: true, pdLoaded: true });
    }
  };

  timeRemaining = () => {
    let dateEnd = new Date(this.state.userTokenPD.voteEnding);
    let dateNow = new Date();
    let remaining = dateEnd - dateNow;
    // let timeLimit = 120 * 1000; // 2min for testing
    let timeLimit = 12 * 60 * 60 * 1000; // 12hs for beta testing
    // let timeLimit = 24 * 60 * 60 * 1000; // 12hs for release

    let percentComplete = 0;
    if (remaining <= 0) {
      percentComplete = 100;
    } else {
      percentComplete = ((timeLimit - remaining) / timeLimit) * 100;
    }
    return percentComplete;
  };

  db_createPDReturned = (data) => {
    // console.log(data);

    dispatcher.dispatch({
      type: DB_GET_TOKEN_PD,
      tokenID: this.state.coinData.id,
    });
    this.setState({ userTokenPD: data, pdEnabled: false });
  };

  db_checkPDResultReturned = (data) => {
    // console.log(data);
    dispatcher.dispatch({
      type: DB_GET_TOKEN_PD,
      tokenID: this.state.coinData.id,
    });
    this.setState({ modalOpen: true, modalData: data });

    //TODO: TRIGGER FUNCTION TO ADD SCREEN DIM AND DIALOG SHOWING RESULT HERE <<<
  };

  db_checkPDResult = (data) => {
    dispatcher.dispatch({
      type: DB_CHECK_PD_RESULT,
      tokenID: this.state.coinData.id,
    });
  };

  pump = () => {
    dispatcher.dispatch({
      type: DB_CREATE_PD,
      tokenID: this.state.coinData.id,
      vote: "pump",
    });
  };

  dump = () => {
    dispatcher.dispatch({
      type: DB_CREATE_PD,
      tokenID: this.state.coinData.id,
      vote: "dump",
    });
  };

  dataDisplaySide = () => {
    const { classes } = this.props;
    const { selectA, dataLoaded, coinData, vs, voteResults } = this.state;
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
                        {this.formatMoney(
                          coinData.market_data.market_cap[vs],
                          2
                        )}{" "}
                        {[vs]}
                      </Typography>
                    </Grid>
                    <Grid item container direction="row">
                      <Typography>Fully diluted: </Typography>
                      <Typography variant="subtitle1">
                        {this.formatMoney(
                          coinData.market_data.fully_diluted_valuation[vs],
                          2
                        )}{" "}
                        {[vs]}
                      </Typography>
                    </Grid>
                    <Grid item container direction="row">
                      <Typography>Max Supply: </Typography>
                      <Typography variant="subtitle1">
                        {this.formatMoney(coinData.market_data.max_supply, 0)}
                      </Typography>
                    </Grid>
                    <Grid item container direction="row">
                      <Typography>Circulating Supply: </Typography>
                      <Typography variant="subtitle1">
                        {this.formatMoney(
                          coinData.market_data.circulating_supply,
                          0
                        )}
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
              className={classes.MarketcapChips}
              elevation={1}
              variant="outlined"
              style={{
                marginTop: 10,
              }}
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
                  <Typography variant="subtitle1">Pump & Dump</Typography>
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
                    {this.state.pdLoaded && this.state.pdEnabled && (
                      <Grid
                        item
                        container
                        direction="row"
                        justify="space-around"
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<ThumbUpIcon />}
                          onClick={() => this.pump()}
                        >
                          Pump
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<ThumbDownIcon />}
                          onClick={() => this.dump()}
                        >
                          Dump
                        </Button>
                      </Grid>
                    )}
                    {this.state.pdLoaded && !this.state.pdEnabled && (
                      <>
                        <Grid
                          item
                          container
                          direction="row"
                          justify="space-around"
                        >
                          <Button
                            variant={
                              this.state.userTokenPD.vote
                                ? "contained"
                                : "outlined"
                            }
                            color="primary"
                            startIcon={<ThumbUpIcon />}
                          >
                            Pump
                          </Button>
                          <Button
                            variant={
                              this.state.userTokenPD.vote
                                ? "outlined"
                                : "contained"
                            }
                            color="secondary"
                            startIcon={<ThumbDownIcon />}
                          >
                            Dump
                          </Button>
                        </Grid>
                      </>
                    )}
                    {this.state.pdLoaded && (
                      <Grid
                        item
                        container
                        direction="row"
                        justify="space-around"
                      >
                        <Grid
                          container
                          direction="row"
                          justify="center"
                          alignItems="flex-start"
                          spacing={0}
                          style={{ marginTop: "10px", width: "90%" }}
                        >
                          <Grid
                            style={{ width: voteResults.pump.percent }}
                            item
                          >
                            <Typography
                              component="div"
                              style={{
                                backgroundColor: colors.cgGreen,
                                minWidth: "100%",
                                width: "100%",
                                height: "5px",
                              }}
                            />
                          </Grid>
                          <Grid
                            style={{ width: voteResults.dump.percent }}
                            item
                          >
                            <Typography
                              component="div"
                              style={{
                                backgroundColor: colors.cgRed,
                                height: "5px",
                                width: "100%",
                              }}
                            />
                          </Grid>
                        </Grid>
                        {!this.state.pdEnabled && (
                          <>
                            <Typography style={{ marginTop: 10 }}>
                              Time remaining
                            </Typography>
                            <div style={{ width: "100%" }}>
                              <LinearProgress
                                variant="determinate"
                                value={this.timeRemaining()}
                              />
                            </div>
                          </>
                        )}
                        {this.timeRemaining() === 100 && (
                          <Button
                            style={{ marginTop: 20 }}
                            variant="outlined"
                            color="primary"
                            onClick={() => this.db_checkPDResult()}
                          >
                            Check Results
                          </Button>
                        )}
                      </Grid>
                    )}
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

    const handleClick = (timeFrame) => {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinData.id, , timeFrame, vs],
      });
      this.setState({ timeFrame: timeFrame });
    };

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
                  alignItems="flex-end"
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
                          onClick={() => {
                            handleClick(1);
                          }}
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
                          onClick={() => {
                            handleClick(7);
                          }}
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
                          onClick={() => {
                            handleClick(30);
                          }}
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
                          onClick={() => {
                            handleClick(60);
                          }}
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
                          onClick={() => {
                            handleClick(365);
                          }}
                          label={`${coinData.market_data.price_change_percentage_1y_in_currency[vs]}%`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" container>
                      <Grid item>
                        <Chip
                          variant="outlined"
                          color={"primary"}
                          onClick={() => {
                            handleClick("max");
                          }}
                          label={"All"}
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

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  renderModal = (data) => {
    return (
      <PDvoteResultModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
        modalData={data}
      />
    );
  };

  render() {
    const { classes } = this.props;
    const { selectA, dataLoaded, coinData, modalOpen, modalData } = this.state;

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
        {modalOpen && this.renderModal(modalData)}
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(CryptoDetective));
