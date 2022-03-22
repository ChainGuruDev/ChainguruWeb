import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";

import { timeConversion } from "../helpers";

import {
  Card,
  Grid,
  Divider,
  CircularProgress,
  Avatar,
  Typography,
} from "@material-ui/core";

import {
  DB_GET_LEADERBOARD,
  DB_GET_LEADERBOARD_RETURNED,
  DB_GET_LEADERBOARD_MINIGAME,
  DB_CHECK_LS_RESULT_RETURNED,
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
    margin: "10px 0px",
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "flex-start",
  },
  firstProfile: {
    width: "75px",
    height: "75px",
  },
  largeProfile: {
    width: "50px",
    height: "50px",
  },
  leaderboard: {
    width: "100%",
    maxHeight: 740,
    scrollbarWidth: "thin",
    overflowY: "auto",
    scrollbarColor: "rgb(121, 216, 162) rgba(48, 48, 48, 0.5)",
    "&::-webkit-scrollbar": {
      width: 7,
      backgroundColor: "rgba(48, 48, 48, 0.5)",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgb(121, 216, 162)",
      borderRadius: 20,
    },
  },
});

class LeaderboardMini extends Component {
  constructor(props) {
    super(props);

    const minigame = props.minigame;

    const seasonStart = new Date(Date.parse("07-Mar-2022".replace(/-/g, " ")));
    const seasonEnd = new Date(seasonStart);
    seasonEnd.setMonth(seasonEnd.getMonth() + 1);

    const dateNow = new Date();
    const timeRemaining = timeConversion(seasonEnd - dateNow);

    this.state = {
      timeRemaining: timeRemaining,
      loading: true,
      leaderboard: null,
      currentUser: null,
      minigame: "longShort",
    };
  }

  componentDidMount() {
    emitter.on(DB_GET_LEADERBOARD_RETURNED, this.dbGetLeaderboardReturned);

    dispatcher.dispatch({
      type: DB_GET_LEADERBOARD_MINIGAME,
      minigameID: this.state.minigame,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(
      DB_GET_LEADERBOARD_RETURNED,
      this.dbGetLeaderboardReturned
    );
  }

  dbGetLeaderboardReturned = (data) => {
    this.setState({
      loading: false,
      leaderboard: data.leaderboard,
      currentUser: data.currentUser,
    });
  };

  drawLeaderboard = (data) => {
    const { classes } = this.props;
    const { currentUser, minigame } = this.state;
    let userHasPlayed = false;
    let userInTop10 = false;
    let currentUserIndex = null;

    if (currentUser) {
      var userIndex = data.findIndex(
        (x) => x.nickname === currentUser.nickname
      );
      if (data[userIndex]) {
        userHasPlayed = true;

        if (userIndex < 10) {
          userInTop10 = true;
        }

        data[userIndex].user = true;
        currentUser.user = true;
        currentUser.position = userIndex + 1;
      }
    }

    if (data.length > 0) {
      //LIMIT TOP 10
      if (userHasPlayed && !userInTop10) {
        // const leaderboardTop10 = data.length > 10 ? data.slice(0, 9) : data;
        const leaderboardTop10 = data;
        // leaderboardTop10.push(currentUser);
        return leaderboardTop10.map((user, i) => (
          <li
            key={`${user}_${i}`}
            style={{
              display: "inherit",
              minWidth: "100%",
              marginLeft: "-20px",
              paddingLeft: "10px",

              background: user.user
                ? "linear-gradient(90deg, rgba(121, 216, 162, 0.2) 0%, rgba(0,0,0, 0) 50%)"
                : "",
            }}
          >
            <Grid
              item
              container
              direction="row"
              alignItems="flex-start"
              style={{ padding: "10px" }}
            >
              <Grid
                container
                item
                style={{
                  maxWidth: "max-content",
                  filter:
                    i === 0
                      ? `drop-shadow(0px 0px 3px ${colors.cgGreen})`
                      : `drop-shadow(0px 0px 3px ${colors.black})`,
                }}
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
                <Grid
                  style={{
                    marginLeft: 10,
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.25))",
                  }}
                  item
                >
                  <Typography color="primary" variant={i === 0 ? "h4" : "h5"}>
                    {user.nickname}
                  </Typography>
                  <Typography color="secondary" variant={"body2"}>
                    xp:{" "}
                    {user.user
                      ? user.minigames.longShort.experiencePoints
                      : user.experiencePoints}
                  </Typography>
                </Grid>
              )}
              {!user.nickname && (
                <Grid
                  style={{
                    marginLeft: 10,
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.25))",
                  }}
                  item
                >
                  <Typography color="primary" variant={i === 0 ? "h4" : "h5"}>
                    Anon user
                  </Typography>
                  <Typography color="secondary" variant={"body2"}>
                    xp: {user.experiencePoints}
                  </Typography>
                </Grid>
              )}
              <Grid style={{ margin: "0 0 0 auto", alignSelf: "center" }} item>
                <Typography
                  variant={i === 0 ? "h2" : "h3"}
                  color={i === 0 ? "primary" : "inherit"}
                >
                  {user.position}
                </Typography>
              </Grid>
            </Grid>
            <Divider />
          </li>
        ));
      } else {
        // const leaderboardTop10 = data.length > 10 ? data.slice(0, 10) : data;
        const leaderboardTop10 = data;

        return leaderboardTop10.map((user, i) => (
          <li
            key={`${user}_${i}`}
            style={{
              display: "inherit",
              minWidth: "100%",
              marginLeft: "-20px",
              paddingLeft: "10px",
              background: user.user
                ? "linear-gradient(90deg, rgba(121, 216, 162, 0.2) 0%, rgba(0,0,0, 0) 50%)"
                : "",
            }}
          >
            <Grid
              item
              container
              direction="row"
              alignItems="flex-start"
              style={{ padding: "10px" }}
            >
              <Grid
                container
                item
                style={{
                  maxWidth: "max-content",
                  filter:
                    i === 0
                      ? `drop-shadow(0px 0px 3px ${colors.cgGreen})`
                      : `drop-shadow(0px 0px 3px ${colors.black})`,
                }}
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
                <Grid
                  style={{
                    marginLeft: 10,
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.25))",
                  }}
                  item
                >
                  <Typography color="primary" variant={i === 0 ? "h4" : "h5"}>
                    {user.nickname}
                  </Typography>
                  <Typography color="secondary" variant={"body2"}>
                    xp: {user.experiencePoints}
                  </Typography>
                </Grid>
              )}
              {!user.nickname && (
                <Grid
                  style={{
                    marginLeft: 10,
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.25))",
                  }}
                  item
                >
                  <Typography color="primary" variant={i === 0 ? "h4" : "h5"}>
                    Anon user
                  </Typography>
                  <Typography color="secondary" variant={"body2"}>
                    xp: {user.experiencePoints}
                  </Typography>
                </Grid>
              )}
              <Grid style={{ margin: "0 0 0 auto", alignSelf: "center" }} item>
                <Typography
                  variant={i === 0 ? "h2" : "h3"}
                  color={i === 0 ? "primary" : "initial"}
                >
                  {user.position}
                </Typography>
              </Grid>
            </Grid>
            <Divider />
          </li>
        ));
      }
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
    const { classes } = this.props;
    const { loading, leaderboard } = this.state;
    const darkMode = store.getStore("theme") === "dark" ? true : false;

    return (
      <Card
        className={classes.favCard}
        style={{ maxHeight: "max-content" }}
        elevation={3}
      >
        <Grid
          container
          direction="column"
          spacing={3}
          style={{ margin: "0px" }}
        >
          {loading && (
            <Grid
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
            <Grid style={{ display: "grid", justifyItems: "center" }}>
              <div
                style={{
                  background: darkMode
                    ? `${colors.cgGreen}15`
                    : `${colors.black}15`, //CG COLOR GREEN 25% opacity
                  paddingBottom: "5px",
                  maxWidth: "inherit",
                  position: "relative",
                  minWidth: "150%",
                  filter: "blur(1px)",
                  overflow: "hidden",
                  margin: "0px",
                  minHeight: "50px",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  textAlign: "center",
                  filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))",
                }}
              >
                <Typography color={"primary"} variant={"h2"}>
                  Leaderboard
                </Typography>
              </div>
              {this.state.timeRemaining && (
                <Grid>
                  <Typography variant="h4" color="primary">
                    Season ends in {this.state.timeRemaining}
                  </Typography>
                </Grid>
              )}
              <div className={classes.leaderboard}>
                {this.drawLeaderboard(leaderboard)}
              </div>
            </Grid>
          )}
        </Grid>
      </Card>
    );
  }
}

export default withRouter(withStyles(styles)(LeaderboardMini));
