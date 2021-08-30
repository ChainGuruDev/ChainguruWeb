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

import LensIcon from "@material-ui/icons/Lens";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SearchIcon from "@material-ui/icons/Search";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

//LOAD TOOLS now with reactLazy
// import CryptoDetective from "../tools/cryptoDetective";
// import CryptoCompare from "../tools/cryptoCompare";
// import Favorites from "../tools/favorites";
// import LongShort from "../tools/longShort";
// import CoinList from "../tools/coins";

import {
  PING_COINGECKO,
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
  DARKMODE_SWITCH_RETURN,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

//LOAD TOOLS ReactLazy
const CryptoDetective = React.lazy(() => import("../tools/cryptoDetective.js"));
const CryptoCompare = React.lazy(() => import("../tools/cryptoCompare.js"));
const Favorites = React.lazy(() => import("../tools/favorites.js"));
const LongShort = React.lazy(() => import("../tools/longShort.js"));
const CoinList = React.lazy(() => import("../tools/coins.js"));
const Swap = React.lazy(() => import("../tools/swap.js"));

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={"span"}>{children}</Typography>
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
    };
  }

  tool2toolID = (tool) => {
    let toolID = 0;
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
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);

    dispatcher.dispatch({
      type: PING_COINGECKO,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
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

  handleBigChart = () => {
    this.setState({ bigChart: !this.state.bigChart });
  };

  render() {
    const { classes } = this.props;
    const { valueTab, coinID, darkMode } = this.state;
    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
      let newScreen = this.toolID2tool(newValueTab);
      this.nav("/short/" + newScreen);
    };
    return (
      <div className={classes.rootTabs} id="rootShort">
        <AppBar position="static" color="default" style={{ height: "72px" }}>
          <Tabs
            value={valueTab}
            onChange={handleChangeTabs}
            aria-label="tool tabs"
            scrollButtons="auto"
            indicatorColor="secondary"
            textColor="secondary"
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
            <Tab
              label="Short & Long"
              icon={<TrendingUpIcon />}
              {...a11yProps(3)}
            />
            <Tab label="Coins" icon={<LensIcon />} {...a11yProps(4)} />
            <Tab label="Swap" icon={<SwapHorizIcon />} {...a11yProps(5)} />
          </Tabs>
        </AppBar>
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
              <Favorites />
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
              {coinID && <CryptoDetective coinID={coinID} />}
              {!coinID && <CryptoDetective coinID={"bitcoin"} />}
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
        </div>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Short)));
