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
  Typography,
  CircularProgress,
  Card,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";

import SearchIcon from "@material-ui/icons/Search";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import LensIcon from "@material-ui/icons/Lens";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

//Load Tools NOW USING REACT.LAzy
// import CryptoDetective from "../tools/cryptoDetective";
// import CryptoCompare from "../tools/cryptoCompare";
// import Favorites from "../tools/favorites";
// import CoinList from "../tools/coins";

import {
  PING_COINGECKO,
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const CryptoDetective = React.lazy(() => import("../tools/cryptoDetective.js"));
const CryptoCompare = React.lazy(() => import("../tools/cryptoCompare.js"));
const Favorites = React.lazy(() => import("../tools/favorites.js"));
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

class Medium extends Component {
  constructor(props) {
    super(props);

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      coinList: [],
      coinDataA: [],
      coinDataB: [],
      valueTab:
        this.props.match.params.tool === "detective" ||
        this.props.tool === "detective"
          ? 1
          : 0,
      selectA: false,
      selectB: false,
      coinID: this.props.match.params.coinID,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.coinID !== this.props.match.params.coinID) {
      if (this.props.match.params.tool === "detective") {
        this.setState({
          valueTab: 1,
          coinID: this.props.match.params.coinID,
        });
      }
      if (this.props.tool === "detective") {
        this.setState({
          valueTab: 1,
          coinID: this.props.match.params.coinID,
        });
      }
    }
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
    if (data[1] === "A") {
      this.setState({ coinDataA: data[0] });
      this.setState({ selectA: true });
    } else if (data[1] === "B") {
      this.setState({ coinDataB: data[0] });
      this.setState({ selectB: true });
    }
  };

  render() {
    const { classes } = this.props;
    const { valueTab, coinID } = this.state;

    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
    };

    return (
      <Grid className={classes.rootTabs}>
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
            <Tab label="Coins" icon={<LensIcon />} {...a11yProps(3)} />
            <Tab label="Swap" icon={<SwapHorizIcon />} {...a11yProps(4)} />
          </Tabs>
        </AppBar>
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
          {
            //<CoinList timeFrame="medium" />
          }
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
      </Grid>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Medium)));
