import React, { Component, Suspense } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Grid,
  AppBar,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Card,
} from "@material-ui/core";

import { withTranslation } from "react-i18next";

import Snackbar from "../snackbar";
import SearchIcon from "@material-ui/icons/Search";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import LensIcon from "@material-ui/icons/Lens";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import MenuBookRoundedIcon from "@material-ui/icons/MenuBookRounded";

import { isMobile } from "react-device-detect";

import {
  PING_COINGECKO,
  PING_COINGECKO_RETURNED,
  COINLIST_RETURNED,
  DARKMODE_SWITCH_RETURN,
  COIN_DATA_RETURNED,
  ERROR,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

require("dotenv/config");

const CryptoDetective = React.lazy(() => import("../tools/cryptoDetective.js"));
const CryptoCompare = React.lazy(() => import("../tools/cryptoCompare.js"));
const Favorites = React.lazy(() => import("../tools/favorites.js"));
const CoinList = React.lazy(() => import("../tools/coins.js"));
const Swap = React.lazy(() => import("../tools/swap.js"));
const CryptoNews = React.lazy(() => import("../tools/news.js"));

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  rootTabs: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
    borderRadius: 0,
  },
  background: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",

    justifyContent: "space-around",
  },
  compareGrid: {
    maxWidth: "75%",
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
      {value === index && <Box p={3}>{children}</Box>}
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

class Medium extends Component {
  constructor(props) {
    super(props);

    const account = store.getStore("account");

    let toolID = this.tool2toolID(this.props.match.params.tool);

    function getMode() {
      let savedmode;
      try {
        savedmode = JSON.parse(localStorage.getItem("dark"));
        return savedmode || false;
      } catch (err) {
        return false;
      }
    }

    const theme = getMode();

    this.state = {
      snackbarType: null,
      snackbarMessage: null,
      darkMode: theme,
      account: account,
      loading: false,
      coinList: [],
      coinDataA: [],
      coinDataB: [],
      valueTab: toolID,
      selectA: false,
      selectB: false,
      coinID: this.props.match.params.coinID,
    };
  }

  tool2toolID = (tool) => {
    let toolID = 1;
    switch (tool) {
      case "compare":
        toolID = 0;
        break;
      case "favorites":
        toolID = 1;
        break;
      case "detective":
        toolID = 2;
        break;
      case "coins":
        toolID = 3;
        break;
      case "swap":
        toolID = 4;
        break;
      case "news":
        toolID = 5;
        break;
      default:
        break;
    }
    return toolID;
  };

  toolID2tool = (toolID) => {
    let tool;
    switch (toolID) {
      case 0:
        tool = "compare";
        break;
      case 1:
        tool = "favorites";
        break;
      case 2:
        tool = "detective";
        break;
      case 3:
        tool = "coins";
        break;
      case 4:
        tool = "swap";
        break;
      case 5:
        tool = "news";
        break;
      default:
        tool = "";
        break;
    }
    return tool;
  };

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.coinID !== this.props.match.params.coinID) {
      if (this.props.match.params.tool === "detective") {
        this.setState({
          valueTab: 2,
          coinID: this.props.match.params.coinID,
        });
      } else {
        if (prevProps.match.params.tool !== this.props.match.params.tool) {
          let newValueTab = this.tool2toolID(this.props.match.params.tool);
          this.setState({
            valueTab: newValueTab,
          });
        }
      }
    } else {
      if (prevProps.match.params.tool !== this.props.match.params.tool) {
        let newValueTab = this.tool2toolID(this.props.match.params.tool);
        this.setState({
          valueTab: newValueTab,
        });
      }
    }
  }

  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(PING_COINGECKO_RETURNED, this.pingCoingeckoReturned);
    new Image().src = "/coingecko.webp";
    dispatcher.dispatch({
      type: PING_COINGECKO,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(PING_COINGECKO_RETURNED, this.pingCoingeckoReturned);
  }

  darkModeSwitch = (mode) => {
    this.setState({ darkMode: mode });
  };

  coinlistReturned = (payload) => {
    this.setState({ coinList: payload });
  };

  coinDataReturned = (data) => {
    if (data[1] === "A") {
      this.setState({ coinDataA: data[0] });
      this.setState({ selectA: true });
    } else if (data[1] === "B") {
      this.setState({ coinDataB: data[0] });
      this.setState({ selectB: true });
    }
  };

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

  pingCoingeckoReturned = (geckoMsg) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: geckoMsg,
        snackbarType: "coingecko",
      };
      that.setState(snackbarObj);
    });
  };

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
  };

  render() {
    const { classes } = this.props;
    const { valueTab, coinID, darkMode, snackbarMessage } = this.state;
    const hasBetaAccess = store.getStore("hasBetaAccess");
    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
      let newScreen = this.toolID2tool(newValueTab);
      this.nav("/medium/" + newScreen);
    };

    return (
      <div className={classes.rootTabs} id="rootMedium">
        {process.env.REACT_APP_CHAINGURU_VERSION === "beta" && hasBetaAccess && (
          <AppBar position="static" color="default">
            <Tabs
              value={valueTab}
              onChange={handleChangeTabs}
              variant={isMobile ? "scrollable" : "standard"}
              aria-label="tool tabs"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
              centered={!isMobile}
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
              <Tab label="Coins" icon={<LensIcon />} {...a11yProps(3)} />
              <Tab label="Swap" icon={<SwapHorizIcon />} {...a11yProps(4)} />
              <Tab
                label="News"
                icon={<MenuBookRoundedIcon />}
                {...a11yProps(5)}
              />
            </Tabs>
          </AppBar>
        )}
        <div
          style={{
            flex: 1,
            backgroundImage: darkMode
              ? "radial-gradient(at center top, rgb(50, 87, 66), rgba(8, 26, 15, 0.98))"
              : "radial-gradient(at center top, rgb(121, 216, 162), rgba(121, 216, 162, 0.1))",
          }}
        >
          <TabPanel value={valueTab} index={0}>
            <Suspense
              fallback={
                <div style={{ textAlign: "center" }}>
                  <Card className={classes.favCard} elevation={3}>
                    <CircularProgress />
                  </Card>
                </div>
              }
            >
              <CryptoCompare toolTimeframe={"medium"} />
            </Suspense>
          </TabPanel>
          <TabPanel value={valueTab} index={1}>
            <Suspense
              fallback={
                <div style={{ textAlign: "center" }}>
                  <Card className={classes.favCard} elevation={3}>
                    <CircularProgress />
                  </Card>
                </div>
              }
            >
              <Favorites timeFrame={"medium"} />
            </Suspense>
          </TabPanel>
          <TabPanel value={valueTab} index={2}>
            <Suspense
              fallback={
                <div style={{ textAlign: "center" }}>
                  <Card className={classes.favCard} elevation={3}>
                    <CircularProgress />
                  </Card>
                </div>
              }
            >
              {coinID && (
                <CryptoDetective toolTimeframe={"medium"} coinID={coinID} />
              )}
              {!coinID && (
                <CryptoDetective toolTimeframe={"medium"} coinID={"bitcoin"} />
              )}
            </Suspense>
          </TabPanel>
          <TabPanel value={valueTab} index={3}>
            <Suspense
              fallback={
                <div style={{ textAlign: "center" }}>
                  <Card className={classes.favCard} elevation={3}>
                    <CircularProgress />
                  </Card>
                </div>
              }
            >
              <CoinList timeFrame="medium" />
            </Suspense>
          </TabPanel>
          <TabPanel value={valueTab} index={4}>
            <Suspense
              fallback={
                <div style={{ textAlign: "center" }}>
                  <Card className={classes.favCard} elevation={3}>
                    <CircularProgress />
                  </Card>
                </div>
              }
            >
              <Swap />
            </Suspense>
          </TabPanel>
          <TabPanel value={valueTab} index={5}>
            <Suspense
              fallback={
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    width: "100%",
                    minHeight: "100%",
                    justifyContent: "space-around",
                  }}
                >
                  <Grid container item xs={8}>
                    <Card
                      style={{
                        padding: 10,
                        margin: 10,
                        display: "flex",
                        flex: 1,
                        direction: "row",
                        alignContent: "center",
                        textAlign: "center",
                        justifyContent: "center",
                      }}
                      elevation={3}
                    >
                      <CircularProgress />
                    </Card>
                  </Grid>
                </div>
              }
            >
              <CryptoNews toolTimeframe={"medium"} />
            </Suspense>
          </TabPanel>
        </div>
        {snackbarMessage && this.renderSnackbar()}
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Medium)));
