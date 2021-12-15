import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Divider,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";
import { getVsSymbol } from "../helpers";

import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import AlltimeChart from "../components/AlltimeChart";

import {
  SWITCH_VS_COIN,
  SWITCH_VS_COIN_RETURNED,
  COINGECKO_GET_ALLTIME_CHART,
  COINGECKO_ALLTIME_CHART_RETURNED,
  DB_DEL_BLUECHIPS_GURU,
  DB_DEL_BLUECHIPS,
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
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.primary,
    background: `${colors.cgBlue}65`,
    webkitBoxShadow: "0px 0px 00px 0px #0005",
    boxShadow: "0px 0px 2px 1px #0004",
    transition: "0.15s",
    "&:hover": {
      webkitBoxShadow: "0px 0px 7px 3px #0005",
      boxShadow: "0px 0px 7px 3px #0005",
    },

    cursor: "pointer",
  },
  paperDark: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.primary,
    background: `${colors.cgBlue}52`,
    webkitBoxShadow: "0px 0px 2px 1px #9de2f9",
    boxShadow: "0px 0px 2px 1px #9de2f9",
    "&:hover": {
      webkitBoxShadow: "0px 0px 7px 3px #9de2f9",
      boxShadow: "0px 0px 7px 3px #9de2f9",
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

    const vs = store.getStore("vsCoin");

    this.state = {
      vsCoin: vs,
      loadingChart: true,
      chartData: [],
      editMode: props.editMode,
      loading: false,
      type: props.type,
    };
  }

  componentDidMount() {
    this._isMounted = true;

    emitter.on(COINGECKO_ALLTIME_CHART_RETURNED, this.geckoAlltimeChart);
    emitter.on(SWITCH_VS_COIN, this.newVsCoin);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    this._isMounted &&
      dispatcher.dispatch({
        type: COINGECKO_GET_ALLTIME_CHART,
        payload: this.props.data.id,
      });
  }

  componentWillUnmount() {
    emitter.removeListener(SWITCH_VS_COIN, this.newVsCoin);
    emitter.removeListener(
      COINGECKO_ALLTIME_CHART_RETURNED,
      this.geckoAlltimeChart
    );
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.editMode !== this.props.editMode) {
      this._isMounted && this.setState({ editMode: this.props.editMode });
    }
  }

  newVsCoin = () => {
    this.setState({ loadingChart: true });
  };

  vsCoinReturned = (data) => {
    this._isMounted &&
      dispatcher.dispatch({
        type: COINGECKO_GET_ALLTIME_CHART,
        payload: this.props.data.id,
      });

    this.setState({
      vsCoin: data,
    });
  };

  geckoAlltimeChart = (data) => {
    if (data[1] === this.props.data.id) {
      for (var i = 1; i < data[0].prices.length; i += 2) {
        delete data[0].prices[i];
        i++;
        delete data[0].prices[i];
      }
      const filteredData = data[0].prices.filter((a) => a);
      this.setState({ chartData: filteredData, loadingChart: false });
    }
  };

  guruRemoveChip = (e, id) => {
    e.stopPropagation();
    this.setState({ loading: true });
    if (this.props.type === "USER") {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_DEL_BLUECHIPS,
          tokenID: id,
        });
    } else {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_DEL_BLUECHIPS_GURU,
          tokenID: id,
        });
    }
  };

  render() {
    const { classes, data } = this.props;
    const { loadingChart, chartData, editMode, vsCoin } = this.state;
    const darkMode = store.getStore("theme") === "dark" ? true : false;
    let id = data.id;
    return (
      <Grid item xs={6} style={{ padding: 10 }}>
        <Paper
          className={darkMode ? classes.paperDark : classes.paper}
          style={{
            opacity: loadingChart ? 0 : 100,
            transition: "all 0.3s cubic-bezier(.46,.03,.52,.96) 0s",
            minHeight: "100%",
          }}
          elevation={0}
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
            justify="space-between"
          >
            {!loadingChart && (
              <>
                {editMode && (
                  <Grid item xs={12}>
                    <Button
                      color="secondary"
                      variant="outlined"
                      style={{
                        marginBottom: 10,
                        marginRight: 0,
                        marginLeft: "auto",
                      }}
                      startIcon={<DeleteIcon />}
                      onClick={(e) => this.guruRemoveChip(e, data.id)}
                    >
                      {this.state.loading ? <CircularProgress /> : "REMOVE"}
                    </Button>
                    <Divider variant="middle" />
                  </Grid>
                )}
                <Grid
                  item
                  container
                  direction="row"
                  justify="flex-start"
                  alignItems="stretch"
                  xs={7}
                  spacing={2}
                >
                  <Grid
                    item
                    xs={2}
                    style={{ alignContent: "center", display: "grid" }}
                  >
                    <img
                      className={classes.img}
                      alt="coin-icon"
                      src={data.image}
                    />
                  </Grid>
                  <Grid
                    style={{ zIndex: 1, margin: "0px 10px" }}
                    item
                    xs
                    container
                    direction="column"
                    spacing={2}
                  >
                    <Typography align="left" variant="h2">
                      {data.name}
                    </Typography>
                    <Typography
                      align="left"
                      variant="h3"
                      style={{ marginBottom: 10 }}
                    >
                      {data.current_price + " " + getVsSymbol(vsCoin)}
                    </Typography>
                    {parseInt(data.market_cap) > 0 && (
                      <Grid
                        item
                        container
                        direction="row"
                        style={{ padding: 0 }}
                        justify="space-between"
                      >
                        <Typography align="left" variant="body1">
                          Marketcap:
                        </Typography>
                        <Typography align="left" variant="body1">
                          {data.market_cap}
                        </Typography>
                      </Grid>
                    )}
                    {parseInt(data.fully_diluted_valuation) > 0 && (
                      <Grid
                        item
                        container
                        direction="row"
                        style={{ padding: 0 }}
                        justify="space-between"
                      >
                        <Typography align="left" variant="body1">
                          Fully diluted:
                        </Typography>
                        <Typography align="left" variant="body1">
                          {data.fully_diluted_valuation}
                        </Typography>
                      </Grid>
                    )}
                    {data.price_change_percentage_1y_in_currency > 0 && (
                      <Grid
                        item
                        container
                        direction="row"
                        style={{ padding: 0 }}
                        justify="space-between"
                      >
                        <Typography align="left" variant="body1">
                          price change 1Y:
                        </Typography>
                        <Typography align="left" variant="body1">
                          {data.price_change_percentage_1y_in_currency}%
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                <Grid
                  item
                  container
                  xs={5}
                  style={{
                    display: "flex",
                  }}
                >
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

export default withTranslation()(withRouter(withStyles(styles)(BlueChipCard)));
