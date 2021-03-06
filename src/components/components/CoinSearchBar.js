import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";

import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_COIN_DATA,
  GETTING_NEW_CHART_DATA,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => {};

const filterOptions = createFilterOptions({
  matchFrom: "any",
  limit: 250,
});

class CoinSearchBar extends Component {
  constructor(props) {
    super();

    this.state = {
      items: [],
      open: false,
      loading: this.open && this.items.length === 0,
    };
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  componentDidMount() {
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
  }

  coinlistReturned = (payload) => {
    this.setState({ loading: false });
    this.setState({ items: payload });
  };

  coinSelect = (newValue, compareBarID) => {
    if (newValue) {
      emitter.emit(GETTING_NEW_CHART_DATA, newValue.id);
      let _id = newValue.id;
      if (compareBarID) {
        if (compareBarID === "news") {
          this.props.callback(newValue.symbol);
        } else {
          dispatcher.dispatch({
            type: GET_COIN_DATA,
            content: _id,
            BarID: compareBarID,
          });
        }
      } else {
        dispatcher.dispatch({
          type: GET_COIN_DATA,
          content: _id,
        });
      }
    }
  };

  openSearch = (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    dispatcher.dispatch({
      type: GET_COIN_LIST,
      content: {},
    });
  };

  render() {
    return (
      <Autocomplete
        id="coin-search-bar"
        options={this.state.items}
        open={this.state.openSearch}
        onOpen={(e) => {
          this.openSearch(e);
        }}
        getOptionSelected={(option, value) => option.name === value.name}
        getOptionLabel={(option) => `${option.name} (${option.symbol})`}
        onChange={(event, newValue) => {
          this.coinSelect(newValue, this.props.id);
        }}
        filterOptions={filterOptions}
        loading={this.state.loading}
        renderInput={(params) => (
          <TextField
            {...params}
            //label="Coin Search"
            label={this.props.label ? this.props.label : "Coin Search"}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {this.state.loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
    );
  }
}

export default withStyles(styles)(CoinSearchBar);
