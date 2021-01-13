import React, { Component } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { withRouter, Link } from "react-router-dom";
import { lighten, withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
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
  FormControlLabel,
  Switch,
  IconButton,
  LinearProgress,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";

import {
  COIN_DATA_RETURNED,
  DB_USERDATA_RETURNED,
  DB_ADD_FAVORITE_RETURNED,
  DB_DEL_FAVORITE,
  DB_DEL_FAVORITE_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  SWITCH_VS_COIN_RETURNED,
} from "../../constants";

import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

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
});

class BalanceList extends Component {
  constructor(props) {
    super();

    this.state = {
      coinData: [],
      loading: true,
      rowData: [],
      sortBy: "marketcap",
      sortOrder: "dsc",
      sortData: [],
      hideLowBalanceCoins: true,
      balanceList: [],
      portfolioData: [],
      loadingPortfolio: false,
      progressBar: 0,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedWallet === "updating") {
      if (prevProps.selectedWallet !== this.props.selectedWallet) {
        console.log("updating");
        if (!this.state.loadingPortfolio) {
          this.setState({ loadingPortfolio: true });
        }
      }
      //agregar un state loading para poner cargador
    } else {
      if (prevProps.selectedWallet !== this.props.selectedWallet) {
        console.log("new Data");
        this.getCoinIDs(this.props.data);

        //cambier el state loading para terminar el cargador
      }
    }
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoPriceReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    dispatcher.dispatch({
      type: GET_COIN_LIST,
    });
    this.interval = setInterval(() => this.updateList(), 750);
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoPriceReturned
    );
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    clearInterval(this.interval);
  }

  vsCoinReturned = () => {
    this.getPortfolioValue(this.state.balanceList);
  };

  updateList() {
    const account = store.getStore("account");
    if (account && account.address) {
      const newProgressBar = this.state.progressBar + 1;
      this.setState({ progressBar: newProgressBar });
      if (newProgressBar > 99) {
        this.setState({ progressBar: 0 });
        // console.log("update List");
        this.getPortfolioValue(this.state.balanceList);
      }
    }
  }

  getCoinIDs = async (data) => {
    if (this.state.coinList) {
      let coinList = { ...this.state.coinList };
      const prevBalanceList = this.props.data;
      let newBalanceList = [];
      if (this.state.hideLowBalanceCoins) {
        for (var i = 0; i < prevBalanceList.length; i++) {
          let item = { ...prevBalanceList[i] };
          if (item.tokenSymbol === "EWTB") {
            item.id = "energy-web-token";
            newBalanceList.push(item);
          } else if (item.tokenSymbol === "XOR") {
            item.id = "sora";
            newBalanceList.push(item);
          } else {
            if (item.balance > 0) {
              let objIndex = this.state.coinList.findIndex(
                (obj) => obj.name === item.tokenName
              );
              if (objIndex > -1) {
                item.id = coinList[objIndex].id;
              } else {
                let objIndex2 = this.state.coinList.findIndex(
                  (obj) => obj.symbol === item.tokenSymbol.toLowerCase()
                );
                if (objIndex2 > -1) {
                  item.id = coinList[objIndex2].id;
                } else {
                  console.log("token not yet supported");
                  console.log(item);
                }
              }
              newBalanceList.push(item);
            }
          }
        }
      } else {
        for (var i = 0; i < prevBalanceList.length; i++) {
          let item = { ...prevBalanceList[i] };
          let objIndex = this.state.coinList.findIndex(
            (obj) => obj.symbol === item.tokenSymbol.toLowerCase()
          );
          if (objIndex > -1) {
            item.id = coinList[objIndex].id;
          }
          newBalanceList.push(item);
        }
      }
      this.setState({ balanceList: newBalanceList });
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
      let geckoData = await dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: tokenIDs,
      });
    }
  };

  geckoPriceReturned = async (data) => {
    let prevBalanceList = [...this.state.balanceList];
    let newBalanceList = [];
    //console.log(prevBalanceList);
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
    //console.log(newBalanceList);
    this.dataSorting(newBalanceList);
  };

  coinlistReturned = (data) => {
    this.setState({ coinList: data });
  };

  coinDataReturned = (data) => {
    console.log(data);
  };

  dbUserDataReturned = (data) => {
    console.log(data);
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
    console.log("price update");

    let rows = [];
    let sort = [];
    data.forEach((item, i) => {
      if (item.geckoData) {
        let balance = item.balance / Math.pow(10, item.tokenDecimal);
        let value = balance * item.geckoData.current_price;
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
    //console.log(sort);
    this.setState({ sortData: sort, loadingPortfolio: false });
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
    }

    if (formatedRows.length > 1) {
      return formatedRows.map((row) => (
        <TableRow hover={true} key={row.contractAddress}>
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
            <Typography variant={"h4"}>{row.current_price}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"h4"}>$ {row.value}</Typography>
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
        </TableRow>
      ));
    }
  };

  sortBy(_sortBy) {
    let _prevSortBy = this.state.sortBy;
    if (_prevSortBy === _sortBy) {
      if (this.state.sortOrder === "asc") {
        this.setState({ sortBy: _sortBy, sortOrder: "dsc" });
      } else {
        this.setState({ sortBy: _sortBy, sortOrder: "asc" });
      }
    } else {
      this.setState({ sortBy: _sortBy, sortOrder: "dsc" });
    }
  }

  nav = (screen) => {
    // console.log(screen);
    this.props.history.push(screen);
  };

  detective = (id) => {
    this.nav("/short/detective/" + id);
  };

  render() {
    const { classes, t } = this.props;
    const { coinData, loading, rowData, sortData } = this.state;

    return (
      <TableContainer
        className={classes.root}
        component={Paper}
        elevation={2}
        size="small"
      >
        <LinearProgress
          variant="determinate"
          value={this.state.progressBar}
          className={classes.balList}
        />
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
              <TableCell onClick={() => this.sortBy("balance")} align="right">
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
            </TableRow>
          </TableHead>
          {!this.state.loadingPortfolio && (
            <TableBody>{this.sortedList(sortData)}</TableBody>
          )}
          {this.state.loadingPortfolio && <div>Updating</div>}
        </Table>
      </TableContainer>
    );
  }
}
export default withTranslation()(withRouter(withStyles(styles)(BalanceList)));
