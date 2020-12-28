import React, { Component } from "react";
import { withRouter, useParams } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import {
  Grid,
  GridList,
  Button,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Link,
} from "@material-ui/core";

import GiftModal from "../gift/giftModal.jsx";

import Loader from "../../loader";
import Snackbar from "../../snackbar";
import { colors } from "../../../theme";
import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_EDITION_DETAILS,
  EDITION_DETAILS_RETURNED,
  BUY_RETURNED,
  GET_ACCOUNT_ROLES,
  BUY_EDITION,
  GET_USER_EDITIONS,
  USER_EDITIONS_RETURNED,
} from "../../../constants";

import { withTranslation } from "react-i18next";

import Store from "../../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  background: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: "100%",
    background: "linear-gradient(to top, #3cba92, #68efcf)",
    alignItems: "center",
  },
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: "1920px",
    width: "90%",
    minHeight: "100%",
  },

  gridList: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    padding: 50,

    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
  },
  imageContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  image: {
    display: "flex",
    flex: 1,
    maxWidth: "80%",
  },
  menuBar: {
    minWidth: 200,
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
    marginRight: 15,
    marginBottom: 15,
  },
});

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

class Show extends Component {
  constructor() {
    super();
    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      editionNumber: "",
      editionDetails: [],
      editionToken: [],
      userOwned: false,
      userTokens: [],
    };

    if (account && account.address) {
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
    }
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  componentDidMount() {
    const account = store.getStore("account");

    const _editNumber = this.props.match.params.editionNumber;
    this.setState({ editionNumber: _editNumber });
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(EDITION_DETAILS_RETURNED, this.editionDetailsReturned);
    emitter.on(BUY_RETURNED, this.buyReturned);
    emitter.on(USER_EDITIONS_RETURNED, this.userEditionsReturned);

    if (account && account.address) {
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
      dispatcher.dispatch({
        type: GET_EDITION_DETAILS,
        content: _editNumber,
      });
      dispatcher.dispatch({
        type: GET_USER_EDITIONS,
        content: account.address,
      });
    }
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(
      EDITION_DETAILS_RETURNED,
      this.editionDetailsReturned
    );
    emitter.removeListener(BUY_RETURNED, this.buyReturned);
    emitter.removeListener(USER_EDITIONS_RETURNED, this.userEditionsReturned);
  }

  connectionConnected = () => {
    const { t } = this.props;
    const { editionNumber } = this.state;
    this.setState({ account: store.getStore("account") });
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
    dispatcher.dispatch({
      type: GET_EDITION_DETAILS,
      content: editionNumber,
    });
    dispatcher.dispatch({
      type: GET_USER_EDITIONS,
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
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
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

  editionDetailsReturned = (payload) => {
    this.setState({ editionDetails: payload });
    this.getTokenJson(payload._tokenURI);
  };

  userEditionsReturned = (payload) => {
    const _editNumber = this.props.match.params.editionNumber;
    let _userTokenBalance = payload[0];
    let _userTokens = payload[1];
    let _userTokenDetails = payload[2];
    let _userOwnedEditions = payload[3];
    let _userOwnedTokens = payload[4];
    var userOwned = _userOwnedEditions.includes(_editNumber);
    this.setState({ userOwned });
    this.setState({ userTokens: _userOwnedTokens[_editNumber] });
  };

  getTokenJson = async (url) => {
    let _tokenURI;
    await fetch(url)
      .then(function (response) {
        _tokenURI = response.json();
      })
      .then(function (data) {
        //console.log('JSON from "' + fullurl + '" parsed successfully!');
        //console.log(data.image);
      })
      .catch(function (error) {
        //console.error(error.message);
      });
    this.setState({ editionToken: await _tokenURI });
  };

  buyEdition = (editNum, value) => {
    this.startLoading();
    dispatcher.dispatch({
      type: BUY_EDITION,
      editNum: editNum,
      value: value,
    });
  };

  buyReturned = () => {
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: "Edition Bought",
        snackbarType: "Info",
      };
      that.setState(snackbarObj);
    });
    this.stopLoading();
    dispatcher.dispatch({
      type: GET_EDITION_DETAILS,
      content: this.state.editionNumber,
    });
  };

  startLoading = () => {
    this.setState({ loading: true });
  };
  stopLoading = () => {
    this.setState({ loading: false });
  };

  render() {
    const { classes, t } = this.props;
    const {
      loading,
      modalOpen,
      snackbarMessage,
      editionToken,
      editionDetails,
      userOwned,
    } = this.state;

    return (
      <div className={classes.background}>
        {this.state.account.address && (
          <div className={classes.root}>
            <Grid className={classes.gridList} container>
              <Grid className={classes.imageContainer} item xs={9}>
                <img
                  className={classes.image}
                  alt={editionToken.image}
                  src={editionToken.image}
                ></img>
              </Grid>
              <Grid className={classes.menuBar} item xs={3}>
                <Paper className={classes.menuItems} elevation={3}>
                  <Typography variant="subtitle2">Name:</Typography>
                  <Typography variant="h6">{editionToken.name}</Typography>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography variant="body2">
                    {editionToken.description}
                  </Typography>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2">Artist:</Typography>
                  <ListItem
                    button
                    disableGutters
                    onClick={() => {
                      this.nav(`../artist/${editionDetails._artistAccount}`);
                    }}
                  >
                    <Typography variant="h6">
                      {editionToken.artistName}
                    </Typography>
                  </ListItem>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2">
                    Artist Commission:
                  </Typography>
                  <Typography variant="h6">
                    {editionDetails._artistCommission} %
                  </Typography>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2">Edition:</Typography>
                  <Typography variant="h6">
                    {this.state.editionNumber}
                  </Typography>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2">Price:</Typography>
                  <Typography variant="h6">
                    {editionDetails._priceInWei / 1000000000000000000} eth
                  </Typography>
                  <Divider className={classes.divider} />
                  {editionDetails._maxAvailable -
                    editionDetails._circulatingSupply !=
                    0 && (
                    <Button
                      variant="contained"
                      disabled={loading}
                      onClick={() => {
                        this.buyEdition(
                          this.state.editionNumber,
                          editionDetails._priceInWei
                        );
                      }}
                      size="small"
                      color="primary"
                      className={classes.button}
                    >
                      {loading && <CircularProgress size={24} />}
                      {!loading &&
                        editionDetails._maxAvailable -
                          editionDetails._circulatingSupply >
                          0 &&
                        "Buy"}
                    </Button>
                  )}
                  {userOwned && (
                    <Button
                      variant="contained"
                      disabled={loading}
                      onClick={this.giftEdition}
                      size="small"
                      color="primary"
                      className={classes.button}
                    >
                      {loading && <CircularProgress size={24} />}
                      {!loading && "Gift"}
                    </Button>
                  )}
                  {editionDetails._maxAvailable -
                    editionDetails._circulatingSupply ===
                    0 && (
                    <Button
                      variant="contained"
                      disabled={loading}
                      size="small"
                      color="primary"
                      className={classes.button}
                    >
                      Sold Out
                    </Button>
                  )}
                  {editionDetails._maxAvailable -
                    editionDetails._circulatingSupply !=
                    0 && (
                    <Button
                      variant="contained"
                      disabled
                      size="small"
                      className={classes.button}
                    >
                      {editionDetails._maxAvailable -
                        editionDetails._circulatingSupply}
                      {" / "}
                      {editionDetails._maxAvailable} remaining
                    </Button>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </div>
        )}
        {!this.state.account.address && <div>{t("Wallet.PleaseConnect")}</div>}
        {modalOpen && this.renderModal()}
        {snackbarMessage && this.renderSnackbar()}
      </div>
    );
  }
  giftEdition = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  renderModal = () => {
    return (
      <GiftModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
        editionNumber={this.props.match.params.editionNumber}
        tokens={this.state.userTokens[this.state.userTokens.length - 1]}
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

export default withTranslation()(withRouter(withStyles(styles)(Show)));
