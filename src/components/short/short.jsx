import React, { Component, Suspense } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  AppBar,
  Tabs,
  Tab,
  Box,
  Grid,
  CircularProgress,
  Card,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";
import Snackbar from "../snackbar";

import MenuBookRoundedIcon from "@material-ui/icons/MenuBookRounded";
import LensIcon from "@material-ui/icons/Lens";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SearchIcon from "@material-ui/icons/Search";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

import { isMobile } from "react-device-detect";

//LOAD TOOLS now with reactLazy
// import CryptoDetective from "../tools/cryptoDetective";
// import CryptoCompare from "../tools/cryptoCompare";
// import Favorites from "../tools/favorites";
// import LongShort from "../tools/longShort";
// import CoinList from "../tools/coins";

import {
  PING_COINGECKO,
  PING_COINGECKO_RETURNED,
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
  DARKMODE_SWITCH_RETURN,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

require("dotenv/config");

//LOAD TOOLS ReactLazy
const CryptoDetective = React.lazy(() => import("../tools/cryptoDetective.js"));
const CryptoCompare = React.lazy(() => import("../tools/cryptoCompare.js"));
const Favorites = React.lazy(() => import("../tools/favorites.js"));
const LongShort = React.lazy(() => import("../tools/longShort.js"));
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
      id={`tools-tabpanel-${index}`}
      aria-labelledby={`tools-tab-${index}`}
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
    id: `tool-tab-${index}`,
    "aria-controls": `tool-tabpanel-${index}`,
  };
}

class Short extends Component {
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
      darkMode: theme,
      account: account,
      loading: false,
      coinList: [],
      bigChart: false,
      coinDataA: [],
      coinDataB: [],
      valueTab: toolID,
      selectA: false,
      selectB: false,
      coinID: this.props.match.params.coinID,
      snackbarType: null,
      snackbarMessage: null,
    };
  }

  tool2toolID = (tool) => {
    let toolID = 3;
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
      case "shortLong":
        toolID = 3;
        break;
      case "coins":
        toolID = 4;
        break;
      case "swap":
        toolID = 5;
        break;
      case "news":
        toolID = 6;
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
        tool = "shortLong";
        break;
      case 4:
        tool = "coins";
        break;
      case 5:
        tool = "swap";
        break;
      case 6:
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
      if (this.props.tool === "detective") {
        this.setState({
          valueTab: 2,
          coinID: this.props.match.params.coinID,
        });
      }
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
    new Image().src = "/coingecko.webp";
    emitter.on(PING_COINGECKO_RETURNED, this.pingCoingeckoReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
    dispatcher.dispatch({
      type: PING_COINGECKO,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(PING_COINGECKO_RETURNED, this.pingCoingeckoReturned);
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
  }

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

  handleBigChart = () => {
    this.setState({ bigChart: !this.state.bigChart });
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
      this.nav("/short/" + newScreen);
    };
    return (
      <div className={classes.rootTabs} id="rootShort">
        {process.env.REACT_APP_CHAINGURU_VERSION === "beta" && hasBetaAccess && (
          <AppBar position="static" color="default" style={{ height: "72px" }}>
            <Tabs
              value={valueTab}
              onChange={handleChangeTabs}
              aria-label="tool tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              indicatorColor="secondary"
              textColor="secondary"
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
              <Tab
                label="Short & Long"
                icon={<TrendingUpIcon />}
                {...a11yProps(3)}
              />
              <Tab label="Coins" icon={<LensIcon />} {...a11yProps(4)} />
              <Tab label="Swap" icon={<SwapHorizIcon />} {...a11yProps(5)} />
              <Tab
                label="News"
                icon={<MenuBookRoundedIcon />}
                {...a11yProps(6)}
              />
            </Tabs>
          </AppBar>
        )}
        <div
          style={{
            flex: 1,
            backgroundImage: darkMode
              ? "radial-gradient(ellipse at center top, rgb(121, 80, 56), rgb(21, 12, 7))"
              : "radial-gradient(ellipse at center top, rgb(247, 157, 107), rgba(247, 157, 107, 0.27))",
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
              <CryptoCompare toolTimeframe={"short"} />
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
              <Favorites timeFrame={"short"} />
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
                <CryptoDetective toolTimeframe={"short"} coinID={coinID} />
              )}
              {!coinID && (
                <CryptoDetective toolTimeframe={"short"} coinID={"bitcoin"} />
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
              <LongShort />
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
              <CoinList timeFrame="short" />
            </Suspense>
          </TabPanel>
          <TabPanel value={valueTab} index={5}>
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
          <TabPanel value={valueTab} index={6}>
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
              <div
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div style={{ maxWidth: "80%" }}>
                  <CryptoNews toolTimeframe={"short"} />
                </div>
              </div>
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

export default withTranslation()(withRouter(withStyles(styles)(Short)));
