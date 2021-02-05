import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import TransactionList from "../components/transactionList.js";

import {
  Card,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
} from "@material-ui/core";

import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";

import {
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_ADD_WALLET,
  DB_DEL_WALLET,
  DB_ADD_WALLET_RETURNED,
  DB_DEL_WALLET_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  CHECK_ACCOUNT,
  CHECK_ACCOUNT_RETURNED,
  DB_UPDATE_WALLET_MOVEMENTS,
  DB_UPDATE_WALLET_MOVEMENTS_RETURNED,
  COINLIST_RETURNED,
  GET_COIN_LIST,
  COINGECKO_POPULATE_TXLIST,
  COINGECKO_POPULATE_TXLIST_RETURNED,
  DB_UPDATE_ONE_MOV_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  txCard: {
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
  button: {
    margin: 15,
  },
});

class Transactions extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      selectedWallet: "updating",
      updatingWallet: "",
      userWallets: [],
      userMovements: [],
      filteredMovements: [],
      errMsgWallet: "",
      errorWallet: false,
      userBalance: [],
      coinList: [],
    };
    if (account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_UPDATE_ONE_MOV_RETURNED, this.dbUpdateOneReturned);
    emitter.on(
      DB_UPDATE_WALLET_MOVEMENTS_RETURNED,
      this.dbUpdateWalletMovementsReturned
    );
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COINGECKO_POPULATE_TXLIST_RETURNED, this.populateTxListReturned);
    dispatcher.dispatch({
      type: GET_COIN_LIST,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.removeListener(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(
      DB_UPDATE_ONE_MOV_RETURNED,
      this.dbUpdateOneReturned
    );
    emitter.removeListener(
      DB_UPDATE_WALLET_MOVEMENTS_RETURNED,
      this.dbUpdateWalletMovementsReturned
    );
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(
      COINGECKO_POPULATE_TXLIST_RETURNED,
      this.populateTxListReturned
    );
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  dbUserDataReturned = (payload) => {
    this.setState({
      userWallets: payload.wallets,
      userMovements: payload.movements.movements,
    });
    this.getCoinIDs(payload.movements.movements);
    //this.getMovements("ALL");
  };

  dbWalletReturned = (payload) => {
    this.setState({ userWallets: payload.wallets });
  };

  dbUpdateOneReturned = (payload) => {
    console.log(payload);
  };

  coinlistReturned = (data) => {
    this.setState({ coinList: data });
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
      type: DB_UPDATE_WALLET_MOVEMENTS,
      wallet: wallet,
    });
    this.setState({ selectedWallet: "updating" });
  };

  dbUpdateWalletMovementsReturned = (payload) => {
    this.setState({
      userMovements: payload[0],
    });
    this.getMovements(payload[1]);
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

  walletClicked = (wallet) => {
    this.getMovements(wallet);
  };

  getMovements = (wallet) => {
    const { userMovements } = this.state;
    let newMovements;
    if (wallet === "ALL") {
      newMovements = userMovements;
    } else {
      if (userMovements) {
        const result = userMovements.filter((item) => item.wallet === wallet);
        newMovements = result;
      }
    }
    console.log(newMovements);
    dispatcher.dispatch({
      type: COINGECKO_POPULATE_TXLIST,
      data: newMovements,
    });

    this.setState({ filteredMovements: newMovements, updatingWallet: wallet });
  };

  populateTxListReturned = (txList) => {
    this.setState({
      geckoData: txList,
      selectedWallet: this.state.updatingWallet,
    });
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

  getCoinIDs = async (data) => {
    if (this.state.coinList) {
      let coinList = [...this.state.coinList];
      let prevTxList = data;
      let newTxList = [];
      for (var i = 0; i < prevTxList.length; i++) {
        let item = { ...prevTxList[i] };
        if (item.tokenSymbol === "EWTB") {
          item.tokenID = "energy-web-token";
          newTxList.push(item);
        } else if (item.tokenSymbol === "XOR") {
          item.tokenID = "sora";
          newTxList.push(item);
        } else {
          let objIndex = this.state.coinList.findIndex(
            (obj) => obj.name === item.tokenName
          );
          if (objIndex > -1) {
            item.tokenID = coinList[objIndex].id;
          } else {
            //IF name is not a match look for match in item.symbol
            //check for more than 1 token with same symbol
            let symbolRepeats = this.state.coinList.filter(
              (obj) => obj.symbol === item.tokenSymbol.toLowerCase()
            ).length;
            if (symbolRepeats === 1) {
              objIndex = this.state.coinList.findIndex(
                (obj) => obj.symbol === item.tokenSymbol.toLowerCase()
              );
              if (objIndex > -1) {
                item.id = coinList[objIndex].id;
              }
            } else {
              if (symbolRepeats === 0) {
                // HERE ENDS LIQUIDITY POOLS, STAKING, AND SCAM SHITCOINS
                // ADD LOGIC FOR CONNECTING WITHw LPs, STAKING TOKENS
                // console.log("missing from geckoList");
                // console.log(item);
                // console.log("missing from geckoList");
                // console.log(item);
              }
              if (symbolRepeats > 1) {
                // console.log("repeated item in geckoList");
                // console.log(item);
                //LOOK TOKEN DATA USING CONTRACT ADDRESS
                let zrx = item.tokenContract;
                let data = await CoinGeckoClient.coins.fetchCoinContractInfo(
                  zrx
                );
                if (data) {
                  item.id = data.data.id;
                }
              }
            }
          }
        }
        newTxList.push(item);
      }
      this.setState({ userMovements: newTxList });
      this.getMovements("ALL");
    }
  };

  render() {
    const { classes, t } = this.props;
    const { account, loading, addWallet, userWallets } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Grid className={classes.portfolioGrid} spacing={3} container>
            <Grid item xs={2}>
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
                      selected={this.state.selectedWallet === "ALL"}
                      onClick={() => this.walletClicked("ALL")}
                      className={classes.list}
                    >
                      <ListItemText primary="All assets" />
                    </ListItem>
                    {this.userWalletList(userWallets)}
                  </List>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={10}>
              <Card className={classes.txCard} elevation={3}>
                <TransactionList
                  geckoData={this.state.geckoData}
                  txData={this.state.filteredMovements}
                  selectedWallet={this.state.selectedWallet}
                />
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

export default withRouter(withStyles(styles)(Transactions));

// <TxList
//   data={this.state.userTXs}
//   selectedWallet={this.state.selectedWallet}
// />
