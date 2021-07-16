import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import {
  Card,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableSortLabel,
  TableContainer,
} from "@material-ui/core";

import {
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
  DB_UPDATE_PORTFOLIO_RETURNED,
  DB_SET_USER_WALLET_NICKNAME_RETURNED,
  DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
  CHECK_ACCOUNT_RETURNED,
  DB_ADD_WALLET_RETURNED,
  DB_DEL_WALLET_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_UPDATE_PORTFOLIO,
  CHECK_ACCOUNT,
  DB_ADD_WALLET,
} from "../../constants";

import WalletNicknameModal from "../components/walletNicknameModal.js";
import WalletRemoveModal from "../components/walletRemoveModal.js";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";

import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";

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
    justifyContent: "space-around",
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
  favCard: {
    background: "rgba(255,255,255,0.05)",
    padding: 10,
    margin: 10,
    display: "flex",
    flex: 1,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: 10,
    margin: 10,
  },
  tokenLogo: {
    maxHeight: 30,
    minWidth: 30,
    marginTop: 3,
  },
});

class Transactions extends Component {
  constructor() {
    super();

    this._isMounted = false;
    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      dbDataLoaded: false,
      addWallet: false,
      userWallets: [],
      error: false,
      errMsgWallet: "",
      errorWallet: true,
      sortBy: "block_signed_at",
      sortOrder: "desc",
    };
    if (account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;
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

  connectionConnected = () => {
    const { t } = this.props;
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
      let walletData = {};
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

  userWalletList = (wallets) => {
    const { walletNicknames } = this.state;
    const { classes, t } = this.props;
    const walletIndex = wallets.findIndex(
      (wallets) => wallets.wallet === wallets.wallet
    );
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
              {this.state.account.address != wallet.wallet && (
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

  drawTransactions = (data) => {
    const { classes } = this.props;
    const { sortBy, sortOrder } = this.state;

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

    let allTX = [];
    let sortedTXs = [];
    // MERGE all transactions from all tokens in user wallet
    // Create new empty array where to store all the TX
    // Append to this array Asset specific data (Name, contract, ticker, and logo url)
    // Push Tx to this new array, then sort by block_signed_at (date of TX)
    data.assets.forEach((item, i) => {
      item.txs.forEach((tx, j) => {
        var d = new Date(tx.block_signed_at);
        let dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");

        tx.contract_name = item.contract_name;
        tx.contract_address = item.contract_address;
        tx.contract_ticker = item.contract_ticker;
        tx.logo_url = item.logo_url;
        tx.dateFormated = dformat.toString();
        allTX.push(tx);
      });
    });

    if (this.state.sortOrder === "asc") {
      sortedTXs = allTX.sort(dynamicSort(sortBy));
    } else {
      sortedTXs = allTX.sort(dynamicSort(`-${sortBy}`));
    }

    console.log(sortedTXs);

    if (sortedTXs.length > 0) {
      return sortedTXs.map((tx) => (
        <TableRow
          hover={true}
          key={tx.block_signed_at + Math.random(0, 10000)}
          style={{ cursor: "pointer" }}
          onClick={() => this.nav("/short/detective/" + tx.contract_address)}
        >
          <TableCell>
            {tx.transfer_type === "IN" && (
              <IconButton color="primary">
                <KeyboardArrowRightRoundedIcon />
              </IconButton>
            )}
            {tx.transfer_type === "OUT" && (
              <IconButton color="secondary">
                <KeyboardArrowLeftRoundedIcon />
              </IconButton>
            )}
          </TableCell>
          <TableCell>
            <Typography>{tx.dateFormated}</Typography>
          </TableCell>
          <TableCell padding="none" align="left">
            <img className={classes.tokenLogo} alt="" src={tx.logo_url} />
            <Typography variant={"h4"}>{tx.contract_name}</Typography>
          </TableCell>
        </TableRow>
      ));
    }
  };

  render() {
    const { classes, t } = this.props;
    const {
      account,
      loading,
      dbDataLoaded,
      addWallet,
      newWallet,
      userWallets,
      walletNicknameModal,
      deleteWalletModal,
      error,
      portfolioData,
      sortBy,
      sortOrder,
    } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <>
            {error && (
              <Card className={classes.favCard} elevation={3}>
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <Typography inline variant={"h4"}>
                    Portfolio dashboard in development
                  </Typography>
                  <Typography inline variant={"h4"}>
                    Please try again later. Sorry!
                  </Typography>
                </Grid>
              </Card>
            )}
            {!error && !dbDataLoaded && (
              <Card className={classes.favCard} elevation={3}>
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <Typography variant={"h4"}>
                    Please give us a moment
                  </Typography>
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
              </Card>
            )}
          </>
        )}
        {account.address && dbDataLoaded && (
          <>
            <Grid item xs={9}>
              <Card className={classes.favCard} elevation={3}>
                <TableContainer size="small">
                  <Table className={classes.table} aria-label="assetList">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{ width: "30px", height: "30px" }}
                          align="left"
                          padding="none"
                        >
                          <TableSortLabel
                            active={sortBy === "transfer_type"}
                            direction={sortOrder}
                            onClick={() => this.sortBy("transfer_type")}
                          >
                            Type
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="left" padding="none">
                          <TableSortLabel
                            active={sortBy === "block_signed_at"}
                            direction={sortOrder}
                            onClick={() => this.sortBy("block_signed_at")}
                          >
                            Date
                          </TableSortLabel>
                        </TableCell>
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
                            active={sortBy === "amount"}
                            direction={sortOrder}
                            onClick={() => this.sortBy("amount")}
                          >
                            Amount
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={sortBy === "rate_at_tx"}
                            direction={sortOrder}
                            onClick={() => this.sortBy("rate_at_tx")}
                          >
                            Price
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={sortBy === "worth_at_tx"}
                            direction={sortOrder}
                            onClick={() => this.sortBy("worth_at_tx")}
                          >
                            Worth
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={sortBy === "profit_percent"}
                            direction={sortOrder}
                            onClick={() => this.sortBy("profit_percent")}
                          >
                            Profit
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.drawTransactions(portfolioData[0])}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card className={classes.favCard} elevation={3}>
                <Grid item style={{ minWidth: "100%" }}>
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
                </Grid>
              </Card>
            </Grid>
          </>
        )}
        {walletNicknameModal && this.renderModal()}
        {deleteWalletModal && this.renderWalletDeleteModal()}
      </div>
    );
  }

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

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withRouter(withStyles(styles)(Transactions));
