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

import Loader from "../../loader";
import Snackbar from "../../snackbar";
import { colors } from "../../../theme";
import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_ARTIST_EDITIONS,
  BUY_RETURNED,
  GET_ACCOUNT_ROLES,
  EDITIONS_DETAILS_RETURNED,
  ARTIST_EDITIONS_RETURNED,
} from "../../../constants";

import { withTranslation } from "react-i18next";

import ArtistEditions from "./artistEditions";
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
    padding: 50,

    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
  },
  gridContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
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

class ArtistShow extends Component {
  constructor() {
    super();
    const account = store.getStore("account");
    this.state = {
      artistName: "",
      account: account,
      loading: false,
      artistAccount: "",
      artistEditions: [],
      editionDetails: [],
      editionToken: [],
      tokenURI: [],
      itemsSold: 0,
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

    const _artistAccount = this.props.match.params.artistAccount;
    this.setState({ artistAccount: _artistAccount });
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(BUY_RETURNED, this.buyReturned);
    emitter.on(EDITIONS_DETAILS_RETURNED, this.editionDetailsReturned);
    emitter.on(ARTIST_EDITIONS_RETURNED, this.artistEditionsReturned);

    if (account && account.address) {
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
      dispatcher.dispatch({
        type: GET_ARTIST_EDITIONS,
        content: _artistAccount,
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
    emitter.removeListener(BUY_RETURNED, this.buyReturned);
    emitter.removeListener(
      EDITIONS_DETAILS_RETURNED,
      this.editionDetailsReturned
    );
    emitter.removeListener(
      ARTIST_EDITIONS_RETURNED,
      this.artistEditionsReturned
    );
  }

  connectionConnected = () => {
    const { t } = this.props;
    const { artistAccount } = this.state;
    this.setState({ account: store.getStore("account") });
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
    dispatcher.dispatch({
      type: GET_ARTIST_EDITIONS,
      content: artistAccount,
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

  buyReturned = () => {
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: "Edition Bought",
        snackbarType: "Info",
      };
      that.setState(snackbarObj);
    });
    dispatcher.dispatch({
      type: GET_ARTIST_EDITIONS,
      content: this.state.artistAccount,
    });
  };

  startLoading = () => {
    this.setState({ loading: true });
  };
  stopLoading = () => {
    this.setState({ loading: false });
  };

  editionDetailsReturned = (editions) => {
    this.setState({ editionDetails: editions });
    this.getTokenJson(editions[editions.length - 1]._tokenURI);
    let _itemsSold = 0;
    editions.map((edition, index) => {
      _itemsSold += parseInt(
        this.state.editionDetails[index]._circulatingSupply
      );
      if (index === this.state.editionDetails.length - 1) {
        this.setState({ itemsSold: _itemsSold });
      }
    });
  };

  artistEditionsReturned = (artistEdit) => {
    this.setState({ artistEditions: artistEdit });
  };

  renderEditions = (editionDetails) => {
    return editionDetails.map((edition, index) => {
      return (
        <ArtistEditions
          key={index}
          editionNum={this.state.artistEditions[index]}
          //tokenURI={this.state.editionsDetails[index]._tokenURI}
          details={this.state.editionDetails[index]}
          //description={web3.utils.toAscii(edition._editionData)}
          //imageURL=""
        />
      );
    });
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
    this.setState({ tokenURI: await _tokenURI });
  };

  render() {
    const { classes, t } = this.props;
    const { loading, modalOpen, snackbarMessage, artistName } = this.state;
    return (
      <div className={classes.background}>
        <div className={classes.root}>
          {this.state.account.address && (
            <Grid className={classes.gridList}>
              <GridList
                xs={9}
                cellHeight={200}
                className={classes.gridContainer}
              >
                {this.renderEditions(this.state.editionDetails)}
              </GridList>
              <Grid className={classes.menuBar} item xs={3}>
                <Paper className={classes.menuItems} elevation={3}>
                  <Typography variant="subtitle2">Name:</Typography>
                  <Typography variant="h6">
                    {this.state.tokenURI.artistName}
                  </Typography>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2">Editions Created:</Typography>
                  <Typography variant="h6">
                    {this.state.editionDetails.length}
                  </Typography>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2">Items Sold:</Typography>
                  <Typography variant="h6">{this.state.itemsSold}</Typography>
                  <Divider className={classes.divider} />

                  <Button
                    variant="outlined"
                    onClick={() => {
                      this.nav("../market");
                    }}
                    size="small"
                    color="primary"
                    className={classes.button}
                  >
                    Market
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
          {!this.state.account.address && (
            <div>{t("Wallet.PleaseConnect")}</div>
          )}

          {snackbarMessage && this.renderSnackbar()}
        </div>
      </div>
    );
  }

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
  };
}

export default withTranslation()(withRouter(withStyles(styles)(ArtistShow)));
