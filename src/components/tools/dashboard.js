// main user Dashboard
// allow users to check their wallet performance
// have minitools for different sections and minigames

import React, { Component, Suspense } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

import { Grid } from "@material-ui/core";
import ProfileMini from "../profile/profileMini.js";

import { CONNECTION_CONNECTED, CONNECTION_DISCONNECTED } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

// Import requiredTools
// It will be modular in the future
//TODO IMPORT portfolio BIG ui
const LeaderboardMini = React.lazy(() =>
  import("../leaderboard/leaderboardMini.js")
);
const LongShortMini = React.lazy(() => import("./longShortMini.js"));

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
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
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.disconnected);
  }

  connected = () => {
    const account = store.getStore("account");
    this.setState({
      account: account,
    });

    // dispatcher.dispatch({
    //   type: DB_GET_USER_LS,
    //   address: account.address,
    // });
  };

  disconnected = () => {
    const account = "";
    this.setState({
      account: account,
    });
  };

  render() {
    const { classes } = this.props;
    const { account, loading, tools } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Grid container>
            <Grid item xs={9}>
              {this.renderBig(tools)}
            </Grid>
            <Grid item xs={3}>
              <ProfileMini />
              {this.renderMini(tools)}
            </Grid>
          </Grid>
        )}
      </div>
    );
  }

  renderMini = (tools) => {
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
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          {activeTools.longShort_MINI && <LongShortMini />}
          {activeTools.leaderboard_MINI && <LeaderboardMini />}
        </Suspense>
      </div>
    );
  };

  renderBig = (tools) => {
    // console.log(tools);

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
    // return (
    //   <div>
    //     <Suspense fallback={<div>Loading...</div>}>
    //       <section>
    //         {activeTools.leaderboard_MINI && <LeaderboardMini />}
    //       </section>
    //     </Suspense>
    //   </div>
    // );
  };

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Dashboard)));
