import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import InfiniteScroll from "react-infinite-scroll-component";

//Import UI elements
import { Typography, Grid, Paper } from "@material-ui/core";

import BlueChipCard from "../components/BlueChipCard.js";

import {
  ERROR,
  DB_GET_BLUECHIPS,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
} from "../../constants";

import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    width: "100%",
    maxHeight: "100%",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: `${colors.cgBlue}85`,
    border: `2px solid ${colors.cgBlue}`,
  },
  paperDark: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: `${colors.cgBlue}52`,
    border: `2px solid ${colors.cgBlue}`,
  },
});

class BlueChips extends Component {
  constructor(props) {
    super();

    this.state = {
      chipData: [],
      hasMore: true,
      count: { prev: 0, next: 6 },
      current: [],
    };
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
    const { count } = this.state;
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
    this.setState({
      chipData: chips,
      current: chips.slice(count.prev, count.next),
    });
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

  render() {
    const { classes } = this.props;
    const { chipData, current, hasMore, count } = this.state;
    const darkMode = store.getStore("theme") === "dark" ? true : false;

    const getMoreData = () => {
      if (current.length === chipData.length) {
        this.setState({ hasMore: false });
        return;
      }
      setTimeout(() => {
        this.setState({
          current: current.concat(
            chipData.slice(
              count.prev === 0 ? count.prev + 6 : count.prev + 4,
              count.next + 4
            )
          ),
        });
      }, 2000);
      this.setState((prevState) => ({
        count: {
          prev:
            prevState.count.prev === 0
              ? prevState.count.prev + 6
              : prevState.count.prev + 4,
          next: prevState.count.next + 4,
        },
      }));
    };

    return (
      <>
        <Grid style={{ maxWidth: "90%", margin: "auto" }}>
          <Grid style={{ marginBottom: 20 }} item xs={12}>
            <Paper
              className={darkMode ? classes.paperDark : classes.paper}
              elevation={3}
            >
              <Typography variant="h2">BLUECHIPS</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <InfiniteScroll
              dataLength={current.length}
              next={getMoreData}
              hasMore={hasMore}
              loader={
                <div style={{ textAlign: "center", marginTop: 15 }}>
                  Loading...
                </div>
              }
              style={{ overflow: false }}
            >
              <Grid container spacing={3}>
                {current.map((bluechip) => (
                  <BlueChipCard key={bluechip.id} data={bluechip} />
                ))}
              </Grid>
            </InfiniteScroll>
          </Grid>
        </Grid>
      </>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(BlueChips)));
