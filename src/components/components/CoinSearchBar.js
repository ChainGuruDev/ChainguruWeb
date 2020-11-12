import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withRouter, Link } from "react-router-dom";

import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import { colors } from "../../theme";

import {
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_COIN_DATA,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => {
  root: {
  }
};

class CoinSearchBar extends Component {
  constructor(props) {
    super();

    this.state = {
      items: [],
    };
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    dispatcher.dispatch({
      type: GET_COIN_LIST,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
  }

  coinlistReturned = (payload) => {
    console.log(payload);

    this.setState({ items: payload });
  };

  coinSelect = (newValue, compareBarID) => {
    if (newValue) {
      let _id = newValue.id;
      if (compareBarID) {
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: _id,
          BarID: compareBarID,
        });
      } else {
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: _id,
        });
      }
    }
  };

  render() {
    return (
      <Autocomplete
        id="coin-search-bar"
        options={this.state.items}
        getOptionLabel={(option) => option.id}
        onChange={(event, newValue) => {
          this.coinSelect(newValue, this.props.id);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Coin Search" variant="outlined" />
        )}
      />
    );
  }
}

export default withRouter(withStyles(styles)(CoinSearchBar));
