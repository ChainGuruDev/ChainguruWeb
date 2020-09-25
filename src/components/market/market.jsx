import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import {
  Grid,
  GridList,
  GridListTileBar,
  StarBorderIcon,
  tileData,
  Card,
  Paper,
  Typography,
} from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import AccountBalanceWalletRoundedIcon from "@material-ui/icons/AccountBalanceWalletRounded";

//import ItemCard from "../components/itemCard";
import RenderEditions from "./renderEditions";
//import MarketBar from "../components/marketBar";
//import MarketHeader from "../components/marketHeader";
//import web3 from "../ethereum/web3Ganache.js";
//import Web3Modal from "web3modal";
//import lfOriginals from "../ethereum/lfOriginals.js";
import web3 from "web3";
import Loader from "../loader";
import UnlockModal from "../unlock/unlockModal.jsx";
import Snackbar from "../snackbar";
import { colors } from "../../theme";
import MarketBar from "./marketBar";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_CURRENTEDITION,
  EDITION_RETURNED,
  GET_EDITION_DETAILS,
  EDITION_DETAILS_RETURNED,
  BUY_RETURNED,
  GET_AVAILABLE_ITEMS,
  GET_ITEMS_CIRCULATING,
  GET_SALES_VALUE,
  GET_ACCOUNT_ROLES,
} from "../../constants";

import { withTranslation } from "react-i18next";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  background: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: "100%",
    minHeight: "100vh",

    alignItems: "center",
    background: "linear-gradient(to top, #3cba92, #68efcf)",
  },
  root: {
    marginTop: "40px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: "1000px",
    width: "90%",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(10),
    textAlign: "center",
  },
  paperHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",

    padding: theme.spacing(1),
    borderRadius: "35px",
  },
  header: {
    marginLeft: "auto",
  },
  buttonWallet: {
    marginLeft: "auto",
    borderRadius: "35px",
  },
  gridList: {
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
    minWidth: "75%",

    maxWidth: "75%",
  },
  titleBar: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
});

class Market extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      editionsDetails: [],
      account: account,
      loading: false,
      tJSON: {},
      curEdit: "",
    };

    if (account && account.address) {
      dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
      dispatcher.dispatch({ type: GET_AVAILABLE_ITEMS, content: {} });
      dispatcher.dispatch({ type: GET_ITEMS_CIRCULATING, content: {} });
      dispatcher.dispatch({ type: GET_SALES_VALUE, content: {} });
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: account.address,
      });
    }
  }

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(EDITION_RETURNED, this.editionReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(EDITION_RETURNED, this.editionReturned);
  }

  editionReturned = (curEdit) => {
    const { t } = this.props;
    this.setState({ curEdit: curEdit });
  };

  editionDetailsReturned = (editions) => {
    this.setState({ editionsDetails: editions });
  };

  connectionConnected = () => {
    const { t } = this.props;

    this.setState({ account: store.getStore("account") });

    dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
    dispatcher.dispatch({ type: GET_AVAILABLE_ITEMS, content: {} });
    dispatcher.dispatch({ type: GET_ITEMS_CIRCULATING, content: {} });
    dispatcher.dispatch({ type: GET_SALES_VALUE, content: {} });
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: this.state.account.address,
    });

    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: t("Unlock.WalletConnected"),
        snackbarType: "Info",
      };
      that.setState(snackbarObj);
    });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  renderEditions = () => {
    for (var i = 0; i < this.state.curEdit; i++) {
      return (
        <RenderEditions
          key={i}
          editionNum={i + 1}
          //title="Remeras"
          //author={edition._artistAccount}
          //description={web3.utils.toAscii(edition._editionData)}
          //  imageURL=""
        />
      );
    }
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

  refresh() {
    this.renderEditions();
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: this.state.account.address,
    });
  }

  render() {
    const { classes, t } = this.props;
    const { account, loading, modalOpen, snackbarMessage } = this.state;
    var address = null;
    if (account.address) {
      address =
        account.address.substring(0, 6) +
        "..." +
        account.address.substring(
          account.address.length - 4,
          account.address.length
        );
    }

    return (
      <div className={classes.background}>
        <div className={classes.root}>
          <Grid justify="space-evenly" container spacing={3}>
            <Grid item xs={12}></Grid>
            <GridList
              item
              xs={9}
              cellHeight={200}
              container
              spacing={3}
              className={classes.gridList}
            >
              {this.renderEditions()}
            </GridList>
            <Grid item xs={3}>
              <MarketBar
                account={this.state.account}
                edition={this.state.curEdit}
              />
            </Grid>
          </Grid>
          {modalOpen && this.renderModal()}
          {snackbarMessage && this.renderSnackbar()}
          {loading && <Loader />}
        </div>
      </div>
    );
  }

  startLoading = () => {
    this.setState({ loading: true });
  };

  renderModal = () => {
    return (
      <UnlockModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
      />
    );
  };

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Market)));
