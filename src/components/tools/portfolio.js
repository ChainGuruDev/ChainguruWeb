import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

//IMPORT MaterialUI
import {
  Card,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";

import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";

import {
  CHECK_ACCOUNT_RETURNED,
  CHECK_ACCOUNT,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_COIN_DATA,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  COIN_DATA_RETURNED,
  DB_ADD_FAVORITE,
  DB_ADD_FAVORITE_RETURNED,
  DB_ADD_WALLET,
  DB_ADD_WALLET_RETURNED,
  DB_DEL_WALLET,
  DB_DEL_WALLET_RETURNED,
  DB_UPDATE_WALLET,
  DB_UPDATE_WALLET_RETURNED,
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
    justifyContent: "space-around",
  },
  portfolioCard: {
    padding: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "stretch",
    background: "rgba(125,125,125,0.1)",
    border: `2px solid ${colors.cgGreen}`,
  },
  walletsCard: {
    background: "rgba(125,125,125,0.1)",
    border: `2px solid ${colors.cgGreen}`,
  },

  walletsGrid: {
    display: "flex",
    flex: 1,
    alignItems: "stretch",
  },
  warning: {
    padding: 5,
    direction: "row",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  favList: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  button: {
    margin: 15,
  },
  inline: {
    maxWidth: "10%",
    display: "inline",
  },
  walletList: {
    maxWidth: "100%",
  },
});

class Portfolio extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      items: [],
      open: false,
      loadingBar: this.open && this.items.length === 0,
      account: account,
      loading: false,
      selectedID: "",
      validSelection: false,
      userWallets: [],
      errMsgWallet: "",
      errorWallet: false,
      userBalance: [],
    };
    if (account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

  // updateFavorites() {
  //   const account = store.getStore("account");
  //   if (account && account.address) {
  //     const newProgressBar = this.state.progressBar + 1;
  //     this.setState({ progressBar: newProgressBar });
  //     if (newProgressBar > 99) {
  //       this.setState({ progressBar: 0 });
  //       console.log("update favorites");
  //       dispatcher.dispatch({
  //         type: DB_GET_USERDATA,
  //         address: account.address,
  //       });
  //     }
  //   }
  // }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_UPDATE_WALLET_RETURNED, this.dbUpdateWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    // this.interval = setInterval(() => this.updateFavorites(), 750);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.removeListener(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(
      DB_UPDATE_WALLET_RETURNED,
      this.dbUpdateWalletReturned
    );

    // clearInterval(this.interval);
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  coinlistReturned = (payload) => {
    console.log(payload);
    this.setState({ loading: false, items: payload });
  };

  coinSelect = (newValue) => {
    if (newValue) {
      this.setState({ validSelection: true, selectedID: newValue.id });
    } else {
      this.setState({ validSelection: false, selectedID: "" });
    }
  };

  openSearch = () => {
    this.setState({ loading: true });
    dispatcher.dispatch({
      type: GET_COIN_LIST,
      content: {},
    });
  };

  dbUserDataReturned = (payload) => {
    this.setState({ userWallets: payload.wallets });
  };

  dbWalletReturned = (payload) => {
    this.setState({ userWallets: payload.wallets });
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

  updateWallet = (wallet) => {
    dispatcher.dispatch({
      type: DB_UPDATE_WALLET,
      wallet: wallet,
    });
  };

  dbUpdateWalletReturned = (payload) => {
    console.log(this.state.userWallets);
    console.log(payload);
    let newWallets = [...this.state.userWallets];
    let objIndex = newWallets.findIndex((obj) => obj.wallet === payload.wallet);
    let item = { ...newWallets[objIndex] };
    item = payload;
    newWallets[objIndex] = item;
    this.setState({ userWallets: newWallets });
  };

  removeWALLET = (wallet) => {
    dispatcher.dispatch({
      type: DB_DEL_WALLET,
      wallet: wallet,
    });
  };

  walletClicked = (wallet) => {
    this.getBalance(wallet);
  };

  getBalance = (wallet) => {
    if (wallet === "ALL") {
      let newWallets = [...this.state.userWallets];
      let displayBalance = [...newWallets[0].erc20Balance];
      console.log(displayBalance);
      let objIndex;
      for (var i = 1; i < newWallets.length; i++) {
        newWallets[i].erc20Balance.forEach((item, i) => {
          if (item.tokenSymbol === "UNI-V2") {
            displayBalance.push(item);
            return;
          }
          objIndex = displayBalance.findIndex(
            (obj) => obj.tokenName === item.tokenName
          );
          if (objIndex < 0) {
            displayBalance.push(item);
          } else {
            let previousBalance = displayBalance[objIndex];
            let newBalance = previousBalance.balance + item.balance;
            displayBalance[objIndex].balance = newBalance;
          }
          console.log(objIndex);
        });
      }

      // prevBalance.forEach((item, i) => {
      //   if (displayBalance.length === 0) {
      //     displayBalance = item.erc20Balance;
      //   } else {
      //     let objIndex;
      //     item.erc20Balance.forEach((item, i) => {
      //       objIndex = displayBalance.findIndex(
      //         (obj) => obj.tokenName === item.tokenName
      //       );
      //       if (objIndex < 0) {
      //         displayBalance.push(item);
      //       } else {
      //         let previousBalance = displayBalance[objIndex];
      //         let newBalance = previousBalance.balance + item.balance;
      //         displayBalance[objIndex].balance = newBalance;
      //       }
      //     });
      //   }
      // });
      console.log("clicked ALL");
      console.log(displayBalance);
    } else {
      console.log(`clicked ${wallet}`);
      this.state.userWallets.forEach((item, i) => {
        if (item.wallet === wallet) {
          this.setState({ userBalance: item.erc20Balance });
        }
      });
    }
  };

  userWalletList = (wallets) => {
    const { classes, t } = this.props;
    if (wallets.length > 0) {
      return wallets.map((wallet) => (
        <div key={wallet._id}>
          <Divider />
          <ListItem
            key={wallet._id}
            button
            onClick={() => this.walletClicked(wallet.wallet)}
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
                    {wallet.wallet.substring(0, 6) +
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
                aria-label="remove"
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

  handleChange = (event) => {
    switch (event.target.id) {
      case "walletAdd":
        this.setState({ addWallet: event.target.value });
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

  checkAccountReturned = (_isAccount) => {
    if (!_isAccount) {
      this.setState({ errMsgAccount: "Not a valid ethereum address" });
      this.setState({ errorWallet: true });
    } else {
      this.setState({ errMsgAccount: "" });
      this.setState({ errorWallet: false });
    }
    this.setState({ errorAccount: !_isAccount });
  };

  render() {
    const { classes, t } = this.props;
    const {
      account,
      loading,
      favList,
      selectedID,
      userWallets,
      addWallet,
    } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Grid className={classes.portfolioGrid} spacing={3} container>
            <Grid item xs={3}>
              <Card className={classes.walletsCard} elevation={3}>
                <Grid
                  className={classes.walletsGrid}
                  container
                  direction="column"
                  justify="center"
                  alignItems="center"
                >
                  <TextField
                    className={classes.button}
                    id="walletAdd"
                    label="Wallet Address"
                    onChange={this.handleChange}
                    helperText={this.state.errMsgAccount}
                    error={this.state.errorWallet}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<AddCircleRoundedIcon />}
                    onClick={() => {
                      this.addWallet(addWallet);
                    }}
                    disabled={this.state.errorWallet}
                  >
                    Add
                  </Button>
                  <List
                    className={classes.walletList}
                    component="nav"
                    aria-label="user wallet list"
                  >
                    <ListItem
                      key={"_ALL"}
                      button
                      onClick={() => this.walletClicked("ALL")}
                    >
                      <ListItemText primary="All assets" />
                    </ListItem>
                    {this.userWalletList(userWallets)}
                  </List>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={9}>
              <Card className={classes.portfolioCard} elevation={3}>
                <Grid>BALANCE</Grid>
              </Card>
            </Grid>
          </Grid>
        )}
      </div>
    );
  }
  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withRouter(withStyles(styles)(Portfolio));