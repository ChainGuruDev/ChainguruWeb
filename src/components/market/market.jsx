import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import { Grid, GridList } from "@material-ui/core";

//import ItemCard from "../components/itemCard";
import RenderEditions from "./renderEditions";
import Loader from "../loader";
import UnlockModal from "../unlock/unlockModal.jsx";
import Snackbar from "../snackbar";
import MarketBar from "./marketBar";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_CURRENTEDITION,
  EDITION_RETURNED,
  GET_EDITIONS_DETAILS,
  EDITIONS_DETAILS_RETURNED,
  BUY_RETURNED,
  GET_AVAILABLE_ITEMS,
  GET_ITEMS_CIRCULATING,
  GET_SALES_VALUE,
  GET_ACCOUNT_ROLES,
  IS_ALLOWED_ARTIST,
  MAX_EDIT_SIZE_RETURNED,
  GET_MAX_EDITIONSIZE,
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
    Width: "100%",
    minHeight: "100%",
    alignItems: "center",
  },
  root: {
    maxWidth: "1920px",
    width: "90%",
    alignItems: "center",
    display: "flex",
  },

  gridList: {
    display: "flex",
    flex: 1,
    justifyContent: "end",
    padding: 20,
  },
  connect: {
    minWidth: "100%",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    marginTop: "5%",
  },
  gridContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
  },
});

const validChainId = ["0x4", "4"]; //ONLY VALID FOR RINKEBY FOR NOW

class Market extends Component {
  constructor() {
    super();
    const account = store.getStore("account");
    const web3 = store.getStore("web3context");
    const chainId = store.getStore("chainId");
    this._isMounted = false;

    this.state = {
      editionsDetails: [],
      account: account,
      loading: true,
      tJSON: {},
      curEdit: "",
      maxEditSize: "",
      web3context: web3,
      chainId: chainId,
    };
    if (account && account.address && validChainId.includes(chainId)) {
      dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
      dispatcher.dispatch({ type: GET_MAX_EDITIONSIZE, content: {} });
      dispatcher.dispatch({ type: GET_AVAILABLE_ITEMS, content: {} });
      dispatcher.dispatch({ type: GET_ITEMS_CIRCULATING, content: {} });
      dispatcher.dispatch({ type: GET_SALES_VALUE, content: {} });
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
      dispatcher.dispatch({
        type: IS_ALLOWED_ARTIST,
        content: {},
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && emitter.on(ERROR, this.errorReturned);
    this._isMounted &&
      emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    this._isMounted &&
      emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    this._isMounted && emitter.on(EDITION_RETURNED, this.editionReturned);
    this._isMounted &&
      emitter.on(EDITIONS_DETAILS_RETURNED, this.editionDetailsReturned);
    this._isMounted && emitter.on(BUY_RETURNED, this.buyReturned);
    this._isMounted && emitter.on(MAX_EDIT_SIZE_RETURNED, this.maxEditSize);
  }

  componentWillUnmount() {
    this._isMounted = false;
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(EDITION_RETURNED, this.editionReturned);
    emitter.removeListener(
      EDITIONS_DETAILS_RETURNED,
      this.editionDetailsReturned
    );
    emitter.removeListener(BUY_RETURNED, this.buyReturned);
    emitter.removeListener(MAX_EDIT_SIZE_RETURNED, this.maxEditSize);
  }

  maxEditSize = (payload) => {
    this._isMounted && this.setState({ maxEditSize: payload });
  };

  editionReturned = (curEdit) => {
    this._isMounted && this.setState({ curEdit: curEdit, loading: false });
    let editions = [];
    for (var i = 0; i < this.state.curEdit; i++) {
      editions.push(i);
    }
    dispatcher.dispatch({ type: GET_EDITIONS_DETAILS, content: { editions } });
  };

  buyReturned = () => {
    dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
    dispatcher.dispatch({ type: GET_AVAILABLE_ITEMS, content: {} });
    dispatcher.dispatch({ type: GET_ITEMS_CIRCULATING, content: {} });
    dispatcher.dispatch({ type: GET_SALES_VALUE, content: {} });

    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: "Edition Bought",
        snackbarType: "Info",
      };
      that.setState({ snackbarObj, loading: false });
    });
  };

  editionDetailsReturned = (editions) => {
    this._isMounted &&
      this.setState({ editionsDetails: editions, loading: false });
  };

  connectionConnected = () => {
    const { t } = this.props;

    this.setState({
      account: store.getStore("account"),
      web3context: store.getStore("web3context"),
      chainId: store.getStore("chainId"),
    });
    let chainId = store.getStore("chainId");
    console.log(chainId);
    if (chainId != null) {
      console.log("llegamos");
      if (validChainId.includes(chainId)) {
        dispatcher.dispatch({ type: GET_MAX_EDITIONSIZE, content: {} });
        dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
        dispatcher.dispatch({ type: GET_AVAILABLE_ITEMS, content: {} });
        dispatcher.dispatch({ type: GET_ITEMS_CIRCULATING, content: {} });
        dispatcher.dispatch({ type: GET_SALES_VALUE, content: {} });
        dispatcher.dispatch({
          type: GET_ACCOUNT_ROLES,
          content: {},
        });
        dispatcher.dispatch({
          type: IS_ALLOWED_ARTIST,
          content: {},
        });

        const that = this;
        setTimeout(() => {
          const snackbarObj = {
            snackbarMessage: t("Unlock.WalletConnected"),
            snackbarType: "Info",
          };
          that.setState(snackbarObj);
        });
      } else {
        const that = this;
        setTimeout(() => {
          const snackbarObj = {
            snackbarMessage: "PLEASE SWITCH TO RINKEBY TESTNET AND RECONNECT",
            snackbarType: "Info",
          };
          that.setState(snackbarObj);
        });
      }
    }
  };

  connectionDisconnected = () => {
    this.setState({
      account: store.getStore("account"),
      web3context: store.getStore("web3context"),
      chainId: store.getStore("chainId"),
    });

    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
  };

  renderEditions = () => {
    return this.state.editionsDetails.map((edition, index) => {
      return (
        <RenderEditions
          key={index}
          editionNum={(index + 1) * this.state.maxEditSize}
          //tokenURI={this.state.editionsDetails[index]._tokenURI}
          details={this.state.editionsDetails[index]}
          //description={web3.utils.toAscii(edition._editionData)}
          //imageURL=""
        />
      );
    });
  };

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState({ snackbarObj: snackbarObj, loading: false });
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
    dispatcher.dispatch({
      type: IS_ALLOWED_ARTIST,
      content: this.state.account.address,
    });
  }

  render() {
    const { classes, t } = this.props;
    const { loading, modalOpen, snackbarMessage } = this.state;

    const chainId = store.getStore("chainId");

    if (this.state.account.address != null) {
      if (validChainId.includes(chainId) === true) {
        if (this.state.loading) {
          dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
          dispatcher.dispatch({ type: GET_MAX_EDITIONSIZE, content: {} });
          dispatcher.dispatch({ type: GET_AVAILABLE_ITEMS, content: {} });
          dispatcher.dispatch({ type: GET_ITEMS_CIRCULATING, content: {} });
          dispatcher.dispatch({ type: GET_SALES_VALUE, content: {} });
          dispatcher.dispatch({
            type: GET_ACCOUNT_ROLES,
            content: {},
          });
          dispatcher.dispatch({
            type: IS_ALLOWED_ARTIST,
            content: {},
          });
        }
      }
    }
    return (
      <Grid className={classes.background}>
        {this.state.account.address != null && validChainId.includes(chainId) && (
          <Grid className={classes.gridList} container>
            <GridList xs={9} cellHeight={200} className={classes.gridContainer}>
              {this.renderEditions()}
            </GridList>
            <Grid item xs={3}>
              <MarketBar edition={this.state.curEdit} />
            </Grid>
          </Grid>
        )}
        {this.state.account.address != null &&
          !validChainId.includes(chainId) && (
            <div className={classes.connect}>
              PLEASE SWITCH TO RINKEBY TESTNET AND RECONNECT
            </div>
          )}
        {!this.state.account.address && (
          <div className={classes.connect}>{t("Wallet.PleaseConnect")}</div>
        )}

        {loading && <Loader />}
        {modalOpen && this.renderModal()}
        {snackbarMessage && this.renderSnackbar()}
      </Grid>
    );
  }

  startLoading = () => {
    if (!this.state.loading) {
      this.setState({ loading: true });
    }
  };
  stopLoading = () => {
    this.setState({ loading: false });
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
