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
import BlueChipCard from "../components/BlueChipCard.js";
import Snackbar from "../snackbar";

import {
  ERROR,
  DB_GET_BLUECHIPS,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  background: {
    background: "linear-gradient(to top, #2F80ED, #56CCF2)",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    flexGrow: 1,
    width: "100%",
    padding: 0,
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

    this.state = { chipData: [], snackbarMessage: "", valueTab: newTab };
  }

  componentDidMount() {
    emitter.setMaxListeners(this.state.chipData.length);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoBluechipData);
    dispatcher.dispatch({
      type: DB_GET_BLUECHIPS,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoBluechipData
    );
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

  formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i = parseInt(
        (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
      ).toString();
      let j = i.length > 3 ? i.length % 3 : 0;

      return (
        negativeSign +
        (j ? i.substr(0, j) + thousands : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount
          ? decimal +
            Math.abs(amount - i)
              .toFixed(decimalCount)
              .slice(2)
          : "")
      );
    } catch (e) {
      console.log(e);
    }
  };

  geckoBluechipData = (payload) => {
    let chips = [];
    payload.forEach((item, i) => {
      let chipData = this.createBluechip(
        item.image,
        item.name,
        item.id,
        item.symbol,
        this.formatMoney(item.current_price, 2),
        parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
        this.formatMoney(item.market_cap, 0),
        this.formatMoney(item.fully_diluted_valuation, 0)
      );
      chips.push(chipData);
    });
    this.setState({ chipData: chips });
  };

  createBluechip = (
    image,
    name,
    id,
    symbol,
    current_price,
    price_change_percentage_1y_in_currency,
    market_cap,
    fully_diluted_valuation
  ) => {
    return {
      image,
      name,
      id,
      symbol,
      current_price,
      price_change_percentage_1y_in_currency,
      market_cap,
      fully_diluted_valuation,
    };
  };

  geckoFavListDataReturned = (data) => {
    let rows = [];
    data.forEach((item, i) => {
      console.log(item);
      let rowData = this.createData(
        item.image,
        item.name,
        item.id,
        item.symbol,
        this.formatMoney(item.current_price, 2),
        parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
        this.formatMoney(item.market_cap, 0),
        this.formatMoney(item.fully_diluted_valuation, 0)
      );
      rows.push(rowData);
    });
    this.setState({ rowData: rows });
  };

  render() {
    const { classes, t, location } = this.props;
    const { chipData, snackbarMessage, valueTab } = this.state;
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
          <div className={classes.root}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.paper} elevation={3}>
                  <Typography variant="h2">BlueChips to hodl</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              {chipData.map((bluechip) => (
                <BlueChipCard key={bluechip.id} data={bluechip} />
              ))}
            </Grid>
            {snackbarMessage && this.renderSnackbar()}
          </div>
        </TabPanel>
        <TabPanel value={valueTab} index={1}>
          <DollarCostAverage />
        </TabPanel>
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
