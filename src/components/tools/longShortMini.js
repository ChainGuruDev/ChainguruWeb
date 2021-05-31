//MiniUI for Long Short term minigame
//Allow users to bet on Tokens going Up or down
//Check result after 24hs since prediction

import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

import LSvoteResultModal from "../components/lsVoteResultModal.js";
import LSResultDonutChart from "../components/LS_ResultDonutChart.js";
//LSTABLEACTIVE MINI

import { Grid, Card, Button, Avatar, Typography } from "@material-ui/core";

import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USER_LS,
  DB_GET_USER_LS_RETURNED,
  DB_CHECK_LS_RESULT_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  favCard: {
    padding: 10,
    margin: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "flex-start",
    background: "rgba(255,255,255,0.05)",
  },
});

class LongShortMini extends Component {
  constructor() {
    super();
    const account = store.getStore("account");

    this.state = {
      account: account,
      loading: false,
      modalOpen: false,
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
    emitter.on(DB_CHECK_LS_RESULT_RETURNED, this.db_checkLSResultReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.disconnected);
    emitter.removeListener(DB_GET_USER_LS_RETURNED, this.db_getUserLS);
    emitter.removeListener(
      DB_CHECK_LS_RESULT_RETURNED,
      this.db_checkLSResultReturned
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
      for (var i = 0; i < remaining; i++) {
        combo.push(
          <RadioButtonUncheckedIcon
            key={`unchecked_${i}`}
            fontSize="small"
            color="disabled"
          />
        );
      }
    } else {
      for (var i = 0; i < number; i++) {
        combo.push(
          <RadioButtonCheckedIcon
            key={`checked_${i}`}
            fontSize="small"
            color="primary"
          />
        );
      }
      for (var i = 0; i < remaining; i++) {
        combo.push(
          <RadioButtonUncheckedIcon
            key={`checked_left${i}`}
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
      <Card
        className={classes.favCard}
        style={{ maxHeight: "max-content" }}
        elevation={3}
      >
        Mini LongShort UI
      </Card>
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
