import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";

import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import { COINLIST_RETURNED, GET_COIN_DATA } from "../../constants";

import {
  GET_SWAP_TOKENLIST,
  GET_SWAP_TOKENLIST_RETURNED,
  GET_CUSTOM_TOKEN_DATA,
  GET_CUSTOM_TOKEN_DATA_RETURNED,
} from "../../constants/constantsOneInch.js";

import Store from "../../stores";
import OneInch_Store from "../../stores/1inch_store.js";

const emitter1Inch = OneInch_Store.emitter;
const dispatcher1Inch = OneInch_Store.dispatcher;

const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => {};

class SwapTokenSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: props.items,
      open: false,
      loading: this.open && this.items.length === 0,
      selectedToken: null,
      loadingCustomToken: false,
    };
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  componentDidMount() {
    emitter1Inch.on(GET_SWAP_TOKENLIST_RETURNED, this.coinlistReturned);
    emitter1Inch.on(
      GET_CUSTOM_TOKEN_DATA_RETURNED,
      this.customTokenDataReturned
    );
  }

  componentWillUnmount() {
    emitter1Inch.removeListener(
      GET_SWAP_TOKENLIST_RETURNED,
      this.coinlistReturned
    );
    emitter1Inch.removeListener(
      GET_CUSTOM_TOKEN_DATA_RETURNED,
      this.customTokenDataReturned
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.selected) {
      if (prevProps.selected !== this.props.selected) {
        let _type = this.props.type;
        this.coinSelect(this.props.selected, _type);
        this.setState({
          selectedToken: this.props.selected,
        });
      }
    }
  }

  coinlistReturned = (payload) => {
    const addr = Object.keys(payload);
    const items = Object.entries(payload);
    let optimizedItems = [];
    items.forEach((item, i) => {
      optimizedItems.push(item[1]);
    });
    this.setState({ loading: false, items: optimizedItems });
  };

  coinSelect = async (newValue, type) => {
    if (newValue) {
      if (!newValue.address) {
        this.getCustomTokenData(newValue);
      } else {
        if (newValue !== this.props.selected) {
          let _id = newValue["address"];
          this.props.parentCallback(newValue, type);
        }
      }
    }
  };

  getCustomTokenData = async (address) => {
    this.setState(
      {
        loadingCustomToken: true,
      },
      () => {
        dispatcher1Inch.dispatch({
          type: GET_CUSTOM_TOKEN_DATA,
          tokenContract: address,
        });
      }
    );
  };

  customTokenDataReturned = (data) => {
    if (this.state.loadingCustomToken) {
      this.setState({ loadingCustomToken: false }, () => {
        this.props.parentCallback(data, this.props.type);
      });
    }
  };

  render() {
    return (
      <Autocomplete
        id="coin-search-bar"
        freeSolo
        options={this.state.items ? this.state.items : []}
        open={this.state.openSearch}
        value={this.state.selectedToken}
        getOptionSelected={(option, value) => option.symbol === value.symbol}
        getOptionLabel={(option) => `${option.name} (${option.symbol})`}
        onChange={(event, newValue) => {
          this.coinSelect(newValue, this.props.type);
        }}
        loading={this.state.loading}
        renderInput={(params) => (
          <TextField
            {...params}
            //label="Coin Search"
            label={this.props.type === "FROM" ? "From" : "To"}
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

export default withRouter(withStyles(styles)(SwapTokenSearch));
