import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Card,
  Typography,
  Grid,
  Divider,
  IconButton,
  Switch,
  AppBar,
  Tabs,
  Tab,
  Box,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import BarChartIcon from "@material-ui/icons/BarChart";
import PieChartIcon from "@material-ui/icons/PieChart";
import CoinSearchBar from "../components/CoinSearchBar.js";
import CoinCompare from "../components/CoinCompare.js";
import BigChart from "../components/BigChart.js";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import AspectRatioRoundedIcon from "@material-ui/icons/AspectRatioRounded";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import SearchIcon from "@material-ui/icons/Search";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  PING_COINGECKO,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_WALLET_TOKENS_BALANCE,
  COIN_DATA_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  rootTabs: {
    flexGrow: 1,
    width: "100%",
    background: "linear-gradient(to top, #F37335, #FDC830)",
  },
  background: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",

    justifyContent: "space-around",
  },
  compareGrid: {
    maxWidth: "100%",
    minHeight: "100%",
    textAlign: "center",
    justifyContent: "space-evenly",
  },
  compareCard: {
    padding: 10,
    minHeight: "70%",
    marginTop: 10,
    marginBottom: 10,
    display: "flex",
    flex: 1,
    textAlign: "center",
    justifyContent: "space-between",
    direction: "row",
    alignItems: "stretch",
    background: "rgba(255,255,255,0.25)",
  },
  divider: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  swapBTN: {
    width: "50px",
    height: "50px",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class Short extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      coinList: [],
      bigChart: false,
      coinDataA: [],
      coinDataB: [],
      valueTab: 0,
      selectA: false,
      selectB: false,
    };
  }

  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);

    dispatcher.dispatch({
      type: PING_COINGECKO,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    if (data[1] == "A") {
      this.setState({ coinDataA: data[0] });
      this.setState({ selectA: true });
    } else if (data[1] == "B") {
      this.setState({ coinDataB: data[0] });
      this.setState({ selectB: true });
    }
  };

  handleBigChart = () => {
    this.setState({ bigChart: !this.state.bigChart });
    console.log("Big Chart " + this.state.bigChart);
  };

  render() {
    const { classes, t, location } = this.props;
    const {
      bigChart,
      coinDataA,
      coinDataB,
      valueTab,
      selectA,
      selectB,
    } = this.state;
    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
    };

    return (
      <div className={classes.rootTabs}>
        <AppBar position="static" color="default">
          <Tabs
            value={valueTab}
            onChange={handleChangeTabs}
            aria-label="tool tabs"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab
              label="Crypto Compare"
              icon={<CompareArrowsIcon />}
              {...a11yProps(0)}
            />
            <Tab label="Favorites" icon={<FlashOnIcon />} {...a11yProps(1)} />
            <Tab
              label="Crypto Detective"
              icon={<SearchIcon />}
              {...a11yProps(2)}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={valueTab} index={0}>
          <div className={classes.background}>
            <Grid
              className={classes.compareGrid}
              style={{
                display: !bigChart ? "flex" : "none",
              }}
              spacing={3}
              container
            >
              <Card className={classes.compareCard} elevation={3}>
                <Grid item xs={6} style={{ marginRight: 10 }}>
                  <CoinCompare id={"A"} />
                </Grid>
                <Grid item xs={6}>
                  <CoinCompare id={"B"} />
                </Grid>
                <Grid item style={{ padding: 10 }}>
                  <IconButton className={classes.swapBTN} aria-label="swap">
                    <SwapHorizIcon size="large" />
                  </IconButton>
                  {selectA && selectB && (
                    <IconButton className={classes.swapBTN} aria-label="merge">
                      <AspectRatioRoundedIcon
                        onClick={() => {
                          this.handleBigChart();
                        }}
                        size="large"
                      />
                    </IconButton>
                  )}
                </Grid>
              </Card>
            </Grid>
            {bigChart && (
              <Grid
                className={classes.compareGrid}
                style={{
                  display: bigChart ? "flex" : "none",
                }}
                spacing={3}
                container
              >
                <Card className={classes.compareCard} elevation={3}>
                  <Grid item xs={12}>
                    <BigChart
                      idA={"A"}
                      idB={"B"}
                      coinDataA={this.state.coinDataA}
                      coinDataB={this.state.coinDataB}
                    />
                  </Grid>
                  <Grid item style={{ padding: 10 }}>
                    <IconButton className={classes.swapBTN} aria-label="swap">
                      <SwapHorizIcon size="large" />
                    </IconButton>
                    <IconButton className={classes.swapBTN} aria-label="merge">
                      <AspectRatioRoundedIcon
                        onClick={() => {
                          this.handleBigChart();
                        }}
                        size="large"
                      />
                    </IconButton>
                  </Grid>
                </Card>
              </Grid>
            )}
          </div>
        </TabPanel>
        <TabPanel value={valueTab} index={1}>
          FavoritesTool
        </TabPanel>
        <TabPanel value={valueTab} index={2}>
          Crypto Detective
        </TabPanel>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Short)));
