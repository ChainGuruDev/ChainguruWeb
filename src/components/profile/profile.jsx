import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import {
  Card,
  Grid,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Avatar,
  Paper,
  Typography,
} from "@material-ui/core";

import Snackbar from "../snackbar";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_NEW_NICKNAME,
  DB_NEW_NICKNAME_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  favCard: {
    padding: 10,
    margin: 30,
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "center",
    maxWidth: "50%",
    background: "rgba(255,255,255,0.05)",
  },
  largeProfile: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    cursor: "pointer",
  },
});

class Profile extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: true,
      loadingBTN: false,
      errorNick: false,
      errorMSG: "",
    };

    if (account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_NEW_NICKNAME_RETURNED, this.dbNewNicknameReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(
      DB_NEW_NICKNAME_RETURNED,
      this.dbNewNicknameReturned
    );
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  dbUserDataReturned = (data) => {
    this.setState({
      loading: false,
      userData: data,
    });
  };

  dbNewNicknameReturned = (data) => {
    if (!data.error) {
      console.log("newNick");
      setTimeout(() => {
        const snackbarObj = {
          snackbarMessage: "Nickname Changed",
          snackbarType: "Success",
        };
        this.setState({
          userData: data,
          loadingBTN: false,
          snackbarMessage: snackbarObj.snackbarMessage,
          snackbarType: snackbarObj.snackbarType,
        });
      });
    } else {
      console.log("error");
      this.setState({
        errorNick: true,
        loadingBTN: false,
        errorMSG: data.message,
      });
    }
  };

  handleNickname = (event) => {
    if (event.target.value.length > 0) {
      this.setState({
        newNickname: event.target.value,
        errorNick: false,
        errorMSG: "",
      });
    } else {
      this.setState({ errorNick: true, errorMSG: "empty nickname not valid" });
    }
  };

  setNickname = () => {
    dispatcher.dispatch({
      type: DB_NEW_NICKNAME,
      nickname: this.state.newNickname,
    });
    this.setState({
      loadingBTN: true,
    });
  };

  renderProfile = () => {
    const { classes, t } = this.props;
    // <Grid container item justify="center" alignItems="center" xs={3}>
    //   <Avatar
    //     alt="avatar"
    //     src="/avatar.jpg"
    //     className={classes.largeProfile}
    //     onClick={() => console.log("clickedProfile")}
    //   />
    // </Grid>
    return (
      <>
        <Grid item xs={12}>
          <Typography style={{ textAlign: "center" }} variant="h3">
            User Profile
          </Typography>
          <Divider />
        </Grid>
        <Grid
          item
          container
          direction="row"
          justify="center"
          alignItems="flex-start"
        >
          <Grid
            style={{
              padding: 10,
            }}
            item
            xs={7}
          >
            <TextField
              id="nickname-field"
              label="Nickname"
              placeholder={this.state.userData.nickname}
              helperText={
                this.state.errorNick
                  ? this.state.errorMSG
                  : "Enter desired nickname/alias"
              }
              fullWidth
              error={this.state.errorNick}
              margin="normal"
              onChange={this.handleNickname}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid
            style={{
              padding: 10,
            }}
            item
            xs={2}
          >
            <Button
              color="primary"
              variant="outlined"
              onClick={() => this.setNickname()}
              disabled={this.state.errorNick || this.state.loadingBTN}
            >
              {!this.state.loadingBTN && "Change"}
              {this.state.loadingBTN && <CircularProgress />}
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };
  // <Grid item xs={12}>
  //   <Paper className={classes.paper}>wallet y sus nicks</Paper>
  // </Grid>
  render() {
    const { classes, t } = this.props;
    const { account, loading, snackbarMessage } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Card className={classes.favCard} elevation={3}>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={3}
            >
              {loading && "Cargando"}
              {!loading && this.renderProfile()}
            </Grid>
          </Card>
        )}
        {snackbarMessage && this.renderSnackbar()}
      </div>
    );
  }
  nav = (screen) => {
    this.props.history.push(screen);
  };

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
  };
}

export default withRouter(withStyles(styles)(Profile));
