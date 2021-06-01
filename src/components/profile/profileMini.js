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

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
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
    margin: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "flex-start",
    background: "rgba(255,255,255,0.05)",
  },
  largeProfile: {
    width: "75px",
    height: "75px",
  },
});

class ProfileMini extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: true,
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
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
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

  renderMiniProfile = () => {
    const { classes, t } = this.props;
    const { avatar } = this.state;

    return (
      <>
        <Grid item container direction="row" alignItems="flex-start">
          <Grid
            container
            item
            style={{ maxWidth: "max-content" }}
            alignItems="center"
          >
            <Avatar
              alt="avatar"
              src={avatar}
              className={classes.largeProfile}
              onClick={() => this.setState({ avatarModalOpen: true })}
            />
          </Grid>
          {this.state.userData.nickname && (
            <Grid style={{ marginLeft: 10 }} item>
              <Typography color="primary" variant={"h3"}>
                {this.state.userData.nickname}
              </Typography>
              <Typography variant={"h5"}>
                xp: {this.state.userData.experiencePoints}
              </Typography>
            </Grid>
          )}
          {!this.state.userData.nickname && (
            <Grid style={{ marginLeft: 10 }} item>
              <Button
                variant={"outlined"}
                color={"primary"}
                onClick={() => {
                  this.nav("../user/profile");
                }}
                style={{ marginLeft: 10 }}
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
    const { classes, t } = this.props;
    const { account, loading, avatarModalOpen } = this.state;

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
          {!loading && this.renderMiniProfile()}
        </Grid>
      </Card>
    );
  }
  nav = (screen) => {
    console.log(screen);
    this.props.history.push(screen);
  };
}

export default withRouter(withStyles(styles)(ProfileMini));
