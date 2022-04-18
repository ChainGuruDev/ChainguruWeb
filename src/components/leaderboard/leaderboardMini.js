import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";

import { timeConversion, getLongShortSeasonData } from "../helpers";
import { ReactComponent as GenesisPlayerIcon } from "../../assets/genesis.svg";
import { ReactComponent as GenesisTop3Icon } from "../../assets/genesisTop3.svg";
import { ReactComponent as TrophyLSIcon } from "../../assets/trophyLS.svg";
import { ReactComponent as MedalLSIcon } from "../../assets/medalLS.svg";

import {
  Card,
  Grid,
  Divider,
  CircularProgress,
  Avatar,
  Typography,
  Tooltip,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
  Badge,
} from "@material-ui/core";

import LocalActivityIcon from "@material-ui/icons/LocalActivity";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import {
  DB_GET_LEADERBOARD,
  DB_GET_LEADERBOARD_RETURNED,
  DB_GET_LEADERBOARD_MINIGAME,
  DB_CHECK_LS_RESULT_RETURNED,
  DB_GET_USER_LS_SEASON_DATA,
  DB_GET_USER_LS_SEASON_DATA_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
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
  activeForecastLogo: {
    width: "35px",
    height: "35px",
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
  genesisIcon: {
    width: 30,
    height: 30,
    marginLeft: 5,
    "&.pos1": {
      width: 45,
      height: 45,
      fill: "goldenrod",
    },
    "&.pos2": {
      width: 40,
      height: 40,
      fill: "lightgray",
    },
    "&.pos3": {
      width: 35,
      height: 35,
      fill: "chocolate",
    },
  },
  lsSeasonIcon: {
    width: 25,
    height: 25,
    fill: "black",
    marginLeft: 5,
    "&.pos1": {
      width: 35,
      height: 35,
      fill: "goldenrod",
    },
    "&.pos2": {
      width: 30,
      height: 30,
      fill: "lightgray",
    },
    "&.pos3": {
      width: 25,
      height: 25,
      fill: "chocolate",
    },
  },
});

class LeaderboardMini extends Component {
  constructor(props) {
    super(props);

    const minigame = props.minigame;

    const lsSeasonData = getLongShortSeasonData();

    this.state = {
      timeRemaining: lsSeasonData.timeRemaining,
      loading: true,
      leaderboard: null,
      currentUser: null,
      minigame: "longShort",
      validMinigames: ["longShort", "global"],
      currentSeason: lsSeasonData.currentSeason,
      validSeasons: ["genesis", 1, 2],
      season: lsSeasonData.currentSeason,
      anchorElRankingType: null,
      newSeasonEnabled: lsSeasonData.currentSeason === 2 ? true : false,
      loadingUserSeasonData: true,
      hoverUserSeasonData: null,
    };
  }

  componentDidMount() {
    emitter.on(DB_GET_LEADERBOARD_RETURNED, this.dbGetLeaderboardReturned);
    emitter.on(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.activePositionDataReturned
    );
    emitter.on(
      DB_GET_USER_LS_SEASON_DATA_RETURNED,
      this.lsUserSeasonDataReturned
    );
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
    emitter.removeListener(
      DB_GET_USER_LS_SEASON_DATA_RETURNED,
      this.lsUserSeasonDataReturned
    );
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.activePositionDataReturned
    );
  }

  dbGetLeaderboardReturned = (data) => {
    this.setState({
      loading: false,
      leaderboard: data.leaderboard,
      currentUser: data.currentUser,
    });
  };

  drawUserLSSeasonAwards = (user) => {
    const { classes } = this.props;
    if (user.minigames.lsSeasons.length > 0) {
      return user.minigames.lsSeasons.map((item, i) => (
        <>
          <Tooltip
            arrow
            title={
              <>
                <Typography variant={"subtitle1"} color="primary">
                  {item.position === 1
                    ? `Season ${item.season} Winner`
                    : `Season ${item.season} Player`}
                </Typography>
                <Typography>
                  Position:{" "}
                  <Typography variant="inline" color="primary">
                    {item.position}
                  </Typography>
                </Typography>
                <Typography>
                  XP Gained:{" "}
                  <Typography variant="inline" color="primary">
                    {item.experiencePoints}
                  </Typography>
                </Typography>
                <Typography>
                  Bull/Bear:{" "}
                  <Typography variant="inline" color="primary">
                    {item.stats.bullBearProfile}
                  </Typography>
                </Typography>
                <Typography>
                  Guru Profile:{" "}
                  <Typography variant="inline" color="primary">
                    {item.stats.guruProfile}
                  </Typography>
                </Typography>
                <Typography>
                  Correct Forecasts:{" "}
                  <Typography variant="inline" color="primary">
                    {item.stats.totalCorrectPercent}%{" "}
                    {item.stats.totalPredictionsGood}/
                    {item.stats.totalPredictions}
                  </Typography>
                </Typography>
              </>
            }
            placement="bottom"
          >
            <div style={{ display: "inline" }}>
              {item.position > 3 && (
                <MedalLSIcon className={classes.lsSeasonIcon} />
              )}
              {item.position <= 3 && (
                <TrophyLSIcon
                  className={`${classes.lsSeasonIcon} pos${item.position}`}
                />
              )}
            </div>
          </Tooltip>
        </>
      ));
    }
  };

  handleLeaveProfile = () => {
    dispatcher.dispatch({
      type: "DB_GET_USER_LS_SEASON_DATA",
      cancelRequest: true,
    });
    this.setState({
      userLSSeasonData: null,
      loadingUserSeasonData: true,
    });
  };

  lsUserSeasonDataReturned = (data) => {
    let tokenIDs = [];
    for (var i = 0; i < data.activePositions.length; i++) {
      tokenIDs.push(data.activePositions[i].tokenId);
    }
    if (tokenIDs.length > 0) {
      dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: tokenIDs,
        versus: "usd",
        lsType: "userActivePositions",
      });
    }
    this.setState({
      hoverUserSeasonData: data,
    });
  };

  activePositionDataReturned = (data) => {
    if (data[1] === "userActivePositions") {
      let hoveredUserData = { ...this.state.hoverUserSeasonData };
      const tokenData = data[0];
      let activePositions = [];
      if (tokenData.length > 0) {
        for (var i = 0; i < tokenData.length; i++) {
          const extraTokenData = {
            name: tokenData[i].name,
            tokenId: tokenData[i].id,
            image: tokenData[i].image,
            symbol: tokenData[i].symbol,
          };
          activePositions.push(extraTokenData);
        }
      }

      for (var i = 0; i < activePositions.length; i++) {
        const tokenIndex = hoveredUserData.activePositions.findIndex(
          (arrayItem) => arrayItem.tokenId === activePositions[i].tokenId
        ); // 1
        if (tokenIndex !== -1) {
          hoveredUserData.activePositions[tokenIndex].name =
            activePositions[i].name;
          hoveredUserData.activePositions[tokenIndex].image =
            activePositions[i].image;
          hoveredUserData.activePositions[tokenIndex].symbol =
            activePositions[i].symbol;
        }
      }
      this.setState({
        hoverUserSeasonData: hoveredUserData,
        loadingUserSeasonData: false,
      });
    }
  };

  drawCombo = (number, type, ls) => {
    if (number > 7 && type !== "combo") {
      number = 7;
    }
    const comboMax = 7;
    const remaining = comboMax - number;
    const combo = [];

    if (type === "combo") {
      if (number > 7) {
        combo.push(
          <Typography color="primary" variant={"h4"}>
            {number} (2x Bonus Active)
          </Typography>
        );
      } else {
        for (var i = 0; i < number; i++) {
          combo.push(
            <CheckCircleIcon
              key={`active_${i}`}
              fontSize="small"
              color={ls === "long" ? "primary" : "secondary"}
            />
          );
        }
        for (var l = 0; l < remaining; l++) {
          combo.push(
            <RadioButtonUncheckedIcon
              key={`unchecked_${l}`}
              fontSize="small"
              color="disabled"
            />
          );
        }
      }
    } else {
      for (var j = 0; j < number; j++) {
        combo.push(
          <RadioButtonCheckedIcon
            key={`checked_${j}`}
            fontSize="small"
            color="primary"
          />
        );
      }
      for (var k = 0; k < remaining; k++) {
        combo.push(
          <RadioButtonUncheckedIcon
            key={`checked_left${k}`}
            fontSize="small"
            color="disabled"
          />
        );
      }
    }
    return combo;
  };

  drawLeaderboard = (data) => {
    const { classes } = this.props;
    const {
      currentUser,
      minigame,
      season,
      hoverUserSeasonData,
      loadingUserSeasonData,
    } = this.state;
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
            alignItems="center"
            style={{ padding: "10px" }}
          >
            <Grid
              container
              item
              style={{
                maxWidth: "max-content",
                marginLeft: 5,
                filter:
                  i === 0
                    ? `drop-shadow(0px 0px 3px ${colors.cgGreen})`
                    : `drop-shadow(0px 0px 3px ${colors.black})`,
              }}
              alignItems="center"
              onMouseEnter={() =>
                dispatcher.dispatch({
                  type: "DB_GET_USER_LS_SEASON_DATA",
                  nickname: user.nickname,
                  season:
                    minigame === "longShort" ? this.state.currentSeason : null,
                })
              }
              onMouseLeave={this.handleLeaveProfile}
            >
              <Tooltip
                title={
                  !loadingUserSeasonData ? (
                    <>
                      <Typography
                        variant="h4"
                        style={{ textAlign: "center" }}
                        color="primary"
                      >
                        {minigame === "longShort"
                          ? "Season Stats"
                          : "Global Stats"}
                      </Typography>
                      <Divider />
                      <Typography color="inherit">
                        Guru Level{" "}
                        <Typography variant="inherit" color="primary">
                          {hoverUserSeasonData.stats.guruProfile}
                        </Typography>
                      </Typography>
                      <Typography color="inherit">
                        Total Forecasts{" "}
                        <Typography variant="inherit" color="primary">
                          {hoverUserSeasonData.stats.totalPredictions}
                        </Typography>
                      </Typography>
                      <Typography color="inherit">
                        Correct Forecasts{" "}
                        <Typography variant="inherit" color="primary">
                          {hoverUserSeasonData.stats.totalCorrectPercent}% (
                          {hoverUserSeasonData.stats.totalPredictionsGood}/
                          {hoverUserSeasonData.stats.totalPredictions})
                        </Typography>
                      </Typography>
                      <Divider variant="middle" />
                      <Typography color="inherit">
                        Bull/Bear Level{" "}
                        <Typography variant="inherit" color="primary">
                          {hoverUserSeasonData.stats.bullBearProfile}
                        </Typography>
                      </Typography>
                      {hoverUserSeasonData.stats.bullRatio >
                      hoverUserSeasonData.stats.bearRatio ? (
                        <Typography color="inherit">
                          {hoverUserSeasonData.stats.bullRatio}%{" "}
                          <Typography variant="inherit" color="primary">
                            Bull
                          </Typography>
                        </Typography>
                      ) : (
                        <Typography color="inherit">
                          {hoverUserSeasonData.stats.bearRatio}%{" "}
                          <Typography variant="inherit" color="primary">
                            Bear
                          </Typography>
                        </Typography>
                      )}
                      <Typography color="inherit">
                        Total Longs{" "}
                        <Typography variant="inherit" color="primary">
                          {hoverUserSeasonData.stats.totalLongs}
                        </Typography>
                      </Typography>
                      <Typography color="inherit">
                        Total Shorts{" "}
                        <Typography variant="inherit" color="primary">
                          {hoverUserSeasonData.stats.totalShorts}
                        </Typography>
                      </Typography>
                      <Divider variant="middle" />
                      <Typography
                        variant="h4"
                        style={{ textAlign: "center", marginTop: 5 }}
                        color="primary"
                      >
                        Active Forecasts
                      </Typography>
                      <Grid
                        item
                        container
                        direction={"row"}
                        justify={"space-around"}
                        style={{ marginBottom: 5 }}
                      >
                        {hoverUserSeasonData.activePositions.map((forecast) => (
                          <Grid
                            item
                            xs={3}
                            spacing={2}
                            style={{
                              textAlign: "center",
                              marginBottom: 5,
                            }}
                          >
                            <Typography
                              style={{
                                textAlign: "center",
                                textTransform: "uppercase",
                              }}
                            >
                              {forecast.symbol}
                            </Typography>
                            <Badge
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              overlap="circle"
                              badgeContent={
                                forecast.vote ? (
                                  <TrendingUpIcon style={{ fontSize: 15 }} />
                                ) : (
                                  <TrendingDownIcon style={{ fontSize: 15 }} />
                                )
                              }
                              color={forecast.vote ? "primary" : "secondary"}
                            >
                              <Avatar
                                alt="avatar"
                                src={forecast.image}
                                className={classes.activeForecastLogo}
                              />
                            </Badge>
                          </Grid>
                        ))}
                      </Grid>
                      <Divider variant="middle" />
                      <Typography
                        variant="h4"
                        style={{ textAlign: "center", marginTop: 5 }}
                        color="primary"
                      >
                        Long Combo
                      </Typography>
                      <Grid
                        item
                        container
                        direction={"row"}
                        justify={"space-around"}
                      >
                        {this.drawCombo(
                          hoverUserSeasonData.longShortStrike.long,
                          "combo",
                          "long"
                        )}
                      </Grid>
                      {minigame === "global" ? (
                        <>
                          {hoverUserSeasonData.longShortStrike.allTimeHighLong >
                            0 && (
                            <Typography color="inherit">
                              All Time Best Long Combo{" "}
                              <Typography variant="inherit" color="primary">
                                {
                                  hoverUserSeasonData.longShortStrike
                                    .allTimeHighLong
                                }
                              </Typography>
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          {hoverUserSeasonData.longShortStrike.seasonHighLong >
                            0 && (
                            <Typography color="inherit">
                              Season Best Long Combo{" "}
                              <Typography variant="inherit" color="primary">
                                {
                                  hoverUserSeasonData.longShortStrike
                                    .seasonHighLong
                                }
                              </Typography>
                            </Typography>
                          )}
                        </>
                      )}
                      <Divider variant="middle" />
                      <Typography
                        variant="h4"
                        style={{ textAlign: "center", marginTop: 5 }}
                        color="primary"
                      >
                        Short Combo
                      </Typography>
                      <Grid
                        item
                        container
                        direction={"row"}
                        justify={"space-around"}
                      >
                        {this.drawCombo(
                          hoverUserSeasonData.longShortStrike.short,
                          "combo",
                          "short"
                        )}
                      </Grid>
                      {minigame === "global" ? (
                        <>
                          {hoverUserSeasonData.longShortStrike
                            .allTimeHighShort > 0 && (
                            <Typography color="inherit">
                              All Time Best Short Combo{" "}
                              <Typography variant="inherit" color="primary">
                                {
                                  hoverUserSeasonData.longShortStrike
                                    .allTimeHighShort
                                }
                              </Typography>
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          {hoverUserSeasonData.longShortStrike.seasonHighShort >
                            0 && (
                            <Typography color="inherit">
                              Season Best Short Combo{" "}
                              <Typography variant="inherit" color="primary">
                                {
                                  hoverUserSeasonData.longShortStrike
                                    .seasonHighShort
                                }
                              </Typography>
                            </Typography>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <CircularProgress />
                    </>
                  )
                }
                arrow
                placement="left-start"
              >
                <Avatar
                  alt="avatar"
                  src={this.getAvatarType(user)}
                  className={
                    i === 0 ? classes.firstProfile : classes.largeProfile
                  }
                />
              </Tooltip>
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
                  xp:
                  {user.experiencePoints}
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
            <Grid item>
              {user.minigames.genesis.experiencePoints &&
                user.minigames.genesis.position > 3 && (
                  <>
                    <Tooltip
                      arrow
                      title={
                        <>
                          <Typography variant={"subtitle1"} color="primary">
                            Genesis Season Player
                          </Typography>
                          <Typography>
                            Position:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.position}
                            </Typography>
                          </Typography>
                          <Typography>
                            XP Gained:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.experiencePoints}
                            </Typography>
                          </Typography>
                          <Typography>
                            Bull/Bear:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.stats[0].bullBearProfile}
                            </Typography>
                          </Typography>
                          <Typography>
                            Guru Profile:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.stats[0].guruProfile}
                            </Typography>
                          </Typography>
                          <Typography>
                            Correct Forecasts:{" "}
                            <Typography variant="inline" color="primary">
                              {
                                user.minigames.genesis.stats[0]
                                  .totalCorrectPercent
                              }
                              % (
                              {
                                user.minigames.genesis.stats[0]
                                  .totalPredictionsGood
                              }
                              /
                              {user.minigames.genesis.stats[0].totalPredictions}
                              )
                            </Typography>
                          </Typography>
                        </>
                      }
                      placement="bottom"
                    >
                      <GenesisPlayerIcon className={classes.genesisIcon} />
                    </Tooltip>
                  </>
                )}
              {user.minigames.genesis.experiencePoints &&
                user.minigames.genesis.position <= 3 && (
                  <>
                    <Tooltip
                      arrow
                      title={
                        <>
                          <Typography variant={"subtitle1"} color="primary">
                            {user.minigames.genesis.position === 1
                              ? "Genesis Season Winner"
                              : "Genesis Season Player"}
                          </Typography>
                          <Typography>
                            Position:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.position}
                            </Typography>
                          </Typography>
                          <Typography>
                            XP Gained:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.experiencePoints}
                            </Typography>
                          </Typography>
                          <Typography>
                            Bull/Bear:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.stats[0].bullBearProfile}
                            </Typography>
                          </Typography>
                          <Typography>
                            Guru Profile:{" "}
                            <Typography variant="inline" color="primary">
                              {user.minigames.genesis.stats[0].guruProfile}
                            </Typography>
                          </Typography>
                          <Typography>
                            Correct Forecasts:{" "}
                            <Typography variant="inline" color="primary">
                              {
                                user.minigames.genesis.stats[0]
                                  .totalCorrectPercent
                              }
                              % (
                              {
                                user.minigames.genesis.stats[0]
                                  .totalPredictionsGood
                              }
                              /
                              {user.minigames.genesis.stats[0].totalPredictions}
                              )
                            </Typography>
                          </Typography>
                        </>
                      }
                      placement="bottom"
                    >
                      <GenesisTop3Icon
                        className={`${classes.genesisIcon} pos${user.minigames.genesis.position}`}
                      />
                    </Tooltip>
                  </>
                )}
            </Grid>
            <Grid item>
              {this.state.newSeasonEnabled &&
                user.minigames.lsSeasons.length > 0 &&
                this.drawUserLSSeasonAwards(user)}
            </Grid>
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
    const {
      loading,
      leaderboard,
      minigame,
      validMinigames,
      season,
      validSeasons,
    } = this.state;
    const darkMode = store.getStore("theme") === "dark" ? true : false;

    const handleChangeSeason = (event) => {
      if (event.target.value !== season) {
        if (event.target.value === this.state.currentSeason) {
          dispatcher.dispatch({
            type: DB_GET_LEADERBOARD_MINIGAME,
            minigameID: "longShort",
          });
        } else {
          dispatcher.dispatch({
            type: DB_GET_LEADERBOARD_MINIGAME,
            minigameID: "longShort",
            season: event.target.value,
          });
        }
        this.setState({
          season: event.target.value,
        });
      }
    };

    const handleChangeRankingType = (event) => {
      if (event.target.value !== minigame) {
        if (event.target.value === "global") {
          dispatcher.dispatch({
            type: DB_GET_LEADERBOARD,
          });
        } else {
          if (this.state.season === this.state.currentSeason) {
            dispatcher.dispatch({
              type: DB_GET_LEADERBOARD_MINIGAME,
              minigameID: event.target.value,
            });
          } else {
            dispatcher.dispatch({
              type: DB_GET_LEADERBOARD_MINIGAME,
              minigameID: event.target.value,
              season: this.state.season,
            });
          }
        }
        this.setState({
          minigame: event.target.value,
        });
      }
    };

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
              <Grid
                container
                justify={"space-between"}
                style={{ marginTop: 5 }}
              >
                <Grid item>
                  <Select
                    labelId="rankingType-label"
                    id="rankingType-helper"
                    value={minigame}
                    onChange={handleChangeRankingType}
                  >
                    <MenuItem value={"longShort"}>Short & Long</MenuItem>
                    <MenuItem value={"global"}>Global Ranking</MenuItem>
                  </Select>
                </Grid>
                <Grid item>
                  {minigame !== "global" && (
                    <Select
                      labelId="season-select-label"
                      id="season-select-helper"
                      value={season}
                      onChange={handleChangeSeason}
                    >
                      <MenuItem value={"genesis"}>Genesis</MenuItem>
                      <MenuItem value={1}>1</MenuItem>
                      {this.state.newSeasonEnabled && (
                        <MenuItem value={2}>2</MenuItem>
                      )}
                    </Select>
                  )}
                </Grid>
              </Grid>
              {this.state.timeRemaining && (
                <Grid>
                  <Typography variant="h4" color="primary">
                    Current season ends in {this.state.timeRemaining}
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
