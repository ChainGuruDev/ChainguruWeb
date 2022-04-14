//Short Long Short term minigame main JS
//Allow users to bet on Tokens going Up or down
//Check result after 24hs since prediction

import React, { Component } from "react";

import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import CoinSearchBar from "../components/CoinSearchBar.js";
import LSResultDonutChart from "../components/LS_ResultDonutChart.js";
import LSTableActive from "../components/LS_Table_Active.js";
import LSTableHistory from "../components/LS_Table_History.js";
import LSvoteResultModal from "../components/lsVoteResultModal.js";
import SparklineChart from "../components/SparklineChart.js";

import ProfileMini from "../profile/profileMini.js";
import LeaderboardMini from "../leaderboard/leaderboardMini.js";
import { timeConversion } from "../helpers";

//import materialUI elements
import {
  Grid,
  Card,
  Button,
  ButtonGroup,
  Avatar,
  Typography,
  Tooltip,
} from "@material-ui/core";

import Gauge from "../components/Gauge.js";
//import materialUI icons
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import {
  LOGIN_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  COIN_DATA_RETURNED,
  DB_GET_USER_LS,
  DB_GET_USER_LS_RETURNED,
  DB_GET_USER_TOKEN_LS,
  DB_GET_USER_TOKEN_LS_RETURNED,
  DB_CREATE_LS,
  DB_CREATE_LS_RETURNED,
  DB_CHECK_LS_RESULT_RETURNED,
  DB_USERDATA_RETURNED,
  DB_GET_USERDATA,
  DB_GET_LEADERBOARD_MINIGAME,
  DB_GET_LS_SENTIMENT,
  DB_GET_LS_SENTIMENT_RETURNED,
  GECKO_GET_PRICE_AT_DATE_RETURNED,
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
    marginBottom: 10,
  },
  favTopBar: {
    marginBottom: 5,
    alignItems: "flex-start",
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  favList: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  graphCard: {
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "stretch",
    maxHeight: "160px",
  },
  comboBar: {
    background: "rgba(125, 125, 125, 0.15)",
    borderRadius: "10px",
  },
  gauge: {
    strokeWidth: 10,
  },
  valueGaugeBull: {
    fontSize: 16,
    fontFamily: "Acumin Variable Concept Default ExtraCondensed UltraBlack",
    transform: "translate(0,-8px)",
    fill: "#79d8a2",
  },
  valueGaugeBear: {
    fontSize: 16,
    fontFamily: "Acumin Variable Concept Default ExtraCondensed UltraBlack",
    transform: "translate(0,-8px)",
    fill: "#f79d6b",
  },
  valueGaugeNeutral: {
    fontSize: 16,
    fontFamily: "Acumin Variable Concept Default ExtraCondensed UltraBlack",
    fill: "#fcc98b",
    transform: "translate(0,-8px)",
  },
});

class LongShort extends Component {
  constructor() {
    super();
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    const dateNow = new Date();

    const currentSeason =
      dateNow >= new Date(Date.parse("06-May-2022 23:59:59".replace(/-/g, " ")))
        ? 3
        : 2;
    const seasonStart = new Date(Date.parse("07-Mar-2022".replace(/-/g, " ")));

    seasonStart.setMonth(seasonStart.getMonth() + currentSeason - 1);
    // seasonStart.setDate(7);
    // seasonStart.setHours(11);
    // seasonStart.setMinutes(0);
    const seasonEnd = new Date(seasonStart);
    seasonEnd.setMonth(seasonStart.getMonth() + 1);
    seasonEnd.setDate(6);
    seasonEnd.setHours(23);
    seasonEnd.setMinutes(59);
    seasonEnd.setSeconds(59);

    const timeRemaining = timeConversion(seasonEnd - dateNow);
    this.state = {
      currentSeason: currentSeason,
      currentSeasonStart: seasonStart,
      seasonEnd: seasonEnd,
      timeRemaining: timeRemaining,
      account: account,
      loading: false,
      newSearchLoading: true,
      newTokenVote: false,
      modalOpen: false,
      activeLS: 0,
      longCombo: 0,
      shortCombo: 0,
      sentimentData: {
        sentiment: 50,
        totalActiveVotes: 0,
        totalLongs: 0,
        totalShorts: 0,
      },
    };

    if (userAuth && account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USER_LS,
        address: account.address,
      });
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connected);
    emitter.on(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.on(DB_GET_USER_LS_RETURNED, this.db_getUserLS);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(DB_GET_USER_TOKEN_LS_RETURNED, this.userTokenLSReturned);
    emitter.on(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.on(DB_CHECK_LS_RESULT_RETURNED, this.db_checkLSResultReturned);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_GET_LS_SENTIMENT_RETURNED, this.dbGetLSSentimentReturned);
    emitter.on(
      GECKO_GET_PRICE_AT_DATE_RETURNED,
      this.geckoGetPriceAtDateReturned
    );
    dispatcher.dispatch({
      type: DB_GET_LS_SENTIMENT,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.removeListener(DB_GET_USER_LS_RETURNED, this.db_getUserLS);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(
      DB_GET_USER_TOKEN_LS_RETURNED,
      this.userTokenLSReturned
    );
    emitter.removeListener(
      GECKO_GET_PRICE_AT_DATE_RETURNED,
      this.geckoGetPriceAtDateReturned
    );

    emitter.removeListener(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.removeListener(
      DB_CHECK_LS_RESULT_RETURNED,
      this.db_checkLSResultReturned
    );
    emitter.removeListener(
      DB_GET_LS_SENTIMENT_RETURNED,
      this.dbGetLSSentimentReturned
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
  }

  connected = () => {
    const account = store.getStore("account");
    this.setState({
      account: account,
    });

    dispatcher.dispatch({
      type: DB_GET_USER_LS,
      address: account.address,
    });
  };

  disconnected = () => {
    const account = "";
    this.setState({
      account: account,
    });
  };

  userTokenLSReturned = (data) => {
    let active = false;
    let vote = false;

    if (data[0]) {
      if (!data[0].complete) {
        active = true;
      }
      if (data[0].vote) {
        vote = data[0].vote;
      }
    }

    this.setState({
      newSearchLoading: false,
      newSearchActive: active,
      newTokenVote: vote,
    });
  };

  coinDataReturned = (data) => {
    dispatcher.dispatch({
      type: DB_GET_USER_TOKEN_LS,
      tokenID: data[0].id,
    });
    // console.log(data[0]);

    this.setState({ coinData: data[0] });
  };

  dbGetLSSentimentReturned = (data) => {
    this.setState({
      sentimentData: data,
    });
  };

  db_getUserLS = (data) => {
    const { currentSeasonStart } = this.state;

    var currentSeasonLS = data.filter(function (el) {
      return new Date(el.voteEnding) >= currentSeasonStart;
    });
    // sort complete and incomplete LongShorts
    let completeLS = [];
    let incompleteLS = [];
    currentSeasonLS.forEach((item, i) => {
      if (item.complete) {
        completeLS.push(item);
      }
    });
    data.forEach((item, i) => {
      if (!item.complete) {
        incompleteLS.push(item);
      }
    });
    // sort stats by Type Long / Short
    let countLong = [0, 0];
    let countShort = [0, 0];
    completeLS.forEach((item, i) => {
      if (item.vote) {
        item.result ? countLong[0]++ : countLong[1]++;
      } else {
        item.result ? countShort[0]++ : countShort[1]++;
      }
    });
    let countTotals = {
      ok: countLong[0] + countShort[0],
      bad: countLong[1] + countShort[1],
    };

    this.setState({
      completeLS,
      incompleteLS,
      countTotals,
      countLong,
      countShort,
      activeLS: incompleteLS.length,
    });
  };

  geckoGetPriceAtDateReturned = (payload) => {
    if (this.state.incompleteLS) {
      let prevLS = [...this.state.incompleteLS];

      if (prevLS !== payload) {
        prevLS.forEach((item, i) => {
          if (!item.priceClosing) {
            let index = payload
              .map(function (e) {
                return e.tokenID;
              })
              .indexOf(item.tokenID);
            if (payload[index] && payload[index].priceClosing) {
              item.priceClosing = payload[index].priceClosing;
            }
          }
        });
      }
      this.setState({
        incompleteLS: prevLS,
      });
    } else {
      this.setState({
        incompleteLS: payload,
      });
    }
  };

  newLSvote = (vote) => {
    dispatcher.dispatch({
      type: DB_CREATE_LS,
      tokenID: this.state.coinData.id,
      vote: vote,
    });
  };

  db_createLSReturned = (data) => {
    const account = store.getStore("account");

    let data2 = [];
    data2.push(data);
    dispatcher.dispatch({
      type: DB_GET_USER_LS,
      address: account.address,
    });
    this.userTokenLSReturned(data2);
  };

  db_checkLSResultReturned = (data) => {
    const { account } = this.state;
    dispatcher.dispatch({
      type: DB_GET_USER_LS,
      address: account.address,
    });
    dispatcher.dispatch({
      type: DB_GET_USERDATA,
      address: account.address,
    });
    dispatcher.dispatch({
      type: DB_GET_LEADERBOARD_MINIGAME,
      minigameID: "longShort",
    });
    this.setState({ modalOpen: true, modalData: data });
  };

  dbUserDataReturned = (data) => {
    this.setState({
      longCombo: data.minigames.longShort.longShortStrike.long,
      shortCombo: data.minigames.longShort.longShortStrike.short,
    });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  renderModal = (data) => {
    return (
      <LSvoteResultModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
        modalData={data}
      />
    );
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

  render() {
    const { classes } = this.props;
    const {
      account,
      countTotals,
      countLong,
      countShort,
      completeLS,
      incompleteLS,
      modalOpen,
      modalData,
      longCombo,
      shortCombo,
      activeLS,
      coinData,
      sentimentData,
    } = this.state;
    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Grid container spacing={3}>
            <Grid item xs={9}>
              <Card className={classes.favCard} elevation={3}>
                <Grid container>
                  <Grid
                    className={classes.favTopBar}
                    item
                    xs={12}
                    spacing={1}
                    container
                  >
                    <Grid item xs={6}>
                      <Grid
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="stretch"
                      >
                        <Tooltip
                          title="FIND COINS TO LONG OR SHORT HERE"
                          arrow
                          placement="top"
                        >
                          <Grid item>
                            <CoinSearchBar label="Find coins to long or short here" />
                          </Grid>
                        </Tooltip>

                        {coinData && (
                          <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                            item
                            style={{ marginTop: 10 }}
                          >
                            <Grid
                              onClick={() => this.detective(coinData.id)}
                              style={{
                                maxWidth: "max-content",
                                cursor: "pointer",
                              }}
                              item
                            >
                              <Avatar
                                alt={coinData.image.large}
                                src={coinData.image.large}
                                style={{ maxWidth: "max-content" }}
                              />
                            </Grid>
                            <Grid
                              onClick={() => this.detective(coinData.id)}
                              style={{
                                cursor: "pointer",
                              }}
                              item
                            >
                              <Grid item>
                                <Typography variant="h6">
                                  {coinData.name}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="subtitle2">
                                  {coinData.symbol}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid
                              onClick={() => this.detective(coinData.id)}
                              style={{
                                cursor: "pointer",
                              }}
                              item
                            >
                              <Grid item>
                                <Typography variant="subtitle2">
                                  Price
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="h6">
                                  $ {coinData.market_data.current_price.usd}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid
                              onClick={() => this.detective(coinData.id)}
                              style={{
                                cursor: "pointer",
                              }}
                              item
                            >
                              <Grid item>
                                <Typography variant="subtitle2">
                                  24hs
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="h6">
                                  {this.state.coinData.market_data
                                    .price_change_percentage_24h &&
                                    this.state.coinData.market_data.price_change_percentage_24h.toFixed(
                                      2
                                    )}
                                  %
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid
                              onClick={() =>
                                this.detective(this.state.coinData.id)
                              }
                              style={{
                                cursor: "pointer",
                              }}
                              item
                            >
                              <Grid item>
                                <Typography variant="subtitle2">7D</Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="h6">
                                  {this.state.coinData.market_data
                                    .price_change_percentage_7d &&
                                    this.state.coinData.market_data.price_change_percentage_7d.toFixed(
                                      2
                                    )}
                                  %
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid
                              onClick={() =>
                                this.detective(this.state.coinData.id)
                              }
                              style={{
                                cursor: "pointer",
                              }}
                              item
                            >
                              <SparklineChart
                                id={this.state.coinData.symbol}
                                data={
                                  this.state.coinData.market_data.sparkline_7d
                                    .price
                                }
                              />
                            </Grid>
                            <Grid item>
                              {!this.state.newSearchLoading &&
                                !this.state.newSearchActive && (
                                  <ButtonGroup
                                    color="primary"
                                    aria-label="LongShort_ButtonGroup"
                                  >
                                    <Button
                                      startIcon={<TrendingUpIcon />}
                                      color="primary"
                                      disabled={activeLS >= 7}
                                      onClick={() => this.newLSvote("long")}
                                    ></Button>
                                    <Button
                                      endIcon={<TrendingDownIcon />}
                                      color="secondary"
                                      disabled={activeLS >= 7}
                                      onClick={() => this.newLSvote("short")}
                                    ></Button>
                                  </ButtonGroup>
                                )}
                              {!this.state.newSearchLoading &&
                                this.state.newSearchActive && (
                                  <>
                                    {this.state.newTokenVote && (
                                      <ButtonGroup
                                        color="primary"
                                        aria-label="LongShort_ButtonGroup"
                                      >
                                        <Button
                                          startIcon={<TrendingUpIcon />}
                                          color="primary"
                                          variant="contained"
                                        ></Button>
                                        <Button
                                          endIcon={<TrendingDownIcon />}
                                          color="secondary"
                                        ></Button>
                                      </ButtonGroup>
                                    )}
                                    {!this.state.newTokenVote && (
                                      <ButtonGroup
                                        color="primary"
                                        aria-label="LongShort_ButtonGroup"
                                      >
                                        <Button
                                          startIcon={<TrendingUpIcon />}
                                          color="primary"
                                        ></Button>
                                        <Button
                                          endIcon={<TrendingDownIcon />}
                                          color="secondary"
                                          variant="contained"
                                        ></Button>
                                      </ButtonGroup>
                                    )}
                                  </>
                                )}
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      container
                      direction="row"
                      justify="flex-start"
                      alignItems="flex-start"
                      xs={4}
                    >
                      {countTotals && countTotals.ok + countTotals.bad > 0 && (
                        <Grid item container justify="center" xs={12}>
                          {countLong && (countLong[0] || countShort[0]) && (
                            <Grid
                              item
                              style={{ minWidth: "120px", maxWidth: "120px" }}
                            >
                              <LSResultDonutChart
                                data={
                                  this.state.countTotals
                                    ? this.state.countTotals
                                    : {}
                                }
                              />
                            </Grid>
                          )}
                          {countLong && (countLong[0] || countShort[0]) && (
                            <Grid style={{ marginLeft: "10px" }} item>
                              <Grid container direction="column">
                                {countTotals && (
                                  <Grid item>
                                    <Grid item container direction="row">
                                      <Typography variant="h2" color="primary">
                                        {countTotals.ok}
                                      </Typography>
                                      <Typography variant="h2">/</Typography>
                                      <Typography
                                        variant="h2"
                                        color="secondary"
                                      >
                                        {countTotals.ok + countTotals.bad}
                                      </Typography>
                                    </Grid>
                                    <Typography variant="h2" color="primary">
                                      {(
                                        (countTotals.ok /
                                          (countTotals.ok + countTotals.bad)) *
                                        100
                                      ).toFixed(2)}{" "}
                                      %
                                    </Typography>
                                  </Grid>
                                )}
                                {countLong && (
                                  <Grid item container direction="row">
                                    <TrendingUpIcon
                                      color="primary"
                                      style={{ marginRight: 10 }}
                                    />
                                    <Typography variant="h3" color="primary">
                                      {countLong[0]}
                                    </Typography>{" "}
                                    <Typography variant="h3">/</Typography>{" "}
                                    <Typography variant="h3" color="secondary">
                                      {countLong[1] + " "}
                                    </Typography>{" "}
                                    <Typography variant="h3" color="primary">
                                      {" ("}
                                      {!isNaN(
                                        (countLong[0] /
                                          (countLong[0] + countLong[1])) *
                                          100
                                      )
                                        ? (
                                            (countLong[0] /
                                              (countLong[0] + countLong[1])) *
                                            100
                                          ).toFixed(2)
                                        : 0}{" "}
                                      %)
                                    </Typography>
                                  </Grid>
                                )}
                                {countShort && (
                                  <Grid item container direction="row">
                                    <TrendingDownIcon
                                      color="secondary"
                                      style={{ marginRight: 10 }}
                                    />
                                    <Typography variant="h3" color="primary">
                                      {countShort[0]}
                                    </Typography>{" "}
                                    <Typography variant="h3">/</Typography>{" "}
                                    <Typography variant="h3" color="secondary">
                                      {countShort[1] + " "}
                                    </Typography>
                                    <Typography variant="h3" color="primary">
                                      {" ("}
                                      {!isNaN(
                                        (countShort[0] /
                                          (countShort[0] + countShort[1])) *
                                          100
                                      )
                                        ? (
                                            (countShort[0] /
                                              (countShort[0] + countShort[1])) *
                                            100
                                          ).toFixed(2)
                                        : 0}{" "}
                                      %)
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Grid>
                          )}
                        </Grid>
                      )}
                    </Grid>
                    <Grid item container justify="center" xs={2}>
                      <Grid
                        style={{
                          maxWidth: 200,
                          textAlign: "center",
                          width: "inherit",
                        }}
                      >
                        <Gauge
                          value={sentimentData.sentiment}
                          totalVotes={sentimentData.totalActiveVotes}
                          votes={[
                            sentimentData.totalLongs,
                            sentimentData.totalShorts,
                          ]}
                          color={function (value) {
                            if (value < 40) {
                              return colors.cgRed;
                            } else if (value < 59) {
                              return colors.cgYellow;
                            } else if (value >= 60) {
                              return colors.cgGreen;
                            }
                          }}
                          label={function (value) {
                            if (value > 60) {
                              return "Bullish";
                            } else if (value < 40) {
                              return "Bearish";
                            } else {
                              return "Neutral";
                            }
                          }}
                          valueDialClass={classes.gauge}
                          valueClass={
                            sentimentData.sentiment > 60
                              ? classes.valueGaugeBull
                              : sentimentData.sentiment < 40
                              ? classes.valueGaugeBear
                              : classes.valueGaugeNeutral
                          }
                          title="Chaingurians Sentiment"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  {countLong && (
                    <Grid
                      item
                      container
                      direction={"row"}
                      justify={"center"}
                      align={"center"}
                      style={{
                        textAlign: "center",
                        marginTop: "5px",
                        marginBottom: "10px",
                      }}
                      xs={12}
                    >
                      <Grid
                        style={{
                          borderColor: "rgba(125, 125, 125, 0.15)",
                          borderStyle: "solid",
                          borderWidth: "thin",
                          borderRadius: "10px",
                          background: "rgba(125, 125, 125, 0.15)",
                        }}
                        container
                      >
                        <Tooltip
                          title="YOU CAN ONLY HAVE 7 TRADES OPEN AT A TIME"
                          arrow
                          placement="top"
                        >
                          <Grid item container xs={4}>
                            <Grid className={classes.comboBar} item xs={4}>
                              <Typography
                                style={{ marginTop: 5 }}
                                variant={"h4"}
                                gutterBottom
                                color="primary"
                              >
                                Active
                              </Typography>
                            </Grid>
                            <Grid
                              container
                              justify={"space-around"}
                              item
                              style={{
                                flex: 1,
                                display: "flex",
                                alignContent: "center",
                              }}
                            >
                              {this.drawCombo(activeLS, "active")}
                            </Grid>
                          </Grid>
                        </Tooltip>
                        <Tooltip
                          title="GET 7 LONGS IN A ROW FOR A 2X BONUS"
                          arrow
                          placement="top"
                        >
                          <Grid item container xs={4}>
                            <Grid className={classes.comboBar} item xs={4}>
                              <Typography
                                style={{ marginLeft: "10px", marginTop: 5 }}
                                variant={"h4"}
                                gutterBottom
                                color="primary"
                              >
                                Long Combo
                              </Typography>
                            </Grid>
                            <Grid
                              container
                              justify={"space-around"}
                              item
                              style={{
                                flex: 1,
                                display: "flex",
                                alignContent: "center",
                              }}
                            >
                              {this.drawCombo(longCombo, "combo", "long")}
                            </Grid>
                          </Grid>
                        </Tooltip>
                        <Tooltip
                          title="GET 7 SHORTS IN A ROW FOR A 2X BONUS"
                          arrow
                          placement="top"
                        >
                          <Grid item container xs={4}>
                            <Grid className={classes.comboBar} item xs={4}>
                              <Typography
                                style={{ marginTop: 5 }}
                                variant={"h4"}
                                gutterBottom
                                color="primary"
                              >
                                Short Combo
                              </Typography>
                            </Grid>
                            <Grid
                              container
                              justify={"space-around"}
                              item
                              style={{
                                flex: 1,
                                display: "flex",
                                alignContent: "center",
                              }}
                            >
                              {this.drawCombo(shortCombo, "combo", "short")}
                            </Grid>
                          </Grid>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )}
                  <Grid item className={classes.favList} xs={12}>
                    {incompleteLS && incompleteLS.length > 0 && (
                      <LSTableActive data={incompleteLS} />
                    )}
                    {completeLS && <LSTableHistory data={completeLS} />}
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <ProfileMini />
              <LeaderboardMini minigame="longShort" />
            </Grid>
          </Grid>
        )}
        {modalOpen && this.renderModal(modalData)}
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
  detective = (id) => {
    this.nav("/short/detective/" + id);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(LongShort)));
