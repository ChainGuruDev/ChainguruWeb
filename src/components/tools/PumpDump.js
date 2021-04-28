//Pump and Dump Short term minigame main JS
//Allow users to bet on Tokens going Up or down
//Check result after 24hs since prediction

import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import CoinSearchBar from "../components/CoinSearchBar.js";

//import materialUI elements
import { Grid, Paper } from "@material-ui/core";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
});

class PumpAndDump extends Component {
  constructor() {
    super();

    const account = store.getStore("accont");
    this.state = {
      account: account,
      loading: false,
    };

    if (account && account.address) {
      //TODO GET CURRENT USER PREDICTIONS from DB
    }
  }

  componentDidMount() {
    const account = store.getStore("account");
    //TODO GET CURRENT USER PREDICTIONS from DB
    //Emitter.on(CONSTANT, this."FUNCTIONNAME")
  }

  componentWillUnmount() {
    //emitter.removeListener(CONSTANT, this."FUNCTIONNAME");
  }

  render() {
    const { classes, t } = this.props;
    const { loading, account } = this.state;

    return (
      <div className={classes.root}>
        <Grid container spacing={3} style={{ margin: 10 }}>
          <Grid item xs={6}>
            <Paper className={classes.paper}>PumpAndDump</Paper>
          </Grid>
          <Grid item xs={6}>
            <CoinSearchBar />
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>pump</Paper>
          </Grid>
        </Grid>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(PumpAndDump)));
