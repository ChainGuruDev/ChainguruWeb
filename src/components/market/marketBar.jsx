import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";

import { Typography, Button, Divider, Card } from "@material-ui/core";
import { colors } from "../../theme";
import {
  AVAILABLE_ITEMS_RETURNED,
  ITEMS_CIRCULATING_RETURNED,
  SALES_VALUE_RETURNED,
  ACCOUNT_ROLES_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  IS_ALLOWED_RETURNED,
} from "../../constants";

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
    background: "rgba(125,125,125,0.2)",
    border: `2px solid ${colors.cgOrange}`,
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
      isAllowedArtist: false,
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
    emitter.on(IS_ALLOWED_RETURNED, this.isAllowedReturned);
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
    emitter.removeListener(IS_ALLOWED_RETURNED, this.isAllowedReturned);
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

  isAllowedReturned = (payload) => {
    this.setState({ isAllowedArtist: payload });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Card className={classes.menuItems} elevation={3}>
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
            variant="contained"
            className={classes.button}
            color="primary"
            onClick={() => {
              this.nav(`../market/user/${this.state.account.address}`);
            }}
          >
            My Items
          </Button>
          <Button
            style={{
              display: !this.state.isAllowedArtist ? "none" : "block",
            }}
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              this.nav("../market/edition/new");
            }}
          >
            New Edition
          </Button>
          <Button
            style={{
              display: !this.state.isAdmin ? "none" : "block",
            }}
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={() => {
              this.nav("../market/edition/new");
            }}
          >
            Admin New Edition
          </Button>
          <Button
            style={{
              display: !this.state.isAdmin ? "none" : "block",
            }}
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={() => {
              this.nav("../market/adminPanel");
            }}
          >
            Admin Panel
          </Button>
        </Card>
      </div>
    );
  }
}
export default withTranslation()(withRouter(withStyles(styles)(MarketBar)));
