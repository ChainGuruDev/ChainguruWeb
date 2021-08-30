import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ReactHtmlParser from "react-html-parser";

//IMPORT COMPONENTS
import CoinSearchBar from "../components/CoinSearchBar.js";
import PriceChart from "../components/Chart.js";
import LSvoteResultModal from "../components/lsVoteResultModal.js";

import LongShortMini from "./longShortMini.js";

import { formatMoney, formatMoneyMCAP } from "../helpers";
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
  Link,
  LinearProgress,
  CircularProgress,
  IconButton,
} from "@material-ui/core";

//IMPORT ICONS
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";

import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
//WEB LINKS ICONS
import LinkIcon from "@material-ui/icons/Link";
import ForumIcon from "@material-ui/icons/Forum";
import TelegramIcon from "@material-ui/icons/Telegram";
import TwitterIcon from "@material-ui/icons/Twitter";
import RedditIcon from "@material-ui/icons/Reddit";
import FacebookIcon from "@material-ui/icons/Facebook";
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
  COIN_PRICECHART_RETURNED,
  DB_GET_TOKEN_LS,
  DB_GET_TOKEN_LS_RETURNED,
  DB_GET_USER_TOKEN_LS,
  DB_GET_USER_TOKEN_LS_RETURNED,
  DB_CREATE_LS,
  DB_CREATE_LS_RETURNED,
  DB_CHECK_LS_RESULT,
  DB_CHECK_LS_RESULT_RETURNED,
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
    minHeight: "100%",
    justifyContent: "space-around",
  },
  favCard: {
    padding: 10,
    margin: "10px 0px",
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "flex-start",
  },
  graphCard: {
    padding: 10,
    margin: "10px 0px",
    flex: 1,
    direction: "column",
  },
  rootTabs: {
    flexGrow: 1,
    width: "100%",
    background: "linear-gradient(to top, #F37335, #FDC830)",
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
  },
  titleBar: {
    cursor: "pointer",
    background: "rgba(121, 216, 162, 0.1)",
    paddingBottom: "5",
    maxWidth: "inherit",
    position: "relative",
    minWidth: "150%",
    filter: "blur(1px)",
    overflow: "hidden",
    margin: "0",
    minHeight: "50px",
    zIndex: "1",
    "&:hover": {
      background: "rgba(121, 216, 162, 0.25)",
    },
    transition: "0.4321s",
  },
  button: {
    transition: "0.33s",
    "&:hover": {
      color: colors.cgGreen,
    },
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
      tokenLS: [],
      userTokenLS: [],
      lsEnabled: false,
      lsLoaded: false,
      modalOpen: false,
      loadingPriceChart: true,
    };
  }

  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(DB_GET_TOKEN_LS_RETURNED, this.db_GetTokenLSReturned);
    emitter.on(DB_GET_USER_TOKEN_LS_RETURNED, this.db_getUserTokenLSReturned);
    emitter.on(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.on(DB_CHECK_LS_RESULT_RETURNED, this.db_checkLSResultReturned);
    emitter.on(COIN_PRICECHART_RETURNED, this.priceChartReturned);

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
      DB_GET_TOKEN_LS_RETURNED,
      this.db_GetTokenLSReturned
    );
    emitter.removeListener(
      DB_GET_USER_TOKEN_LS_RETURNED,
      this.db_getUserTokenLSReturned
    );
    emitter.removeListener(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.removeListener(
      DB_CHECK_LS_RESULT_RETURNED,
      this.db_checkLSResultReturned
    );
    emitter.removeListener(COIN_PRICECHART_RETURNED, this.priceChartReturned);
  }

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    dispatcher.dispatch({
      type: DB_GET_TOKEN_LS,
      tokenID: data[0].id,
    });
    this.setState({
      coinData: data[0],
      dataLoaded: true,
    });
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
    this.setState({ vs: vsCoin });
  };

  graphTimeFrameChanged = (data) => {
    const { coinData, vs } = this.state;
    this.setState({ timeFrame: data, loadingPriceChart: true });

    if (coinData.id) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinData.id, this.props.id, data, vs],
      });
    }
  };

  db_GetTokenLSReturned = async (data) => {
    dispatcher.dispatch({
      type: DB_GET_USER_TOKEN_LS,
      tokenID: this.state.coinData.id,
    });
    let results = await this.getVoteResults(data);
    this.setState({ tokenLS: data, voteResults: await results });
  };

  getVoteResults = async (data) => {
    let voteShort = 0;
    let voteLong = 0;
    for (var i = 0; i < data.length; i++) {
      data[i].vote ? voteLong++ : voteShort++;
    }
    let shareLong =
      ((voteLong / (voteLong + voteShort)) * 100).toString() + "%";
    let shareShort =
      ((voteShort / (voteLong + voteShort)) * 100).toString() + "%";

    let voteResults = {
      long: { result: voteLong, percent: shareLong },
      short: { result: voteShort, percent: shareShort },
    };
    return voteResults;
  };

  db_getUserTokenLSReturned = (data) => {
    if (data.length > 0) {
      //TODO CALCULATE REMAINING TIME UNTIL P&D is ready
      // console.log({ message: "user has active LS", data: data[0] });
      this.setState({ userTokenLS: data[0], lsEnabled: false, lsLoaded: true });
    } else {
      // console.log({ message: "user has no LS running", data: data });
      this.setState({ userTokenLS: data, lsEnabled: true, lsLoaded: true });
    }
  };

  timeRemaining = () => {
    let dateEnd = new Date(this.state.userTokenLS.voteEnding);
    let dateNow = new Date();
    let remaining = dateEnd - dateNow;
    // let timeLimit = 120 * 1000; // 2min for testing
    //let timeLimit = 12 * 60 * 60 * 1000; // 12hs for beta testing
    let timeLimit = 24 * 60 * 60 * 1000; // 24hs for release

    let percentComplete = 0;
    if (remaining <= 0) {
      percentComplete = 100;
    } else {
      percentComplete = ((timeLimit - remaining) / timeLimit) * 100;
    }
    return percentComplete;
  };

  db_createLSReturned = (data) => {
    // console.log(data);

    dispatcher.dispatch({
      type: DB_GET_TOKEN_LS,
      tokenID: this.state.coinData.id,
    });
    this.setState({ userTokenLS: data, pdEnabled: false });
  };

  db_checkLSResultReturned = (data) => {
    // console.log(data);
    dispatcher.dispatch({
      type: DB_GET_TOKEN_LS,
      tokenID: this.state.coinData.id,
    });
    this.setState({ modalOpen: true, modalData: data });

    //TODO: TRIGGER FUNCTION TO ADD SCREEN DIM AND DIALOG SHOWING RESULT HERE <<<
  };

  db_checkLSResult = (data) => {
    dispatcher.dispatch({
      type: DB_CHECK_LS_RESULT,
      tokenID: this.state.coinData.id,
    });
  };

  long = () => {
    dispatcher.dispatch({
      type: DB_CREATE_LS,
      tokenID: this.state.coinData.id,
      vote: "long",
    });
  };

  short = () => {
    dispatcher.dispatch({
      type: DB_CREATE_LS,
      tokenID: this.state.coinData.id,
      vote: "short",
    });
  };

  priceChartReturned = () => {
    this.setState({ loadingPriceChart: false });
  };

  drawMarket = (coinData, vs) => {
    const { classes } = this.props;

    return (
      <Card className={classes.MarketcapChips} elevation={1} variant="outlined">
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch"
          item
          xs={12}
          padding={5}
        >
          <Grid item>
            <Typography
              variant="h4"
              color="primary"
              style={{ textAlign: "center" }}
            >
              Market
            </Typography>
            <Divider variant="middle" />
            {coinData.market_data.market_cap[vs] > 0 && (
              <Grid item container direction="row" justify="space-between">
                <Typography>Marketcap: </Typography>
                <Typography
                  variant="subtitle1"
                  style={{ marginLeft: 5 }}
                  color="primary"
                >
                  {formatMoney(coinData.market_data.market_cap[vs], "0")}
                </Typography>
              </Grid>
            )}
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
            >
              {coinData.market_data.market_cap_rank > 0 && (
                <Chip
                  variant="outlined"
                  color={"primary"}
                  label={`Rank ${coinData.market_data.market_cap_rank}`}
                />
              )}
              {coinData.market_data
                .market_cap_change_percentage_24h_in_currency[vs] > 0 && (
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
                      .market_cap_change_percentage_24h_in_currency[vs] > 0 ? (
                      <ArrowDropUpRoundedIcon />
                    ) : (
                      <ArrowDropDownRoundedIcon />
                    )
                  }
                  label={`${formatMoney(
                    coinData.market_data
                      .market_cap_change_percentage_24h_in_currency[vs]
                  )} % 24hs`}
                />
              )}
              {coinData.liquidity_score > 0 && (
                <Chip
                  variant="outlined"
                  color="primary"
                  label={`Liquidity Score: ${formatMoney(
                    coinData.liquidity_score
                  )}`}
                />
              )}
            </Grid>
            {coinData.market_data.fully_diluted_valuation[vs] > 0 && (
              <Grid item container direction="row" justify="space-between">
                <Typography>Fully diluted: </Typography>
                <Typography variant="subtitle1" color="primary">
                  {formatMoney(
                    coinData.market_data.fully_diluted_valuation[vs],
                    "0"
                  )}
                </Typography>
              </Grid>
            )}
            {coinData.market_data.max_supply > 0 && (
              <Grid item container direction="row" justify="space-between">
                <Typography>Max Supply: </Typography>
                <Typography variant="subtitle1" color="primary">
                  {formatMoney(coinData.market_data.max_supply, 0)}
                </Typography>
              </Grid>
            )}
            {coinData.market_data.circulating_supply > 0 && (
              <Grid item container direction="row" justify="space-between">
                <Typography>Circulating Supply: </Typography>
                <Typography variant="subtitle1" color="primary">
                  {formatMoney(coinData.market_data.circulating_supply, 0)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Card>
    );
  };
  drawLinks = (coinData) => {
    const { classes } = this.props;

    return (
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
            <Typography
              variant="h4"
              color="primary"
              style={{ textAlign: "center" }}
            >
              Links
            </Typography>
            <Divider variant="middle" />
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
                      <Link target="_blank" href={coinData.links.homepage[0]}>
                        <Button
                          variant="outlined"
                          size="small"
                          className={classes.button}
                          startIcon={<LinkIcon />}
                        >
                          Web
                        </Button>
                      </Link>
                    </Typography>
                  </Grid>
                )}
                {coinData.links.facebook_username && (
                  <Grid item>
                    <Typography variant="subtitle1">
                      <Link
                        target="_blank"
                        href={`https://www.facebook.com/${coinData.links.facebook_username}`}
                      >
                        <IconButton
                          variant="outlined"
                          className={classes.button}
                        >
                          <FacebookIcon />
                        </IconButton>
                      </Link>
                    </Typography>
                  </Grid>
                )}
                {coinData.links.subreddit_url && (
                  <Grid item>
                    <Typography variant="subtitle1">
                      <Link
                        target="_blank"
                        href={`${coinData.links.subreddit_url}`}
                      >
                        <IconButton
                          variant="outlined"
                          className={classes.button}
                        >
                          <RedditIcon />
                        </IconButton>
                      </Link>
                    </Typography>
                  </Grid>
                )}
                {coinData.links.twitter_screen_name && (
                  <Grid item>
                    <Typography variant="subtitle1">
                      <Link
                        target="_blank"
                        href={`https://twitter.com/${coinData.links.twitter_screen_name}`}
                      >
                        <IconButton
                          variant="outlined"
                          className={classes.button}
                        >
                          <TwitterIcon />
                        </IconButton>
                      </Link>
                    </Typography>
                  </Grid>
                )}
                {coinData.links.telegram_channel_identifier && (
                  <Grid item>
                    <Typography variant="subtitle1">
                      <Link
                        target="_blank"
                        href={`https://t.me/${coinData.links.telegram_channel_identifier}`}
                      >
                        <IconButton
                          variant="outlined"
                          className={classes.button}
                        >
                          <TelegramIcon />
                        </IconButton>
                      </Link>
                    </Typography>
                  </Grid>
                )}
                {coinData.links.official_forum_url[0] && (
                  <Grid item>
                    <Typography variant="subtitle1">
                      <Link
                        target="_blank"
                        href={coinData.links.official_forum_url[0]}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          className={classes.button}
                          startIcon={<ForumIcon />}
                        >
                          Forum
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
                          size="small"
                          className={classes.button}
                          startIcon={<CompassCalibrationIcon />}
                        >
                          Block explorer
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
                      <Link target="_blank" href={coinData.links.chat_url[0]}>
                        <Button
                          variant="outlined"
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
    );
  };
  drawCommunity = (coinData) => {
    const { classes } = this.props;
    return (
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
            <Typography
              variant="h4"
              color="primary"
              style={{ textAlign: "center" }}
            >
              Community
            </Typography>
            <Divider variant="middle" />
            <Grid item>
              <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
                item
                xs={12}
                padding={5}
              >
                {coinData.community_data.facebook_likes && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Facebook Likes: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(coinData.community_data.facebook_likes, 0)}
                    </Typography>
                  </Grid>
                )}
                {coinData.community_data.reddit_accounts_active_48h > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Reddit accounts active 48hs: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.community_data.reddit_accounts_active_48h,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.community_data.reddit_average_comments_48h > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Reddit average comments 48hs:</Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.community_data.reddit_average_comments_48h,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.community_data.reddit_average_posts_48h > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Reddit posts 48hs: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.community_data.reddit_average_posts_48h,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.community_data.reddit_subscribers > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Reddit subscribers: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.community_data.reddit_subscribers,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.community_data.telegram_channel_user_count > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Telegram channel users: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.community_data.telegram_channel_user_count,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.community_data.twitter_followers > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Twitter followers: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.community_data.twitter_followers,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              <Typography>Social Sentiment: </Typography>
              <LinearProgress
                variant="determinate"
                value={coinData.sentiment_votes_up_percentage}
                style={{ backgroundColor: colors.cgRed }}
              />
              <Grid
                container
                direction="row"
                style={{ justifyContent: "space-between" }}
              >
                <Grid item>{coinData.sentiment_votes_up_percentage}</Grid>
                <Grid item>{coinData.sentiment_votes_down_percentage}</Grid>
              </Grid>
            </Grid>
            <Grid
              style={{
                marginTop: 10,
                marginBottom: 10,
              }}
              container
              direction="column"
              justify="center"
              alignItems="center"
              item
              xs={12}
              padding={5}
            >
              {coinData.community_score > 0 && (
                <Grid item>
                  <Chip
                    variant="outlined"
                    color="primary"
                    label={`Score: ${formatMoney(coinData.community_score, 0)}`}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Card>
    );
  };
  drawDevelopers = (coinData, vs) => {
    const { classes } = this.props;

    return (
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
            <Typography
              variant="h4"
              color="primary"
              style={{ textAlign: "center" }}
            >
              Developers
            </Typography>
            <Divider variant="middle" />
            <Grid item>
              <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
                item
                xs={12}
                padding={5}
              >
                {coinData.developer_data.closed_issues > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Closed issues: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(coinData.developer_data.closed_issues, 0)}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.commit_count_4_weeks > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Commits last month: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.developer_data.commit_count_4_weeks,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.code_additions_deletions_4_weeks
                  .additions > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Code add/delete last month: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.developer_data.code_additions_deletions_4_weeks
                          .additions,
                        0
                      )}
                    </Typography>
                    /
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="secondary"
                    >
                      {formatMoney(
                        coinData.developer_data.code_additions_deletions_4_weeks
                          .deletions,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.forks > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Forks: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(coinData.developer_data.forks, 0)}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.pull_request_contributors > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Pull request contributors: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.developer_data.pull_request_contributors,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.pull_requests_merged > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Pull request merged: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(
                        coinData.developer_data.pull_requests_merged,
                        0
                      )}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.stars > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Stars: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(coinData.developer_data.stars, 0)}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.subscribers > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Subscribers: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(coinData.developer_data.subscribers, 0)}
                    </Typography>
                  </Grid>
                )}
                {coinData.developer_data.total_issues > 0 && (
                  <Grid item container direction="row" justify="space-between">
                    <Typography>Total issues: </Typography>
                    <Typography
                      variant="subtitle1"
                      style={{ marginLeft: 5 }}
                      color="primary"
                    >
                      {formatMoney(coinData.developer_data.total_issues, 0)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
            {coinData.community_score > 0 && (
              <Grid
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                }}
                container
                direction="column"
                justify="center"
                alignItems="center"
                item
                xs={12}
                padding={5}
              >
                <Grid item>
                  <Chip
                    variant="outlined"
                    color="primary"
                    label={`Score: ${formatMoney(coinData.community_score)}`}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Card>
    );
  };

  dataDisplaySide = () => {
    const { classes } = this.props;
    const { coinData, vs, voteResults } = this.state;

    return (
      <div>
        <Card
          className={classes.favCard}
          style={{ maxHeight: "max-content" }}
          elevation={3}
        >
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
          >
            <CoinSearchBar />
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
              <Grid
                item
                container
                direction="row"
                justify={"flex-start"}
                xs={6}
              >
                <div className={classes.image}>
                  <img
                    className={classes.img}
                    alt="coin-icon"
                    src={coinData.image.small}
                  />
                </div>
                <Grid item>
                  <Grid
                    container
                    direction="column"
                    alignItems="flex-start"
                    item
                    xs={12}
                    style={{ marginLeft: 5 }}
                  >
                    <Typography variant="body1">{coinData.name}</Typography>
                    <Typography variant="subtitle1">
                      {coinData.symbol}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                container
                direction="row"
                xs={12}
                sm={6}
                justify="flex-end"
              >
                <Grid item>
                  <Typography
                    color="textSecondary"
                    align="right"
                    noWrap
                    variant="h2"
                  >
                    {coinData.market_data.current_price[vs]}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    color="textPrimary"
                    align="right"
                    variant="subtitle1"
                    style={{ marginLeft: 5 }}
                  >
                    {vs}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {this.drawMarket(coinData, vs)}
            {this.drawLinks(coinData)}
            {this.drawCommunity(coinData)}
            {this.drawDevelopers(coinData)}
          </Grid>
        </Card>
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
            <Grid
              direction="row"
              container
              justify="space-around"
              alignItems="flex-start"
              item
            ></Grid>
            <LongShortMini />
          </Grid>
        </Grid>
      </div>
    );
  };

  dataDisplayMain = () => {
    const { classes } = this.props;
    const { coinData, vs, loadingPriceChart } = this.state;

    const handleClick = (timeFrame) => {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinData.id, null, timeFrame, vs],
      });
      this.setState({ timeFrame: timeFrame, loadingPriceChart: true });
    };

    return (
      <div>
        <Card
          className={classes.graphCard}
          style={{ maxHeight: "max-content" }}
          elevation={3}
        >
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
                            style={
                              this.state.timeFrame === 1
                                ? {
                                    background:
                                      coinData.market_data
                                        .price_change_percentage_24h_in_currency[
                                        vs
                                      ] > 0
                                        ? colors.cgGreen
                                        : colors.cgOrange,
                                    color: "#000",
                                    fontSize: "16px",
                                  }
                                : {}
                            }
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
                            label={`${formatMoney(
                              coinData.market_data
                                .price_change_percentage_24h_in_currency[vs]
                            )}%`}
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
                            style={
                              this.state.timeFrame === 7
                                ? {
                                    background:
                                      coinData.market_data
                                        .price_change_percentage_7d_in_currency[
                                        vs
                                      ] > 0
                                        ? colors.cgGreen
                                        : colors.cgOrange,
                                    color: "#000",
                                    fontSize: "16px",
                                  }
                                : {}
                            }
                            label={`${formatMoney(
                              coinData.market_data
                                .price_change_percentage_7d_in_currency[vs],
                              2
                            )}%`}
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
                            style={
                              this.state.timeFrame === 30
                                ? {
                                    background:
                                      coinData.market_data
                                        .price_change_percentage_30d_in_currency[
                                        vs
                                      ] > 0
                                        ? colors.cgGreen
                                        : colors.cgOrange,
                                    color: "#000",
                                    fontSize: "16px",
                                  }
                                : {}
                            }
                            label={`${formatMoney(
                              coinData.market_data
                                .price_change_percentage_30d_in_currency[vs]
                            )}%`}
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
                            style={
                              this.state.timeFrame === 60
                                ? {
                                    background:
                                      coinData.market_data
                                        .price_change_percentage_60d_in_currency[
                                        vs
                                      ] > 0
                                        ? colors.cgGreen
                                        : colors.cgOrange,
                                    color: "#000",
                                    fontSize: "16px",
                                  }
                                : {}
                            }
                            label={`${formatMoney(
                              coinData.market_data
                                .price_change_percentage_60d_in_currency[vs]
                            )}%`}
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
                            style={
                              this.state.timeFrame === 365
                                ? {
                                    background:
                                      coinData.market_data
                                        .price_change_percentage_1y_in_currency[
                                        vs
                                      ] > 0
                                        ? colors.cgGreen
                                        : colors.cgOrange,
                                    fontSize: "16px",
                                    color: "#000",
                                  }
                                : {}
                            }
                            label={`${formatMoney(
                              coinData.market_data
                                .price_change_percentage_1y_in_currency[vs]
                            )}%`}
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
                            style={
                              this.state.timeFrame === "max"
                                ? {
                                    background: colors.cgGreen,
                                    color: "#000",
                                    fontSize: "16px",
                                  }
                                : {}
                            }
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
            {loadingPriceChart && (
              <Grid
                item
                container
                style={{ minHeight: "50vh" }}
                justify="center"
                alignItems="center"
              >
                <CircularProgress />
              </Grid>
            )}
            <Grid
              item
              style={{
                height: loadingPriceChart ? "0" : "100%",
                transition: !loadingPriceChart ? "0.5s" : "0s",
                opacity: !loadingPriceChart ? 100 : 0,
              }}
            >
              <PriceChart
                style={{}}
                id={this.props.id}
                coinID={coinData.id}
                vsCoin={vs}
                timeFrame={this.state.timeFrame}
              />
            </Grid>
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
        </Card>
      </div>
    );
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  renderModal = (data) => {
    return (
      <LSvoteResultModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
        modalData={data}
      />
    );
  };

  render() {
    const { classes } = this.props;
    const { dataLoaded, coinData, modalOpen, modalData } = this.state;
    console.log(coinData);

    return (
      <div className={classes.root}>
        <Grid
          container
          spacing={3}
          justify="center"
          style={{ maxWidth: "90%" }}
        >
          <Grid item xs={3}>
            {dataLoaded && this.dataDisplaySide(coinData)}
          </Grid>
          <Grid item xs={9}>
            {dataLoaded && this.dataDisplayMain(coinData)}
          </Grid>
        </Grid>
        {modalOpen && this.renderModal(modalData)}
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(CryptoDetective));
