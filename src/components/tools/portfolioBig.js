import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import {
  Card,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@material-ui/core";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
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
    minHeight: "100%",
  },
  favCard: {
    background: "rgba(255,255,255,0.05)",
  },
});

class PortfolioBig extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: true,
    };

    // IF USER IS CONNECTED GET THE PORTFOLIO DATA
    // if(account && account.address) {
    //   dispatcher.dispatch({
    //     type: DB_GET_USERPORTFOLIO,
    //     address: account.address,
    //   })
    // }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  render() {
    const { classes, t } = this.props;
    const { account, loading } = this.state;

    return <Card className={classes.favCard} elevation={3}></Card>;
  }

  nav = (screen) => {
    console.log(screen);
    this.props.history.push(screen);
  };
}

export default withStyles(styles)(PortfolioBig);
