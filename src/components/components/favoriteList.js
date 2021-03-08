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
  TableFooter,
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

import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";

import {
  COIN_DATA_RETURNED,
  DB_USERDATA_RETURNED,
  DB_ADD_FAVORITE_RETURNED,
  DB_DEL_FAVORITE,
  DB_DEL_FAVORITE_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
  SWITCH_VS_COIN_RETURNED,
  SWITCH_VS_COIN,
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
  footer: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
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
      page: 0,
      rows: 10,
      rowsPerPage: 10,
      formatedRows: [],
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
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
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
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
  }

  coinDataReturned = (data) => {
    console.log(data);
  };

  vsCoinReturned = (vsCoin) => {
    this.setState({ vsCoin: vsCoin });
    dispatcher.dispatch({
      type: COINGECKO_POPULATE_FAVLIST,
      tokenIDs: this.state.tokenIDs,
      versus: vsCoin,
    });
  };

  dbUserDataReturned = (data) => {
    if (data.favorites.tokenIDs.length > 0) {
      this.setState({ tokenIDs: data.favorites.tokenIDs });
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
    //console.log(sort);
    this.setState({ sortData: sort });
  };

  deleteFav = (tokenID) => {
    dispatcher.dispatch({
      type: DB_DEL_FAVORITE,
      content: tokenID,
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
    const { sortBy, sortOrder, rowsPerPage, page, formatedRows } = this.state;

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
    let newRows = [];
    if (sortOrder === "asc") {
      sortedRows = rowData.sort(dynamicSort(sortBy));
      sortedRows.forEach((item, i) => {
        let _rowData = this.createData(
          item.image,
          item.name,
          item.id,
          item.symbol,
          this.formatMoney(item.current_price),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          this.formatMoneyMCAP(item.market_cap, 0),
          parseFloat(item.market_cap_change_percentage_24h).toFixed(2),
          item.sparkline_in_7d
        );
        newRows.push(_rowData);
      });
    } else {
      sortedRows = rowData.sort(dynamicSort(`-${sortBy}`));
      sortedRows.forEach((item, i) => {
        let _rowData = this.createData(
          item.image,
          item.name,
          item.id,
          item.symbol,
          this.formatMoney(item.current_price),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          this.formatMoneyMCAP(item.market_cap, 0),
          parseFloat(item.market_cap_change_percentage_24h).toFixed(2),
          item.sparkline_in_7d
        );
        newRows.push(_rowData);
      });
    }

    if (newRows.length > 1) {
      if (newRows.length != formatedRows.length) {
        this.setState({ formatedRows: newRows });
      }
      return (rowsPerPage > 0
        ? newRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : newRows
      ).map((row) => (
        <TableRow hover={true} key={row.name}>
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

  TablePaginationActions = (props) => {
    const { classes, t } = this.props;
    const { formatedRows, page, rowsPerPage, onChangePage } = this.state;
    const count = formatedRows.length;

    const handleFirstPageButtonClick = (event) => {
      this.setState({ page: 0 });
    };

    const handleBackButtonClick = (event) => {
      console.log(event);
      console.log(count);
      this.setState({ page: page - 1 });
    };

    const handleNextButtonClick = (event) => {
      this.setState({ page: page + 1 });
    };

    const handleLastPageButtonClick = (event) => {
      this.setState({ page: Math.max(0, Math.ceil(count / rowsPerPage) - 1) });
    };

    return (
      <div className={classes.footer}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {<FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {<KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {<KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {<LastPageIcon />}
        </IconButton>
      </div>
    );
  };

  render() {
    const { classes, t } = this.props;
    const {
      coinData,
      loading,
      rowData,
      sortData,
      page,
      rows,
      rowsPerPage,
      formatedRows,
      count,
    } = this.state;

    const handleChangePage = (newPage) => {
      console.log(newPage);
      this.setState({ page: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
      this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 });
    };

    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <TableContainer
        className={classes.root}
        component={Paper}
        elevation={2}
        size="small"
      >
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
              <TableCell align="center">Chart (7d)</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{this.sortedList(sortData)}</TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={3}
                count={formatedRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={this.TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  }
}
export default withTranslation()(withRouter(withStyles(styles)(FavoriteList)));
