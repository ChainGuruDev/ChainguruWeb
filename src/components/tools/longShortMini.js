//MiniUI for Long Short term minigame
//Allow users to bet on Tokens going Up or down
//Check result after 24hs since prediction

import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import { timeConversion } from "../helpers";

import Gauge from "../components/Gauge.js";

import LSvoteResultModal from "../components/lsVoteResultModal.js";
import LSResultDonutChart from "../components/LS_ResultDonutChart.js";
//LSTABLEACTIVE MINI
import LSTableActiveMini from "../components/LS_Table_ActiveMini.js";

import {
  Grid,
  Card,
  Typography,
  CircularProgress,
  Divider,
  Tooltip,
  Button,
  ButtonGroup,
} from "@material-ui/core";

import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import CancelIcon from "@material-ui/icons/Cancel";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  LOGIN_RETURNED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_GET_USER_LS,
  DB_GET_USER_LS_RETURNED,
  DB_CHECK_LS_RESULT,
  DB_CHECK_LS_RESULT_RETURNED,
  DB_GET_USER_TOKEN_LS,
  DB_CREATE_LS,
  DB_CREATE_LS_RETURNED,
  DB_GET_USER_TOKEN_LS_RETURNED,
  GECKO_GET_PRICE_AT_DATE_RETURNED,
  DB_GET_LS_SENTIMENT,
  DB_GET_LS_SENTIMENT_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  favCard: {
    padding: 10,
    margin: "10px 0px",
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "flex-start",
  },
  favList: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  titleBar: {
    cursor: "pointer",
    background: "rgba(121, 216, 162, 0.1)",
    paddingBottom: "5",
    maxWidth: "inherit",
    position: "relative",
    minWidth: "150%",
    filter: "blur(1px)",
    overflow: "hidden",
    margin: "0",
    minHeight: "50px",
    zIndex: "1",
    "&:hover": {
      background: "rgba(121, 216, 162, 0.25)",
    },
    transition: "0.4321s",
  },
  comboBarBorder: {
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderStyle: "solid",
    borderWidth: "thin",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.1)",
    textAlign: "center",
  },
  comboBar: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
    textAlign: "center",
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

class LongShortMini extends Component {
  constructor(props) {
    super();
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    const dateNow = new Date();

    const currentSeason =
      dateNow >= new Date(Date.parse("06-Apr-2022 23:59:59".replace(/-/g, " ")))
        ? 2
        : 1;

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
      currentSeasonStart: seasonStart,
      seasonEnd: seasonEnd,
      timeRemaining: timeRemaining,
      account: account,
      loading: true,
      modalOpen: false,
      activeLS: 0,
      longCombo: 0,
      shortCombo: 0,
      tokenID: props.tokenID,
      loadingResult: false,
      loadingNewVote: false,
      sentimentData: { sentiment: 50, totalActiveVotes: 0 },
    };

    if (userAuth && account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USER_LS,
        address: account.address,
      });
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tokenID !== this.props.tokenID) {
      this.setState({ tokenID: this.props.tokenID });
      // console.log(this.props.tokenID);
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connected);
    emitter.on(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.on(DB_GET_USER_LS_RETURNED, this.db_getUserLS);
    emitter.on(DB_CHECK_LS_RESULT_RETURNED, this.db_checkLSResultReturned);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_GET_USER_TOKEN_LS_RETURNED, this.userTokenLSReturned);
    emitter.on(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.on(LOGIN_RETURNED, this.loginReturned);
    emitter.on(
      GECKO_GET_PRICE_AT_DATE_RETURNED,
      this.geckoGetPriceAtDateReturned
    );
    emitter.on(DB_GET_LS_SENTIMENT_RETURNED, this.dbGetLSSentimentReturned);

    dispatcher.dispatch({
      type: DB_GET_LS_SENTIMENT,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.removeListener(DB_GET_USER_LS_RETURNED, this.db_getUserLS);
    emitter.removeListener(
      DB_CHECK_LS_RESULT_RETURNED,
      this.db_checkLSResultReturned
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      DB_GET_USER_TOKEN_LS_RETURNED,
      this.userTokenLSReturned
    );
    emitter.removeListener(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);
    emitter.removeListener(
      GECKO_GET_PRICE_AT_DATE_RETURNED,
      this.geckoGetPriceAtDateReturned
    );
    emitter.removeListener(
      DB_GET_LS_SENTIMENT_RETURNED,
      this.dbGetLSSentimentReturned
    );
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

  dbGetLSSentimentReturned = (data) => {
    this.setState({
      sentimentData: data,
    });
  };

  loginReturned = () => {
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");
    if (userAuth && account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USER_LS,
        address: account.address,
      });
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  };

  userTokenLSReturned = (data) => {
    let complete = false;
    let vote = false;
    let active = false;

    if (data[0]) {
      active = true;
      if (data[0].complete) {
        complete = true;
      }
      if (data[0].vote) {
        vote = data[0].vote;
      }
    }

    this.setState({
      loadingNewVote: false,
      tokenLS_Loading: false,
      tokenLS_Complete: complete,
      tokenLS_Active: active,
      tokenLS_Vote: vote,
    });
  };

  checkTokenLS = (tokenID) => {
    dispatcher.dispatch({
      type: DB_GET_USER_TOKEN_LS,
      tokenID: tokenID,
    });
  };

  checkResult = (e, id) => {
    this.setState({ loadingResult: true });
    dispatcher.dispatch({
      type: DB_CHECK_LS_RESULT,
      tokenID: id,
    });
    e.stopPropagation();
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
      good: countLong[0] + countShort[0],
      bad: countLong[1] + countShort[1],
    };

    this.setState({
      completeLS,
      incompleteLS,
      countTotals,
      countLong,
      countShort,
      activeLS: incompleteLS.length,
      loading: false,
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

  db_checkLSResultReturned = (data) => {
    const { account } = this.state;
    if (data.error === "voting time not complete") {
      console.log("time not complete");
      //TODO HANDLE ERRORS
      this.setState({ loadingResult: false });
    } else {
      dispatcher.dispatch({
        type: DB_GET_USER_LS,
        address: account.address,
      });
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
      this.setState({ modalOpen: true, modalData: data, loadingResult: false });
    }
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

  newLSvote = (vote) => {
    this.setState({ loadingNewVote: true });
    dispatcher.dispatch({
      type: DB_CREATE_LS,
      tokenID: this.state.tokenID,
      vote: vote,
    });
  };

  db_createLSReturned = (data) => {
    const { account } = this.state;

    let data2 = [];
    data2.push(data);
    dispatcher.dispatch({
      type: DB_GET_USER_LS,
      address: account.address,
    });
    this.userTokenLSReturned(data2);
  };

  drawCombo = (number, type, ls) => {
    if (number > 7) {
      number = 7;
    }
    const comboMax = 7;
    const remaining = comboMax - number;
    const combo = [];

    if (type === "combo") {
      for (var i = 0; i < number; i++) {
        combo.push(
          <CheckCircleIcon
            key={`active_${i}`}
            fontSize="small"
            color={ls === "long" ? "primary" : "secondary"}
          />
        );
      }
      for (var j = 0; j < remaining; j++) {
        combo.push(
          <RadioButtonUncheckedIcon
            key={`unchecked_${j}`}
            fontSize="small"
            color="disabled"
          />
        );
      }
    } else {
      for (var k = 0; k < number; k++) {
        combo.push(
          <RadioButtonCheckedIcon
            key={`checked_${k}`}
            fontSize="small"
            color="primary"
          />
        );
      }
      for (var l = 0; l < remaining; l++) {
        combo.push(
          <RadioButtonUncheckedIcon
            key={`checked_left${l}`}
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
    const { loading } = this.state;
    const {
      countTotals,
      countLong,
      countShort,
      incompleteLS,
      activeLS,
      modalOpen,
      modalData,
      longCombo,
      shortCombo,
      tokenID,
      loadingNewVote,
    } = this.state;

    const MyComponent = React.forwardRef(function MyComponent(props, ref) {
      //  Spread the props to the underlying DOM element.
      return (
        <div {...props} ref={ref}>
          Bin
        </div>
      );
    });

    return (
      <>
        <Card
          className={classes.favCard}
          style={{ maxHeight: "max-content" }}
          elevation={3}
          id="longShortMiniUI"
        >
          <Grid container direction="column" style={{ margin: "0px" }}>
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
              <>
                <Grid
                  style={{
                    display: "flex",
                    alignContent: "center",
                    justifyContent: "center",
                    marginBottom: 5,
                  }}
                >
                  <div
                    className={classes.titleBar}
                    onClick={() => this.nav("/short/shortLong")}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                    }}
                  >
                    <Typography
                      style={{
                        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))",
                      }}
                      color={"primary"}
                      variant={"h2"}
                    >
                      Short & Long
                    </Typography>
                  </div>
                </Grid>
                {countTotals && countTotals.good + countTotals.bad > 0 && (
                  <>
                    <Grid
                      item
                      container
                      direction="row"
                      justify="space-between"
                      alignItems="stretch"
                      className={classes.comboBarBorder}
                    >
                      {countLong && countTotals.good + countTotals.bad > 0 && (
                        <div style={{ margin: "0px auto" }}>
                          <Grid
                            item
                            style={{
                              margin: "0px 10px",
                              minWidth: "120px",
                              maxWidth: "120px",
                              filter:
                                "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))",
                              alignSelf: "center",
                            }}
                          >
                            <LSResultDonutChart
                              data={
                                this.state.countTotals
                                  ? this.state.countTotals
                                  : {}
                              }
                            />
                          </Grid>
                        </div>
                      )}
                      {countLong && countTotals.good + countTotals.bad > 0 && (
                        <Grid
                          style={{
                            justifyContent: "space-between",
                          }}
                          item
                          container
                          direction="column"
                          alignItems="stretch"
                          className={classes.comboBarBorder}
                          lg
                        >
                          {countTotals && (
                            <>
                              <Tooltip
                                interactive
                                arrow
                                title={
                                  <React.Fragment>
                                    <Grid
                                      style={{
                                        padding: 5,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography variant={"h4"}>
                                        Total
                                      </Typography>
                                      <Divider
                                        variant="middle"
                                        style={{ margin: "5px 0px" }}
                                      />
                                      <Typography
                                        variant={"h4"}
                                        color="primary"
                                      >
                                        <CheckCircleIcon
                                          color="primary"
                                          style={{ marginRight: 5 }}
                                        />
                                        {countTotals.good}
                                      </Typography>
                                      <Typography
                                        variant={"h4"}
                                        color="secondary"
                                      >
                                        <CancelIcon
                                          color="secondary"
                                          style={{ marginRight: 5 }}
                                        />
                                        {countTotals.bad + countTotals.good}
                                      </Typography>
                                    </Grid>
                                  </React.Fragment>
                                }
                              >
                                <Grid
                                  item
                                  container
                                  direction="row"
                                  alignItems="center"
                                  justify="center"
                                  wrap="nowrap"
                                  style={{ padding: "0px 5px" }}
                                >
                                  <Typography variant="h2" color="primary">
                                    {(
                                      (countTotals.good /
                                        (countTotals.good + countTotals.bad)) *
                                      100
                                    ).toFixed(1)}{" "}
                                    %
                                  </Typography>
                                </Grid>
                              </Tooltip>
                              <Divider />
                            </>
                          )}
                          {countLong && (
                            <>
                              <Tooltip
                                interactive
                                arrow
                                title={
                                  <React.Fragment>
                                    <Grid
                                      style={{
                                        padding: 5,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography variant={"h4"}>
                                        Total Long
                                      </Typography>
                                      <Divider
                                        variant="middle"
                                        style={{ margin: "5px 0px" }}
                                      />
                                      <Typography
                                        variant={"h4"}
                                        color="primary"
                                      >
                                        <CheckCircleIcon
                                          color="primary"
                                          style={{ marginRight: 5 }}
                                        />
                                        {countLong[0]}
                                      </Typography>
                                      <Typography
                                        variant={"h4"}
                                        color="secondary"
                                      >
                                        <CancelIcon
                                          color="secondary"
                                          style={{ marginRight: 5 }}
                                        />
                                        {countLong[1]}
                                      </Typography>
                                    </Grid>
                                  </React.Fragment>
                                }
                              >
                                <Grid
                                  item
                                  container
                                  justify="center"
                                  direction="row"
                                  alignItems="center"
                                  wrap="nowrap"
                                  style={{ padding: "0px 5px" }}
                                >
                                  <TrendingUpIcon
                                    color="primary"
                                    style={{ marginRight: 10 }}
                                  />
                                  <Typography variant="h3" color="primary">
                                    {isNaN(
                                      (countLong[0] /
                                        (countLong[0] + countLong[1])) *
                                        100
                                    )
                                      ? 0
                                      : (
                                          (countLong[0] /
                                            (countLong[0] + countLong[1])) *
                                          100
                                        ).toFixed(1)}
                                  </Typography>
                                  <Typography
                                    style={{ marginLeft: 5 }}
                                    variant="h4"
                                    color="primary"
                                  >
                                    %
                                  </Typography>
                                </Grid>
                              </Tooltip>
                            </>
                          )}
                          <Divider display="block" />
                          {countShort && (
                            <>
                              <Tooltip
                                interactive
                                arrow
                                title={
                                  <React.Fragment>
                                    <Grid
                                      style={{
                                        padding: 5,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography variant={"h4"}>
                                        Total Short
                                      </Typography>
                                      <Divider
                                        variant="middle"
                                        style={{ margin: "5px 0px" }}
                                      />
                                      <Typography
                                        variant={"h4"}
                                        color="primary"
                                      >
                                        <CheckCircleIcon
                                          color="primary"
                                          style={{ marginRight: 5 }}
                                        />
                                        {countShort[0]}
                                      </Typography>
                                      <Typography
                                        variant={"h4"}
                                        color="secondary"
                                      >
                                        <CancelIcon
                                          color="secondary"
                                          style={{ marginRight: 5 }}
                                        />
                                        {countShort[1]}
                                      </Typography>
                                    </Grid>
                                  </React.Fragment>
                                }
                              >
                                <Grid
                                  item
                                  container
                                  direction="row"
                                  alignItems="center"
                                  justify="center"
                                  wrap="nowrap"
                                  style={{ padding: "0px 5px" }}
                                >
                                  <TrendingDownIcon
                                    color="secondary"
                                    style={{ marginRight: 10 }}
                                  />
                                  <Typography variant="h3" color="secondary">
                                    {isNaN(
                                      (countShort[0] /
                                        (countShort[0] + countShort[1])) *
                                        100
                                    )
                                      ? 0
                                      : (
                                          (countShort[0] /
                                            (countShort[0] + countShort[1])) *
                                          100
                                        ).toFixed(1)}
                                  </Typography>
                                  <Typography
                                    style={{ marginLeft: 5 }}
                                    variant="h4"
                                    color="secondary"
                                  >
                                    %
                                  </Typography>
                                </Grid>
                              </Tooltip>
                            </>
                          )}
                        </Grid>
                      )}
                    </Grid>
                    <Grid
                      className={classes.comboBarBorder}
                      style={{
                        marginTop: 10,
                        padding: 3,
                      }}
                      container
                    >
                      <Grid item container className={classes.comboBarBorder}>
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
                      <Grid
                        item
                        container
                        className={classes.comboBarBorder}
                        style={{ marginTop: 5 }}
                      >
                        <Grid className={classes.comboBar} item xs={4}>
                          <Typography
                            style={{ marginTop: 5 }}
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
                      <Grid
                        item
                        container
                        className={classes.comboBarBorder}
                        style={{ marginTop: 5 }}
                      >
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
                    </Grid>
                  </>
                )}
                {countTotals && countTotals.good + countTotals.bad === 0 && (
                  <div style={{ margin: "0px auto" }}>
                    <Grid
                      item
                      style={{
                        margin: "0px 10px",
                        alignSelf: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        style={{ display: "initial" }}
                        onClick={() => this.nav("/short/shortLong")}
                      >
                        <Typography>You haven't played yet.</Typography>
                        <Typography>
                          Click here and make your first prediction
                        </Typography>
                      </Button>
                    </Grid>
                  </div>
                )}
                {activeLS <= 7 &&
                  !this.state.tokenLS_Active &&
                  this.state.tokenID && (
                    <Grid
                      item
                      className={classes.comboBarBorder}
                      style={{ marginTop: 5, overflow: "clip" }}
                      xs={12}
                    >
                      <div style={{ background: "rgba(255,255,255,0.1)" }}>
                        Set New
                      </div>
                      <Divider style={{ marginBottom: 5 }} />
                      {!this.state.tokenLS_Loading &&
                        !this.state.tokenLS_Active && (
                          <ButtonGroup
                            color="primary"
                            aria-label="LongShort_ButtonGroup"
                            style={{ marginBottom: 5 }}
                          >
                            <Button
                              startIcon={
                                loadingNewVote ? (
                                  <CircularProgress />
                                ) : (
                                  <TrendingUpIcon />
                                )
                              }
                              color="primary"
                              disabled={activeLS >= 7 || loadingNewVote}
                              onClick={() => this.newLSvote("long")}
                            ></Button>
                            <Button
                              endIcon={
                                loadingNewVote ? (
                                  <CircularProgress />
                                ) : (
                                  <TrendingDownIcon />
                                )
                              }
                              color="secondary"
                              disabled={activeLS >= 7 || loadingNewVote}
                              onClick={() => this.newLSvote("short")}
                            ></Button>
                          </ButtonGroup>
                        )}
                      {!this.state.tokenLS_Loading &&
                        this.state.tokenLS_Active &&
                        !this.state.tokenLS_Complete && (
                          <>
                            {this.state.tokenLS_Vote && (
                              <ButtonGroup
                                color="primary"
                                aria-label="LongShort_ButtonGroup"
                                style={{ marginBottom: 5 }}
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
                            {!this.state.tokenLS_Vote && (
                              <ButtonGroup
                                color="primary"
                                aria-label="LongShort_ButtonGroup"
                                style={{ marginBottom: 5 }}
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
                      {!this.state.tokenLS_Loading &&
                        this.state.tokenLS_Active &&
                        this.state.tokenLS_Complete && (
                          <>
                            {!this.state.loadingResult && (
                              <Button
                                startIcon={<AssignmentTurnedInIcon />}
                                variant="outlined"
                                onClick={(event) =>
                                  this.checkResult(event, tokenID)
                                }
                                color="primary"
                              >
                                Results
                              </Button>
                            )}
                            {this.state.loadingResult && (
                              <Button disabled variant="outlined">
                                <CircularProgress />
                              </Button>
                            )}
                          </>
                        )}
                    </Grid>
                  )}
                <Grid
                  item
                  container
                  justify="center"
                  xs={12}
                  className={classes.comboBarBorder}
                  style={{ marginTop: 12 }}
                >
                  <Grid
                    style={{
                      maxWidth: 200,
                      textAlign: "center",
                      width: "inherit",
                    }}
                  >
                    <Gauge
                      value={this.state.sentimentData.sentiment}
                      totalVotes={this.state.sentimentData.totalActiveVotes}
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
                        this.state.sentimentData.sentiment > 60
                          ? classes.valueGaugeBull
                          : this.state.sentimentData.sentiment < 40
                          ? classes.valueGaugeBear
                          : classes.valueGaugeNeutral
                      }
                      title="Chaingurians Sentiment"
                    />
                  </Grid>
                </Grid>
                {incompleteLS.length > 0 && (
                  <Grid item className={classes.favList} xs={12}>
                    <Divider style={{ marginTop: "12px" }} />
                    <LSTableActiveMini data={incompleteLS} />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Card>
        {modalOpen && this.renderModal(modalData)}
      </>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
  detective = (id) => {
    this.nav("/short/detective/" + id);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(LongShortMini)));
