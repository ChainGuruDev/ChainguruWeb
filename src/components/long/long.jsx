import React, { Component, Suspense } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Grid,
  Box,
  AppBar,
  Tabs,
  Tab,
  CircularProgress,
  Card,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { colors } from "../../theme";
import { isMobile } from "react-device-detect";

//Import ICONS
import ShowChartIcon from "@material-ui/icons/ShowChart";
import SearchIcon from "@material-ui/icons/Search";

import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import LensIcon from "@material-ui/icons/Lens";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import MenuBookRoundedIcon from "@material-ui/icons/MenuBookRounded";

// import CoinList from "../tools/coins";
// import DollarCostAverage from "../tools/dollarCostAverage.js";
// import BlueChips from "../tools/blueChips.js";

import Snackbar from "../snackbar";

import {
  ERROR,
  DARKMODE_SWITCH_RETURN,
  PING_COINGECKO,
  PING_COINGECKO_RETURNED,
} from "../../constants";

import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

require("dotenv/config");

const Swap = React.lazy(() => import("../tools/swap.js"));
const CoinList = React.lazy(() => import("../tools/coins"));

const CryptoDetective = React.lazy(() => import("../tools/cryptoDetective"));

const DollarCostAverage = React.lazy(() =>
  import("../tools/dollarCostAverage.js")
);
const BlueChips = React.lazy(() => import("../tools/blueChips.js"));
const CryptoNews = React.lazy(() => import("../tools/news.js"));

const styles = (theme) => ({
  background: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  root: {
    padding: theme.spacing(2),
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
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
  },
  favCard: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "stretch",
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

const LongTabs = withStyles({
  indicator: {
    backgroundColor: colors.cgBlue,
  },
})(Tabs);

const LongTab = withStyles((theme) => ({
  root: {
    "&$selected": {
      color: colors.cgBlue,
    },
    "&:focus": {
      color: colors.cgBlue,
    },
  },
  selected: {},
}))((props) => <Tab {...props} />);

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

class Long extends Component {
  constructor(props) {
    super(props);

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
      valueTab: toolID,
      darkMode: theme,
      coinID: this.props.match.params.coinID,
    };
  }

  tool2toolID = (tool) => {
    let toolID = 2;
    switch (tool) {
      case "bluechips":
        toolID = 0;
        break;
      case "dca":
        toolID = 1;
        break;
      case "coins":
        toolID = 2;
        break;
      case "detective":
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
        tool = "bluechips";
        break;
      case 1:
        tool = "dca";
        break;
      case 2:
        tool = "coins";
        break;
      case 3:
        tool = "detective";
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

  componentDidMount() {
    new Image().src = "/coingecko.webp";
    emitter.on(PING_COINGECKO_RETURNED, this.pingCoingeckoReturned);

    emitter.on(ERROR, this.errorReturned);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
    dispatcher.dispatch({
      type: PING_COINGECKO,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(PING_COINGECKO_RETURNED, this.pingCoingeckoReturned);
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.coinID !== this.props.match.params.coinID) {
      if (this.props.match.params.tool === "detective") {
        this.setState({
          valueTab: 3,
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

  darkModeSwitch = (mode) => {
    this.setState({ darkMode: mode });
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

  render() {
    const { classes } = this.props;
    const { snackbarMessage, valueTab, darkMode, coinID } = this.state;
    const hasBetaAccess = store.getStore("hasBetaAccess");
    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
      let newScreen = this.toolID2tool(newValueTab);
      this.nav("/long/" + newScreen);
    };

    return (
      <Grid className={classes.rootTabs}>
        {process.env.REACT_APP_CHAINGURU_VERSION === "beta" &&
          hasBetaAccess ===
          (
            <AppBar position="static" color="default">
              <LongTabs
                value={valueTab}
                onChange={handleChangeTabs}
                aria-label="tool tabs"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                centered={!isMobile}
                textColor="secondary"
              >
                <LongTab
                  label="BlueChips"
                  icon={<CheckCircleIcon />}
                  {...a11yProps(0)}
                  style={{ cursor: "inherit" }}
                />
                <LongTab
                  label="Dollar Cost Average"
                  icon={<ShowChartIcon />}
                  {...a11yProps(1)}
                  style={{ cursor: "inherit" }}
                />
                <LongTab label="Coins" icon={<LensIcon />} {...a11yProps(2)} />
                <LongTab
                  label="CryptoDetective"
                  icon={<SearchIcon />}
                  {...a11yProps(3)}
                  style={{ cursor: "inherit" }}
                />
                <LongTab
                  label="Swap"
                  icon={<SwapHorizIcon />}
                  {...a11yProps(4)}
                  style={{ cursor: "inherit" }}
                />
                <Tab
                  label="News"
                  icon={<MenuBookRoundedIcon />}
                  {...a11yProps(5)}
                  style={{ cursor: "inherit" }}
                />
              </LongTabs>
            </AppBar>
          )}
        <div
          style={{
            flex: 1,
            backgroundImage: darkMode
              ? "radial-gradient(circle at center top, rgb(56, 81, 89), rgb(0, 30, 40))"
              : "radial-gradient(circle at center top, rgb(157, 226, 249), rgba(157, 226, 249, 0.1))",
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
              <BlueChips />
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
              <DollarCostAverage />
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
              <CoinList timeFrame="long" />
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
              {coinID && (
                <CryptoDetective toolTimeframe={"long"} coinID={coinID} />
              )}
              {!coinID && (
                <CryptoDetective toolTimeframe={"long"} coinID={"bitcoin"} />
              )}
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
              <CryptoNews toolTimeframe={"long"} />
            </Suspense>
          </TabPanel>
        </div>
        {snackbarMessage && this.renderSnackbar()}
      </Grid>
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
