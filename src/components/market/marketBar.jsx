import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withRouter, Link } from "react-router-dom";

import { Paper, Typography, Button, Divider } from "@material-ui/core";
import { colors } from "../../theme";
import {
  AVAILABLE_ITEMS_RETURNED,
  ITEMS_CIRCULATING_RETURNED,
  SALES_VALUE_RETURNED,
  ACCOUNT_ROLES_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
} from "../../constants";

import UnlockModal from "../unlock/unlockModal.jsx";

import { withTranslation } from "react-i18next";
import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;

const styles = (theme) => ({
  root: {
    marginTop: 15,
    width: "100%",
    maxWidth: 360,
    minWidth: 200,

    backgroundColor: colors.cardBackground,
  },
  marketBar: {
    flex: 1,

    display: "flex",
    alignItems: "center",
    flexDirection: "column",

    padding: theme.spacing(1),
    textAlign: "center",
  },
  menuItems: {
    padding: 15,
    alignItems: "center",
    textAlign: "left",

    background: colors.cardBackground,
  },
  divider: {
    margin: 15,
  },

  button: {
    minWidth: "100%",
    marginTop: theme.spacing(1),
  },

  link: {
    minWidth: "100%",
    textDecoration: "none",
  },
});

class MarketBar extends Component {
  constructor(props) {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      itemsAvailable: "",
      itemsCirculating: "",
      salesValue: "",
      isAdmin: "",
      isMinter: "",
      isLF: "",
    };
  }
  nav = (screen) => {
    this.props.history.push(screen);
  };

  static async getInitialProps(props) {
    return {
      userAccount: this.props.userAccount,
    };
  }
  componentDidMount() {
    emitter.on(AVAILABLE_ITEMS_RETURNED, this.availableItemsReturned);
    emitter.on(ITEMS_CIRCULATING_RETURNED, this.itemsCirculatingReturned);
    emitter.on(SALES_VALUE_RETURNED, this.salesValueReturned);
    emitter.on(ACCOUNT_ROLES_RETURNED, this.accountRolesReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
  }

  componentWillUnmount() {
    emitter.removeListener(
      AVAILABLE_ITEMS_RETURNED,
      this.availableItemsReturned
    );
    emitter.removeListener(
      ITEMS_CIRCULATING_RETURNED,
      this.itemsCirculatingReturned
    );
    emitter.removeListener(SALES_VALUE_RETURNED, this.salesValueReturned);
    emitter.removeListener(ACCOUNT_ROLES_RETURNED, this.accountRolesReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };
  availableItemsReturned = (payload) => {
    this.setState({ itemsAvailable: payload });
  };

  itemsCirculatingReturned = (payload) => {
    this.setState({ itemsCirculating: payload });
  };
  salesValueReturned = (payload) => {
    this.setState({ salesValue: payload });
  };
  accountRolesReturned = (payload) => {
    this.setState({ isAdmin: payload[0] });
    this.setState({ isMinter: payload[1] });
    this.setState({ isLF: payload[2] });
  };

  render() {
    const { classes, t } = this.props;
    const { userAccount, snackbarMessage } = this.state;
    return (
      <div className={classes.root}>
        <Paper className={classes.menuItems} elevation={3}>
          <Typography className={classes.header}>Total editions</Typography>
          <Typography variant="h3" className={classes.header}>
            {this.props.edition}
          </Typography>
          <Divider className={classes.divider} />
          <Typography className={classes.header}>
            Total items available
          </Typography>
          <Typography variant="h3" className={classes.header}>
            {this.state.itemsAvailable}
          </Typography>

          <Divider className={classes.divider} />
          <Typography className={classes.header}>
            Total items Circulating
          </Typography>
          <Typography variant="h3" className={classes.header}>
            {this.state.itemsCirculating}
          </Typography>
          <Divider className={classes.divider} />
          <Typography className={classes.header}>Total sales in Eth</Typography>
          <Typography variant="h3" className={classes.header}>
            {this.state.salesValue}
          </Typography>
          <Divider className={classes.divider} />
          <Button
            variant="outlined"
            onClick={this.overlayClicked}
            className={classes.button}
            color="primary"
            onClick={() => {
              this.nav(`/user/${this.state.account.address}`);
            }}
          >
            My Items
          </Button>
          <Button
            style={{
              display: !this.state.isLF ? "none" : "block",
            }}
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              this.nav("/edition/new");
            }}
          >
            New Edition
          </Button>
          <Button
            style={{
              display: !this.state.isAdmin ? "none" : "block",
            }}
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              this.nav("/market/adminPanel");
            }}
          >
            Admin Panel
          </Button>
        </Paper>
      </div>
    );
  }
}
export default withTranslation()(withRouter(withStyles(styles)(MarketBar)));
