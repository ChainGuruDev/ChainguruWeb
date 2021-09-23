import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";
import { formatMoney } from "../helpers";
import WalletNicknameModal from "../components/walletNicknameModal.js";
import WalletRemoveModal from "../components/walletRemoveModal.js";

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
} from "@material-ui/core";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_USERDATA_RETURNED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
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
  container: {
    maxHeight: 500,
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
    padding: "10px",
    background: `#9991`,
    minHeight: "100%",
  },
  walletInput: {
    width: "100%",
    minWidth: "-moz-available" /* WebKit-based browsers will ignore this. */,
    minWidth:
      "-webkit-fill-available" /* Mozilla-based browsers will ignore this. */,
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
      sortBy: "quote",
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
          wallet: wallets[0],
        });
    }
    this.setState({
      loading: true,
      selectedWallet: wallets[0],
      userWallets: data.wallets,
      walletNicknames: data.walletNicknames,
    });
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
    console.log(data);
    this.setState({
      walletNicknames: data,
    });
  };

  dbGetPortfolioReturned = (data) => {
    console.log(data);
    if (data) {
      const walletProfitValue = data[0].profit_value;
      let assets = data[0].assets;
      let walletBalance = 0;
      let lpTokens = [];
      for (var i = 0; i < assets.length; i++) {
        walletBalance += assets[i].quote;
        if (assets[i].balance > 0 && assets[i].contract_ticker === "UNI-V2") {
          lpTokens.push(assets[i]);
        }

        // console.log(sortedRows[i].quote);
      }
      console.log(lpTokens);

      function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
        }
        return function (a, b) {
          var result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

          return result * sortOrder;
        };
      }

      // Sort tokens with most profit and losses and store as state
      let winnersLosers;
      winnersLosers = data[0].assets.sort(dynamicSort("-profit_value"));

      this.setState({
        winners: winnersLosers.slice(0, 5),
        losers: winnersLosers
          .slice(winnersLosers.length - 5, winnersLosers.length)
          .reverse(),
      });

      this.setState({
        error: false,
        loading: false,
        dbDataLoaded: true,
        portfolioData: data,
        portfolioProfit: walletProfitValue,
        portfolioBalance: walletBalance,
        lpTokens: lpTokens,
      });
    }
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
    const { sortBy, portfolioData, hideLowBalanceCoins } = this.state;

    function dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

        return result * sortOrder;
      };
    }

    let filteredData = [];

    if (hideLowBalanceCoins) {
      portfolioData[0].assets.forEach((item, i) => {
        if (item.balance > 0.000001) {
          filteredData.push(portfolioData[0].assets[i]);
        }
      });
    } else {
      filteredData = portfolioData[0].assets;
    }

    let sortedRows;
    if (this.state.sortOrder === "asc") {
      sortedRows = filteredData.sort(dynamicSort(sortBy));
    } else {
      sortedRows = filteredData.sort(dynamicSort(`-${sortBy}`));
    }

    if (sortedRows.length > 0) {
      return sortedRows.map((row) => (
        <TableRow
          hover={true}
          key={row.contract_address}
          style={{ cursor: "pointer" }}
          onClick={() => this.nav("/short/detective/" + row.contract_address)}
        >
          <TableCell>
            <img className={classes.tokenLogo} alt="" src={row.logo_url} />
          </TableCell>
          <TableCell padding="none" align="left">
            <Typography variant={"h4"}>{row.contract_name}</Typography>
          </TableCell>
          <TableCell align="right">
            <div>
              <Typography variant={"body1"}>{row.balance}</Typography>
            </div>
            <div>
              <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
                {row.contract_ticker}
              </Typography>
            </div>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"body1"}>
              {formatMoney(row.quote_rate)}
            </Typography>
          </TableCell>
          <TableCell align="right">
            {row.avg_buy !== 0 && (
              <>
                <Typography variant={"body1"}>
                  ${formatMoney(row.avg_buy)}
                </Typography>
                <Typography
                  variant={"body1"}
                  color={
                    ((row.quote_rate - row.avg_buy) / row.avg_buy) * 100 > 0
                      ? "primary"
                      : "secondary"
                  }
                >
                  {formatMoney(
                    ((row.quote_rate - row.avg_buy) / row.avg_buy) * 100
                  )}
                  %
                </Typography>
              </>
            )}
          </TableCell>
          <TableCell align="right">
            <Typography variant={"body1"}>{formatMoney(row.quote)}</Typography>
          </TableCell>
          <TableCell align="right">
            {row.profit_percent && (
              <>
                <Typography
                  className={
                    row.profit_percent > 0
                      ? classes.profit_green
                      : classes.profit_red
                  }
                  variant={"body1"}
                >
                  {row.profit_percent.toFixed(1)} %
                </Typography>
                <Typography
                  className={
                    row.profit_percent > 0
                      ? classes.profit_green
                      : classes.profit_red
                  }
                  variant={"body1"}
                >
                  ( $ {formatMoney(row.profit_value)} )
                </Typography>
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
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO,
        wallet: wallet,
      });
    this.setState({ selectedWallet: wallet, dbDataLoaded: false });
  };

  updateWallet = (wallet) => {
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_UPDATE_PORTFOLIO,
        wallet: wallet,
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
        wallet: wallet,
      });
  };

  userWalletList = (wallets) => {
    const { walletNicknames } = this.state;
    const { classes } = this.props;

    if (wallets.length > 0) {
      let data;
      return wallets.map((wallet) => (
        <div key={wallet._id}>
          <Divider />
          <ListItem
            key={wallet._id}
            button
            selected={this.state.selectedWallet === wallet.wallet}
            onClick={() => this.walletClicked(wallet.wallet)}
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
                      (ele) => ele.wallet === wallet.wallet
                    )) &&
                      data.nickname +
                        " (" +
                        wallet.wallet.substring(0, 6) +
                        "..." +
                        wallet.wallet.substring(
                          wallet.wallet.length - 4,
                          wallet.wallet.length
                        ) +
                        ")"}
                    {!walletNicknames.some((e) => e.wallet === wallet.wallet) &&
                      wallet.wallet.substring(0, 6) +
                        "..." +
                        wallet.wallet.substring(
                          wallet.wallet.length - 4,
                          wallet.wallet.length
                        )}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                aria-label="rename"
                onClick={() => this.renameWallet(wallet.wallet)}
              >
                <MoreHorizIcon />
              </IconButton>
              <IconButton
                aria-label="update"
                onClick={() => this.updateWallet(wallet.wallet)}
              >
                <RefreshRoundedIcon />
              </IconButton>
              {this.state.account.address !== wallet.wallet && (
                <IconButton
                  aria-label="remove"
                  onClick={() => this.removeWALLET(wallet.wallet)}
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
      console.log(item.wallet);
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
      console.log(wallet);
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
    this.setState({ userWallets: payload.wallets });
  };

  //Send token data as data and type "win" / "lose"
  //Returns a list of items sorted by most profit / most loses
  drawWinnersLosers = (data, type) => {
    const { classes } = this.props;
    if (data.length > 0) {
      let filtered = [];
      if (type === "win") {
        for (var i = 0; i < data.length; i++) {
          if (data[i].profit_value > 0) filtered.push(data[i]);
        }
      } else {
        for (var j = 0; j < data.length; j++) {
          if (data[j].profit_value < 0) filtered.push(data[j]);
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
                key={
                  type === "win"
                    ? "win" + row.contract_address
                    : "lose" + row.contract_address
                }
                container
                direction="row"
                justify="space-between"
                align="center"
                className={classes.winLoseGrid}
                onClick={() => this.winLoseClick(row.contract_address)}
              >
                <Grid item>
                  <img
                    className={classes.tokenLogo}
                    alt=""
                    src={row.logo_url}
                  />
                </Grid>
                <Grid style={{ textAlign: "left" }} item>
                  <Typography color={type === "win" ? "primary" : "secondary"}>
                    {row.contract_name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography color={type === "win" ? "primary" : "secondary"}>
                    {formatMoney(row.profit_value)}
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

  render() {
    const { classes } = this.props;
    const {
      dbDataLoaded,
      portfolioData,
      sortBy,
      sortOrder,
      userWallets,
      walletNicknameModal,
      deleteWalletModal,
      error,
      addWallet,
      newWallet,
    } = this.state;

    return (
      <>
        <Card className={classes.favCard} elevation={3}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            spacing={3}
          >
            {error && (
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <Typography inline variant={"h4"}>
                  Portfolio dashboard in development
                </Typography>
                <Typography inline variant={"h4"}>
                  Please try again later. Sorry!
                </Typography>
              </Grid>
            )}
            {!error && !dbDataLoaded && (
              <Grid item xs={12} style={{ textAlign: "center" }}>
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
              <>
                <Grid item xs={6}>
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
                      {this.userWalletList(userWallets)}
                    </List>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className={classes.graphGrid}>
                    <Typography variant={"h4"}>
                      Balance: {this.state.portfolioBalance}
                    </Typography>
                    <Typography variant={"h4"}>
                      Profit/Loss: {this.state.portfolioProfit}
                    </Typography>
                    <Grid
                      style={{ marginTop: 10, minWidth: "100%" }}
                      container
                      direction="column"
                      justify="flex-start"
                      alignItems="stretch"
                    >
                      <Grid
                        item
                        container
                        direction="row"
                        justify="space-around"
                        alignItems="center"
                      >
                        <Grid item>Winners</Grid>
                        <Grid item>Losers</Grid>
                      </Grid>
                      <Divider />
                      <Grid
                        direction="row"
                        item
                        container
                        spacing={3}
                        style={{ marginTop: 1 }}
                      >
                        <Grid xs={6} item>
                          {this.drawWinnersLosers(this.state.winners, "win")}
                        </Grid>
                        <Grid item xs={6}>
                          {this.drawWinnersLosers(this.state.losers, "lose")}
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant={"h4"}>Assets</Typography>
                  <Divider />
                  <TableContainer className={classes.container} size="small">
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
                              active={sortBy === "contract_name"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("contract_name")}
                            >
                              Name
                            </TableSortLabel>
                          </TableCell>
                          <TableCell align="right">
                            <TableSortLabel
                              active={sortBy === "balance"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("balance")}
                            >
                              Balance
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("quote_rate")}
                          >
                            <TableSortLabel
                              active={sortBy === "quote_rate"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("quote_rate")}
                            >
                              Price
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("avg_buy")}
                          >
                            <TableSortLabel
                              active={sortBy === "avg_buy"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("avg_buy")}
                            >
                              Avg. Buy Price
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("quote")}
                          >
                            <TableSortLabel
                              active={sortBy === "quote"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("quote")}
                            >
                              Value
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
                              Profit %
                            </TableSortLabel>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>{this.sortedList(portfolioData)}</TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </>
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
