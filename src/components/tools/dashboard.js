// main user Dashboard
// allow users to check their wallet performance
// have minitools for different sections and minigames

import React, { Component, Suspense } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

import { Grid, CircularProgress, Card } from "@material-ui/core";
import ProfileMini from "../profile/profileMini.js";
import Snackbar from "../snackbar";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  ERROR,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;

// Import requiredTools
// It will be modular in the future
//TODO IMPORT portfolio BIG ui
const LeaderboardMini = React.lazy(() =>
  import("../leaderboard/leaderboardMini.js")
);
const LongShortMini = React.lazy(() => import("./longShortMini.js"));
const PortfolioBig = React.lazy(() => import("./portfolioBig.js"));

const styles = (theme) => ({
  miniUI: {},
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  favCard: {
    padding: 10,
    margin: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignContent: "center",
    textAlign: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
  },
});

class Dashboard extends Component {
  constructor() {
    super();
    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      tools: {
        portfolio_BIG: true,
        profile_MINI: true,
        longShort_MINI: true,
        leaderboard_MINI: true,
      },
    };

    if (account && account.address) {
      //IF USER IS LOGGED IN DO SOMETHING
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connected);
    emitter.on(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.on(ERROR, this.errorReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.removeListener(ERROR, this.errorReturned);
  }

  connected = () => {
    const account = store.getStore("account");
    this.setState({
      account: account,
    });
  };

  disconnected = () => {
    const account = "";
    this.setState({
      account: account,
    });
  };

  render() {
    const { classes } = this.props;
    const { account, tools, snackbarMessage } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Grid container spacing={2}>
            <Grid id="bigTools" item xs={9}>
              {this.renderBig(tools)}
            </Grid>
            <Grid
              className={classes.miniUI}
              item
              xs={3}
              style={{ height: "max-content" }}
            >
              {this.renderMini(tools)}
            </Grid>
          </Grid>
        )}
        {snackbarMessage && this.renderSnackbar()}
      </div>
    );
  }

  renderMini = (tools) => {
    const { classes } = this.props;
    // console.log(tools);

    // check if tools active are Mini or Big
    // only render the needed for the section
    let activeTools = {};
    Object.keys(tools).forEach(function (key) {
      const toolSize = key.split("_")[1];
      if (toolSize === "MINI") {
        // console.log(key, tools[key]);

        //Check if tool is active or not
        if (tools[key]) {
          activeTools[key] = tools[key];
        }
      }
    });
    return (
      <div id="miniUI">
        <Suspense
          fallback={
            <div style={{ textAlign: "center" }}>
              <Card className={classes.favCard} elevation={3}>
                <CircularProgress />
              </Card>
            </div>
          }
        >
          <ProfileMini />
          {activeTools.longShort_MINI && <LongShortMini />}
          {activeTools.leaderboard_MINI && <LeaderboardMini />}
        </Suspense>
      </div>
    );
  };

  renderBig = (tools) => {
    // console.log(tools);
    const { classes } = this.props;

    // check if tools active are Mini or Big
    // only render the needed for the section
    let activeTools = {};
    Object.keys(tools).forEach(function (key) {
      const toolSize = key.split("_")[1];
      if (toolSize === "BIG") {
        // console.log(key, tools[key]);

        //Check if tool is active or not
        if (tools[key]) {
          activeTools[key] = tools[key];
        }
      }
    });

    return (
      <div style={{ minHeight: "100%", display: "flex" }}>
        <Suspense
          fallback={
            <div style={{ textAlign: "center" }}>
              <Card className={classes.favCard} elevation={3}>
                <CircularProgress />
              </Card>
            </div>
          }
        >
          {activeTools.portfolio_BIG && <PortfolioBig />}
        </Suspense>
      </div>
    );
  };

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
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

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Dashboard)));
