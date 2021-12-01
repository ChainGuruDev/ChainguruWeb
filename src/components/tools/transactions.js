import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  formatMoney,
  formatBigNumbers,
  differenceInPercentage,
} from "../helpers";

import { colors } from "../../theme";

import {
  Card,
  Link,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import {
  ERROR,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_GET_ADDRESS_TX,
  DB_GET_ADDRESS_TX_RETURNED,
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
  LOGIN_RETURNED,
} from "../../constants";

import TransactionsBig from "./transactionsBig.js";

import WalletNicknameModal from "../components/walletNicknameModal.js";
import WalletRemoveModal from "../components/walletRemoveModal.js";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";

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
    borderRadius: "10px",
    padding: "10px",
    background: `#9991`,
    minHeight: "100%",
  },
  favCard: {
    padding: 10,
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  card: {
    padding: 10,
    margin: 10,
  },
  tokenLogo: {
    maxHeight: 30,
    minWidth: 30,
    margin: "0 5px",
  },
  container: {
    maxHeight: 500,
  },
  subtitle: {
    opacity: 0.8,
    textColor: "primary",
  },
  dateGrid: {
    minWidth: "160px",
    textAlign: "center",
  },
  fromToSpenderGrid: {
    margin: "0px 5px 0px 5px",
    minWidth: 175,
  },
  mainTx: {
    transition: "all .33s ease-in-out",
    background:
      "linear-gradient(90deg, rgba(121, 216, 162, 0.1) 0%, rgba(0,0,0,0.2) 10%)",
    boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.5)",
    borderRadius: 10,
    margin: "5px 0",
    padding: 10,
    [theme.breakpoints.down("xl")]: {
      justifyContent: "center",
    },
    [theme.breakpoints.up("xl")]: {
      justifyContent: "space-between",
    },
    "&:hover": {
      boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.3)",
    },
  },
  mainTxFailed: {
    transition: "all .33s ease-in-out",
    background:
      "linear-gradient(90deg, rgba(247, 157, 107, 0.1) 0%, rgba(0,0,0,0.2) 10%)",
    boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.5)",
    borderRadius: 10,
    margin: "5px 0",
    padding: 10,
    [theme.breakpoints.down("xl")]: {
      justifyContent: "center",
    },
    [theme.breakpoints.up("xl")]: {
      justifyContent: "space-between",
    },
    "&:hover": {
      boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.3)",
    },
  },
  mainData: {
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    height: "auto",
    [theme.breakpoints.down("xl")]: {
      height: "30%",
    },
    [theme.breakpoints.up("xl")]: {
      height: "100%",
    },
  },
  extraData: {
    margin: "0 0 0 auto",
    maxWidth: "max-content",
  },
  divVert: {
    width: "1px",
    height: "2rem",
  },
  linkButton: {
    padding: ".5rem",
    marginLeft: 5,
  },
  txLink: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  formControl: {
    minWidth: 120,
  },
});

class Transactions extends Component {
  constructor() {
    super();

    this._isMounted = false;
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    this.state = {
      account: account,
      loading: false,
      dbDataLoaded: false,
      addWallet: false,
      userWallets: [],
      error: false,
      errMsgWallet: "",
      errorWallet: true,
      sortBy: "mined_at",
      sortOrder: "desc",
      transactions: null,
      txLimit: 50,
      txOffset: 0,
      txQuery: null,
    };

    if (userAuth && account && account.address) {
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
    emitter.on(DB_GET_ADDRESS_TX_RETURNED, this.dbGetAddressTxReturned);
    emitter.on(DB_UPDATE_PORTFOLIO_RETURNED, this.dbGetAddressTxReturned);
    emitter.on(DB_SET_USER_WALLET_NICKNAME_RETURNED, this.setNicknameReturned);
    emitter.on(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(LOGIN_RETURNED, this.loginReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      DB_GET_ADDRESS_TX_RETURNED,
      this.dbGetAddressTxReturned
    );
    emitter.removeListener(
      DB_UPDATE_PORTFOLIO_RETURNED,
      this.dbGetAddressTxReturned
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
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);
    this._isMounted = false;
  }

  loginReturned = (status) => {
    const { account } = this.state;
    if (status && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  };

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
          type: DB_GET_ADDRESS_TX,
          wallet: wallets,
        });
    }
    this.setState({
      loading: true,
      selectedWallet: "all",
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

  dbGetAddressTxReturned = (data) => {
    if (data) {
      this.setState({
        error: false,
        loading: false,
        dbDataLoaded: true,
        transactions: data.transactions,
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

  walletClicked = (wallet) => {
    if (wallet === "all") {
      let wallets = [];
      this.state.userWallets.forEach((item, i) => {
        wallets.push(item.wallet);
      });
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_ADDRESS_TX,
          wallet: wallets,
          limit: this.state.txLimit,
          offset: this.state.txOffset,
          query: this.state.txQuery,
        });
    } else {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_ADDRESS_TX,
          wallet: [wallet],
          limit: this.state.txLimit,
          offset: this.state.txOffset,
          query: this.state.txQuery,
        });
    }
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
        type: DB_GET_ADDRESS_TX,
        wallet: [wallet],
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

  render() {
    const { classes } = this.props;
    const {
      account,
      dbDataLoaded,
      addWallet,
      newWallet,
      userWallets,
      walletNicknameModal,
      deleteWalletModal,
      error,
      transactions,
      sortBy,
      sortOrder,
      txLimit,
      txOffset,
      selectedWallet,
    } = this.state;

    return (
      <Grid container spacing={3} className={classes.root}>
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
              <TransactionsBig
                tx={transactions}
                selected={selectedWallet}
                wallets={userWallets}
                query={this.state.txQuery}
              />
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
                    <ListItem
                      key={"allwallets"}
                      button
                      selected={this.state.selectedWallet === "all"}
                      onClick={() => this.walletClicked("all")}
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
                    {this.userWalletList(userWallets)}
                  </List>
                </Grid>
              </Card>
            </Grid>
          </>
        )}
        {walletNicknameModal && this.renderModal()}
        {deleteWalletModal && this.renderWalletDeleteModal()}
      </Grid>
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
