import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ReactHtmlParser from "react-html-parser";

//IMPORT COMPONENTS
import CoinSearchBar from "../components/CoinSearchBar.js";
import PriceChart from "../components/Chart.js";

import LongShortMini from "./longShortMini.js";
import TransactionsBig from "./transactionsBig.js";

import {
  formatMoney,
  formatMoneyMCAP,
  formatBigNumbers,
  percentage,
  dynamicSort,
  getVsSymbol,
} from "../helpers";

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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  CircularProgress,
} from "@material-ui/core";

//IMPORT ICONS
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";

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

import { CircularProgressLabel, Pie } from "../muiCustom";
import {
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
  GET_COIN_DATA,
  GRAPH_TIMEFRAME_CHANGED,
  SWITCH_VS_COIN_RETURNED,
  GET_COIN_PRICECHART,
  COIN_PRICECHART_RETURNED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  GETTING_NEW_CHART_DATA,
  DB_GET_ADDRESS_TX,
  DB_GET_ADDRESS_TX_RETURNED,
  LOGIN_RETURNED,
} from "../../constants";

import {
  ZERION_GET_ASSETSTATS,
  ZERION_ASSETSTATS_RETURNED,
} from "../../constants/zerion.js";

import Store from "../../stores";
import Zerion_Store from "../../stores/zerionStore.js";

const emitter = Store.emitter;
const store = Store.store;
const dispatcher = Store.dispatcher;

const emitterZerion = Zerion_Store.emitter;
const dispatcherZerion = Zerion_Store.dispatcher;

const CryptoNews = React.lazy(() => import("../tools/news.js"));

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
  priceChipTitle: {
    textAlign: "center",
  },
  expandIcon: {
    webkitTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    mozTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    oTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transform: "rotate(180deg)",
  },
  unexpandIcon: {
    webkitTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    mozTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    oTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transform: "rotate(0deg)",
  },
  expand: {
    opacity: 1,
    transition: "all .5s cubic-bezier(.65,.05,.36,1)",
  },
  contract: {
    opacity: 0,
    maxHeight: "0px",
    transition: "all .5s cubic-bezier(.65,.05,.36,1)",
  },
  itemContainer: {
    transition: "all .5s cubic-bezier(.65,.05,.36,1)",
  },
});

class CryptoDetective extends Component {
  constructor(props) {
    super(props);
    let vsCoin = store.getStore("vsCoin");
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");
    const userWallets = store.getStore("userWallets");

    this.newSearch = this.newSearch.bind(this);
    this.state = {
      userAuth: userAuth,
      account: account,
      loading: false,
      coinList: [],
      valueTab: 0,
      dataLoaded: false,
      vs: vsCoin,
      timeFrame: "max",
      coinData: null,
      tokenLS: [],
      loadingPriceChart: true,
      userWallets: userWallets,
      portfolioBalances: null,
      portfolioStats: null,
      portfolioDataLoaded: false,
      portfolioDataExpanded: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    const { userAuth, account } = this.state;
    emitter.on(DB_USERDATA_RETURNED, this.userDataReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(COIN_PRICECHART_RETURNED, this.priceChartReturned);
    emitter.on(GETTING_NEW_CHART_DATA, this.newSearch);
    emitter.on(DB_GET_ADDRESS_TX_RETURNED, this.txReturned);
    emitter.on(LOGIN_RETURNED, this.loginReturned);

    emitterZerion.on(ZERION_ASSETSTATS_RETURNED, this.db_getAssetStatsReturned);

    if (userAuth && account && account.address) {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_USERDATA,
          address: account.address,
        });
    }

    if (this.props.coinID) {
      this._isMounted &&
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: this.props.coinID,
        });
    }
    if (!this.state.vs) {
      this.getVsCoin();
    }
    this._isMounted &&
      (this.interval = setInterval(
        () => this.updateTokenData(),
        60 * 1000 * 5
      )); //update every 5mins
  }

  componentWillUnmount() {
    emitter.removeListener(DB_USERDATA_RETURNED, this.userDataReturned);
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(GRAPH_TIMEFRAME_CHANGED, this.graphTimeFrameChanged);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);

    emitterZerion.removeListener(
      ZERION_ASSETSTATS_RETURNED,
      this.db_getAssetStatsReturned
    );
    emitter.removeListener(COIN_PRICECHART_RETURNED, this.priceChartReturned);
    emitter.removeListener(GETTING_NEW_CHART_DATA, this.newSearch);
    emitter.removeListener(DB_GET_ADDRESS_TX_RETURNED, this.txReturned);
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);

    clearInterval(this.interval);
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.coinID !== this.props.match.params.coinID) {
      if (this.props.match.params.coinID) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        this._isMounted &&
          this.setState({
            loading: true,
            loadingPriceChart: true,
            portfolioBalances: null,
            portfolioStats: null,
            portfolioDataLoaded: false,
            portfolioDataExpanded: false,
          });
        this._isMounted &&
          dispatcher.dispatch({
            type: GET_COIN_DATA,
            content: this.props.match.params.coinID,
          });
      }
    }
  }

  updateTokenData() {
    if (this.state.coinData.id) {
      this._isMounted &&
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: this.state.coinData.id,
        });
    }
  }

  loginReturned = () => {
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    if (userAuth && account && account.address) {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_USERDATA,
          address: account.address,
        });
    }
    this._isMounted && this.setState({ userAuth: userAuth });
  };

  newSearch(newID) {
    this._isMounted &&
      this.setState({
        loading: true,
        loadingPriceChart: true,
        portfolioBalances: null,
        portfolioStats: null,
        portfolioDataLoaded: false,
        portfolioDataExpanded: false,
      });
    this.nav(newID);
  }

  txReturned = (data) => {
    if (data) {
      this._isMounted &&
        this.setState({
          error: false,
          loading: false,
          txDataLoaded: true,
          transactions: data.transactions,
        });
    }
  };

  userDataReturned = (data) => {
    const { coinData } = this.state;
    let wallets = [];
    let colours = [
      colors.cgGreen,
      colors.cgOrange,
      colors.cgYellow,
      colors.cgBlue,
      colors.cgRed,
    ];
    let walletColors = [];
    let query = "";
    data.wallets.forEach((item, i) => {
      var x = i;
      x %= colours.length;
      walletColors.push(colours[x]);
      wallets.push(item.wallet);
    });
    if (coinData) {
      if (coinData.id && this._isMounted) {
        if (coinData.contract_address) {
          dispatcherZerion.dispatch({
            type: ZERION_GET_ASSETSTATS,
            wallet: wallets,
            asset: { asset_code: coinData.contract_address },
          });
          dispatcher.dispatch({
            type: DB_GET_ADDRESS_TX,
            wallet: wallets,
            query: coinData.contract_address,
          });
          query = coinData.contract_address;
        } else if (coinData.symbol === "eth") {
          dispatcherZerion.dispatch({
            type: ZERION_GET_ASSETSTATS,
            wallet: wallets,
            asset: { asset_code: coinData.symbol },
          });
          dispatcher.dispatch({
            type: DB_GET_ADDRESS_TX,
            wallet: wallets,
            query: coinData.symbol,
          });
          query = coinData.symbol;
        }
      }
    }
    this._isMounted &&
      this.setState({
        userWallets: wallets,
        walletColors: walletColors,
        query: query,
        walletNicknames: data.walletNicknames,
      });
  };

  coinlistReturned = (payload) => {
    this._isMounted && this.setState({ coinList: payload });
  };

  coinDataReturned = async (data) => {
    let userWallets = null;
    if (this.state.userWallets) {
      userWallets = this.state.userWallets;
    }

    if (!data[0].error) {
      if (data[0].id) {
        this._isMounted &&
          dispatcher.dispatch({
            type: GET_COIN_PRICECHART,
            content: [
              data[0].id,
              this.props.id,
              this.state.timeFrame,
              this.state.vs,
            ],
          });
      }
      let query = "";
      if (this._isMounted && userWallets) {
        if (data[0].contract_address) {
          dispatcherZerion.dispatch({
            type: ZERION_GET_ASSETSTATS,
            wallet: userWallets,
            asset: { asset_code: data[0].contract_address },
          });
          dispatcher.dispatch({
            type: DB_GET_ADDRESS_TX,
            wallet: userWallets,
            query: data[0].contract_address,
          });
          query = data[0].contract_address;
        } else if (data[0].symbol === "eth") {
          dispatcherZerion.dispatch({
            type: ZERION_GET_ASSETSTATS,
            wallet: userWallets,
            asset: { asset_code: data[0].symbol },
          });
          dispatcher.dispatch({
            type: DB_GET_ADDRESS_TX,
            wallet: userWallets,
            query: data[0].symbol,
          });
          query = data[0].symbol;
        }
      }
      this._isMounted &&
        this.setState({
          coinData: data[0],
          dataLoaded: true,
          txDataLoaded: false,
          query: query,
        });
    }
    if (data[0].error) {
      console.log(`gecko says ${data[0].error}`);
      this._isMounted &&
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: "bitcoin",
        });
    }
  };

  getVsCoin = () => {
    let vsCoin;
    try {
      vsCoin = JSON.parse(localStorage.getItem("vsCoin"));
      if (!vsCoin) {
        vsCoin = "usd";
      }
      this._isMounted && this.setState({ vs: vsCoin });
    } catch (err) {
      vsCoin = "usd";
      this._isMounted && this.setState({ vs: vsCoin });
    }
  };

  vsCoinReturned = (vsCoin) => {
    const { coinData, userWallets } = this.state;
    if (this._isMounted && coinData.id) {
      dispatcher.dispatch({
        type: GET_COIN_PRICECHART,
        content: [coinData.id, this.props.id, this.state.timeFrame, vsCoin],
      });
      if (userWallets) {
        if (coinData.contract_address) {
          dispatcherZerion.dispatch({
            type: ZERION_GET_ASSETSTATS,
            wallet: userWallets,
            asset: { asset_code: coinData.contract_address },
          });
        } else if (coinData.symbol === "eth") {
          dispatcherZerion.dispatch({
            type: ZERION_GET_ASSETSTATS,
            wallet: userWallets,
            asset: { asset_code: coinData.symbol },
          });
        }
      }
    }

    this._isMounted && this.setState({ vs: vsCoin });
  };

  graphTimeFrameChanged = (data) => {
    const { coinData, vs } = this.state;
    this._isMounted &&
      this.setState({ timeFrame: data, loadingPriceChart: true });

    if (coinData.id) {
      this._isMounted &&
        dispatcher.dispatch({
          type: GET_COIN_PRICECHART,
          content: [coinData.id, this.props.id, data, vs],
        });
    }
  };

  db_getAssetStatsReturned = (stats, balance) => {
    let portfolioBalances = [];
    let portfolioStats = {
      avgBuyPrice: null,
      avgSellPrice: null,
      totalReturned: null,
      totalFeeSpent: null,
    };
    var createPortfolio = (wallet, balance, portfolioShare) => {
      return {
        wallet,
        balance,
        portfolioShare,
      };
    };
    if (stats[0] && stats[0].stats) {
      if (stats[0].stats.avg_buy_price_net || stats[0].stats.avg_buy_price) {
        portfolioStats.avgBuyPrice =
          stats[0].stats.avg_buy_price_net !== null
            ? stats[0].stats.avg_buy_price_net
            : stats[0].stats.avg_buy_price;
      }
      if (stats[0].stats.avg_sell_price_net || stats[0].stats.avg_sell_price) {
        portfolioStats.avgSellPrice =
          stats[0].stats.avg_sell_price_net !== null
            ? stats[0].stats.avg_sell_price_net
            : stats[0].stats.avg_sell_price;
      }
      if (stats[0].stats.total_returned) {
        portfolioStats.totalReturned = stats[0].stats.total_returned;
      }
      if (stats[0].stats.total_fee_spent) {
        portfolioStats.totalFeeSpent = stats[0].stats.total_fee_spent;
      }
    }
    if (balance) {
      balance.forEach((item, i) => {
        let balance = formatBigNumbers(item.quantity, item.decimals);
        let data = createPortfolio(item.wallet_address, balance);
        portfolioBalances.push(data);
      });
    }
    let totalBalance = 0;
    portfolioBalances.forEach((portfolio, i) => {
      totalBalance += portfolio.balance;
    });
    portfolioBalances.forEach((portfolio, i) => {
      let share = percentage(portfolio.balance, totalBalance);
      portfolio.portfolioShare = share;
    });
    portfolioBalances.totalBalance = totalBalance;
    portfolioBalances.sort(dynamicSort("-balance"));

    if (portfolioStats || portfolioBalances) {
      this._isMounted &&
        this.setState({
          portfolioDataLoaded: true,
          portfolioStats,
          portfolioBalances,
        });
    }
  };

  priceChartReturned = (data) => {
    this._isMounted &&
      this.setState({ loadingPriceChart: false, loading: false });
  };

  expandPortfolioData = (currentState) => {
    let newState = !currentState;

    var expandContract = document.getElementById("expandContract");
    var expandedContainer = document.getElementById("expandedItemsContainer");

    var expandedHeight;
    if (!this.state.expandedHeight) {
      if (expandedContainer) {
        expandedHeight = expandedContainer.clientHeight + 10 + "px";
      }
    } else {
      expandedHeight = this.state.expandedHeight;
    }
    if (expandedContainer) {
      expandedContainer.style.transform = newState
        ? "translateY(0%)"
        : `translateY(-${expandedHeight})`;
      // expandContract.style.opacity = newState ? 1 : 0;
    }
    expandContract.style.maxHeight = newState ? expandedHeight : 0;

    this._isMounted &&
      this.setState({
        portfolioDataExpanded: newState,
        expandedHeight: expandedHeight,
      });
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
                  {formatMoneyMCAP(coinData.market_data.market_cap[vs], "0") +
                    " " +
                    getVsSymbol(vs)}
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
                  ) +
                    " " +
                    getVsSymbol(vs)}
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

  drawWalletsWithAsset = (portfolioBalances) => {
    const { walletNicknames, walletColors } = this.state;
    const { coinData, vs } = this.state;

    let walletNick;
    return portfolioBalances.map((row, i) => (
      <TableRow hover={true} key={row.wallet} style={{ cursor: "pointer" }}>
        <TableCell align="left">
          <Typography variant={"h4"}>
            {(walletNick = walletNicknames.find(
              (ele) => ele.wallet.toLowerCase() === row.wallet
            )) && walletNick.nickname}
            {!walletNicknames.some(
              (e) => e.wallet.toLowerCase() === row.wallet
            ) &&
              row.wallet.substring(0, 6) +
                "..." +
                row.wallet.substring(row.wallet.length - 4, row.wallet.length)}
          </Typography>
          {(walletNick = walletNicknames.find(
            (ele) => ele.wallet.toLowerCase() === row.wallet
          )) && (
            <Typography variant="subtitle1">
              {row.wallet.substring(0, 6) +
                "..." +
                row.wallet.substring(row.wallet.length - 4, row.wallet.length)}
            </Typography>
          )}
        </TableCell>
        <TableCell align="left">
          <CircularProgressLabel
            percentage={row.portfolioShare}
            colour={walletColors[i]}
            size={50}
          />
        </TableCell>
        <TableCell align="left">
          <Typography variant={"h4"}>{formatMoney(row.balance)}</Typography>
        </TableCell>
        <TableCell align="left">
          {`${formatMoney(
            row.balance * coinData.market_data.current_price[vs]
          )} ${getVsSymbol(vs)}`}
        </TableCell>
      </TableRow>
    ));
  };

  dataDisplaySide = () => {
    const { classes } = this.props;
    const { coinData, vs } = this.state;

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
            <CoinSearchBar newSearch={this.newSearch} />
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
                <Grid item style={{ display: "flex", alignItems: "end" }}>
                  <Typography
                    color="textPrimary"
                    align="right"
                    variant="subtitle1"
                    style={{ marginLeft: 5 }}
                  >
                    {getVsSymbol(vs)}
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
            {this.state.userAuth && <LongShortMini tokenID={coinData.id} />}
          </Grid>
        </Grid>
      </div>
    );
  };

  dataDisplayMain = () => {
    const { classes } = this.props;
    const {
      coinData,
      vs,
      loadingPriceChart,
      portfolioStats,
      portfolioBalances,
      portfolioDataLoaded,
      portfolioDataExpanded,
      walletColors,
    } = this.state;

    const handleClick = (timeFrame) => {
      this._isMounted &&
        dispatcher.dispatch({
          type: GET_COIN_PRICECHART,
          content: [coinData.id, null, timeFrame, vs],
        });
      this._isMounted &&
        this.setState({ timeFrame: timeFrame, loadingPriceChart: true });
    };

    return (
      <div>
        <Card
          className={classes.graphCard}
          style={{ maxHeight: "max-content" }}
          elevation={3}
        >
          {portfolioDataLoaded && (
            <Grid item xs={12} style={{ marginBottom: 10 }}>
              <Card
                className={classes.MarketcapChips}
                elevation={1}
                variant="outlined"
              >
                <Grid
                  item
                  style={{
                    margin: "-10px -10px 0px",
                    padding: "5px 10px",
                    background: "#0002",
                    display: "flex",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    this.expandPortfolioData(portfolioDataExpanded)
                  }
                >
                  <Typography variant="subtitle1">Portfolio</Typography>
                  <IconButton
                    color="primary"
                    aria-label="Show Portfolio Data"
                    size="small"
                  >
                    {
                      <ExpandMoreIcon
                        id="expandIcon"
                        className={
                          portfolioDataExpanded
                            ? classes.expandIcon
                            : classes.unexpandIcon
                        }
                      />
                    }
                  </IconButton>
                </Grid>
                <Grid
                  style={{
                    marginTop: 3,
                  }}
                  direction="row"
                  container
                  justify="space-around"
                  alignItems="flex-end"
                  item
                  xs={12}
                >
                  <Grid item>
                    <Pie
                      data={portfolioBalances}
                      size={50}
                      colors={walletColors}
                    />
                  </Grid>
                  <Grid item>
                    <Grid direction="column" align="center" container>
                      <Grid item>
                        <Typography variant="subtitle2">Balance</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="h3">
                          {formatMoney(portfolioBalances.totalBalance) +
                            " " +
                            coinData.symbol}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" align="center" container>
                      <Grid item>
                        <Typography variant="subtitle2">Value</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="h3">
                          {formatMoney(
                            portfolioBalances.totalBalance *
                              coinData.market_data.current_price[vs]
                          ) +
                            " " +
                            getVsSymbol(vs)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" align="center" container>
                      <Grid item>
                        <Typography variant="subtitle2">
                          Avg. buy price
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="h3">
                          {`${formatMoney(
                            portfolioStats.avgBuyPrice
                          )} ${getVsSymbol(vs)}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" align="center" container>
                      <Grid item>
                        <Typography variant="subtitle2">
                          Avg. sell price
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="h3">
                          {`${formatMoney(
                            portfolioStats.avgSellPrice
                          )} ${getVsSymbol(vs)}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" align="center" container>
                      <Grid item>
                        <Typography variant="subtitle2">
                          Total Return
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="h3">
                          {`${formatMoney(
                            portfolioStats.totalReturned
                          )} ${getVsSymbol(vs)}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid direction="column" align="center" container>
                      <Grid item>
                        <Typography variant="subtitle2">
                          total spent on Fees
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="h3">
                          {`${formatMoney(
                            portfolioStats.totalFeeSpent
                          )} ${getVsSymbol(vs)}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <div style={{ overflow: "hidden", padding: "1px" }}>
                  <Grid
                    className={
                      portfolioDataExpanded ? classes.expand : classes.contract
                    }
                    id="expandContract"
                    direction="column"
                    container
                    alignItems="stretch"
                    item
                    container
                    xs={12}
                  >
                    <div
                      id="expandedItemsContainer"
                      className={classes.itemContainer}
                    >
                      <Divider />
                      <Table aria-label="portfolioHoldings">
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ width: 0 }} align="left">
                              Wallet
                            </TableCell>
                            <TableCell style={{ width: 0 }}>Share</TableCell>
                            <TableCell style={{ width: 0 }} align="left">
                              Balance
                            </TableCell>
                            <TableCell align="left">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.drawWalletsWithAsset(portfolioBalances)}
                        </TableBody>
                      </Table>
                    </div>
                  </Grid>
                </div>
              </Card>
            </Grid>
          )}
          <Grid item xs={12}>
            <Card
              className={classes.MarketcapChips}
              elevation={1}
              variant="outlined"
            >
              <Grid
                item
                style={{
                  margin: "-10px -10px 0px",
                  padding: "5px 10px",
                  background: "#0002",
                }}
              >
                <Typography variant="subtitle1">Price Performance</Typography>
              </Grid>
              <Grid
                style={{
                  marginTop: 3,
                }}
                direction="row"
                container
                justify="space-around"
                alignItems="flex-end"
                item
                xs={12}
              >
                <Grid item>
                  <Grid direction="column" align="center" container>
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
                            .price_change_percentage_24h_in_currency[vs] > 0 ? (
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
                  <Grid direction="column" align="center" container>
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
                            .price_change_percentage_7d_in_currency[vs] > 0 ? (
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
                  <Grid direction="column" align="center" container>
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
                            .price_change_percentage_30d_in_currency[vs] > 0 ? (
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
                  <Grid direction="column" align="center" container>
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
                            .price_change_percentage_60d_in_currency[vs] > 0 ? (
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
                    <Grid item className={classes.priceChipTitle}>
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
                            .price_change_percentage_1y_in_currency[vs] > 0 ? (
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
              aria-controls="description-content"
              id="description-header"
            >
              <Typography variant="h4">Description</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="subtitle1"
                style={{
                  textAlign: "left",
                  color: "inherit",
                  textDecoration: "inherit",
                }}
              >
                <div
                  style={{
                    textAlign: "left",
                    color: "inherit",
                    textDecoration: "inherit",
                  }}
                >
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
        {!this.state.loading && coinData.id && (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="transactionsAccordion"
              id="transactions-header"
            >
              <Typography variant="h4">Crypto News</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ padding: 0 }}>
              <CryptoNews
                toolTimeframe={this.props.toolTimeframe}
                currency={coinData.symbol}
              />
            </AccordionDetails>
          </Accordion>
        )}
        {!this.state.loading &&
          this.state.txDataLoaded &&
          this.state.transactions.length > 0 && (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="transactionsAccordion"
                id="transactions-header"
              >
                <Typography variant="h4">Transactions</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ padding: 0 }}>
                <TransactionsBig
                  tx={this.state.transactions}
                  wallets={this.state.userWallets}
                  selected="all"
                  query={this.state.query}
                />
              </AccordionDetails>
            </Accordion>
          )}
      </div>
    );
  };

  render() {
    const { classes } = this.props;
    const { dataLoaded, coinData } = this.state;
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
      </div>
    );
  }

  nav = (screen) => {
    if (this.props.match.params.coinID) {
      this.props.history.push(screen);
    } else {
      this.props.history.push(`detective/${screen}`);
    }
  };
}

export default withRouter(withStyles(styles)(CryptoDetective));
