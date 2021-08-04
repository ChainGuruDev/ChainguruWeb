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

//Import ICONS
import ShowChartIcon from "@material-ui/icons/ShowChart";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import LensIcon from "@material-ui/icons/Lens";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

// import CoinList from "../tools/coins";
// import DollarCostAverage from "../tools/dollarCostAverage.js";
// import BlueChips from "../tools/blueChips.js";

import Snackbar from "../snackbar";

import { ERROR } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;

const Swap = React.lazy(() => import("../tools/swap.js"));
const CoinList = React.lazy(() => import("../tools/coins"));
const DollarCostAverage = React.lazy(() =>
  import("../tools/dollarCostAverage.js")
);
const BlueChips = React.lazy(() => import("../tools/blueChips.js"));

const styles = (theme) => ({
  background: {
    flex: 1,
    display: "flex",
    width: "90%",
    minHeight: "100%",

    justifyContent: "space-around",
  },
  root: {
    padding: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    width: "100%",
  },
  rootTabs: {
    flexGrow: 1,
    width: "100%",
    borderRadius: 0,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: "rgba(255, 255, 255, 0.2);",
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

class Long extends Component {
  constructor(props) {
    super();

    let newTab = 0;

    if (props.match.params.toolID === "bluechips") {
      newTab = 0;
    } else if (props.match.params.toolID === "dca") {
      newTab = 1;
    }

    this.state = { snackbarMessage: "", valueTab: newTab };
  }

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
  }

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
    const { snackbarMessage, valueTab } = this.state;
    const handleChangeTabs = (event, newValueTab) => {
      this.setState({ valueTab: newValueTab });
    };

    return (
      <Grid className={classes.rootTabs}>
        <AppBar position="static" color="default">
          <LongTabs
            value={valueTab}
            onChange={handleChangeTabs}
            aria-label="tool tabs"
            scrollButtons="auto"
            textColor="secondary"
            centered
          >
            <LongTab
              label="BlueChips"
              icon={<CheckCircleIcon />}
              {...a11yProps(0)}
            />
            <LongTab
              label="Dollar Cost Average"
              icon={<ShowChartIcon />}
              {...a11yProps(1)}
            />
            <Tab label="Coins" icon={<LensIcon />} {...a11yProps(2)} />
            <Tab label="Swap" icon={<SwapHorizIcon />} {...a11yProps(3)} />
          </LongTabs>
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
            <Swap />
          </Suspense>
        </TabPanel>
        {snackbarMessage && this.renderSnackbar()}
      </Grid>
    );
  }

  nav = (screen) => {
    console.log(screen);
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
