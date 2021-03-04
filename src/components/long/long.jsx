import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Card,
  Typography,
  Paper,
  Grid,
  ButtonBase,
  Button,
  Box,
  AppBar,
  Tabs,
  Tab,
} from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import PropTypes from "prop-types";

//Import ICONS
import ShowChartIcon from "@material-ui/icons/ShowChart";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import DollarCostAverage from "../tools/dollarCostAverage.js";
import BlueChips from "../tools/blueChips.js";

import Snackbar from "../snackbar";

import { ERROR } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

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
    const { classes, t, location } = this.props;
    const { snackbarMessage, valueTab } = this.state;
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
              label="BlueChips"
              icon={<CheckCircleIcon />}
              {...a11yProps(0)}
            />
            <Tab
              label="Dollar Cost Average"
              icon={<ShowChartIcon />}
              {...a11yProps(1)}
            />
          </Tabs>
        </AppBar>
        <TabPanel className={classes.background} value={valueTab} index={0}>
          <BlueChips />
        </TabPanel>
        <TabPanel value={valueTab} index={1}>
          <DollarCostAverage />
        </TabPanel>
        {snackbarMessage && this.renderSnackbar()}
      </Paper>
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
