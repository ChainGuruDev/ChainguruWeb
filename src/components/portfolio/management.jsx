import React, { Component, useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Grid, AppBar, Tabs, Tab, Box, Typography } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import BusinessCenterRoundedIcon from "@material-ui/icons/BusinessCenterRounded";
import SearchIcon from "@material-ui/icons/Search";
import SyncAltRoundedIcon from "@material-ui/icons/SyncAltRounded";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import ViewQuiltIcon from "@material-ui/icons/ViewQuilt";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import TrackChangesRoundedIcon from "@material-ui/icons/TrackChangesRounded";
import DashboardIcon from "@material-ui/icons/Dashboard";
import ReceiptIcon from "@material-ui/icons/Receipt";
//Load Tools
import CryptoDetective from "../tools/cryptoDetective";
import Transactions from "../tools/transactions";
import Portfolio from "../tools/portfolio";
import PortfolioHeatMap from "../tools/portfolioHeatMap";
import CryptoConverter from "../tools/cryptoConverter";
import PortfolioRadar from "../tools/portfolioRadar";
import Dashboard from "../tools/dashboard.js";

import {
  PING_COINGECKO,
  COINLIST_RETURNED,
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

const PortfolioTabs = withStyles({
  indicator: {
    backgroundColor: colors.cgYellow,
  },
})(Tabs);

const PortfolioTab = withStyles((theme) => ({
  root: {
    "&$selected": {
      color: colors.cgYellow,
    },
    "&:focus": {
      color: colors.cgYellow,
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

// MAIN PAGE FOR PORTFOLIO MANAGEMENT AND TOOLS

class PortfolioManagement extends Component {
  constructor(props) {
    super(props);

    const account = store.getStore("account");

    let toolID = this.tool2toolID(this.props.match.params.tool);
    this.state = {
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
    let toolID = 0;
    switch (tool) {
      case "dashboard":
        toolID = 0;
        break;
      case "transactions":
        toolID = 1;
        break;
      case "heatmap":
        toolID = 2;
        break;
      case "cryptoConverter":
        toolID = 3;
        break;
      case "portfolioRadar":
        toolID = 4;
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
        tool = "dashboard";
        break;
      case 1:
        tool = "transactions";
        break;
      case 2:
        tool = "heatmap";
        break;
      case 3:
        tool = "cryptoConverter";
        break;
      case 4:
        tool = "portfolioRadar";
        break;
      default:
        tool = "";
        break;
    }
    return tool;
  };

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.tool !== this.props.match.params.tool) {
      let newValueTab = this.tool2toolID(this.props.match.params.tool);
      this.setState({
        valueTab: newValueTab,
      });
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
    const { classes, t, location } = this.props;
    const { valueTab, coinID } = this.state;

    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
      let newScreen = this.toolID2tool(newValueTab);
      this.nav("/portfolio/" + newScreen);
    };

    return (
      <Grid className={classes.rootTabs}>
        <AppBar position="static" color="default">
          <PortfolioTabs
            value={valueTab}
            onChange={handleChangeTabs}
            aria-label="tool tabs"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <PortfolioTab
              label="Dashboard"
              icon={<DashboardIcon />}
              {...a11yProps(0)}
            />
            <PortfolioTab
              label="Transactions"
              icon={<ReceiptIcon />}
              {...a11yProps(1)}
            />
            <PortfolioTab
              label="HeatMap"
              icon={<ViewQuiltIcon />}
              {...a11yProps(2)}
            />
            <PortfolioTab
              label="CryptoConverter"
              icon={<ShuffleIcon />}
              {...a11yProps(3)}
            />
            <PortfolioTab
              label="Portfolio Radar"
              icon={<TrackChangesRoundedIcon />}
              {...a11yProps(4)}
            />
          </PortfolioTabs>
        </AppBar>
        <TabPanel value={valueTab} index={0}>
          <Dashboard />
        </TabPanel>
        <TabPanel value={valueTab} index={1}>
          <Transactions />
        </TabPanel>
        <TabPanel value={valueTab} index={2}>
          <PortfolioHeatMap />
        </TabPanel>
        <TabPanel value={valueTab} index={3}>
          <CryptoConverter />
        </TabPanel>
        <TabPanel value={valueTab} index={4}>
          <PortfolioRadar />
        </TabPanel>
      </Grid>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(
  withRouter(withStyles(styles)(PortfolioManagement))
);
