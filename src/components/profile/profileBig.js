import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";
import {
  getLevel,
  getLevelProgress,
  getCurrentAndNextLevelXP,
} from "../helpers";

import {
  Card,
  Grid,
  Button,
  CircularProgress,
  Avatar,
  Badge,
  Typography,
  Tooltip,
} from "@material-ui/core";

import EditRoundedIcon from "@material-ui/icons/EditRounded";
import ProfileEditModal from "../profile/profileModal.jsx";

import {
  LOGIN_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
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
    marginBottom: "10px",
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "flex-start",
  },
  largeProfile: {
    width: "75px",
    height: "75px",
    zIndex: 1,
    boxShadow: "0px 0px 4px -2px black",
    transition: "all .35s",
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
  levelProgress: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    zIndex: 0,
  },
});

class ProfileBig extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    this.state = {
      account: account,
      loading: true,
      userAvatar: null,
      profileModalOpen: false,
    };

    if (userAuth && account && account.address) {
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
    emitter.on(LOGIN_RETURNED, this.loginReturned);
    emitter.on(DB_NEW_NICKNAME_RETURNED, this.dbUserDataReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DB_NEW_NICKNAME_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  loginReturned = () => {
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");
    if (userAuth && account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  };

  dbUserDataReturned = (data) => {
    if (!data.experiencePoints) {
      data.experiencePoints = 0;
    }

    const userLevel = getLevel(data.experiencePoints);
    const levelProgress = getLevelProgress(data.experiencePoints);
    const currentandrequiredXP = getCurrentAndNextLevelXP(
      data.experiencePoints
    );

    if (data.avatar) {
      let avatar = this.getAvatarType({ avatar: data.avatar });

      this.setState({
        loading: false,
        userData: data,
        avatar: avatar,
        userLevel,
        levelProgress,
        currentandrequiredXP,
      });
    } else {
      this.setState({
        loading: false,
        userData: data,
        userLevel,
        levelProgress,
        currentandrequiredXP,
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

  renderProfile = () => {
    const { classes } = this.props;
    const { avatar } = this.state;

    return (
      <>
        <Grid item container direction="row" alignItems="flex-start">
          <Grid
            container
            item
            style={{
              maxWidth: "max-content",
              filter: `drop-shadow(0px 0px 3px ${colors.cgGreen})`,
            }}
            alignItems="center"
          >
            <Badge
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              overlap="circle"
              badgeContent={this.state.userLevel}
              color="secondary"
              max={99999}
            >
              <Tooltip
                title={
                  <>
                    <Typography color="inherit">
                      Current XP{" "}
                      <Typography variant="inline" color="primary">
                        {this.state.currentandrequiredXP.currentXP}
                      </Typography>
                    </Typography>
                    <Typography color="inherit">
                      XP for next level{" "}
                      <Typography variant="inline" color="primary">
                        {this.state.currentandrequiredXP.nextLevelXP}
                      </Typography>
                    </Typography>
                    <Typography color="inherit">
                      Remaining{" "}
                      <Typography variant="inline" color="primary">
                        {this.state.currentandrequiredXP.neededXP}
                      </Typography>
                    </Typography>
                  </>
                }
                arrow
                placement="bottom"
              >
                <Grid
                  container
                  item
                  justify="center"
                  alignItems="center"
                  className={classes.avatarContainer}
                  onClick={this.profileModalClicked}
                >
                  <Avatar
                    alt="avatar"
                    src={avatar}
                    className={classes.largeProfile}
                  />
                  <EditRoundedIcon className={classes.overlay} />
                </Grid>
              </Tooltip>
              <CircularProgress
                size={85}
                variant="static"
                value={this.state.levelProgress}
                className={classes.levelProgress}
                style={{ transform: "rotate(-90deg)" }}
              />
            </Badge>
          </Grid>
          {this.state.userData.nickname && (
            <Grid
              style={{
                marginLeft: 20,
                filter: `drop-shadow(1px 1px 1px rgba(0,0,0,0.5))`,
              }}
              item
            >
              <Typography color="primary" variant={"h3"}>
                {this.state.userData.nickname}
              </Typography>
            </Grid>
          )}
          {!this.state.userData.nickname && (
            <Grid style={{ marginLeft: 10, alignSelf: "center" }} item>
              <Button
                variant={"outlined"}
                color={"primary"}
                onClick={this.profileModalClicked}
              >
                Set Profile
              </Button>
            </Grid>
          )}
        </Grid>
      </>
    );
  };
  // <Grid item xs={12}>
  //   <Paper className={classes.paper}>wallet y sus nicks</Paper>
  // </Grid>
  render() {
    const { classes } = this.props;
    const { loading, profileModalOpen } = this.state;

    return (
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
          {profileModalOpen && this.renderProfileModal()}
        </Grid>
      </Card>
    );
  }
  nav = (screen) => {
    this.props.history.push(screen);
  };

  profileModalClicked = () => {
    this.setState({ profileModalOpen: true });
  };

  closeProfileModal = () => {
    this.setState({ profileModalOpen: false });
  };

  renderProfileModal = () => {
    return (
      <ProfileEditModal
        closeModal={this.closeProfileModal}
        modalOpen={this.state.profileModalOpen}
      />
    );
  };
}

export default withRouter(withStyles(styles)(ProfileBig));
