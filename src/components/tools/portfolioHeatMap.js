import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

//Import Material UI components
import {
  Card,
  Typography,
  Grid,
  Divider,
  Button,
  ButtonGroup,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";

import HeatMapChart from "../components/heatmapChart.js";

//Import ICONS
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";

//import Constants
import {
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_ADD_WALLET,
  DB_ADD_WALLET_RETURNED,
  DB_DEL_WALLET,
  DB_DEL_WALLET_RETURNED,
  DB_UPDATE_WALLET_RETURNED,
  DB_UPDATE_WALLET,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  CHECK_ACCOUNT_RETURNED,
  CHECK_ACCOUNT,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

//Define css Styling
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
  list: {
    "&:hover": {
      background: colors.cgGreen,
    },
  },
});

class PortfolioHeatMap extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      selectedWallet: "updating",
      userWallets: [],
      errMsgWallet: "",
      errorWallet: false,
      userBalance: [],
      hideBlacklisted: true,
      hideLowBalanceCoins: true,
      sortBy: "value",
      sortOrder: "dsc",
      timeFrame: "24hs",
      rowData: [],
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
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_UPDATE_WALLET_RETURNED, this.dbUpdateWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoPriceReturned);

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
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoPriceReturned
    );
    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.removeListener(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(
      DB_UPDATE_WALLET_RETURNED,
      this.dbUpdateWalletReturned
    );
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    this._isMounted = false;
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  coinlistReturned = (data) => {
    this._isMounted && this.setState({ coinList: data });
  };

  dbUserDataReturned = (payload) => {
    this.setState({
      userWallets: payload.wallets,
      userBlacklist: payload.blacklist,
    });
    this.getBalance("ALL");
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
    this.setState({ selectedWallet: "updating" });
  };

  dbUpdateWalletReturned = (payload) => {
    let newWallets = [...this.state.userWallets];
    let objIndex = newWallets.findIndex((obj) => obj.wallet === payload.wallet);
    let item = { ...newWallets[objIndex] };
    item = payload;
    newWallets[objIndex] = item;
    this.setState({ userWallets: newWallets });
    this.walletClicked(payload.wallet);
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
      let userWallet = { ...newWallets[0] };
      let displayBalance = [...userWallet.erc20Balance];

      let objIndex;
      for (var i = 1; i < newWallets.length; i++) {
        let wallet = { ...newWallets[i] };
        let erc20Balance = [...wallet.erc20Balance];
        erc20Balance.forEach((item, x) => {
          if (item.tokenSymbol === "UNI-V2") {
            // agregar comparar el contract address
            // para ver si son del mismo pool de uni y sumar los balances
            displayBalance.push(item);
            return;
          }
          objIndex = displayBalance.findIndex(
            (obj) => obj.contractAddress === item.contractAddress
          );
          if (objIndex < 0) {
            displayBalance.push(item);
          } else {
            let previousBalance = { ...displayBalance[objIndex] };
            let oldBalance = previousBalance.balance;

            let newBalance = oldBalance + item.balance;

            previousBalance.balance = newBalance;
            displayBalance.splice(objIndex, 1, previousBalance);
          }
        });
      }
      this.getCoinIDs(displayBalance);
      this.setState({ selectedWallet: wallet });
    } else {
      this.state.userWallets.forEach((item, i) => {
        if (item.wallet === wallet) {
          this.getCoinIDs(item.erc20Balance);
          this.setState({
            selectedWallet: item.wallet,
          });
        }
      });
    }
  };

  getCoinIDs = async (data) => {
    const { userBlacklist } = this.state;
    if (this.state.coinList) {
      let coinList = { ...this.state.coinList };
      const prevBalanceList = [...data];

      let newBalanceList = [];

      if (this.state.hideBlacklisted) {
        for (var i = 0; i < prevBalanceList.length; i++) {
          if (
            userBlacklist.tokenIDs.includes(prevBalanceList[i].contractAddress)
          ) {
            let blacklistedIndex = prevBalanceList.findIndex(
              (obj) =>
                obj.contractAddress === prevBalanceList[i].contractAddress
            );
            prevBalanceList.splice(blacklistedIndex, 1);
            i--;
          }
        }
      }

      if (this.state.hideLowBalanceCoins) {
        for (var i = 0; i < prevBalanceList.length; i++) {
          if (!prevBalanceList[i].balance > 0) {
            let blacklistedIndex = prevBalanceList.findIndex(
              (obj) =>
                obj.contractAddress === prevBalanceList[i].contractAddress
            );
            prevBalanceList.splice(blacklistedIndex, 1);
            i--;
          }
        }
      }

      for (var i = 0; i < prevBalanceList.length; i++) {
        let item = { ...prevBalanceList[i] };
        if (item.tokenSymbol === "EWTB") {
          item.id = "energy-web-token";
        } else if (item.tokenSymbol === "XOR") {
          item.id = "sora";
        } else {
          //CHECK IF `item.name` is a match in coingecko coin list IDs
          let objIndex = this.state.coinList.findIndex(
            (obj) => obj.name === item.tokenName
          );
          if (objIndex > -1) {
            item.id = coinList[objIndex].id;
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
              }
              if (symbolRepeats > 1) {
                // console.log("repeated item in geckoList");
                // console.log(item);
                //LOOK TOKEN DATA USING CONTRACT ADDRESS
                let zrx = item.contractAddress;
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
        newBalanceList.push(item);
      }

      this._isMounted && this.setState({ balanceList: newBalanceList });
      this.getPortfolioValue(newBalanceList);
    }
  };

  getPortfolioValue = async (coinList) => {
    let tokenIDs = [];
    coinList.forEach((item, i) => {
      if (item.id) {
        tokenIDs.push(item.id);
      }
    });
    if (tokenIDs.length > 0) {
      let geckoData = dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: tokenIDs,
      });
    }
  };

  geckoPriceReturned = async (data) => {
    let prevBalanceList = [...this.state.balanceList];
    let newBalanceList = [];

    for (var i = 0; i < prevBalanceList.length; i++) {
      let item = { ...prevBalanceList[i] };
      let objIndex = data.findIndex((obj) => obj.id === item.id);
      if (objIndex > -1) {
        item.geckoData = data[objIndex];
      }
      //console.log(objIndex);
      newBalanceList.push(item);

      // console.log(data[i]);
      // console.log(newBalanceList[i]);
    }
    this.dataSorting(newBalanceList);
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

  createData = (
    contractAddress,
    image,
    name,
    id,
    symbol,
    balance,
    current_price,
    value,
    price_change_percentage_1h_in_currency,
    price_change_percentage_24h,
    price_change_percentage_7d_in_currency,
    price_change_percentage_30d_in_currency,
    price_change_percentage_1y_in_currency
  ) => {
    return {
      contractAddress,
      image,
      name,
      id,
      symbol,
      balance,
      current_price,
      value,
      price_change_percentage_1h_in_currency,
      price_change_percentage_24h,
      price_change_percentage_7d_in_currency,
      price_change_percentage_30d_in_currency,
      price_change_percentage_1y_in_currency,
    };
  };

  dataSorting = (data) => {
    let rows = [];
    let sort = [];
    data.forEach((item, i) => {
      if (item.geckoData) {
        let balance = item.balance / Math.pow(10, item.tokenDecimal);
        let value = balance * item.geckoData.current_price;

        if (value >= 1) {
          let sortData = this.createData(
            item.contractAddress,
            item.geckoData.image,
            item.geckoData.name,
            item.geckoData.id,
            item.geckoData.symbol,
            balance,
            item.geckoData.current_price,
            value,
            item.geckoData.price_change_percentage_1h_in_currency,
            item.geckoData.price_change_percentage_24h,
            item.geckoData.price_change_percentage_7d_in_currency,
            item.geckoData.price_change_percentage_30d_in_currency,
            item.geckoData.price_change_percentage_1y_in_currency
          );
          sort.push(sortData);
        }
      } else {
        // console.log("staking o token raro");
        // console.log(item);
      }
    });
    this.setState({
      rowData: sort,
    });
    this.sortedList(sort);
  };

  formatMoney = (amount, decimalCount = 5, decimal = ".", thousands = ",") => {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 5 : decimalCount;
      const negativeSign = amount < 0 ? "-" : "";

      let num = parseInt((amount = Math.abs(Number(amount) || 0)));
      if (num > 0) {
        decimalCount = 2;
      } else {
        decimalCount = 5;
      }
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

  formatMoneyMCAP = (
    amount,
    decimalCount = 2,
    decimal = ".",
    thousands = ","
  ) => {
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

  sortedList = (rowData) => {
    const { classes } = this.props;
    const { sortBy, sortOrder } = this.state;

    function dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

        return result * sortOrder;
      };
    }
    let sortedRows;
    let formatedRows = [];
    if (sortOrder === "asc") {
      sortedRows = rowData.sort(dynamicSort(sortBy));
      sortedRows.forEach((item, i) => {
        let _rowData = this.createData(
          item.contractAddress,
          item.image,
          item.name,
          item.id,
          item.symbol,
          this.formatMoney(item.balance, 2),
          this.formatMoney(item.current_price, 2),
          parseFloat(item.value).toFixed(2),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          this.formatMoneyMCAP(item.market_cap, 0),
          parseFloat(item.market_cap_change_percentage_24h).toFixed(2),
          item.sparkline_in_7d
        );
        formatedRows.push(_rowData);
      });
    } else {
      sortedRows = rowData.sort(dynamicSort(`-${sortBy}`));
      sortedRows.forEach((item, i) => {
        let _rowData = this.createData(
          item.contractAddress,
          item.image,
          item.name,
          item.id,
          item.symbol,
          this.formatMoney(item.balance, 2),
          this.formatMoney(item.current_price, 2),
          parseFloat(item.value).toFixed(2),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          this.formatMoney(item.market_cap, 0),
          parseFloat(item.market_cap_change_percentage_24h).toFixed(2),
          item.sparkline_in_7d
        );
        formatedRows.push(_rowData);
      });
    }

    if (formatedRows.length > 0) {
      let heatMapData = [];

      let getColor = (tframe) => {
        let colorsGreen = [colors.cgGreen, "#61d192", "#4dcb84", "#39c676"];
        let colorsRed = [colors.cgRed, "#ea6d62", "#e7584b", "#e34435"];

        if (tframe >= 0) {
          if (tframe > 50) {
            return colorsGreen[3];
          } else if (tframe <= 50 && tframe > 20) {
            return colorsGreen[2];
          } else if (tframe <= 20 && tframe > 10) {
            return colorsGreen[1];
          } else if (tframe <= 10) {
            return colorsGreen[0];
          }
        } else if (tframe < 0) {
          if (tframe < -50) {
            return colorsRed[3];
          } else if (tframe >= -50 && tframe < -20) {
            return colorsRed[2];
          } else if (tframe >= -20 && tframe < -10) {
            return colorsRed[1];
          } else if (tframe >= -10) {
            return colorsRed[0];
          }
        } else {
          return colorsGreen[0];
        }
      };

      for (var i = 0; i < formatedRows.length; i++) {
        let timeFrameChange = null;
        let timeFrameChangeString = "";
        switch (this.state.timeFrame) {
          case "1h":
            timeFrameChange =
              formatedRows[i].price_change_percentage_1h_in_currency;
            timeFrameChangeString = "1 H";
            break;
          case "24hs":
            timeFrameChange = formatedRows[i].price_change_percentage_24h;
            timeFrameChangeString = "24 Hs";
            break;
          case "7d":
            timeFrameChange =
              formatedRows[i].price_change_percentage_7d_in_currency;
            timeFrameChangeString = "7 days";
            break;
          case "30d":
            timeFrameChange =
              formatedRows[i].price_change_percentage_30d_in_currency;
            timeFrameChangeString = "30 days";
            break;
          case "1y":
            timeFrameChange =
              formatedRows[i].price_change_percentage_1y_in_currency;
            timeFrameChangeString = "1 Year";
            break;
          default:
            break;
        }

        var item = {
          x: formatedRows[i].name,
          y: parseInt(formatedRows[i].value),
          symbol: formatedRows[i].symbol,
          change: timeFrameChange,
          changeText: timeFrameChangeString,
          fillColor: getColor(timeFrameChange),
          stroke: colors.cgBlue,
        };

        heatMapData.push(item);
      }
      this.setState({
        heatMapData: heatMapData,
      });
    }
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

  handleTimeFrameChange = async (newTimeframe) => {
    this.setState({ timeFrame: newTimeframe }, () =>
      this.sortedList(this.state.rowData)
    );
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
      selectedID,
      userWallets,
      addWallet,
      heatMapData,
    } = this.state;

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
              <Card className={classes.portfolioCard} elevation={3}>
                <Grid
                  item
                  container
                  direction="column"
                  justify="flex-start"
                  alignItems="stretch"
                >
                  <Grid
                    item
                    container
                    direction="row"
                    justify="space-evenly"
                    alignItems="flex-start"
                  >
                    <ButtonGroup
                      color="primary"
                      aria-label="outlined primary button group"
                    >
                      <Button onClick={() => this.handleTimeFrameChange("1h")}>
                        1h
                      </Button>
                      <Button
                        onClick={() => this.handleTimeFrameChange("24hs")}
                      >
                        24hs
                      </Button>
                      <Button onClick={() => this.handleTimeFrameChange("7d")}>
                        7d
                      </Button>
                      <Button onClick={() => this.handleTimeFrameChange("30d")}>
                        30d
                      </Button>
                      <Button onClick={() => this.handleTimeFrameChange("1y")}>
                        1y
                      </Button>
                    </ButtonGroup>
                  </Grid>
                  <Grid item>
                    {heatMapData && <HeatMapChart data={heatMapData} />}
                  </Grid>
                </Grid>
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

export default withRouter(withStyles(styles)(PortfolioHeatMap));
