import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Card,
  Typography,
  Paper,
  Grid,
  ButtonBase,
  Button,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import BlueChipCard from "../components/BlueChipCard.js";
import Snackbar from "../snackbar";

import {
  ERROR,
  DB_GET_BLUECHIPS,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  background: {
    flexGrow: 1,
    width: "100%",
    background: "linear-gradient(to top, #2F80ED, #56CCF2)",
    justifyContent: "center",
    alignItems: "center",
  },
  root: {
    padding: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "1920px",
    width: "85%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: "rgba(255, 255, 255, 0.2);",
  },
  image: {
    width: 64,
    height: 64,
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  buttonGrid: {
    marginLeft: "auto",
    marginRight: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
});

class Long extends Component {
  constructor(props) {
    super();

    this.state = { chipData: [], snackbarMessage: "" };
  }

  componentDidMount() {
    emitter.setMaxListeners(this.state.chipData.length);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoBluechipData);
    dispatcher.dispatch({
      type: DB_GET_BLUECHIPS,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoBluechipData
    );
  }

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: error.toString(),
        snackbarType: "Error",
      };
      that.setState(snackbarObj);
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

  geckoBluechipData = (payload) => {
    let chips = [];
    payload.forEach((item, i) => {
      let chipData = this.createBluechip(
        item.image,
        item.name,
        item.id,
        item.symbol,
        this.formatMoney(item.current_price, 2),
        parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
        this.formatMoney(item.market_cap, 0),
        this.formatMoney(item.fully_diluted_valuation, 0)
      );
      chips.push(chipData);
    });
    this.setState({ chipData: chips });
  };

  createBluechip = (
    image,
    name,
    id,
    symbol,
    current_price,
    price_change_percentage_1y_in_currency,
    market_cap,
    fully_diluted_valuation
  ) => {
    return {
      image,
      name,
      id,
      symbol,
      current_price,
      price_change_percentage_1y_in_currency,
      market_cap,
      fully_diluted_valuation,
    };
  };

  geckoFavListDataReturned = (data) => {
    let rows = [];
    data.forEach((item, i) => {
      console.log(item);
      let rowData = this.createData(
        item.image,
        item.name,
        item.id,
        item.symbol,
        this.formatMoney(item.current_price, 2),
        parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
        this.formatMoney(item.market_cap, 0),
        this.formatMoney(item.fully_diluted_valuation, 0)
      );
      rows.push(rowData);
    });
    this.setState({ rowData: rows });
  };

  render() {
    const { classes, t, location } = this.props;
    const { chipData, snackbarMessage } = this.state;

    return (
      <div className={classes.background}>
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.paper} elevation={3}>
                <Typography variant="h2">BlueChips to hodl</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            {chipData.map((bluechip) => (
              <BlueChipCard data={bluechip} />
            ))}
          </Grid>
          {snackbarMessage && this.renderSnackbar()}
        </div>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Long)));
