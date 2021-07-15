import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import Bottleneck from "bottleneck";

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
  DB_UPDATE_WALLET_MOVEMENTS_PRICES,
  DB_UPDATE_WALLET_MOVEMENTS_PRICES_RETURNED,
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
const axios = require("axios").default;

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

const limiter = new Bottleneck({
  reservoir: 50, // initial value
  reservoirRefreshAmount: 50,
  reservoirRefreshInterval: 60 * 1100, // must be divisible by 250

  // also use maxConcurrent and/or minTime for safety
  maxConcurrent: 1,
  minTime: 1100, // pick a value that makes sense for your use case
});

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

    this._isMounted = false;
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
      list: [],
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
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_UPDATE_ONE_MOV_RETURNED, this.dbUpdateOneReturned);
    emitter.on(
      DB_UPDATE_WALLET_MOVEMENTS_RETURNED,
      this.dbUpdateWalletMovementsReturned
    );
    emitter.on(
      DB_UPDATE_WALLET_MOVEMENTS_PRICES_RETURNED,
      this.dbUpdateMovPriceReturned
    );
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COINGECKO_POPULATE_TXLIST_RETURNED, this.populateTxListReturned);
    this._isMounted &&
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
      DB_UPDATE_WALLET_MOVEMENTS_PRICES_RETURNED,
      this.dbUpdateMovPriceReturned
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
    this._isMounted = false;
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  dbUserDataReturned = (payload) => {
    this._isMounted &&
      this.setState({
        userWallets: payload.wallets,
        userMovements: payload.movements.movements,
        selectedWallet: "ALL",
      });
    this.getCoinIDs(payload.movements.movements);
    // this._isMounted && this.getMovements("ALL");
  };

  dbWalletReturned = (payload) => {
    this._isMounted && this.setState({ userWallets: payload.wallets });
  };

  dbUpdateOneReturned = (payload) => {
    console.log(payload);
    this._isMounted &&
      this.setState({
        userMovements: payload[0],
      });
    this._isMounted && this.getMovements(this.state.selectedWallet);
  };

  dbUpdateMovPriceReturned = (payload) => {
    console.log(payload);
  };

  coinlistReturned = (data) => {
    this._isMounted && this.setState({ coinList: data });
  };

  addWallet = (wallet) => {
    if (wallet) {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_ADD_WALLET,
          wallet: wallet,
        });
    } else {
      this._isMounted && this.setState({ errorWallet: true });
    }
  };

  updateWallet = (wallet) => {
    this.getAllResults(this.state.list);

    // this._isMounted &&
    //   dispatcher.dispatch({
    //     type: DB_UPDATE_WALLET_MOVEMENTS,
    //     wallet: wallet,
    //   });
    // this._isMounted && this.setState({ selectedWallet: "updating" });
  };

  dbUpdateWalletMovementsReturned = (payload) => {
    this._isMounted &&
      this.setState({
        selectedWallet: payload[1],
      });
    this.getCoinIDs(payload[0]);
  };

  handleChange = (event) => {
    switch (event.target.id) {
      case "walletAdd":
        this.setState({ addWallet: event.target.value, errorWallet: false });
        this._isMounted &&
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
      this.setState({
        errMsgAccount: "Not a valid ethereum address",
        errorWallet: true,
      });
    } else {
      this.setState({ errMsgAccount: "", errorWallet: false });
    }
    this._isMounted && this.setState({ errorAccount: !_isAccount });
  };

  walletClicked = (wallet) => {
    this.setState({ selectedWallet: "updating" });
    this.getMovements(wallet);
  };

  getMovements = (wallet) => {
    const { userMovements } = this.state;

    console.log(userMovements);
    console.log(wallet);

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
    this._isMounted &&
      dispatcher.dispatch({
        type: COINGECKO_POPULATE_TXLIST,
        data: newMovements,
      });

    this._isMounted &&
      this.setState({
        filteredMovements: newMovements,
        updatingWallet: wallet,
      });
  };

  createData = (
    _id,
    id,
    image,
    operation,
    timeStamp,
    value,
    wallet,
    current_price,
    buyPrice,
    gasUsed,
    gasPrice,
    tokenSymbol,
    tokenName,
    tokenDecimal
  ) => {
    return {
      _id,
      id,
      image,
      operation,
      timeStamp,
      value,
      wallet,
      current_price,
      buyPrice,
      gasUsed,
      gasPrice,
      tokenSymbol,
      tokenName,
      tokenDecimal,
    };
  };

  populateTxListReturned = (txList) => {
    const movements = this.state.filteredMovements;
    let rows = [];
    movements.forEach((item, i) => {
      let objIndex = txList.findIndex((obj) => obj.id === item.tokenID);
      if (objIndex > -1) {
        let rowData = this.createData(
          item._id,
          txList[objIndex].id,
          txList[objIndex].image,
          item.operation,
          item.timeStamp,
          item.value,
          item.wallet,
          txList[objIndex].current_price,
          item.buyPrice,
          item.gasUsed,
          item.gasPrice,
          item.tokenSymbol,
          txList[objIndex].name,
          item.tokenDecimal
        );
        rows.push(rowData);
      }
    });
    // this.setState({ rowData: rows, loadingData: false });

    // if (this.state.updatingWallet !== "ALL") {
    //   this.getAllResults(rows);
    // } else {
    //   this._isMounted &&
    //     this.setState({
    //       list: rows,
    //       selectedWallet: this.state.updatingWallet,
    //     });
    // }

    this._isMounted &&
      this.setState({
        list: rows,
        selectedWallet: this.state.updatingWallet,
      });
  };

  updateBuyPrice = async (tokenData) => {
    let prices = {};
    let vsCoin = ["usd", "eur", "btc", "eth"];
    const from = parseInt(tokenData.timeStamp) - 100;
    const to = parseInt(tokenData.timeStamp) + 10000;
    try {
      if (tokenData.buyPrice) {
        console.log("token already has price");
        return tokenData;
      } else {
        let date = new Date(parseInt(tokenData.timeStamp) * 1000);
        const queryDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
        const _urlUSD = await `https://api.coingecko.com/api/v3/coins/${tokenData.id}/market_chart/range?vs_currency=${vsCoin[0]}&from=${from}&to=${to}`;
        const _urlEUR = await `https://api.coingecko.com/api/v3/coins/${tokenData.id}/market_chart/range?vs_currency=${vsCoin[1]}&from=${from}&to=${to}`;
        const _urlBTC = await `https://api.coingecko.com/api/v3/coins/${tokenData.id}/market_chart/range?vs_currency=${vsCoin[2]}&from=${from}&to=${to}`;
        const _urlETH = await `https://api.coingecko.com/api/v3/coins/${tokenData.id}/market_chart/range?vs_currency=${vsCoin[3]}&from=${from}&to=${to}`;

        const geckoUSD = await axios.get(_urlUSD);
        const geckoEUR = await axios.get(_urlEUR);
        const geckoBTC = await axios.get(_urlBTC);
        const geckoETH = await axios.get(_urlETH);

        prices = {
          usd: await geckoUSD.data.prices[0][1],
          eur: await geckoEUR.data.prices[0][1],
          btc: await geckoBTC.data.prices[0][1],
          eth: await geckoETH.data.prices[0][1],
        };
        tokenData.buyPrice = await prices;

        return await tokenData;
      }
    } catch (err) {
      console.log(err.message);
      return tokenData;
    }
  };

  updateBuyPriceMany = async (tokenData) => {
    console.log(tokenData);
    let itemIds = [];
    tokenData.forEach((item, i) => {
      if (itemIds.indexOf(item.id) === -1) {
        itemIds.push(item.id);
      }
    });
    console.log(itemIds);
  };

  limitedUpdatePrices = limiter.wrap(this.updateBuyPrice);
  //limitedUpdatePrices = this.updateBuyPriceMany;

  getAllResults = async (data) => {
    console.log(data);
    const newMovements = [];
    this.updateBuyPriceMany(data);
    const allThePromises = data.map((item) => {
      if (!item.buyPrice) {
        return this.limitedUpdatePrices(item);
      } else {
        console.log("token already has price");
        return item;
      }
    });
    try {
      const results = await Promise.all(allThePromises);
      this.setState(
        {
          list: results,
          selectedWallet: this.state.updatingWallet,
        },
        () => {
          dispatcher.dispatch({
            type: DB_UPDATE_WALLET_MOVEMENTS_PRICES,
            newMovements: results,
            selectedWallet: this.state.updatingWallet,
          });
        }
      );
    } catch (err) {
      console.log(err);
    }
    // for (let i = 0; i < count; i++) {
    //   sourceIds.push({
    //     id: i,
    //   });
    // } // Map over all the results and call our pretend API, stashing the promises in a new array
    // const allThePromises = sourceIds.map((item) => {
    //   return throttledGetMyData(item);
    // });
    // try {
    //   const results = await Promise.all(allThePromises);
    //   console.log(results);
    // } catch (err) {
    //   console.log(err);
    // }
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
                aria-label="updateTX"
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
          // newTxList.push(item);
        } else if (item.tokenSymbol === "XOR") {
          item.tokenID = "sora";
          // newTxList.push(item);
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
                item.tokenID = coinList[objIndex].id;
              }
            } else {
              if (symbolRepeats === 0) {
                // HERE ENDS LIQUIDITY POOLS, STAKING, AND SCAM SHITCOINS
                // ADD LOGIC FOR CONNECTING WITHw LPs, STAKING TOKENS
                // console.log("missing from geckoList");
                // console.log(item);
              }
              if (symbolRepeats > 1) {
                // console.log("repeated item in geckoList");
                // console.log(item);
                //LOOK TOKEN DATA USING CONTRACT ADDRESS
                let zrx = item.tokenContract;
                try {
                  let data = await CoinGeckoClient.coins.fetchCoinContractInfo(
                    zrx
                  );
                  if (await data) {
                    item.tokenID = data.data.id;
                  }
                } catch (err) {
                  if (err) {
                    console.log(err.message);
                  }
                }
              }
            }
          }
        }
        newTxList.push(item);
      }
      this._isMounted && this.setState({ userMovements: newTxList });
      this.getMovements(this.state.selectedWallet);
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
                  list={this.state.list}
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
