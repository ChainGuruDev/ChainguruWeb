import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import AlltimeChart from "../components/AlltimeChart";
import Skeleton from "@material-ui/lab/Skeleton";

import {
  COINGECKO_GET_ALLTIME_CHART,
  COINGECKO_ALLTIME_CHART_RETURNED,
  UNISWAP_TRADE,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  background: {
    flexGrow: 1,
  },
  skeletonChart: {
    minHeight: "150px",
    minWidth: "100%",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  root: {
    padding: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "1920px",
    width: "75%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
    background: `${colors.cgBlue}65`,
    border: `2px solid ${colors.cgBlue}`,
    transition: "0.5s",
    "&:hover": {
      background: `${colors.cgBlue}95`,
    },
    cursor: "pointer",
  },
  paperDark: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
    background: `${colors.cgBlue}52`,
    border: `2px solid ${colors.cgBlue}`,
    transition: "0.5s",
    "&:hover": {
      background: `${colors.cgBlue}75`,
    },
    cursor: "pointer",
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  buttonGrid: {
    marginRight: 0,
    marginTop: 10,
    justifyContent: "right",
    alignItems: "center",
  },
});

class BlueChipCard extends Component {
  constructor(props) {
    super();
    this.state = { loadingChart: true, chartData: [] };
  }

  componentDidMount() {
    emitter.on(COINGECKO_ALLTIME_CHART_RETURNED, this.geckoAlltimeChart);
    dispatcher.dispatch({
      type: COINGECKO_GET_ALLTIME_CHART,
      payload: this.props.data.id,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(
      COINGECKO_ALLTIME_CHART_RETURNED,
      this.geckoAlltimeChart
    );
  }

  geckoAlltimeChart = (data) => {
    if (data[1] === this.props.data.id) {
      this.setState({ chartData: data[0].prices });
      this.setState({ loadingChart: false });
      emitter.removeListener(
        COINGECKO_ALLTIME_CHART_RETURNED,
        this.geckoAlltimeChart
      );
    }
  };

  render() {
    const { classes, data } = this.props;
    const { loadingChart, chartData } = this.state;
    const darkMode = store.getStore("theme") === "dark" ? true : false;

    let id = data.id;
    return (
      <Grid item xs={6}>
        <Paper
          className={darkMode ? classes.paperDark : classes.paper}
          elevation={10}
        >
          <Grid
            onClick={
              !loadingChart
                ? () => this.nav(`./short/detective/` + id)
                : () => console.log("")
            }
            container
            direction="row"
            spacing={2}
          >
            {loadingChart && (
              <Grid item className={classes.skeletonChart}>
                <CircularProgress />
              </Grid>
            )}
            {!loadingChart && (
              <>
                <Grid item xs={2}>
                  <img
                    className={classes.img}
                    alt="coin-icon"
                    src={data.image}
                  />
                </Grid>
                <Grid
                  style={{ zIndex: 1 }}
                  item
                  xs
                  container
                  direction="column"
                  spacing={2}
                >
                  <Typography align="left" variant="h2">
                    {data.name}
                  </Typography>
                  <Typography align="left" variant="h3">
                    {data.current_price}
                  </Typography>
                  <Typography align="left" variant="body2">
                    Marketcap: {data.market_cap}
                  </Typography>
                  {data.fully_diluted_valuation > 0 && (
                    <Typography align="left" variant="body2">
                      Fully diluted valuation: {data.fully_diluted_valuation}
                    </Typography>
                  )}
                  {data.price_change_percentage_1y_in_currency > 0 && (
                    <Typography align="left" variant="body2">
                      price change 1Y:{" "}
                      {data.price_change_percentage_1y_in_currency}%
                    </Typography>
                  )}
                </Grid>
                <Grid item xs>
                  <AlltimeChart id={data.symbol} data={chartData} />
                </Grid>
              </>
            )}
          </Grid>
          {/*<Grid
            className={classes.buttonGrid}
            item
            xs
            container
            direction="row"
            spacing={2}
          >
            <Button
              variant="contained"
              className={classes.button}
              color="primary"
              onClick={() => {
                dispatcher.dispatch({ type: UNISWAP_TRADE, id: id });
              }}
            >
              Get Some
            </Button>
          </Grid>*/}
        </Paper>
      </Grid>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

// <Button
//   spacing={2}
//   style={{
//     marginLeft: 10,
//   }}
//   variant="outlined"
//   onClick={this.overlayClicked}
//   className={classes.button}
//   color="primary"
//   onClick={() => {
//     window.location.assign(
//       "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
//     );
//   }}
// >
//   More Info
// </Button>

export default withTranslation()(withRouter(withStyles(styles)(BlueChipCard)));
