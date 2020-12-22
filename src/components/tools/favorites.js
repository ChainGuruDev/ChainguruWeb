import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import FavoriteList from "../components/favoriteList.js";

//IMPORT MaterialUI
import {
  Card,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";

import Autocomplete from "@material-ui/lab/Autocomplete";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";

import {
  ERROR,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_COIN_DATA,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  COIN_DATA_RETURNED,
  DB_ADD_FAVORITE,
  DB_ADD_FAVORITE_RETURNED,
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
    background: "rgba(255,255,255,0.25)",
  },
  favTopBar: {
    padding: 5,
    marginBottom: 5,
    direction: "row",
    alignItems: "center",
    textAlign: "flex-end",
    justifyContent: "center",
  },
  favList: {
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
});

class Favorites extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      items: [],
      open: false,
      loadingBar: this.open && this.items.length === 0,
      account: account,
      loading: false,
      selectedID: "",
      validSelection: false,
      favList: [],
    };
    if (account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
  }

  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  coinlistReturned = (payload) => {
    console.log(payload);
    this.setState({ loading: false, items: payload });
  };

  coinSelect = (newValue) => {
    if (newValue) {
      this.setState({ validSelection: true, selectedID: newValue.id });
    } else {
      this.setState({ validSelection: false, selectedID: "" });
    }
  };

  openSearch = () => {
    this.setState({ loading: true });
    dispatcher.dispatch({
      type: GET_COIN_LIST,
      content: {},
    });
  };

  dbUserDataReturned = (payload) => {
    console.log(payload);
  };

  addFavorite = (tokenID) => {
    dispatcher.dispatch({
      type: DB_ADD_FAVORITE,
      content: tokenID,
    });
    this.setState({ validSelection: false, selectedID: "" });
  };

  render() {
    const { classes, t } = this.props;
    const { account, loading, favList, selectedID } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Card className={classes.favCard} elevation={3}>
            <Grid className={classes.favGrid} container>
              <Grid className={classes.favTopBar} item xs={12} container>
                <Grid item xs={9}>
                  <Autocomplete
                    id="coin-search-bar"
                    options={this.state.items}
                    open={this.state.openSearch}
                    onOpen={() => {
                      this.openSearch();
                    }}
                    getOptionSelected={(option, value) =>
                      option.name === value.name
                    }
                    getOptionLabel={(option) =>
                      `${option.name} (${option.symbol})`
                    }
                    onChange={(event, newValue) => {
                      this.coinSelect(newValue, this.props.id);
                    }}
                    loading={this.state.loadingBar}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Coin Search"
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
                </Grid>
                <Grid item xs={1} style={{ marginLeft: 10 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<AddCircleRoundedIcon />}
                    disabled={!this.state.validSelection}
                    onClick={() => {
                      this.addFavorite(selectedID);
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
              <Grid item className={classes.favList} xs={12}>
                <FavoriteList />
              </Grid>
            </Grid>
          </Card>
        )}
      </div>
    );
  }
  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withRouter(withStyles(styles)(Favorites));
