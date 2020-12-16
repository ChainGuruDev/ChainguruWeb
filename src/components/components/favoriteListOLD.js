import React, { Component } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { withRouter } from "react-router-dom";
import { lighten, withStyles, makeStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import SparklineChart from "./SparklineChart.js";

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

import { DataGrid } from "@material-ui/data-grid";

import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
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
    backgroundColor: "rgba(255, 255, 255, 0.0);",
  },
  tokenLogo: {
    maxHeight: 30,
  },
  list: {
    height: 400,
  },
});

class FavoriteList extends Component {
  constructor(props) {
    super();

    this.state = { coinData: [], loading: true, rowData: [] };
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
    const { classes } = this.props;
    let rows = [];
    data.forEach((item, i) => {
      let rowData = this.createData(
        `<img className={classes.tokenLogo} alt="coin-icon" src=${item.image} />`,
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
        item.sparkline_in_7d.price
      );
      rows.push(rowData);
    });
    this.setState({ rowData: rows });
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

  render() {
    const { classes, t } = this.props;
    const { coinData, loading, rowData } = this.state;

    const columns = [
      { field: "image", headerName: " " },
      { field: "name", headerName: "Name" },
      {
        field: "symbol",
        headerName: " ",
        type: "number",
      },
      {
        field: "current_price",
        headerName: "Price",
        type: "number",
      },
      {
        field: "price_change_percentage_1h_in_currency",
        headerName: "Price 1h",
        type: "number",
      },
      {
        field: "price_change_percentage_24h",
        headerName: "Price 24h",
        type: "number",
      },
      {
        field: "price_change_percentage_7d_in_currency",
        headerName: "Price 7d",
        type: "number",
      },
      {
        field: "price_change_percentage_30d_in_currency",
        headerName: "Price 30d",
        type: "number",
      },
      {
        field: "price_change_percentage_1y_in_currency",
        headerName: "Price 1y",
        type: "number",
      },
      {
        field: "market_cap",
        headerName: "Marketcap",
        type: "number",
      },
      {
        field: "market_cap_change_percentage_24h",
        headerName: "Marketcap 24h",
        type: "number",
      },
      {
        field: "sparkline_in_7d",
        headerName: "Chart (7d)",
      },
    ];

    const rows = [
      { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
      { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
      { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
      { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
      { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
      { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
      { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
      { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
      { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
    ];

    console.log(rows);
    return (
      <div style={{ height: 600, width: "100%" }}>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            <DataGrid rows={rowData} columns={columns} checkboxSelection />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(withRouter(withStyles(styles)(FavoriteList)));
