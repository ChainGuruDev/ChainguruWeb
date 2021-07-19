import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import {
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  TextField,
} from "@material-ui/core";
import { colors } from "../../theme";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import CancelRoundedIcon from "@material-ui/icons/CancelRounded";

import Loader from "../loader";
import UnlockModal from "../unlock/unlockModal.jsx";
import Snackbar from "../snackbar";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  CHECK_ACCOUNT_RETURNED,
  CHECK_ROLES,
  CHECK_ROLES_RETURNED,
  SET_ROLES,
  REVOKE_ROLES,
  SET_ALLOWED_ARTIST,
  ALLOWED_ARTIST_RETURNED,
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
  adminPanel: {
    minWidth: "75%",
    padding: 20,
    alignItems: "center",
  },
  textInput: {
    align: "center",
    minWidth: "90%",
    marginLeft: "5%",
  },
  button: {
    align: "center",
  },
  roleActive: {
    color: colors.green,
  },
  role: {
    color: colors.red,
  },
  buttons: {
    width: "100%",
    padding: 20,
  },
});

class AdminPanel extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      accountAddress: "",
      artistAddress: "",
      isAdmin: false,
      isMinter: false,
      isLF: false,
    };

    if (account && account.address) {
    }
  }

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(CHECK_ROLES_RETURNED, this.accountRolesReturned);
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(ALLOWED_ARTIST_RETURNED, this.allowedArtistReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(CHECK_ROLES_RETURNED, this.accountRolesReturned);
    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.removeListener(ALLOWED_ARTIST_RETURNED, this.allowedArtistReturned);
  }

  connectionConnected = () => {
    const { t } = this.props;

    this.setState({ account: store.getStore("account") });

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

  handleAccount = (event) => {
    this.setState({
      accountAddress: event.target.value,
    });
  };

  handleArtistAccount = (event) => {
    this.setState({
      artistAddress: event.target.value,
    });
  };

  checkAccountReturned = (_isAccount) => {
    if (!_isAccount) {
      this.setState({ errMsgArtistAccount: "Not a valid ethereum address" });
    } else {
      this.setState({
        errMsgArtistAccount: "Artist's ethereum Wallet address.",
      });
    }
    this.setState({
      errorArtistAccount: !_isAccount,
    });
  };

  accountRolesReturned = (payload) => {
    this.setState({ isAdmin: payload[0] });
    this.setState({ isMinter: payload[1] });
    this.setState({ isLF: payload[2] });
    this.setState({ loading: false });
  };

  getRoles = async () => {
    dispatcher.dispatch({
      type: CHECK_ROLES,
      content: this.state.accountAddress,
    });
  };

  setRoleAdmin = async () => {
    this.setState({ loading: true });

    dispatcher.dispatch({
      type: SET_ROLES,
      account: this.state.accountAddress,
      role: 1,
    });
  };

  setRoleMinter = async () => {
    this.setState({ loading: true });

    dispatcher.dispatch({
      type: SET_ROLES,
      account: this.state.accountAddress,
      role: 2,
    });
  };

  setRoleLFCrew = async () => {
    this.setState({ loading: true });

    dispatcher.dispatch({
      type: SET_ROLES,
      account: this.state.accountAddress,
      role: 3,
    });
  };

  revokeRoleAdmin = async () => {
    this.setState({ loading: true });

    dispatcher.dispatch({
      type: REVOKE_ROLES,
      account: this.state.accountAddress,
      role: 1,
    });
  };

  revokeRoleMinter = async () => {
    this.setState({ loading: true });

    dispatcher.dispatch({
      type: REVOKE_ROLES,
      account: this.state.accountAddress,
      role: 2,
    });
  };

  revokeRoleLFCrew = async () => {
    this.setState({ loading: true });

    dispatcher.dispatch({
      type: REVOKE_ROLES,
      account: this.state.accountAddress,
      role: 3,
    });
  };

  allowArtist = async () => {
    this.setState({ loading: true });

    dispatcher.dispatch({
      type: SET_ALLOWED_ARTIST,
      account: this.state.artistAddress,
      enabled: true,
    });
  };

  disallowArtist = async () => {
    this.setState({ loading: true });
    dispatcher.dispatch({
      type: SET_ALLOWED_ARTIST,
      account: this.state.artistAddress,
      enabled: false,
    });
  };

  allowedArtistReturned = async (payload) => {
    const { t } = this.props;

    this.setState({ loading: false });

    const that = this;
    if (payload) {
      setTimeout(() => {
        const snackbarObj = {
          snackbarMessage: t("Admin.AllowArtist"),
          snackbarType: "Info",
        };
        that.setState(snackbarObj);
      });
    } else {
      setTimeout(() => {
        const snackbarObj = {
          snackbarMessage: t("Admin.ArtistNotAllowed"),
          snackbarType: "Info",
        };
        that.setState(snackbarObj);
      });
    }
  };

  render() {
    const { classes, t } = this.props;
    const { loading, snackbarMessage } = this.state;

    return (
      <div className={classes.background}>
        <div className={classes.root}>
          {this.state.account.address && (
            <Paper className={classes.adminPanel} elevation={3}>
              <Grid>
                <Typography align="center" variant="h3">
                  Account Roles
                </Typography>
                <Divider variant="middle" />
                <form
                  className={classes.adminPanel}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    className={classes.textInput}
                    id="AccountCheck"
                    label="Account"
                    onChange={this.handleAccount}
                    error={this.state.errorRoleAccount}
                  />
                </form>
                <Grid
                  justify="space-evenly"
                  container
                  alignItems="center"
                  padding="5"
                >
                  <Button
                    variant="contained"
                    component="span"
                    style={{
                      backgroundColor: this.state.isAdmin
                        ? colors.green
                        : colors.red,
                    }}
                  >
                    {this.state.isAdmin && "Admin"}
                    {!this.state.isAdmin && "Not Admin"}
                  </Button>
                  <Button
                    variant="contained"
                    component="span"
                    style={{
                      backgroundColor: this.state.isMinter
                        ? colors.green
                        : colors.red,
                    }}
                  >
                    {this.state.isMinter && "Minter"}
                    {!this.state.isMinter && "Not Minter"}
                  </Button>
                  <Button
                    variant="contained"
                    component="span"
                    style={{
                      backgroundColor: this.state.isLF
                        ? colors.green
                        : colors.red,
                    }}
                  >
                    {this.state.isLF && "LF Crew"}
                    {!this.state.isLF && "Not LF"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component="span"
                    onClick={this.getRoles}
                    disabled={this.state.loading}
                    className={classes.button}
                  >
                    Check Roles
                  </Button>
                </Grid>
                <Divider style={{ marginTop: 20 }} variant="middle" />
                <Grid
                  className={classes.buttons}
                  justify="space-evenly"
                  container
                  alignItems="center"
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="span"
                    onClick={this.setRoleAdmin}
                    disabled={this.state.loading}
                    className={classes.button}
                  >
                    Set Admin
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="span"
                    onClick={this.setRoleMinter}
                    disabled={this.state.loading}
                    className={classes.button}
                  >
                    Set Minter
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="span"
                    onClick={this.setRoleLFCrew}
                    disabled={this.state.loading}
                    className={classes.button}
                  >
                    Set LF Crew
                  </Button>
                </Grid>
                <Grid
                  className={classes.buttons}
                  justify="space-evenly"
                  container
                  alignItems="center"
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="span"
                    onClick={this.revokeRoleAdmin}
                    disabled={this.state.loading}
                    className={classes.button}
                  >
                    Revoke Admin
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="span"
                    onClick={this.revokeRoleMinter}
                    disabled={this.state.loading}
                    className={classes.button}
                  >
                    Revoke Minter
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="span"
                    onClick={this.revokeRoleLFCrew}
                    disabled={this.state.loading}
                    className={classes.button}
                  >
                    Revoke LF Crew
                  </Button>
                </Grid>
                <Divider variant="middle" />
                <Typography
                  style={{ marginTop: 20 }}
                  align="center"
                  variant="h3"
                >
                  Setup Seller
                </Typography>
                <Divider variant="middle" />
                <form
                  className={classes.adminPanel}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    className={classes.textInput}
                    id="ArtistAccount"
                    label="Artist Account"
                    onChange={this.handleArtistAccount}
                    error={this.state.errorArtistAccount}
                  />
                </form>
                <Grid
                  justify="space-evenly"
                  container
                  alignItems="center"
                  padding="5"
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    className={classes.button}
                    startIcon={<AddCircleRoundedIcon />}
                    onClick={this.allowArtist}
                    disabled={this.state.loading}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<CancelRoundedIcon />}
                    onClick={this.disallowArtist}
                    disabled={this.state.loading}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
          {!this.state.account.address && (
            <div>{t("Wallet.PleaseConnect")}</div>
          )}

          {loading && <Loader />}
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

export default withTranslation()(withRouter(withStyles(styles)(AdminPanel)));
