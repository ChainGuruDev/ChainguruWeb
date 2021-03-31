import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import clsx from "clsx";

import {
  Card,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Button,
  ButtonGroup,
} from "@material-ui/core";

import PieChart from "../components/pieChart.js";
import FavoriteList from "../components/favoriteList.js";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  COINLIST_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
  GET_COIN_LIST,
  DB_GET_COIN_CATEGORIES,
  DB_GET_COIN_CATEGORIES_RETURNED,
  PIE_CHART_SELECTED,
} from "../../constants";

import Store from "../../stores";
import DefiSDKStore from "../../stores/defiSDK_store.js";

const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const emitterDefi = DefiSDKStore.emitter;
const storeDefi = DefiSDKStore.store;
const dispatcherDefi = DefiSDKStore.dispatcher;

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
  graphCard: {
    padding: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "stretch",
    background: "rgba(125,125,125,0.1)",
    border: `2px solid ${colors.cgGreen}`,
    textAlign: "center",
    justifyContent: "space-evenly",
  },
});

// PORTFOLIO RADAR CHART TOOL
// GET USER TOKEN IDS FROM ASSETS IN PORTFOLIO
// COUNT TOKEN CATEGORIES AND DISPLAY IN RADAR CHART

class PortfolioRadar extends Component {
  constructor() {
    super();

    let vsCoin = store.getStore("vsCoin");
    const account = store.getStore("account");

    this.state = {
      loading: false,
      userData: [],
      account: account,
      userBlacklist: [],
      tokenList: [],
    };
  }

  componentDidMount() {
    this._isMounted = true;
    // emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    // emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(DB_GET_COIN_CATEGORIES_RETURNED, this.dbCategoriesReturned);
    emitter.on(PIE_CHART_SELECTED, this.pieChartSelected);
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.populateListReturned);

    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: this.state.account.address,
      });
    this._isMounted &&
      dispatcher.dispatch({
        type: GET_COIN_LIST,
      });
  }

  componentWillUnmount() {
    // emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    // emitter.removeListener(
    //   CONNECTION_DISCONNECTED,
    //   this.connectionDisconnected
    // );
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(
      DB_GET_COIN_CATEGORIES_RETURNED,
      this.dbCategoriesReturned
    );
    emitter.removeListener(PIE_CHART_SELECTED, this.pieChartSelected);

    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.populateListReturned
    );

    this._isMounted = false;
  }

  pieChartSelected = (selectedCategorie) => {
    const { balanceList } = this.state;
    let tokensInCategorie = [];
    if (selectedCategorie) {
      // console.log(selectedCategorie);
      for (var i = 0; i < balanceList.length; i++) {
        if (balanceList[i] != null) {
          if (balanceList[i].categories.includes(selectedCategorie)) {
            tokensInCategorie.push(balanceList[i].tokenID);
          }
        }
      }
      this.setState({ tokenList: tokensInCategorie });
      dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: tokensInCategorie,
      });
    } else {
      this.setState({ tokenList: [] });
    }
  };

  populateListReturned = (data) => {
    // console.log(data);
  };

  coinlistReturned = (data) => {
    this._isMounted && this.setState({ coinList: data });
  };

  dbUserDataReturned = (payload) => {
    let userTokens = [];
    if (payload.wallets.length > 0) {
      let allTokens = [];
      payload.wallets.forEach((item, i) => {
        console.log(item.wallet);
        console.log(i);
        allTokens = payload.wallets[i].erc20Balance;
        for (var x = 0; x < allTokens.length; x++) {
          if (allTokens[x].balance >= 1) {
            userTokens.push(allTokens[x]);
          }
        }
      });

      if (this.state.loading === false) {
        this.getCoinIDs(userTokens);
        this.setState({ userBlacklist: payload.blacklist, loading: true });
      }
    }
  };

  getCoinIDs = async (data) => {
    const { userBlacklist } = this.state;

    if (this.state.coinList) {
      let coinList = { ...this.state.coinList };
      const prevBalanceList = data;

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
                // ADD LOGIC FOR CONNECTING WITH LPs, STAKING TOKENS
                // console.log("missing from geckoList");
                if (item.tokenSymbol === "UNI-V2") {
                  // TODO: set categories Liquidity Pools
                  console.log("token uni");
                }
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

      // console.log(newBalanceList);
      this._isMounted && this.setState({ balanceList: newBalanceList });
      this.getCoinCategories(newBalanceList);
    }
  };

  getCoinCategories = async (data) => {
    let tokenIDs = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].id) {
        tokenIDs.push(data[i].id);
      }
    }
    if (tokenIDs.length > 0) {
      dispatcher.dispatch({
        type: DB_GET_COIN_CATEGORIES,
        tokenIDs,
      });
    }
  };

  dbCategoriesReturned = (categories) => {
    // console.log(categories.data);
    // console.log(this.state.balanceList);

    if (categories.data) {
      let _newBalanceList = [...this.state.balanceList];
      for (var i = 0; i < categories.data.length; i++) {
        if (categories.data[i] != null) {
          let objIndex = _newBalanceList.findIndex(
            (obj) => obj.id === categories.data[i].tokenID
          );
          if (objIndex != -1) {
            let item = { ..._newBalanceList[objIndex] };
            item.categories = categories.data[i].categories;
            _newBalanceList[objIndex] = item;
          }
        }
      }

      let allCategories = [];
      let uniqueCategories = [];

      for (var i = 0; i < categories.data.length; i++) {
        if (categories.data[i] != null) {
          categories.data[i].categories.forEach((item, i) => {
            allCategories.push(item);
            if (uniqueCategories.indexOf(item) === -1) {
              uniqueCategories.push(item);
            }
          });
        }
      }
      // console.log(allCategories);
      // console.log(_newBalanceList);
      let countCategories = {};
      allCategories.forEach(function (x) {
        countCategories[x] = (countCategories[x] || 0) + 1;
      });
      // console.log(categories.data);
      this.setState({ balanceList: categories.data });
      this.preSort(uniqueCategories, countCategories);
    }
  };

  preSort = (uniqueCategories, countCategories) => {
    let unsortedData = [];

    uniqueCategories.forEach(function (y) {
      function createData(categorie, amount) {
        return {
          categorie,
          amount,
        };
      }

      let categorie = y.toString();
      let value = countCategories[y];
      let sortData = createData(categorie, value);
      unsortedData.push(sortData);
    });
    this.sortList(unsortedData);
  };

  sortList = (rowData) => {
    // console.log(rowData);
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

    sortedRows = rowData.sort(dynamicSort(`-amount`));
    this.setState({ countCategories: sortedRows });
  };

  getWalletButtons() {
    return (
      <div>
        <ButtonGroup
          orientation="vertical"
          color="primary"
          aria-label="wallet Select"
        >
          <Button>All</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>
      </div>
    );
  }

  render() {
    const { classes, t } = this.props;
    const { loading, account, countCategories, tokenList } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Card className={classes.graphCard} elevation={3}>
            <Grid
              className={classes.gridRoot}
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
            >
              <Grid item style={{ marginBottom: 10 }}>
                <Typography>Portfolio Radar</Typography>
              </Grid>
              <Grid item>
                {countCategories != null && (
                  <Grid
                    item
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                  >
                    <PieChart data={countCategories} />
                  </Grid>
                )}
                {!countCategories && <CircularProgress />}
                {tokenList.length >= 1 && <FavoriteList />}
              </Grid>
            </Grid>
          </Card>
        )}
      </div>
    );
  }

  // {this.getWalletButtons()}

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withRouter(withStyles(styles)(PortfolioRadar));
