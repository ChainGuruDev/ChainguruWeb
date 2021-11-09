import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";
import { formatMoney, formatMoneyMCAP } from "../helpers";
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
  CircularProgress,
} from "@material-ui/core";

import HeatMapChart from "../components/heatmapChart.js";
import Skeleton from "@material-ui/lab/Skeleton";

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
  LOGIN,
  LOGIN_RETURNED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
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
    minHeight: "100%",
  },
  walletsCard: {},
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
    const userAuth = store.getStore("userAuth");
    const coinList = store.getStore("coinList");
    this.state = {
      account: account,
      coinList: coinList,
      loading: true,
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
    dispatcher.dispatch({
      type: GET_COIN_LIST,
    });
    if (!userAuth && account && account.address) {
      dispatcher.dispatch({
        type: LOGIN,
        address: account.address,
      });
    }
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
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_UPDATE_WALLET_RETURNED, this.dbUpdateWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoPriceReturned);
    emitter.on(LOGIN_RETURNED, this.loginReturned);
    emitter.on(DB_GET_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
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
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(
      DB_GET_PORTFOLIO_RETURNED,
      this.dbGetPortfolioReturned
    );
    this._isMounted = false;
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  loginReturned(state) {
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    if (userAuth && account && account.address) {
      dispatcher.dispatch({
        type: GET_COIN_LIST,
      });
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

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
      let wallets = [];
      this.state.userWallets.forEach((item, i) => {
        wallets.push(item.wallet);
      });

      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO,
          wallet: wallets,
        });
      this.setState({
        selectedWallet: "ALL",
        loading: true,
      });
    } else {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO,
          wallet: [wallet],
        });
      this.setState({
        selectedWallet: wallet,
        loading: true,
      });
    }
  };

  dbGetPortfolioReturned = (data) => {
    let assets = [];
    for (var i = 0; i < data.length; i++) {
      const objIndex = assets.findIndex(
        (obj) => obj.asset_code === data[i].asset_code
      );
      if (objIndex === -1) {
        if (data[i].balance > 0) {
          assets.push(data[i]);
        }
      } else {
        const newBalance = data[i].balance + assets[objIndex].balance;
        assets[objIndex].balance = newBalance;
      }
    }
    this.getCoinIDs(assets);
  };

  getCoinIDs = async (data) => {
    const { userBlacklist } = this.state;
    if (this.state.coinList) {
      let coinList = { ...this.state.coinList };
      const prevBalanceList = [...data];

      let newBalanceList = [];

      if (this.state.hideBlacklisted) {
        for (var i = 0; i < prevBalanceList.length; i++) {
          if (userBlacklist.tokenIDs.includes(prevBalanceList[i].asset_code)) {
            let index = i;
            let blacklistedIndex = prevBalanceList.findIndex(
              (obj) => obj.contractAddress === prevBalanceList[index].asset_code
            );
            prevBalanceList.splice(blacklistedIndex, 1);
            i--;
          }
        }
      }

      for (var k = 0; k < prevBalanceList.length; k++) {
        let item = { ...prevBalanceList[k] };
        if (item.symbol === "EWTB") {
          item.id = "energy-web-token";
        } else if (item.symbol === "XOR") {
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
              (obj) => obj.symbol === item.symbol.toLowerCase()
            ).length;

            if (symbolRepeats === 1) {
              objIndex = this.state.coinList.findIndex(
                (obj) => obj.symbol === item.symbol.toLowerCase()
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
                let zrx = item.asset_code;
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
    } else {
      console.log("no coinlist");
      dispatcher.dispatch({
        type: GET_COIN_LIST,
      });
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
      dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: tokenIDs,
      });
    }
  };

  geckoPriceReturned = async (data) => {
    let prevBalanceList = [...this.state.balanceList];
    let newBalanceList = [];
    //Merge Gecko price data with current token list.
    //If Gecko has no token price data, dont include asset in final array
    for (var i = 0; i < prevBalanceList.length; i++) {
      let item = { ...prevBalanceList[i] };
      let objIndex = data.findIndex((obj) => obj.id === item.id);
      if (objIndex > -1) {
        item.geckoData = data[objIndex];
        newBalanceList.push(item);
      }
    }
    this.dataSorting(newBalanceList);
  };

  userWalletList = (wallets) => {
    const { classes } = this.props;
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
    price_change_percentage_24h_in_currency,
    price_change_percentage_7d_in_currency,
    price_change_percentage_30d_in_currency,
    price_change_percentage_1y_in_currency,
    atl_change_percentage
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
      price_change_percentage_24h_in_currency,
      price_change_percentage_7d_in_currency,
      price_change_percentage_30d_in_currency,
      price_change_percentage_1y_in_currency,
      atl_change_percentage,
    };
  };

  dataSorting = (data) => {
    let sort = [];
    data.forEach((item, i) => {
      let balance = item.quantityDecimals;
      let value = item.balance;

      if (value >= 1) {
        let sortData = this.createData(
          item.asset_code,
          item.geckoData.image,
          item.geckoData.name,
          item.geckoData.id,
          item.geckoData.symbol,
          balance,
          item.geckoData.current_price,
          value,
          item.geckoData.price_change_percentage_1h_in_currency,
          item.geckoData.price_change_percentage_24h_in_currency,
          item.geckoData.price_change_percentage_7d_in_currency,
          item.geckoData.price_change_percentage_30d_in_currency,
          item.geckoData.price_change_percentage_1y_in_currency,
          item.geckoData.atl_change_percentage
        );
        sort.push(sortData);
      }
    });
    this.setState({
      rowData: sort,
      loading: false,
    });
    this.sortedList(sort);
  };

  sortedList = (rowData) => {
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
          formatMoney(item.balance, 2),
          formatMoney(item.current_price, 2),
          parseFloat(item.value).toFixed(2),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          parseFloat(item.atl_change_percentage).toFixed(4)
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
          formatMoney(item.balance, 2),
          formatMoney(item.current_price, 2),
          parseFloat(item.value).toFixed(2),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          parseFloat(item.atl_change_percentage).toFixed(2)
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
            timeFrameChangeString = " in 1 H";
            break;
          case "24hs":
            timeFrameChange =
              formatedRows[i].price_change_percentage_24h_in_currency;
            timeFrameChangeString = " in 24 Hs";
            break;
          case "7d":
            timeFrameChange =
              formatedRows[i].price_change_percentage_7d_in_currency;
            timeFrameChangeString = " in 7 days";
            if (timeFrameChange === "NaN") {
              timeFrameChange = formatedRows[i].atl_change_percentage;
              timeFrameChangeString = " since all time low";
            }
            break;
          case "30d":
            timeFrameChange =
              formatedRows[i].price_change_percentage_30d_in_currency;
            timeFrameChangeString = " in 30 days";
            if (timeFrameChange === "NaN") {
              timeFrameChange = formatedRows[i].atl_change_percentage;
              timeFrameChangeString = " since all time low";
            }
            break;
          case "1y":
            timeFrameChange =
              formatedRows[i].price_change_percentage_1y_in_currency;
            timeFrameChangeString = " in 1 Year";
            if (timeFrameChange === "NaN") {
              timeFrameChange = formatedRows[i].atl_change_percentage;
              timeFrameChangeString = " since all time low";
            }
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
          curPrice: formatedRows[i].current_price,
          tokenID: formatedRows[i].id,
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
    const { classes } = this.props;
    const {
      account,
      userWallets,
      addWallet,
      heatMapData,
      loading,
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
                  {loading && (
                    <Skeleton
                      variant="rect"
                      width={"100%"}
                      height={"100%"}
                      style={{ borderRadius: 10 }}
                      animation="wave"
                    />
                  )}
                  {!loading && (
                    <>
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
                          <Button
                            style={{
                              background:
                                this.state.timeFrame === "1h"
                                  ? colors.cgGreen + 25
                                  : "",
                            }}
                            onClick={() => this.handleTimeFrameChange("1h")}
                          >
                            1h
                          </Button>
                          <Button
                            style={{
                              background:
                                this.state.timeFrame === "24hs"
                                  ? colors.cgGreen + 25
                                  : "",
                            }}
                            onClick={() => this.handleTimeFrameChange("24hs")}
                          >
                            24hs
                          </Button>
                          <Button
                            style={{
                              background:
                                this.state.timeFrame === "7d"
                                  ? colors.cgGreen + 25
                                  : "",
                            }}
                            onClick={() => this.handleTimeFrameChange("7d")}
                          >
                            7d
                          </Button>
                          <Button
                            style={{
                              background:
                                this.state.timeFrame === "30d"
                                  ? colors.cgGreen + 25
                                  : "",
                            }}
                            onClick={() => this.handleTimeFrameChange("30d")}
                          >
                            30d
                          </Button>
                          <Button
                            style={{
                              background:
                                this.state.timeFrame === "1y"
                                  ? colors.cgGreen + 25
                                  : "",
                            }}
                            onClick={() => this.handleTimeFrameChange("1y")}
                          >
                            1y
                          </Button>
                        </ButtonGroup>
                      </Grid>
                      <Grid item>
                        {heatMapData && <HeatMapChart data={heatMapData} />}
                      </Grid>
                    </>
                  )}
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
