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
  DB_GET_LEADERBOARD,
  DB_GET_LEADERBOARD_RETURNED,
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
  firstProfile: {
    width: "75px",
    height: "75px",
  },
  largeProfile: {
    width: "50px",
    height: "50px",
  },
});

class LeaderboardMini extends Component {
  constructor() {
    super();

    this.state = {
      loading: true,
      leaderboard: [],
    };
    dispatcher.dispatch({
      type: DB_GET_LEADERBOARD,
    });
  }

  componentDidMount() {
    emitter.on(DB_GET_LEADERBOARD_RETURNED, this.dbGetLeaderboardReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(
      DB_GET_LEADERBOARD_RETURNED,
      this.dbGetLeaderboardReturned
    );
  }

  dbGetLeaderboardReturned = (data) => {
    this.setState({ loading: false, leaderboard: data });
  };

  drawLeaderboard = (data) => {
    const { classes } = this.props;
    if (data.length > 0) {
      //LIMIT TOP 5
      let leaderboardData = data.length > 10 ? data.slice(0, 10) : data;
      return leaderboardData.map((user, i) => (
        <>
          <Grid
            item
            container
            direction="row"
            alignItems="flex-start"
            style={{ padding: "10px", maxWidth: "80%" }}
          >
            <Grid
              container
              item
              style={{ maxWidth: "max-content" }}
              alignItems="center"
            >
              <Avatar
                alt="avatar"
                src={this.getAvatarType(user)}
                className={
                  i === 0 ? classes.firstProfile : classes.largeProfile
                }
              />
            </Grid>
            {user.nickname && (
              <Grid style={{ marginLeft: 10 }} item>
                <Typography color="primary" variant={i === 0 ? "h6" : "h4"}>
                  {user.nickname}
                </Typography>
                <Typography color="secondary" variant={"body2"}>
                  xp: {user.experiencePoints}
                </Typography>
              </Grid>
            )}
            {!user.nickname && (
              <Grid style={{ marginLeft: 10 }} item>
                Anon User
              </Grid>
            )}
          </Grid>
          <Divider />
        </>
      ));
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

  render() {
    const { classes, t } = this.props;
    const { loading } = this.state;

    return (
      <Card
        className={classes.favCard}
        style={{ maxHeight: "max-content" }}
        elevation={3}
      >
        <Grid container direction="column" justifyContent="center" spacing={3}>
          {loading && (
            <Grid
              alignItems="center"
              justifyContent="center"
              style={{
                padding: 25,
                justifyContent: "center",
                display: "flex",
              }}
            >
              <CircularProgress />
            </Grid>
          )}
          {!loading && (
            <Grid style={{ display: "contents" }} justifyContent="center">
              <Typography
                style={{
                  marginTop: 10,
                  justifyContent: "center",
                  display: "flex",
                }}
                color={"primary"}
                variant={"h6"}
              >
                Leaderboard
              </Typography>
              <Divider />
              {this.drawLeaderboard(this.state.leaderboard)}
            </Grid>
          )}
        </Grid>
      </Card>
    );
  }
}

export default withRouter(withStyles(styles)(LeaderboardMini));
