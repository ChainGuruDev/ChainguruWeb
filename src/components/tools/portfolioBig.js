import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";
import { formatMoney } from "../helpers";
import WalletNicknameModal from "../components/walletNicknameModal.js";
import WalletRemoveModal from "../components/walletRemoveModal.js";
import PortfolioChart from "../components/PortfolioChart.js";
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";

import {
  Card,
  Grid,
  Divider,
  Button,
  LinearProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  CircularProgress,
} from "@material-ui/core";

import Skeleton from "@material-ui/lab/Skeleton";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_USERDATA_RETURNED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
  DB_GET_PORTFOLIO_STATS,
  DB_GET_PORTFOLIO_STATS_RETURNED,
  DB_GET_PORTFOLIO_ASSET_STATS,
  DB_GET_PORTFOLIO_ASSET_STATS_RETURNED,
  DB_GET_PORTFOLIO_CHART,
  DB_GET_PORTFOLIO_CHART_RETURNED,
  DB_UPDATE_PORTFOLIO,
  DB_UPDATE_PORTFOLIO_RETURNED,
  DB_SET_USER_WALLET_NICKNAME_RETURNED,
  DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
  CHECK_ACCOUNT,
  CHECK_ACCOUNT_RETURNED,
  DB_ADD_WALLET,
  DB_ADD_WALLET_RETURNED,
  DB_DEL_WALLET_RETURNED,
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
    minHeight: "100%",
  },
  favCard: {
    padding: 10,
    margin: "10px 0px",
    display: "flex",
    flex: 1,
  },
  tokenLogo: {
    maxHeight: 30,
    minWidth: 30,
    marginTop: 3,
  },
  winLoseGrid: {
    cursor: "pointer",
    alignItems: "center",
    "&:hover": {
      background: "rgba(255,255,255, 0.05)",
      transition: "0.5s",
    },
  },
  profit_green: {
    color: colors.cgGreen,
  },
  profit_red: {
    color: colors.cgRed,
  },
  walletGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    padding: "10px",
    background: `#9991`,
    minHeight: "100%",
  },
  graphGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    background: store.getStore("theme") === "dark" ? "#0005" : "#9991",
    minHeight: "100%",
    height: "100%",
    overflow: "clip",
    display: "grid",
  },
  walletInput: {
    width: "100%",
    minWidth: "-moz-available" /* WebKit-based browsers will ignore this. */,
    minWidth:
      "-webkit-fill-available" /* Mozilla-based browsers will ignore this. */,
  },
  timeframeBTN: {
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255,255,255, 0.05)",
      transition: "0.5s",
    },
  },
  timeframeBTNSelected: {
    backgroundColor: colors.cgGreen + "50",
  },
});

class PortfolioBig extends Component {
  constructor() {
    super();
    this._isMounted = false;

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      dbDataLoaded: false,
      dbStatsData: false,
      sortBy: "balance",
      sortOrder: "desc",
      hideBlacklisted: true,
      hideLowBalanceCoins: true,
      userWallets: [],
      walletNicknames: [],
      walletNicknameModal: false,
      error: false,
      addWallet: false,
      errMsgWallet: "",
      errorWallet: true,
      portfolioChartData: null,
      chartDataLoaded: false,
      timeFrame: "w",
      chartVariation: null,
    };

    // IF USER IS CONNECTED GET THE PORTFOLIO DATA
    // if(account && account.address) {
    //   dispatcher.dispatch({
    //     type: DB_GET_USERPORTFOLIO,
    //     address: account.address,
    //   })
    // }
  }

  componentDidMount() {
    this._isMounted = true;
    this.setState({ loading: false });
    emitter.on(ERROR, this.error);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_GET_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
    emitter.on(
      DB_GET_PORTFOLIO_CHART_RETURNED,
      this.db_getPortfolioChartReturned
    );
    emitter.on(
      DB_GET_PORTFOLIO_ASSET_STATS_RETURNED,
      this.dbGetPortfolioAssetStatsReturned
    );
    emitter.on(
      DB_GET_PORTFOLIO_STATS_RETURNED,
      this.dbGetPortfolioStatsReturned
    );
    emitter.on(DB_UPDATE_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
    emitter.on(DB_SET_USER_WALLET_NICKNAME_RETURNED, this.setNicknameReturned);
    emitter.on(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      DB_GET_PORTFOLIO_RETURNED,
      this.dbGetPortfolioReturned
    );
    emitter.removeListener(
      DB_GET_PORTFOLIO_ASSET_STATS_RETURNED,
      this.dbGetPortfolioAssetStatsReturned
    );
    emitter.removeListener(
      DB_GET_PORTFOLIO_CHART_RETURNED,
      this.db_getPortfolioChartReturned
    );
    emitter.removeListener(
      DB_UPDATE_PORTFOLIO_RETURNED,
      this.dbGetPortfolioReturned
    );
    emitter.removeListener(
      DB_SET_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.removeListener(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.removeListener(
      DB_GET_PORTFOLIO_STATS_RETURNED,
      this.dbGetPortfolioStatsReturned
    );
    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.removeListener(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    this._isMounted = false;
  }

  //EMITTER EVENTS FUNCTIONS
  connectionConnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  dbUserDataReturned = (data) => {
    let wallets = [];
    data.wallets.forEach((item, i) => {
      wallets.push(item.wallet);
    });
    if (!this.state.loading) {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO,
          wallet: wallets,
        });
    }
    if (wallets.length > 0) {
      this.setState({
        loading: true,
        selectedWallet: "all",
        userWallets: wallets,
        walletNicknames: data.walletNicknames,
      });
    } else {
      this.setState({
        loading: true,
        selectedWallet: wallets[0],
        userWallets: wallets,
        walletNicknames: data.walletNicknames,
      });
    }
  };

  removeWALLET = (wallet) => {
    const walletNick = this.state.walletNicknames.find(
      (ele) => ele.wallet === wallet
    );
    if (walletNick) {
      this.setState({
        deleteWalletModal: true,
        removeWALLET: [wallet, walletNick.nickname],
      });
    } else {
      this.setState({
        deleteWalletModal: true,
        removeWALLET: [wallet],
      });
    }
  };

  setNicknameReturned = (data) => {
    this.setState({
      walletNicknames: data,
    });
  };

  dynamicSort = (property) => {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    if (property === "value") {
      return function (a, b) {
        const a_prices = a.price ? a.price[property] : 0;
        const b_prices = b.price ? b.price[property] : 0;

        var result = a_prices < b_prices ? -1 : a_prices > b_prices ? 1 : 0;

        return result * sortOrder;
      };
    } else if (property === "total_returned") {
      return function (a, b) {
        const a_stats = a.stats ? a.stats[property] : 0;
        const b_stats = b.stats ? b.stats[property] : 0;

        var result = a_stats < b_stats ? -1 : a_stats > b_stats ? 1 : 0;

        return result * sortOrder;
      };
    } else if (property === "avg_buy_price") {
      return function (a, b) {
        const a_stats =
          a.stats && a.price
            ? ((a.price.value - a.stats.avg_buy_price) /
                a.stats.avg_buy_price) *
              100
            : 0;
        const b_stats =
          b.stats && b.price
            ? ((b.price.value - b.stats.avg_buy_price) /
                b.stats.avg_buy_price) *
              100
            : 0;

        var result = a_stats < b_stats ? -1 : a_stats > b_stats ? 1 : 0;

        return result * sortOrder;
      };
    } else {
      return function (a, b) {
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

        return result * sortOrder;
      };
    }
  };

  dbGetPortfolioReturned = (portfolioData) => {
    let keys = [];
    let assetPrice = [];
    portfolioData.forEach((item, i) => {
      keys.push(item.asset_code);
      assetPrice.push(item.price ? item.price.value : null);
    });

    if (this.state.selectedWallet === "all") {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_CHART,
          wallet: this.state.userWallets,
          timeframe: "w",
        });
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_STATS,
          wallet: this.state.userWallets,
        });

      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_ASSET_STATS,
          wallet: this.state.userWallets,
          portfolioData,
        });
    } else {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_CHART,
          wallet: [portfolioData[0].wallet_address],
          timeframe: "w",
        });
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_STATS,
          wallet: [portfolioData[0].wallet_address],
        });

      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_ASSET_STATS,
          wallet: [portfolioData[0].wallet_address],
          portfolioData,
        });
    }

    this.setState({
      error: false,
      loading: false,
      dbDataLoaded: true,
      dbStatsData: false,
      portfolioData: portfolioData,
      chartVariation: null,
    });
  };

  db_getPortfolioChartReturned = (portfolioChart) => {
    const priceEnd = portfolioChart[0][1];
    const priceStart = portfolioChart[portfolioChart.length - 1][1];
    const differenceValue = priceEnd - priceStart;
    const differencePercent = ((priceEnd - priceStart) / priceStart) * 100;
    // console.log(chartVariation);
    let timeFrame = "";
    switch (this.state.timeFrame) {
      case "w":
        timeFrame = "Week change";
        break;
      case "m":
        timeFrame = "Month change";
        break;
      case "y":
        timeFrame = "Year change";
        break;
      default:
    }
    this.setState({
      chartVariation: { timeFrame, differenceValue, differencePercent },
      portfolioChartData: portfolioChart,
      chartDataLoaded: true,
    });
  };

  dbGetPortfolioStatsReturned = (portfolioStats) => {
    this.setState({
      portfolioStats: portfolioStats,
    });
  };

  dbGetPortfolioAssetStatsReturned = (portfolioStats) => {
    const { portfolioData } = this.state;
    portfolioData.forEach((item, i) => {
      item.profit_percent = portfolioStats[i].profit_percent;
      item.stats = portfolioStats[i].stats;
    });

    let winnersLosers;
    winnersLosers = portfolioData.sort(this.dynamicSort("total_returned"));
    winnersLosers.reverse();
    this.setState({
      error: false,
      loading: false,
      dbStatsData: true,
      portfolioData: portfolioData,
      winners: winnersLosers.slice(0, 5),
      losers: winnersLosers
        .slice(winnersLosers.length - 5, winnersLosers.length)
        .reverse(),
    });
  };

  error = () => {
    this.setState({ error: true });
  };

  getLP_Tokens = () => {
    console.log(this.state.lpTokens);
  };

  //END EMITTER EVENT FUNCTIONS
  sortedList = () => {
    const { classes } = this.props;
    const {
      sortBy,
      portfolioData,
      hideLowBalanceCoins,
      dbStatsData,
      walletNicknames,
      selectedWallet,
    } = this.state;

    let filteredData = [];
    if (hideLowBalanceCoins) {
      portfolioData.forEach((item, i) => {
        if (item.balance > 0.01) {
          filteredData.push(portfolioData[i]);
        } else {
        }
        if (item.type === "NFT") {
          filteredData.push(portfolioData[i]);
        }
      });
    } else {
      filteredData = portfolioData;
    }
    let sortedRows;
    if (this.state.sortOrder === "asc") {
      sortedRows = filteredData.sort(this.dynamicSort(sortBy));
    } else {
      sortedRows = filteredData.sort(this.dynamicSort(`-${sortBy}`));
    }
    if (sortedRows.length > 0) {
      let data;
      return sortedRows.map((row) => (
        <TableRow
          hover={true}
          key={`${row.asset_code}_${row.wallet_address}`}
          style={{ cursor: "pointer", background: "#00000015" }}
          onClick={() => this.nav("/short/detective/" + row.asset_code)}
        >
          <TableCell>
            <img className={classes.tokenLogo} alt="" src={row.icon_url} />
          </TableCell>
          <TableCell padding="none" align="left">
            <div>
              <Typography variant={"h4"}>{row.name}</Typography>
            </div>
            {selectedWallet === "all" && (
              <div>
                <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
                  at wallet:{" "}
                  {(data = walletNicknames.find(
                    (ele) => ele.wallet === row.wallet_address
                  )) &&
                    data.nickname +
                      " (" +
                      row.wallet_address.substring(0, 6) +
                      "..." +
                      row.wallet_address.substring(
                        row.wallet_address.length - 4,
                        row.wallet_address.length
                      ) +
                      ")"}
                  {!walletNicknames.some(
                    (e) => e.wallet === row.wallet_address
                  ) &&
                    row.wallet_address.substring(0, 6) +
                      "..." +
                      row.wallet_address.substring(
                        row.wallet_address.length - 4,
                        row.wallet_address.length
                      )}
                </Typography>
              </div>
            )}
          </TableCell>
          <TableCell align="right">
            <div>
              <Typography variant={"body1"}>
                {formatMoney(row.quantityDecimals)}
              </Typography>
            </div>
            <div>
              <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
                {row.symbol}
              </Typography>
            </div>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"body1"}>
              $ {row.balance && formatMoney(row.balance)}
            </Typography>
          </TableCell>
          <TableCell align="right">
            {row.price && (
              <>
                <div>
                  <Typography variant={"body1"}>
                    {formatMoney(row.price.value)}
                  </Typography>
                </div>
                {row.price.relative_change_24h && (
                  <div>
                    <Typography
                      color={
                        row.price.relative_change_24h > 0
                          ? "primary"
                          : "secondary"
                      }
                      variant={"subtitle2"}
                    >
                      {row.price.relative_change_24h.toFixed(2)} %
                    </Typography>
                  </div>
                )}
              </>
            )}
          </TableCell>
          <TableCell align="right">
            {dbStatsData &&
              (row.profit_percent && (
                <>
                  <Typography
                    variant={"body1"}
                    color={row.profit_percent > 0 ? "primary" : "secondary"}
                  >
                    {formatMoney(row.profit_percent)} %
                  </Typography>
                  <Typography variant={"body1"}>
                    ($ {formatMoney(row.stats.avg_buy_price)})
                  </Typography>
                </>
              ),
              row.profit_percent && (
                <>
                  <Typography
                    variant={"body1"}
                    color={row.profit_percent > 0 ? "primary" : "secondary"}
                  >
                    {formatMoney(row.profit_percent)} %
                  </Typography>
                  <Typography variant={"body1"}>
                    ($ {formatMoney(row.stats.avg_buy_price)})
                  </Typography>
                </>
              ))}
            {!dbStatsData && (
              <>
                <CircularProgress />
              </>
            )}
          </TableCell>

          <TableCell align="right">
            {row.stats && row.stats.total_returned && (
              <>
                <Typography
                  className={
                    row.stats.total_returned > 0
                      ? classes.profit_green
                      : classes.profit_red
                  }
                  variant={"body1"}
                >
                  $ {row.stats.total_returned.toFixed(1)}
                </Typography>
                {row.stats.total_returned_net && (
                  <Typography
                    className={
                      row.stats.total_returned_net > 0
                        ? classes.profit_green
                        : classes.profit_red
                    }
                    variant={"body1"}
                  >
                    $ {row.stats.total_returned_net.toFixed(1)}
                  </Typography>
                )}
              </>
            )}
          </TableCell>
        </TableRow>
      ));
    }
  };

  sortBy(_sortBy) {
    let _prevSortBy = this.state.sortBy;
    if (_prevSortBy === _sortBy) {
      if (this.state.sortOrder === "asc") {
        this._isMounted &&
          this.setState({ sortBy: _sortBy, sortOrder: "desc" });
      } else {
        this._isMounted && this.setState({ sortBy: _sortBy, sortOrder: "asc" });
      }
    } else {
      this._isMounted && this.setState({ sortBy: _sortBy, sortOrder: "desc" });
    }
  }

  walletClicked = (wallet) => {
    if (Array.isArray(wallet)) {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO,
          wallet: this.state.userWallets,
        });
      this.setState({
        selectedWallet: "all",
        dbDataLoaded: false,
        chartDataLoaded: false,
        portfolioStats: null,
      });
    } else {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO,
          wallet: [wallet],
        });
      this.setState({
        selectedWallet: wallet,
        dbDataLoaded: false,
        chartDataLoaded: false,
        portfolioStats: null,
      });
    }
  };

  updateWallet = (wallet) => {
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO,
        wallet: [wallet],
      });
    this.setState({ dbDataLoaded: false });
  };

  renameWallet = (wallet) => {
    const data = this.state.walletNicknames.find(
      (ele) => ele.wallet === wallet
    );
    this.setState({
      walletNicknameModal: true,
      selectedWallet: wallet,
      oldNickname: data ? data.nickname : "",
      dbDataLoaded: false,
    });
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO,
        wallet: [wallet],
      });
  };

  userWalletList = (wallets) => {
    const { walletNicknames } = this.state;
    const { classes } = this.props;

    if (wallets.length > 0) {
      let data;
      return wallets.map((wallet) => (
        <div key={wallet + "_id"}>
          <Divider />
          <ListItem
            key={wallet + "_id"}
            button
            selected={this.state.selectedWallet === wallet}
            onClick={() => this.walletClicked(wallet)}
            className={classes.list}
          >
            <ListItemText
              primary={
                <React.Fragment>
                  <Typography
                    display="inline"
                    noWrap={true}
                    className={classes.inline}
                    color="textPrimary"
                  >
                    {(data = walletNicknames.find(
                      (ele) => ele.wallet === wallet
                    )) &&
                      data.nickname +
                        " (" +
                        wallet.substring(0, 6) +
                        "..." +
                        wallet.substring(wallet.length - 4, wallet.length) +
                        ")"}
                    {!walletNicknames.some((e) => e.wallet === wallet) &&
                      wallet.substring(0, 6) +
                        "..." +
                        wallet.substring(wallet.length - 4, wallet.length)}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                aria-label="rename"
                onClick={() => this.renameWallet(wallet)}
              >
                <MoreHorizIcon />
              </IconButton>
              {this.state.account.address !== wallet && (
                <IconButton
                  aria-label="remove"
                  onClick={() => this.removeWALLET(wallet)}
                >
                  <BackspaceRoundedIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </div>
      ));
    }
    wallets.forEach((item, i) => {
      console.log(item);
    });
  };

  toggleAddWallet = () => {
    let _addingWallet = this.state.addWallet;
    this.setState({
      addWallet: !_addingWallet,
      newWallet: "",
      errorWallet: true,
    });
  };

  handleChange = (event) => {
    switch (event.target.id) {
      case "walletAdd":
        this.setState({ newWallet: event.target.value });
        this.setState({ errorWallet: false });
        dispatcher.dispatch({
          type: CHECK_ACCOUNT,
          content: event.target.value,
        });
        break;

      default:
        break;
    }
  };

  addWallet = (wallet) => {
    if (wallet) {
      dispatcher.dispatch({
        type: DB_ADD_WALLET,
        wallet: wallet,
      });
    } else {
      this.setState({ errorWallet: true });
    }
  };

  checkAccountReturned = (_isAccount) => {
    if (!_isAccount) {
      this.setState({ errMsgWallet: "Not a valid ethereum address" });
      this.setState({ errorWallet: true });
    } else {
      this.setState({ errMsgWallet: "" });
      this.setState({ errorWallet: false });
    }
    this.setState({ errorAccount: !_isAccount });
  };

  dbWalletReturned = (payload) => {
    let userWallets = [];
    payload.wallets.forEach((item, i) => {
      userWallets.push(item.wallet);
    });

    this.setState({ userWallets, addWallet: false });
  };

  //Send token data as data and type "win" / "lose"
  //Returns a list of items sorted by most profit / most loses
  drawWinnersLosers = (data, type) => {
    const { classes } = this.props;
    if (data.length > 0) {
      let filtered = [];
      if (type === "win") {
        for (var i = 0; i < data.length; i++) {
          if (data[i].stats) {
            if (data[i].stats.total_returned > 0) filtered.push(data[i]);
          }
        }
      } else {
        for (var j = 0; j < data.length; j++) {
          if (data[j].stats) {
            if (data[j].stats.total_returned < 0) filtered.push(data[j]);
          }
        }
      }

      return (
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch"
          key={type === "win" ? "winList" : "loseList"}
        >
          {filtered.map((row) => (
            <>
              <Grid
                item
                key={row.asset_code}
                container
                direction="row"
                justify="space-between"
                align="center"
                className={classes.winLoseGrid}
                onClick={() => this.winLoseClick(row.asset_code)}
              >
                <Grid item>
                  <img
                    className={classes.tokenLogo}
                    alt=""
                    src={row.icon_url}
                  />
                </Grid>
                <Grid style={{ textAlign: "left" }} item>
                  <Typography color={type === "win" ? "primary" : "secondary"}>
                    {row.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography color={type === "win" ? "primary" : "secondary"}>
                    {formatMoney(row.stats.total_returned)}
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
            </>
          ))}
        </Grid>
      );
    }
  };

  winLoseClick = (tokenName) => {
    this.nav(`/short/detective/${tokenName}`);
  };

  timeframeBTNClicked = (newTimeframe) => {
    if (this.state.selectedWallet === "all") {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_CHART,
          wallet: this.state.userWallets,
          timeframe: newTimeframe,
        });
    } else {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_CHART,
          wallet: [this.state.selectedWallet],
          timeframe: newTimeframe,
        });
    }

    this.setState({ timeFrame: newTimeframe, chartDataLoaded: false });
  };

  render() {
    const { classes } = this.props;
    const {
      dbDataLoaded,
      portfolioData,
      portfolioChartData,
      sortBy,
      sortOrder,
      userWallets,
      walletNicknameModal,
      deleteWalletModal,
      error,
      addWallet,
      newWallet,
      chartDataLoaded,
      timeFrame,
    } = this.state;

    return (
      <>
        <Card className={classes.favCard} elevation={3}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
          >
            {error && (
              <Grid
                item
                style={{
                  textAlign: "center",
                  minWidth: "100%",
                  paddingBottom: "10px",
                }}
              >
                <Typography variant={"h4"}>
                  Portfolio dashboard in development
                </Typography>
                <Typography variant={"h4"}>
                  Please try again later. Sorry!
                </Typography>
              </Grid>
            )}
            {!error && !dbDataLoaded && (
              <Grid
                item
                xs={12}
                style={{
                  textAlign: "center",
                  minWidth: "100%",
                  paddingBottom: "10px",
                }}
              >
                <Typography variant={"h4"}>Please give us a moment</Typography>
                <Typography variant={"h4"}>
                  while we prepare your portfolio data...
                </Typography>
                <Typography style={{ marginTop: "10px" }} variant={"h4"}>
                  (The first time on a wallet with lots of transactions
                </Typography>
                <Typography variant={"h4"}>
                  might take a couple of minutes to complete)
                </Typography>
                <LinearProgress style={{ marginTop: "10px" }} />
              </Grid>
            )}
            {dbDataLoaded && (
              <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
              >
                <Grid
                  id="topUI"
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="flex-start"
                  style={{ maxHeight: "400px" }}
                  spacing={1}
                >
                  <Grid
                    item
                    xs={6}
                    style={{ display: "grid", minHeight: "100%" }}
                  >
                    <div className={classes.walletGrid}>
                      <Grid
                        item
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                        xs={12}
                      >
                        <Typography variant={"h4"}>Wallets</Typography>
                        {!addWallet && (
                          <Button
                            startIcon={<AddCircleRoundedIcon />}
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={this.toggleAddWallet}
                          >
                            New
                          </Button>
                        )}
                        {addWallet && (
                          <Button
                            startIcon={<ArrowBackIosRoundedIcon />}
                            variant="contained"
                            size="small"
                            color="secondary"
                            onClick={this.toggleAddWallet}
                          >
                            Back
                          </Button>
                        )}
                      </Grid>
                      {addWallet && (
                        <>
                          <Divider style={{ marginTop: 10 }} />
                          <Grid
                            item
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                            xs={12}
                          >
                            <Grid item xs={9}>
                              <TextField
                                className={classes.walletInput}
                                id="walletAdd"
                                label="Wallet Address"
                                onChange={this.handleChange}
                                helperText={this.state.errMsgWallet}
                                error={this.state.errorWallet}
                              />
                            </Grid>
                            <Grid item style={{ textAlign: "end" }} xs={3}>
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                className={classes.button}
                                startIcon={<AddCircleRoundedIcon />}
                                onClick={() => {
                                  this.addWallet(newWallet);
                                }}
                                disabled={this.state.errorWallet}
                              >
                                Add
                              </Button>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      <List
                        className={classes.walletList}
                        component="nav"
                        aria-label="user wallet list"
                      >
                        <div key={"allWallets"}>
                          <Divider />
                          <ListItem
                            key={"allWallets"}
                            button
                            selected={this.state.selectedWallet === "all"}
                            onClick={() =>
                              this.walletClicked(this.state.userWallets)
                            }
                            className={classes.list}
                          >
                            <ListItemText
                              primary={
                                <React.Fragment>
                                  <Typography
                                    display="inline"
                                    noWrap={true}
                                    className={classes.inline}
                                    color="textPrimary"
                                  >
                                    All
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                        </div>
                        {this.userWalletList(userWallets)}
                      </List>
                    </div>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    style={{ height: "100%", maxHeight: "100%" }}
                  >
                    <div className={classes.graphGrid}>
                      {this.state.portfolioStats && (
                        <Grid container item justify="space-around">
                          <Grid item xs={12} style={{ textAlign: "center" }}>
                            <Typography variant={"h3"}>
                              Balance: ${" "}
                              {formatMoney(
                                this.state.portfolioStats.assets_value
                              )}{" "}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            container
                            justify="space-around"
                            style={{ backgroundColor: "rgba(125,125,125,0.2)" }}
                          >
                            <Grid item>24Hs Change</Grid>
                            <Grid
                              item
                              style={{
                                color:
                                  this.state.portfolioStats
                                    .absolute_change_24h > 0
                                    ? colors.cgGreen
                                    : colors.cgRed,
                              }}
                            >
                              ${" "}
                              {formatMoney(
                                this.state.portfolioStats.absolute_change_24h
                              )}
                            </Grid>
                            <Grid
                              item
                              style={{
                                color:
                                  this.state.portfolioStats
                                    .relative_change_24h > 0
                                    ? colors.cgGreen
                                    : colors.cgRed,
                              }}
                            >
                              {formatMoney(
                                this.state.portfolioStats.relative_change_24h
                              )}
                              %
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                      {this.state.chartDataLoaded &&
                        this.state.chartVariation &&
                        this.state.timeFrame != "d" && (
                          <Grid container item justify="space-around">
                            <Grid
                              item
                              container
                              justify="space-around"
                              style={{
                                backgroundColor: "rgba(125,125,125,0.2)",
                              }}
                            >
                              <Grid item>
                                {this.state.chartVariation.timeFrame}
                              </Grid>
                              <Grid
                                item
                                style={{
                                  color:
                                    this.state.chartVariation.differenceValue >
                                    0
                                      ? colors.cgGreen
                                      : colors.cgRed,
                                }}
                              >
                                ${" "}
                                {formatMoney(
                                  this.state.chartVariation.differenceValue
                                )}
                              </Grid>
                              <Grid
                                item
                                style={{
                                  color:
                                    this.state.chartVariation
                                      .differencePercent > 0
                                      ? colors.cgGreen
                                      : colors.cgRed,
                                }}
                              >
                                {formatMoney(
                                  this.state.chartVariation.differencePercent
                                )}
                                %
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      <Grid item container justify="flex-end" align="flex-end">
                        {chartDataLoaded ? (
                          <PortfolioChart
                            height="250px"
                            data={portfolioChartData}
                          />
                        ) : (
                          <Skeleton
                            variant="rect"
                            width={"100%"}
                            height={"250px"}
                            style={{ borderRadius: 10 }}
                          />
                        )}
                        {
                          // <Typography variant={"h4"}>
                          //   Balance: {this.state.portfolioBalance}
                          // </Typography>
                          // <Typography variant={"h4"}>
                          //   Profit/Loss: {this.state.portfolioProfit}
                          // </Typography>
                          // <Grid
                          //   style={{ marginTop: 10, minWidth: "100%" }}
                          //   container
                          //   direction="column"
                          //   justify="flex-start"
                          //   alignItems="stretch"
                          // >
                          //   <Grid
                          //   item
                          //   container
                          //   direction="row"
                          //   justify="space-around"
                          //   alignItems="center"
                          // >
                          //   <Grid item>Winners</Grid>
                          //   <Grid item>Losers</Grid>
                          // </Grid>
                          // <Divider />
                          // <Grid
                          //   direction="row"
                          //   item
                          //   container
                          //   spacing={3}
                          //   style={{ marginTop: 1 }}
                          // >
                          //   <Grid xs={6} item>
                          //     {this.drawWinnersLosers(this.state.winners, "win")}
                          //   </Grid>
                          //   <Grid item xs={6}>
                          //     {this.drawWinnersLosers(this.state.losers, "lose")}
                          //   </Grid>
                          // </Grid>
                          // </Grid>
                        }
                      </Grid>
                      <Grid
                        item
                        container
                        justify="space-around"
                        style={{
                          backgroundColor: "rgba(125,125,125,0.2)",
                          textAlign: "center",
                        }}
                      >
                        <Grid
                          item
                          className={
                            timeFrame === "d"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("d")}
                          xs={3}
                        >
                          Day
                        </Grid>
                        <Grid
                          item
                          className={
                            timeFrame === "w"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("w")}
                          xs={3}
                        >
                          Week
                        </Grid>
                        <Grid
                          item
                          className={
                            timeFrame === "m"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("m")}
                          xs={3}
                        >
                          Month
                        </Grid>
                        <Grid
                          item
                          className={
                            timeFrame === "y"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("y")}
                          xs={3}
                        >
                          Year
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
                <Grid
                  container
                  direction="column"
                  justify="flex-start"
                  alignItems="stretch"
                  style={{ marginTop: 10 }}
                >
                  <TableContainer
                    style={{
                      maxHeight: "875px",
                      scrollbarWidth: "thin",
                      scrollbarColor: `${colors.cgGreen} #30303080`,
                    }}
                    size="small"
                  >
                    <Table
                      stickyHeader
                      className={classes.table}
                      aria-label="assetList"
                    >
                      <TableHead style={{ backgroundColor: "#fafafa" }}>
                        <TableRow>
                          <TableCell
                            style={{ width: "30px", height: "30px" }}
                          ></TableCell>
                          <TableCell align="left" padding="none">
                            <TableSortLabel
                              active={sortBy === "name"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("name")}
                            >
                              Name
                            </TableSortLabel>
                          </TableCell>
                          <TableCell align="right">
                            <TableSortLabel
                              active={sortBy === "quantityDecimals"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("quantityDecimals")}
                            >
                              Balance
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("balance")}
                          >
                            <TableSortLabel
                              active={sortBy === "balance"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("balance")}
                            >
                              Value
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("value")}
                          >
                            <TableSortLabel
                              active={sortBy === "value"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("value")}
                            >
                              <Grid>
                                <Grid item>Price</Grid>
                                <Grid item>(% 24hs)</Grid>
                              </Grid>
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("profit_percent")}
                          >
                            <TableSortLabel
                              active={sortBy === "profit_percent"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("profit_percent")}
                            >
                              <Grid>
                                <Grid item>Profit/Loss %</Grid>
                                <Grid item>(Avg. Buy Price)</Grid>
                              </Grid>
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("total_returned")}
                          >
                            <TableSortLabel
                              active={sortBy === "total_returned"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("total_returned")}
                            >
                              <Grid>
                                <Grid item>Profit</Grid>
                                <Grid item>Net Profit (- gas fees)</Grid>
                              </Grid>
                            </TableSortLabel>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>{this.sortedList(portfolioData)}</TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Card>
        {walletNicknameModal && this.renderModal()}
        {deleteWalletModal && this.renderWalletDeleteModal()}
      </>
    );
  }

  //
  //
  //

  nav = (screen) => {
    this.props.history.push(screen);
  };

  closeModalNick = () => {
    this.setState({ walletNicknameModal: false });
  };

  closeModalDelete = () => {
    this.setState({ deleteWalletModal: false });
  };

  renderModal = (wallet, nickname) => {
    return (
      <WalletNicknameModal
        closeModal={this.closeModalNick}
        modalOpen={this.state.walletNicknameModal}
        wallet={this.state.selectedWallet}
        nickname={this.state.oldNickname}
      />
    );
  };

  renderWalletDeleteModal = (wallet) => {
    return (
      <WalletRemoveModal
        closeModal={this.closeModalDelete}
        modalOpen={this.state.deleteWalletModal}
        wallet={this.state.removeWALLET[0]}
        nickname={this.state.removeWALLET[1]}
      />
    );
  };
}

export default withRouter(withStyles(styles)(PortfolioBig));
