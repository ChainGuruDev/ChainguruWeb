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
  GET_USER_EDITIONS,
  BUY_RETURNED,
  GET_ACCOUNT_ROLES,
  GET_ARTIST_EDITIONS_DETAILS,
  EDITIONS_DETAILS_RETURNED,
  USER_EDITIONS_RETURNED,
} from "../../../constants";

import { withTranslation } from "react-i18next";

import UserEditions from "./userEditions";
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

class User extends Component {
  constructor() {
    super();
    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      userAccount: "",
      userEditions: [],
      editionDetails: [],
      editionToken: [],
      tokenURI: [],
      userTokens: {},
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

    const _userAccount = this.props.match.params.userAccount;
    this.setState({ userAccount: _userAccount });
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(EDITIONS_DETAILS_RETURNED, this.editionDetailsReturned);
    emitter.on(USER_EDITIONS_RETURNED, this.userEditionsReturned);

    if (account && account.address) {
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
      dispatcher.dispatch({
        type: GET_USER_EDITIONS,
        content: _userAccount,
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
      EDITIONS_DETAILS_RETURNED,
      this.editionDetailsReturned
    );
    emitter.removeListener(USER_EDITIONS_RETURNED, this.userEditionsReturned);
  }

  connectionConnected = () => {
    const { t } = this.props;
    const { userAccount } = this.state;
    this.setState({ account: store.getStore("account") });
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
    dispatcher.dispatch({
      type: GET_USER_EDITIONS,
      content: userAccount,
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

  startLoading = () => {
    this.setState({ loading: true });
  };
  stopLoading = () => {
    this.setState({ loading: false });
  };

  editionDetailsReturned = (editions) => {
    this.setState({ editionDetails: editions });
    //this.getTokenJson(editions[editions.length - 1]._tokenURI);
  };

  userEditionsReturned = (payload) => {
    let _userTokenBalance = payload[0];
    let _userTokens = payload[1];
    let _userTokenDetails = payload[2];
    let _userOwnedEditions = payload[3];
    let _userOwnedTokens = payload[4];
    this.setState({ userTokens: _userOwnedTokens });
    this.setState({ userEditions: _userOwnedEditions });
  };

  renderEditions = (edition) => {
    if (this.state.editionDetails.length > 0) {
      return edition.map((edit, index) => {
        return (
          <UserEditions
            key={index}
            editionNum={edition[index]}
            //tokenURI={this.state.editionsDetails[index]._tokenURI}
            details={this.state.editionDetails[index]}
            //description={web3.utils.toAscii(edition._editionData)}
            owned={this.state.userTokens[edition[index]]}
          />
        );
      });
    } else {
    }
  };

  getTokenJson = async (url) => {
    let _tokenURI;
    await fetch(url)
      .then(async function (response) {
        _tokenURI = await response.json();
      })
      .then(function (data) {
        //console.log('JSON from "' + fullurl + '" parsed successfully!');
        //console.log(data.image);
      })
      .catch(function (error) {
        //console.error(error.message);
      });
    console.log(_tokenURI);
    this.setState({ tokenURI: await _tokenURI });
  };

  render() {
    const { classes, t } = this.props;
    const { loading, modalOpen, snackbarMessage } = this.state;
    return (
      <div className={classes.background}>
        <div className={classes.root}>
          {!this.state.userTokens.isEmpty && (
            <Grid className={classes.gridList}>
              <GridList
                xs={9}
                cellHeight={200}
                className={classes.gridContainer}
              >
                {""}
                {this.renderEditions(this.state.userEditions)}
              </GridList>
              <Grid className={classes.menuBar} item xs={3}>
                <Paper className={classes.menuItems} elevation={3}></Paper>
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

export default withTranslation()(withRouter(withStyles(styles)(User)));
