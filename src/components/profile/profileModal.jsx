import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Card,
  Grid,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Avatar,
  IconButton,
  Typography,
  Tooltip,
} from "@material-ui/core";

import Snackbar from "../snackbar";
import AvatarSelectModal from "./avatarSelectModal.js";
import CloseIcon from "@material-ui/icons/Close";
import EditRoundedIcon from "@material-ui/icons/EditRounded";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_NEW_NICKNAME,
  DB_NEW_NICKNAME_RETURNED,
  DB_NEW_AVATAR_RETURNED,
  LOGIN_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    height: "auto",
    display: "flex",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    position: "absolute",
    right: "12px",
    top: "12px",
    cursor: "pointer",
  },
  favCard: {
    padding: 10,
    margin: 30,
    display: "flex",
    flex: 1,
    alignItems: "flex-start",
    maxWidth: "50%",
    height: "100%",
    background: "rgba(255,255,255,0.05)",
  },
  largeProfile: {
    transition: "all .35s",
    width: "100px",
    height: "100px",
    opacity: 1,
  },
  avatarContainer: {
    cursor: "pointer",
    maxWidth: "fit-content",
    borderRadius: 50,
    "&:hover": {
      "& $largeProfile": {
        opacity: "0.3",
      },
      "& $overlay": {
        opacity: 1,
      },
    },
  },
  overlay: {
    transform: "scale(1.25)",
    transition: "all .35s",
    position: "absolute",
    opacity: 0,
    zIndex: 200,
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: 20,
    width: 700,
    height: "fit-content",
    position: "absolute",
    padding: "0px 15px",
  },
});

class ProfileEditModal extends Component {
  constructor(props) {
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
    emitter.on(LOGIN_RETURNED, this.loginReturned);
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
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    console.log("disconnected");
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
    const { closeModal } = this.props;
    if (!data.error) {
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
        closeModal();
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
    const { classes, closeModal } = this.props;

    if (!this.state.newNickname) {
      closeModal();
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

  loginReturned = (status) => {
    const { account } = this.state;
    if (status && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  };

  renderProfile = () => {
    const { classes, closeModal } = this.props;
    const { avatar } = this.state;

    return (
      <>
        <Grid style={{ width: "100%" }} item xs={12}>
          <Typography
            style={{ textAlign: "center", marginTop: 10 }}
            variant="h3"
          >
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
          <Tooltip title="Change Profile Picture" arrow>
            <Grid
              container
              item
              justify="center"
              alignItems="center"
              xs={3}
              className={classes.avatarContainer}
              onClick={() => this.setState({ avatarModalOpen: true })}
            >
              <Avatar
                alt="avatar"
                src={avatar}
                className={classes.largeProfile}
              />
              <EditRoundedIcon className={classes.overlay} />
            </Grid>
          </Tooltip>
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
            item
            xs={12}
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "end",
              padding: 10,
            }}
          >
            <Button
              color="secondary"
              variant="outlined"
              onClick={closeModal}
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
    const { classes, modalOpen, closeModal } = this.props;
    const { account, loading, snackbarMessage, avatarModalOpen } = this.state;

    return (
      <Modal
        id="profileModalRoot"
        open={modalOpen}
        onClose={closeModal}
        className={classes.root}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        aria-labelledby="Profile Edit"
        aria-describedby="Profile edit modal"
      >
        <Fade in={modalOpen}>
          <Grid
            className={classes.paper}
            id="profileDetailsGrid"
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={3}
          >
            <IconButton
              className={classes.closeIcon}
              aria-label="close"
              onClick={closeModal}
            >
              <CloseIcon />
            </IconButton>
            {!account.address && <div>CONNECT WALLET</div>}
            {account.address && (
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
            )}
            {avatarModalOpen && this.renderModal()}
            {snackbarMessage && this.renderSnackbar()}
          </Grid>
        </Fade>
      </Modal>
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

export default withRouter(withStyles(styles)(ProfileEditModal));
