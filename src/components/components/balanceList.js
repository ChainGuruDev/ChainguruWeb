import React, { Component } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { withRouter, Link } from "react-router-dom";
import { lighten, withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import CargaLineal from "../components/cargaLineal.js";
import SparklineChart from "./SparklineChart.js";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import { colors } from "../../theme";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  Tooltip,
  FormGroup,
  FormControlLabel,
  Switch,
  IconButton,
  LinearProgress,
  Grid,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import RestoreFromTrashRoundedIcon from "@material-ui/icons/RestoreFromTrashRounded";

import {
  GET_TOKEN_COMPONENTS,
  GET_PROTOCOLS_BALANCES,
} from "../../constants/defiSDK.js";

import {
  COIN_DATA_RETURNED,
  DB_USERDATA_RETURNED,
  DB_ADD_FAVORITE_RETURNED,
  DB_DEL_FAVORITE,
  DB_DEL_FAVORITE_RETURNED,
  DB_DEL_BLACKLIST,
  DB_ADD_BLACKLIST,
  DB_ADDDEL_BLACKLIST_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  SWITCH_VS_COIN_RETURNED,
  UPDATE_WAIT_COMPLETE,
} from "../../constants";

import Store from "../../stores";
import DefiSDKStore from "../../stores/defiSDK_store.js";

const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const emitterDefi = DefiSDKStore.emitter;
const storeDefi = DefiSDKStore.store;
const dispatcherDefi = DefiSDKStore.dispatcher;

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

const styles = (theme) => ({
  root: {
    backgroundColor: "rgba(255, 255, 255, 0.0)",
    maxHeight: "440",
  },
  tokenLogo: {
    maxHeight: 30,
  },
  balList: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  topBar: {
    padding: 10,
  },
});

class BalanceList extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;

    this.state = {
      coinData: [],
      loading: true,
      rowData: [],
      sortBy: "marketcap",
      sortOrder: "dsc",
      sortData: [],
      hideBlacklisted: true,
      hideLowBalanceCoins: true,
      balanceList: [],
      portfolioData: [],
      loadingPortfolio: false,
      progressBar: 0,
      totalValue: 0,
      anchorMenu: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedWallet === "updating") {
      if (prevProps.selectedWallet !== this.props.selectedWallet) {
        if (!this.state.loadingPortfolio) {
          this._isMounted && this.setState({ loadingPortfolio: true });
        }
      }
      //agregar un state loading para poner cargador
    } else {
      if (prevProps.selectedWallet !== this.props.selectedWallet) {
        if (this.state.userBlacklist) {
          this.getCoinIDs(this.props.data);
          // dispatcherDefi.dispatch({
          //   type: GET_PROTOCOLS_BALANCES,
          //   address: this.props.selectedWallet,
          // });
        }
        //cambier el state loading para terminar el cargador
      }
    }
  }

  componentDidMount() {
    this._isMounted = true;
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(UPDATE_WAIT_COMPLETE, this.updateWaitComplete);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoPriceReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(DB_ADDDEL_BLACKLIST_RETURNED, this.dbBlacklistReturned);
    this._isMounted &&
      dispatcher.dispatch({
        type: GET_COIN_LIST,
      });
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoPriceReturned
    );
    emitter.removeListener(UPDATE_WAIT_COMPLETE, this.updateWaitComplete);
    emitter.removeListener(
      DB_ADDDEL_BLACKLIST_RETURNED,
      this.dbBlacklistReturned
    );

    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    this._isMounted = false;
  }

  vsCoinReturned = () => {
    this.getPortfolioValue(this.state.balanceList);
  };

  updateWaitComplete = () => {
    this.getPortfolioValue(this.state.balanceList);
  };

  getCoinIDs = async (data) => {
    const { userBlacklist } = this.state;
    if (this.state.coinList) {
      let coinList = { ...this.state.coinList };
      const prevBalanceList = [...this.props.data];

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
                  dispatcherDefi.dispatch({
                    type: GET_TOKEN_COMPONENTS,
                    address: item.contractAddress,
                  });
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

      console.log(newBalanceList);
      this._isMounted && this.setState({ balanceList: newBalanceList });
      this.getPortfolioValue(newBalanceList);
    }
  };

  dbBlacklistReturned = (data) => {
    this.setState({ userBlacklist: data });
    this.getCoinIDs(this.props.data);
  };

  getPortfolioValue = async (coinList) => {
    let tokenIDs = [];
    coinList.forEach((item, i) => {
      if (item.id) {
        tokenIDs.push(item.id);
      }
    });

    if (tokenIDs.length > 0) {
      let geckoData = await dispatcher.dispatch({
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

  coinlistReturned = (data) => {
    this._isMounted && this.setState({ coinList: data });
  };

  coinDataReturned = (data) => {
    // console.log(data);
  };

  dbUserDataReturned = (data) => {
    this.setState({ userBlacklist: data.blacklist });
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
    price_change_percentage_1y_in_currency,
    market_cap,
    market_cap_change_percentage_24h,
    sparkline_in_7d
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
      market_cap,
      market_cap_change_percentage_24h,
      sparkline_in_7d,
    };
  };

  dataSorting = (data) => {
    let rows = [];
    let sort = [];
    let totalValue = 0;
    data.forEach((item, i) => {
      if (item.geckoData) {
        let balance = item.balance / Math.pow(10, item.tokenDecimal);
        let value = balance * item.geckoData.current_price;
        totalValue = totalValue + value;

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
          item.geckoData.price_change_percentage_1y_in_currency,
          item.geckoData.market_cap,
          item.geckoData.market_cap_change_percentage_24h,
          item.geckoData.sparkline_in_7d.price
        );
        sort.push(sortData);
      } else {
        // console.log("staking o token raro");
        // console.log(item);
      }
    });
    this._isMounted &&
      this.setState({
        sortData: sort,
        totalValue: totalValue,
        loadingPortfolio: false,
      });
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
          this.formatMoney(item.value, 2),
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
          this.formatMoney(item.value, 2),
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
      // console.log(this.props.selectedWallet);
    }
    if (formatedRows.length > 0) {
      return formatedRows.map((row) => (
        <TableRow hover={true} key={row.id}>
          <TableCell
            style={{ cursor: "pointer" }}
            onClick={() => this.detective(row.id)}
            component="th"
            scope="row"
          >
            <img
              className={classes.tokenLogo}
              alt="coin-icon"
              src={row.image}
            />
          </TableCell>
          <TableCell
            style={{ cursor: "pointer" }}
            onClick={() => this.detective(row.id)}
            align="left"
          >
            <Typography variant={"h4"} onClick={() => this.detective(row.id)}>
              {row.name}
            </Typography>
            <Typography variant="subtitle1">{row.symbol}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"h4"}>{row.balance}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"h4"}>${row.current_price}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"h4"}>${row.value}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography
              variant={"h4"}
              color={
                row.price_change_percentage_1h_in_currency > 0
                  ? "primary"
                  : "secondary"
              }
            >
              {row.price_change_percentage_1h_in_currency}%
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography
              variant={"h4"}
              color={
                row.price_change_percentage_24h > 0 ? "primary" : "secondary"
              }
            >
              {row.price_change_percentage_24h}%
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography
              variant={"h4"}
              color={
                row.price_change_percentage_7d_in_currency > 0
                  ? "primary"
                  : "secondary"
              }
            >
              {row.price_change_percentage_7d_in_currency}%
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography
              variant={"h4"}
              color={
                row.price_change_percentage_30d_in_currency > 0
                  ? "primary"
                  : "secondary"
              }
            >
              {row.price_change_percentage_30d_in_currency}%
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography
              variant={"h4"}
              color={
                row.price_change_percentage_1y_in_currency > 0
                  ? "primary"
                  : "secondary"
              }
            >
              {row.price_change_percentage_1y_in_currency}%
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"h4"}>{row.market_cap} </Typography>
          </TableCell>
          <TableCell align="center">
            <SparklineChart id={row.symbol} data={row.sparkline_in_7d} />
          </TableCell>
          <TableCell align="center">
            {this.state.userBlacklist.tokenIDs.includes(
              row.contractAddress
            ) && (
              <IconButton
                aria-label="restore"
                onClick={(e) =>
                  this.removeItemFromBlacklist(row.contractAddress, e)
                }
              >
                <RestoreFromTrashRoundedIcon />
              </IconButton>
            )}
            {!this.state.userBlacklist.tokenIDs.includes(
              row.contractAddress
            ) && (
              <IconButton
                aria-label="delete"
                onClick={(e) => this.addItemToBlacklist(row.contractAddress, e)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </TableCell>
        </TableRow>
      ));
    }
  };

  addItemToBlacklist = (tokenID) => {
    dispatcher.dispatch({
      type: DB_ADD_BLACKLIST,
      content: tokenID,
    });
  };

  removeItemFromBlacklist = (tokenID) => {
    dispatcher.dispatch({
      type: DB_DEL_BLACKLIST,
      content: tokenID,
    });
  };

  sortBy(_sortBy) {
    let _prevSortBy = this.state.sortBy;
    if (_prevSortBy === _sortBy) {
      if (this.state.sortOrder === "asc") {
        this._isMounted && this.setState({ sortBy: _sortBy, sortOrder: "dsc" });
      } else {
        this._isMounted && this.setState({ sortBy: _sortBy, sortOrder: "asc" });
      }
    } else {
      this._isMounted && this.setState({ sortBy: _sortBy, sortOrder: "dsc" });
    }
  }

  nav = (screen) => {
    // console.log(screen);
    this.props.history.push(screen);
  };

  detective = (id) => {
    this.nav("/short/detective/" + id);
  };

  handleClose = () => {
    this.setState({ anchorMenu: null });
  };

  render() {
    const { classes, t } = this.props;
    const { coinData, loading, rowData, sortData } = this.state;

    const openMenu = (event) => {
      this.setState({ anchorMenu: event.currentTarget });
    };
    const switchBlacklisted = () => {
      this.setState({ hideBlacklisted: !this.state.hideBlacklisted }, () => {
        this.getCoinIDs(this.props.data);
      });
    };
    const switchLowBalance = async () => {
      const newState = await this.setState(
        {
          hideLowBalanceCoins: !this.state.hideLowBalanceCoins,
        },
        () => {
          this.getCoinIDs(this.props.data);
        }
      );
    };

    return (
      <Grid container spacing={3}>
        {this.state.totalValue > 0 && (
          <Grid item xs={12}>
            <Paper className={classes.topBar} elevation={3}>
              Total Value ${this.formatMoney(this.state.totalValue)}
            </Paper>
          </Grid>
        )}
        <Grid item xs={12}>
          <TableContainer
            className={classes.root}
            component={Paper}
            elevation={2}
            size="small"
          >
            <CargaLineal />
            <Table className={classes.table} aria-label="favoritesList">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell onClick={() => this.sortBy("name")} align="left">
                    {this.state.sortBy === "name" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy === "name" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Name
                  </TableCell>
                  <TableCell
                    onClick={() => this.sortBy("balance")}
                    align="right"
                  >
                    {this.state.sortBy === "balance" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy === "balance" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Balance
                  </TableCell>
                  <TableCell
                    onClick={() => this.sortBy("current_price")}
                    align="right"
                  >
                    {this.state.sortBy === "current_price" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy === "current_price" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Current Price
                  </TableCell>
                  <TableCell onClick={() => this.sortBy("value")} align="right">
                    {this.state.sortBy === "value" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy === "value" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Value
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      this.sortBy("price_change_percentage_1h_in_currency")
                    }
                    align="right"
                  >
                    {this.state.sortBy ===
                      "price_change_percentage_1h_in_currency" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy ===
                      "price_change_percentage_1h_in_currency" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Price 1h
                  </TableCell>
                  <TableCell
                    onClick={() => this.sortBy("price_change_percentage_24h")}
                    align="right"
                  >
                    {this.state.sortBy === "price_change_percentage_24h" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy === "price_change_percentage_24h" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Price 24hs
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      this.sortBy("price_change_percentage_7d_in_currency")
                    }
                    align="right"
                  >
                    {this.state.sortBy ===
                      "price_change_percentage_7d_in_currency" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy ===
                      "price_change_percentage_7d_in_currency" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Price 7d
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      this.sortBy("price_change_percentage_30d_in_currency")
                    }
                    align="right"
                  >
                    {this.state.sortBy ===
                      "price_change_percentage_30d_in_currency" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy ===
                      "price_change_percentage_30d_in_currency" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Price 30d
                  </TableCell>
                  <TableCell
                    hover="true"
                    onClick={() =>
                      this.sortBy("price_change_percentage_1y_in_currency")
                    }
                    align="right"
                  >
                    {this.state.sortBy ===
                      "price_change_percentage_1y_in_currency" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy ===
                      "price_change_percentage_1y_in_currency" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Price 1y
                  </TableCell>
                  <TableCell
                    hover="true"
                    onClick={() => this.sortBy("market_cap")}
                    align="right"
                  >
                    {this.state.sortBy === "market_cap" &&
                      this.state.sortOrder === "asc" && (
                        <ArrowDropUpRoundedIcon align="right" />
                      )}
                    {this.state.sortBy === "market_cap" &&
                      this.state.sortOrder === "dsc" && (
                        <ArrowDropDownRoundedIcon align="right" />
                      )}
                    Marketcap
                  </TableCell>
                  <TableCell align="center">Chart (7d)</TableCell>
                  <TableCell align="center">
                    <IconButton aria-label="menu" onClick={openMenu}>
                      <MoreHorizIcon />
                    </IconButton>
                    <Menu
                      id="simple-menu"
                      anchorEl={this.state.anchorMenu}
                      keepMounted
                      open={Boolean(this.state.anchorMenu)}
                      onClose={this.handleClose}
                    >
                      <MenuItem>
                        <FormGroup row>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={this.state.hideBlacklisted}
                                onChange={switchBlacklisted}
                                name="checkedBlacklist"
                              />
                            }
                            label="Hide Blacklisted"
                          />
                        </FormGroup>
                      </MenuItem>
                      <MenuItem>
                        <FormGroup row>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={this.state.hideLowBalanceCoins}
                                onChange={switchLowBalance}
                                name="checkedLowCost"
                              />
                            }
                            label="Hide Low balance"
                          />
                        </FormGroup>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              </TableHead>
              {!this.state.loadingPortfolio && (
                <TableBody>{this.sortedList(sortData)}</TableBody>
              )}
              {this.state.loadingPortfolio && (
                <TableBody>
                  <TableRow>
                    <TableCell align="center">Updating</TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  }
}
export default withTranslation()(withRouter(withStyles(styles)(BalanceList)));
