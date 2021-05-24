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
import AvatarSelectModal from "./avatarSelectModal.js";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_NEW_NICKNAME,
  DB_NEW_NICKNAME_RETURNED,
  DB_NEW_AVATAR_RETURNED,
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
    width: "100px",
    height: "100px",
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
      avatarModalOpen: false,
      userAvatar: null,
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
    emitter.on(DB_NEW_AVATAR_RETURNED, this.dbNewAvatarReturned);
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
    emitter.removeListener(DB_NEW_AVATAR_RETURNED, this.dbNewAvatarReturned);
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  dbUserDataReturned = (data) => {
    if (data.avatar) {
      let avatar = this.getAvatarType({ avatar: data.avatar });

      this.setState({
        loading: false,
        userData: data,
        avatar: avatar,
      });
    } else {
      this.setState({
        loading: false,
        userData: data,
      });
    }
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

  getAvatarType = (data) => {
    // userData.avatar starts with local_ or custom_
    // depending which one load local avatars or custom user
    let avatar;
    if (data != null) {
      if (data.avatar) {
        var line = data.avatar;
        var pieces = line.split("_");
        avatar = {
          type: pieces[0],
          name: pieces[1],
        };
      }
    }

    let currentAvatar = null;
    if (avatar) {
      if (avatar.type === "local") {
        switch (avatar.name) {
          case "1":
            currentAvatar = "/AvatarBeta/avatar-01.png";
            break;
          case "2":
            currentAvatar = "/AvatarBeta/avatar-02.png";
            break;
          case "3":
            currentAvatar = "/AvatarBeta/avatar-03.png";
            break;
          case "4":
            currentAvatar = "/AvatarBeta/avatar-04.png";
            break;
          case "5":
            currentAvatar = "/AvatarBeta/avatar-05.png";
            break;
          case "6":
            currentAvatar = "/AvatarBeta/avatar-06.png";
            break;
          case "7":
            currentAvatar = "/AvatarBeta/avatar-07.png";
            break;
          case "8":
            currentAvatar = "/AvatarBeta/avatar-08.png";
            break;
          default:
        }
      } else if (avatar.type === "custom") {
        currentAvatar = avatar.name;
        //TODO ADD LOGIC TO POINT TO USER CUSTOM UPLOADED PICTURE
      } else {
        currentAvatar = "/avatar.jpg";
      }
    } else {
      currentAvatar = "/avatar.jpg";
    }

    return currentAvatar;
  };

  dbNewAvatarReturned = (data) => {
    if (!data.error) {
      let avatar = this.getAvatarType(data);
      this.setState({
        loading: false,
        userData: data,
        avatar: avatar,
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
    if (!this.state.newNickname) {
      console.log(this.state.newNickname);
      this.props.history.goBack();
    }
    dispatcher.dispatch({
      type: DB_NEW_NICKNAME,
      nickname: this.state.newNickname,
    });
    this.setState({
      loadingBTN: true,
    });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  renderProfile = () => {
    const { classes, t } = this.props;
    const { avatar } = this.state;

    return (
      <>
        <Grid style={{ width: "100%" }} item xs={12}>
          <Typography style={{ textAlign: "center" }} variant="h3">
            User Profile
          </Typography>
          <Divider />
        </Grid>
        <Grid
          item
          container
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
        >
          <Grid
            style={{ minWidth: "120px" }}
            container
            item
            justify="center"
            alignItems="center"
            xs={3}
          >
            <Avatar
              alt="avatar"
              src={avatar}
              className={classes.largeProfile}
              onClick={() => this.setState({ avatarModalOpen: true })}
            />
          </Grid>
          <Grid
            style={{
              padding: 10,
            }}
            item
            xs={8}
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
            xs={12}
            style={{ marginTop: 10, display: "flex", justifyContent: "end" }}
          >
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => this.goBack()}
              style={{ marginRight: 10 }}
            >
              {!this.state.loadingBTN && "Back"}
              {this.state.loadingBTN && <CircularProgress />}
            </Button>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => this.setNickname()}
              disabled={this.state.errorNick || this.state.loadingBTN}
            >
              {!this.state.loadingBTN && "Save"}
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
    const { account, loading, snackbarMessage, avatarModalOpen } = this.state;

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
              {loading && (
                <Grid style={{ padding: 25 }}>
                  <CircularProgress />
                </Grid>
              )}
              {!loading && this.renderProfile()}
            </Grid>
          </Card>
        )}
        {avatarModalOpen && this.renderModal()}
        {snackbarMessage && this.renderSnackbar()}
      </div>
    );
  }
  nav = (screen) => {
    this.props.history.push(screen);
  };

  closeModal = () => {
    this.setState({ avatarModalOpen: false });
  };

  renderModal = () => {
    return (
      <AvatarSelectModal
        closeModal={this.closeModal}
        modalOpen={this.state.avatarModalOpen}
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

export default withRouter(withStyles(styles)(Profile));
