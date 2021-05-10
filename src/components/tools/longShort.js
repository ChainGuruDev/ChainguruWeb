//Short Long Short term minigame main JS
//Allow users to bet on Tokens going Up or down
//Check result after 24hs since prediction

import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import CoinSearchBar from "../components/CoinSearchBar.js";
import LS_ResultDonutChart from "../components/LS_ResultDonutChart.js";
import LS_Table_Active from "../components/LS_Table_Active.js";
import LS_Table_History from "../components/LS_Table_History.js";
import LSvoteResultModal from "../components/lsVoteResultModal.js";

//import materialUI elements
import {
  Grid,
  Paper,
  Card,
  TextField,
  CircularProgress,
  Button,
  ButtonGroup,
  Avatar,
  Typography,
} from "@material-ui/core";

import Autocomplete from "@material-ui/lab/Autocomplete";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";

import {
  ERROR,
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
  DB_GET_TOKEN_LS,
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
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "stretch",
    background: "rgba(255,255,255,0.05)",
  },
  favTopBar: {
    padding: 5,
    marginBottom: 5,
    direction: "row",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    textAlign: "flex-end",
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
    };

    //TODO MAS TODO GET CURRENT LEADERBOARD
    if (account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USER_LS,
        address: account.address,
      });
    }
  }

  componentDidMount() {
    const account = store.getStore("account");
    emitter.on(CONNECTION_CONNECTED, this.connected);
    emitter.on(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.on(DB_GET_USER_LS_RETURNED, this.db_getUserLS);
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(DB_GET_USER_TOKEN_LS_RETURNED, this.userTokenLSReturned);
    emitter.on(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.on(DB_CHECK_LS_RESULT_RETURNED, this.db_checkLSResultReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.removeListener(DB_GET_USER_LS_RETURNED, this.db_getUserLS);
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(COIN_DATA_RETURNED, this.userTokenLSReturned);
    emitter.removeListener(DB_CREATE_LS_RETURNED, this.db_createLSReturned);
    emitter.on(DB_CHECK_LS_RESULT_RETURNED, this.db_checkLSResultReturned);
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
    this.setState({ coinData: data[0] });
  };

  db_getUserLS = (data) => {
    // sort complete and incomplete LongShorts
    let completeLS = [];
    let incompleteLS = [];
    data.forEach((item, i) => {
      item.complete ? completeLS.push(item) : incompleteLS.push(item);
    });
    console.log({ complete: completeLS, incomplete: incompleteLS });

    // sort stats by Type Long / Short
    let countLong = [0, 0];
    let countShort = [0, 0];
    completeLS.forEach((item, i) => {
      if (item.vote) {
        item.result === item.vote ? countLong[0]++ : countLong[1]++;
      } else {
        item.result === item.vote ? countShort[0]++ : countShort[1]++;
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
    let data2 = [];
    data2.push(data);
    this.userTokenLSReturned(data2);
  };

  db_checkLSResultReturned = (data) => {
    const { account } = this.state;
    // console.log(data);
    dispatcher.dispatch({
      type: DB_GET_USER_LS,
      address: account.address,
    });

    this.setState({ modalOpen: true, modalData: data });
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

  render() {
    const { classes, t } = this.props;
    const {
      account,
      loading,
      selectedID,
      countTotals,
      countLong,
      countShort,
      completeLS,
      incompleteLS,
      modalOpen,
      modalData,
    } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Card className={classes.favCard} elevation={3}>
            <Grid className={classes.favGrid} container>
              <Grid
                className={classes.favTopBar}
                item
                xs={12}
                container
                spacing={3}
              >
                <Grid item xs={6}>
                  <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="stretch"
                  >
                    <Grid item>
                      <CoinSearchBar />
                    </Grid>
                    {this.state.coinData && (
                      <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                        item
                        style={{ marginTop: 10 }}
                      >
                        <Grid item>
                          <Avatar
                            alt={this.state.coinData.image.large}
                            src={this.state.coinData.image.large}
                          />
                        </Grid>
                        <Grid item>
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
                        <Grid item>
                          <Grid item>
                            <Typography variant="subtitle2">Price</Typography>
                          </Grid>
                          <Grid item>
                            <Typography variant="h6">
                              ${" "}
                              {
                                this.state.coinData.market_data.current_price
                                  .usd
                              }
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid item>
                          <Grid item>
                            <Typography variant="subtitle2">24hs</Typography>
                          </Grid>
                          <Grid item>
                            <Typography variant="h6">
                              {
                                this.state.coinData.market_data
                                  .price_change_percentage_24h
                              }
                              %
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid item>
                          <Grid item>
                            <Typography variant="subtitle2">7D</Typography>
                          </Grid>
                          <Grid item>
                            <Typography variant="h6">
                              {
                                this.state.coinData.market_data
                                  .price_change_percentage_7d
                              }
                              %
                            </Typography>
                          </Grid>
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
                                  onClick={() => this.newLSvote("long")}
                                ></Button>
                                <Button
                                  endIcon={<TrendingDownIcon />}
                                  color="secondary"
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
                {countLong && (countLong[0] || countShort[0]) && (
                  <Grid item className={classes.graphCard} xs={6}>
                    <Grid
                      item
                      container
                      direction="column"
                      justify="flex-start"
                    >
                      <Grid item xs={3} style={{ minWidth: "120px" }}>
                        <LS_ResultDonutChart
                          data={
                            this.state.countTotals ? this.state.countTotals : {}
                          }
                        />
                      </Grid>
                      <Grid
                        item
                        container
                        direction="column"
                        xs={9}
                        style={{ marginLeft: 20 }}
                      >
                        {countTotals && (
                          <Typography variant="h2" color="primary">
                            {(
                              (countTotals.ok /
                                (countTotals.ok + countTotals.bad)) *
                              100
                            ).toFixed(2)}{" "}
                            %
                          </Typography>
                        )}
                        {countLong && (
                          <Typography variant="h3" color="primary">
                            Long: {countLong[0]} correct (
                            {countLong[0] + countLong[1]} total)
                          </Typography>
                        )}
                        {countShort && (
                          <Typography variant="h3" color="secondary">
                            Short: {countShort[0]} correct (
                            {countShort[0] + countShort[1]} total)
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
              <Grid item className={classes.favList} xs={12}>
                {incompleteLS && <LS_Table_Active data={incompleteLS} />}
                {completeLS && <LS_Table_History data={completeLS} />}
              </Grid>
            </Grid>
          </Card>
        )}
        {modalOpen && this.renderModal(modalData)}
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(LongShort)));
