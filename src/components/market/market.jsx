import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import { Grid, GridList, Button } from "@material-ui/core";

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
    background: "linear-gradient(to top, #3cba92, #68efcf)",
  },
  root: {
    maxWidth: "1920px",
    width: "90%",
    alignItems: "center",
  },

  gridList: {
    display: "flex",
    flex: 1,
    justifyContent: "end",
    padding: 40,
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
        content: {},
      });
    }
  }

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(EDITION_RETURNED, this.editionReturned);
    emitter.on(EDITIONS_DETAILS_RETURNED, this.editionDetailsReturned);
    emitter.on(BUY_RETURNED, this.buyReturned);
  }

  componentWillUnmount() {
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
  }

  editionReturned = (curEdit) => {
    this.setState({ curEdit: curEdit });
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
      that.setState(snackbarObj);
    });
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
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
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
          editionNum={index + 1}
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
    const { loading, modalOpen, snackbarMessage } = this.state;

    return (
      <div className={classes.background}>
        <div className={classes.root}>
          {this.state.account.address && (
            <Grid className={classes.gridList} container>
              <GridList
                xs={9}
                cellHeight={200}
                className={classes.gridContainer}
              >
                {this.renderEditions()}
              </GridList>
              <Grid item xs={3}>
                <MarketBar edition={this.state.curEdit} />
              </Grid>
            </Grid>
          )}
          {!this.state.account.address && (
            <div className={classes.connect}>{t("Wallet.PleaseConnect")}</div>
          )}

          {loading && <Loader />}
          {modalOpen && this.renderModal()}
          {snackbarMessage && this.renderSnackbar()}
        </div>
      </div>
    );
  }

  startLoading = () => {
    this.setState({ loading: true });
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
