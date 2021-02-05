import React, { Component } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { withRouter, Link } from "react-router-dom";
import { lighten, withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

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
  Grid,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";

import { DB_UPDATE_ONE_MOV } from "../../constants";

import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const axios = require("axios").default;

const styles = (theme) => ({
  root: {
    backgroundColor: "rgba(255, 255, 255, 0.0)",
    maxHeight: "440",
  },
  tokenLogo: {
    maxHeight: 50,
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

class TransactionList extends Component {
  constructor(props) {
    super();
    this.state = {
      rowData: [],
      loadingTx: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedWallet === "updating") {
      if (prevProps.selectedWallet !== this.props.selectedWallet) {
        if (!this.state.loadingData) {
          this.setState({ loadingData: true });
        }
      }
      //agregar un state loading para poner cargador
    } else {
      if (prevProps.selectedWallet !== this.props.selectedWallet) {
        // console.log("new Data");
        let data = {
          geckoData: this.props.geckoData,
          txData: this.props.txData,
        };
        this.mergeTableData(data);
      }
    }
  }

  componentDidMount() {}

  componentWillUnmount() {}

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

  mergeTableData = (data) => {
    let rows = [];
    console.log(data);
    data.txData.forEach((item, i) => {
      let objIndex = data.geckoData.findIndex((obj) => obj.id === item.tokenID);
      if (objIndex > -1) {
        let rowData = this.createData(
          item._id,
          data.geckoData[objIndex].id,
          data.geckoData[objIndex].image,
          item.operation,
          item.timeStamp,
          item.value,
          item.wallet,
          data.geckoData[objIndex].current_price,
          item.buyPrice,
          item.gasUsed,
          item.gasPrice,
          item.tokenSymbol,
          data.geckoData[objIndex].name,
          item.tokenDecimal
        );
        rows.push(rowData);
      }
    });
    console.log(rows);
    this.setState({ rowData: rows });
  };

  getReadableTime = (timeStamp) => {
    const date = new Date(timeStamp * 1000);
    // Year
    var year = date.getFullYear();
    var months_arr = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    // Month
    var month = months_arr[date.getMonth()];

    // Day
    var day = date.getDate();

    // Hours
    var hours = date.getHours();

    // Minutes
    var minutes = "0" + date.getMinutes();

    // Seconds
    var seconds = "0" + date.getSeconds();

    // Display date time in MM-dd-yyyy h:m:s format
    var formattedDate = month + "-" + day + "-" + year;

    var formattedTime =
      hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

    return [formattedDate, formattedTime];
  };

  nav = (screen) => {
    this.props.history.push(screen);
  };

  updateBuyPrice = async (tokenData) => {
    let prices = {};
    let vsCoin = ["usd", "eur", "btc", "eth"];
    const from = parseInt(tokenData.timeStamp) - 100;
    const to = parseInt(tokenData.timeStamp) + 10000;
    try {
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
      console.log(tokenData);
      dispatcher.dispatch({
        type: DB_UPDATE_ONE_MOV,
        content: tokenData,
      });
      return await tokenData;
    } catch (err) {
      console.log(err.message);
      return tokenData;
    }
  };

  sortedList = (rowData) => {
    console.log(rowData);
    const { classes } = this.props;
    // style={{ cursor: "pointer" }}
    if (rowData.length > 1) {
      return rowData.map((row) => (
        <TableRow hover={true} key={row.contractAddress}>
          <TableCell component="th" scope="row">
            <img
              className={classes.tokenLogo}
              alt="coin-icon"
              src={row.image}
            />
          </TableCell>
          <TableCell align="left">
            <Typography variant={"h4"}>{row.tokenName}</Typography>
            <Typography variant="subtitle1">{row.tokenSymbol}</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant={"h4"}>{row.operation} </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"subtitle1"}>Amount</Typography>
            <Typography variant={"h4"}>
              {(row.value / Math.pow(10, row.tokenDecimal)).toFixed(4)}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
            >
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Typography variant={"subtitle1"}>Price</Typography>
                <IconButton
                  onClick={() => this.updateBuyPrice(row)}
                  color="primary"
                  aria-label="updatePrice"
                >
                  <RefreshRoundedIcon />
                </IconButton>
              </Grid>
              {row.buyPrice && (
                <Typography variant={"h4"}>
                  ${row.buyPrice.usd.toFixed(4)}
                </Typography>
              )}
              {!row.buyPrice && <Typography variant={"h4"}>---</Typography>}
            </Grid>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"subtitle1"}>Current Price</Typography>
            <Typography variant={"h4"}>
              ${row.current_price.toFixed(4)}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"subtitle1"}>Profit</Typography>
            {row.buyPrice && (
              <Typography variant={"h4"}>
                $
                {(
                  row.current_price *
                    (row.value / Math.pow(10, row.tokenDecimal)) -
                  row.buyPrice.usd *
                    (row.value / Math.pow(10, row.tokenDecimal))
                ).toFixed(2)}
              </Typography>
            )}
            {!row.buyPrice && <Typography variant={"h4"}>---</Typography>}
          </TableCell>
          <TableCell align="right">
            <Typography variant={"subtitle1"}>
              {this.getReadableTime(row.timeStamp)[0]}
            </Typography>
            <Typography variant={"subtitle1"}>
              {this.getReadableTime(row.timeStamp)[1]}
            </Typography>
          </TableCell>
        </TableRow>
      ));
    }
  };

  render() {
    const { classes, t } = this.props;
    const { rowData } = this.state;

    return (
      <Table className={classes.table} aria-label="favoritesList">
        <TableBody>{this.sortedList(rowData)}</TableBody>
      </Table>
    );
  }
}

export default withTranslation()(
  withRouter(withStyles(styles)(TransactionList))
);
