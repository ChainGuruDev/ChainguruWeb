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
} from "../../constants";

import Store from "../../stores";
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
});

class FavoriteList extends Component {
  constructor(props) {
    super();

    this.state = {
      coinData: [],
      loading: true,
      rowData: [],
      sortBy: "marketcap",
      sortOrder: "dsc",
      sortData: [],
    };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_ADD_FAVORITE_RETURNED, this.dbAddFavoriteReturned);
    emitter.on(DB_DEL_FAVORITE_RETURNED, this.dbDelFavoriteReturned);
    emitter.on(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoFavListDataReturned
    );
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(
      DB_ADD_FAVORITE_RETURNED,
      this.dbAddFavoriteReturned
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      DB_DEL_FAVORITE_RETURNED,
      this.dbDelFavoriteReturned
    );

    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoFavListDataReturned
    );
  }

  coinDataReturned = (data) => {
    console.log(data);
  };

  dbUserDataReturned = (data) => {
    if (data.favorites.tokenIDs.length > 0) {
      dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: data.favorites.tokenIDs,
      });
    }
  };

  dbAddFavoriteReturned = (data) => {
    dispatcher.dispatch({
      type: COINGECKO_POPULATE_FAVLIST,
      tokenIDs: data.tokenIDs,
    });
  };

  dbDelFavoriteReturned = (data) => {
    console.log(data.tokenIDs);
    dispatcher.dispatch({
      type: COINGECKO_POPULATE_FAVLIST,
      tokenIDs: data.tokenIDs,
    });
  };

  createData = (
    image,
    name,
    id,
    symbol,
    current_price,
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
      image,
      name,
      id,
      symbol,
      current_price,
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

  geckoFavListDataReturned = (data) => {
    let rows = [];
    let sort = [];
    data.forEach((item, i) => {
      let sortData = this.createData(
        item.image,
        item.name,
        item.id,
        item.symbol,
        item.current_price,
        item.price_change_percentage_1h_in_currency,
        item.price_change_percentage_24h,
        item.price_change_percentage_7d_in_currency,
        item.price_change_percentage_30d_in_currency,
        item.price_change_percentage_1y_in_currency,
        item.market_cap,
        item.market_cap_change_percentage_24h,
        item.sparkline_in_7d.price
      );
      sort.push(sortData);
    });
    this.setState({ sortData: sort });
  };

  deleteFav = (tokenID) => {
    dispatcher.dispatch({
      type: DB_DEL_FAVORITE,
      content: tokenID,
    });
  };

  formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
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
          item.image,
          item.name,
          item.id,
          item.symbol,
          this.formatMoney(item.current_price, 2),
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
    } else {
      sortedRows = rowData.sort(dynamicSort(`-${sortBy}`));
      sortedRows.forEach((item, i) => {
        let _rowData = this.createData(
          item.image,
          item.name,
          item.id,
          item.symbol,
          this.formatMoney(item.current_price, 2),
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
        <TableRow hover={true} key={row.name}>
          <TableCell component="th" scope="row">
            <img
              style={{ cursor: "pointer" }}
              className={classes.tokenLogo}
              alt="coin-icon"
              src={row.image}
              onClick={() => this.detective(row.id)}
            />
          </TableCell>
          <TableCell padding="none" align="left">
            {row.symbol}
          </TableCell>
          <TableCell align="left">
            <Typography variant={"h4"}>{row.name}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"h4"}>{row.current_price}</Typography>
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
          <TableCell align="right">
            <Typography
              variant={"h4"}
              color={
                row.market_cap_change_percentage_24h > 0
                  ? "primary"
                  : "secondary"
              }
            >
              {row.market_cap_change_percentage_24h}%
            </Typography>
          </TableCell>
          <TableCell align="center">
            <SparklineChart id={row.symbol} data={row.sparkline_in_7d} />
          </TableCell>
          <TableCell padding="none">
            <IconButton
              aria-label="delete"
              onClick={(e) => this.deleteFav(row.id, e)}
            >
              <DeleteIcon />
            </IconButton>
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
    console.log(screen);
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
        <Table className={classes.table} aria-label="favoritesList">
          <TableHead style={{ backgroundColor: colors.cgOrange }}>
            <TableRow>
              <TableCell></TableCell>
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
              <TableCell
                onClick={() => this.sortBy("market_cap_change_percentage_24h")}
                align="right"
              >
                {this.state.sortBy === "market_cap_change_percentage_24h" &&
                  this.state.sortOrder === "asc" && (
                    <ArrowDropUpRoundedIcon align="right" />
                  )}
                {this.state.sortBy === "market_cap_change_percentage_24h" &&
                  this.state.sortOrder === "dsc" && (
                    <ArrowDropDownRoundedIcon align="right" />
                  )}
                Marketcap 24hs
              </TableCell>
              <TableCell align="center">Chart (7d)</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{this.sortedList(sortData)}</TableBody>
        </Table>
      </TableContainer>
    );
  }
}
export default withTranslation()(withRouter(withStyles(styles)(FavoriteList)));
