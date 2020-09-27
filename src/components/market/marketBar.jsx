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
} from "../../constants";

import UnlockModal from "../unlock/unlockModal.jsx";

import { withTranslation } from "react-i18next";
import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;

const styles = (theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
  },
  marketBar: {
    flex: 1,

    display: "flex",
    alignItems: "center",
    flexDirection: "column",

    padding: theme.spacing(1),
    textAlign: "center",
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
  }

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

  walletClick = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  renderModal = () => {
    return (
      <UnlockModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
      />
    );
  };

  render() {
    const { classes, t } = this.props;
    const { modalOpen, snackbarMessage } = this.state;
    return (
      <Paper className={classes.root} elevation={5}>
        <div className={classes.marketBar}>
          <Typography className={classes.header}>Total editions</Typography>
          <Typography variant="h3" className={classes.header}>
            {this.props.edition}
          </Typography>
        </div>
        <Divider flexItem light />
        <div className={classes.marketBar}>
          <Typography className={classes.header}>
            Total items available
          </Typography>
          <Typography variant="h3" className={classes.header}>
            {this.state.itemsAvailable}
          </Typography>
        </div>

        <Divider flexItem light />
        <div className={classes.marketBar}>
          <Typography className={classes.header}>
            Total items Circulating
          </Typography>
          <Typography variant="h3" className={classes.header}>
            {this.state.itemsCirculating}
          </Typography>
        </div>
        <Divider flexItem light />
        <div className={classes.marketBar}>
          <Typography className={classes.header}>Total sales in Eth</Typography>
          <Typography variant="h3" className={classes.header}>
            {this.state.salesValue}
          </Typography>
        </div>
        <Divider flexItem light />
        <div className={classes.marketBar}>
          <Button
            variant="contained"
            onClick={this.overlayClicked}
            color="primary"
            className={classes.button}
          >
            My Items
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              this.nav("/edition/new");
            }}
          >
            New Edition
          </Button>
          <Link
            to="/edition/new"
            className={classes.link}
            style={{
              display: !this.state.isAdmin ? "none" : "block",
            }}
          ></Link>

          <Button
            variant="contained"
            style={{
              display: !this.state.isMinter ? "none" : "block",
            }}
            onClick={this.overlayClicked}
            color="primary"
            className={classes.button}
          >
            do minter stuff
          </Button>
          <Button
            variant="contained"
            style={{
              display: !this.state.isLF ? "none" : "block",
            }}
            onClick={this.overlayClicked}
            color="primary"
            className={classes.button}
          >
            LF Crew
          </Button>
          {modalOpen && this.renderModal()}
        </div>
      </Paper>
    );
  }
}
export default withTranslation()(withRouter(withStyles(styles)(MarketBar)));
