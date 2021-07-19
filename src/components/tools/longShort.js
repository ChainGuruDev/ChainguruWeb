//Short Long Short term minigame main JS
//Allow users to bet on Tokens going Up or down
//Check result after 24hs since prediction

import React, { Component } from "react";

import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

import CoinSearchBar from "../components/CoinSearchBar.js";
import LSResultDonutChart from "../components/LS_ResultDonutChart.js";
import LSTableActive from "../components/LS_Table_Active.js";
import LSTableHistory from "../components/LS_Table_History.js";
import LSvoteResultModal from "../components/lsVoteResultModal.js";
import SparklineChart from "../components/SparklineChart.js";

import ProfileMini from "../profile/profileMini.js";
import LeaderboardMini from "../leaderboard/leaderboardMini.js";

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

//import materialUI icons
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import {
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
    marginTop: 10,
    marginBottom: 10,
    background: "rgba(255,255,255,0.05)",
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
    background: "rgba(75,75,75,0.8)",
    borderRadius: "10px",
  },
});

class LongShort extends Component {
  constructor() {
    super();
    const account = store.getStore("account");

    this.state = {
      account: account,
      loading: false,
      newSearchLoading: true,
      newTokenVote: false,
      modalOpen: false,
      activeLS: 0,
      longCombo: 0,
      shortCombo: 0,
    };

    if (account && account.address) {
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
    emitter.removeListener(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.removeListener(
      DB_CHECK_LS_RESULT_RETURNED,
      this.db_checkLSResultReturned
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

  db_getUserLS = (data) => {
    // sort complete and incomplete LongShorts
    let completeLS = [];
    let incompleteLS = [];
    data.forEach((item, i) => {
      item.complete ? completeLS.push(item) : incompleteLS.push(item);
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
    console.log(data);
    dispatcher.dispatch({
      type: DB_GET_USER_LS,
      address: account.address,
    });
    dispatcher.dispatch({
      type: DB_GET_USERDATA,
      address: account.address,
    });
    this.setState({ modalOpen: true, modalData: data });
  };

  dbUserDataReturned = (data) => {
    //GET LONG SHORT COMBO STATUS
    this.setState({
      longCombo: data.minigames.longShortStrike.long,
      shortCombo: data.minigames.longShortStrike.short,
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
      for (var l = 0; l < remaining; l++) {
        combo.push(
          <RadioButtonUncheckedIcon
            key={`unchecked_${l}`}
            fontSize="small"
            color="disabled"
          />
        );
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
    } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Grid container>
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
                    <Grid item xs={8}>
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
                            <CoinSearchBar />
                          </Grid>
                        </Tooltip>

                        {this.state.coinData && (
                          <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                            item
                            style={{ marginTop: 10 }}
                          >
                            <Grid
                              onClick={() =>
                                this.detective(this.state.coinData.id)
                              }
                              style={{
                                maxWidth: "max-content",
                                cursor: "pointer",
                              }}
                              item
                            >
                              <Avatar
                                alt={this.state.coinData.image.large}
                                src={this.state.coinData.image.large}
                                style={{ maxWidth: "max-content" }}
                              />
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
                                <Typography variant="h6">
                                  {this.state.coinData.name}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="subtitle2">
                                  {this.state.coinData.symbol}
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
                                <Typography variant="subtitle2">
                                  Price
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="h6">
                                  ${" "}
                                  {
                                    this.state.coinData.market_data
                                      .current_price.usd
                                  }
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
                                <Typography variant="subtitle2">
                                  24hs
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="h6">
                                  {this.state.coinData.market_data.price_change_percentage_24h.toFixed(
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
                                  {this.state.coinData.market_data.price_change_percentage_7d.toFixed(
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
                                    <Typography variant="h2" color="secondary">
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
                                    {(
                                      (countLong[0] /
                                        (countLong[0] + countLong[1])) *
                                      100
                                    ).toFixed(2)}{" "}
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
                                    {(
                                      (countShort[0] /
                                        (countShort[0] + countShort[1])) *
                                      100
                                    ).toFixed(2)}{" "}
                                    %)
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Grid>
                        )}
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
                          borderColor: "rgba(75,75,75,0.5)",
                          borderStyle: "solid",
                          borderWidth: "thin",
                          borderRadius: "10px",
                          background: "rgba(75,75,75,0.25)",
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
                                marginTop: 5,
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
                                marginTop: 5,
                                marginRight: 5,
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
                                marginTop: 5,
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
              <LeaderboardMini />
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
