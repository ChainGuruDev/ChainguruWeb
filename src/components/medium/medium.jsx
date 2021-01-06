import React, { Component, useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Paper, AppBar, Tabs, Tab, Box, Typography } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import BusinessCenterRoundedIcon from "@material-ui/icons/BusinessCenterRounded";
import SearchIcon from "@material-ui/icons/Search";

//Load Tools
import Portfolio from "../tools/portfolio";
import CryptoDetective from "../tools/cryptoDetective";

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
    const { classes, t, location } = this.props;
    const { valueTab, coinID } = this.state;

    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
    };

    return (
      <Paper className={classes.rootTabs}>
        <AppBar position="static" color="default">
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
              label="Portfolio"
              icon={<BusinessCenterRoundedIcon />}
              {...a11yProps(0)}
            />
            <Tab
              label="Crypto Detective"
              icon={<SearchIcon />}
              {...a11yProps(1)}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={valueTab} index={0}>
          <Portfolio />
        </TabPanel>
        <TabPanel value={valueTab} index={1}>
          {coinID && <CryptoDetective coinID={coinID} />}
          {!coinID && <CryptoDetective />}
        </TabPanel>
      </Paper>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Medium)));
