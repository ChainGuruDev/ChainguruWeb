import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import FavoriteList from "../components/favoriteList.js";

//IMPORT MaterialUI
import {
  Card,
  Grid,
  Button,
  TextField,
  CircularProgress,
  LinearProgress,
} from "@material-ui/core";

import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";

import {
  GET_COIN_LIST,
  COINLIST_RETURNED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_ADD_FAVORITE,
  DB_ADD_FAVORITE_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  LOGIN_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const filterOptions = createFilterOptions({
  matchFrom: "any",
  limit: 250,
});

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
    const userAuth = store.getStore("userAuth");

    this.state = {
      items: [],
      open: false,
      loadingBar: this.open && this.items.length === 0,
      account: account,
      loading: false,
      selectedID: "",
      validSelection: false,
      favList: [],
      progressBar: 0,
      isAddingFav: false,
    };
    if (userAuth && account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  }

  updateFavorites() {
    // console.log("bar update");
    const account = store.getStore("account");
    if (account && account.address) {
      const newProgressBar = this.state.progressBar + 1;
      this.setState({ progressBar: newProgressBar });
      if (newProgressBar > 99) {
        this.setState({ progressBar: 0 });
        dispatcher.dispatch({
          type: COINGECKO_POPULATE_FAVLIST,
          tokenIDs: this.state.favList,
        });
      }
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_ADD_FAVORITE_RETURNED, this.dbAddFavoriteReturned);
    emitter.on(LOGIN_RETURNED, this.loginReturned);
    //emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    this.interval = setInterval(() => this.updateFavorites(), 1000);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(
      DB_ADD_FAVORITE_RETURNED,
      this.dbAddFavoriteReturned
    );
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);
    //emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    clearInterval(this.interval);
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  loginReturned = () => {
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    if (userAuth && account && account.address) {
      dispatcher.dispatch({
        type: DB_GET_USERDATA,
        address: account.address,
      });
    }
  };

  dbUserDataReturned = (data) => {
    if (data.favorites.tokenIDs.length > 0) {
      this.setState({ favList: data.favorites.tokenIDs });
    }
  };

  dbAddFavoriteReturned = () => {
    this.setState({ isAddingFav: false });
  };

  coinlistReturned = (payload) => {
    // console.log(payload);
    this.setState({ loading: false, items: payload, progressBar: 0 });
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

  // dbUserDataReturned = (payload) => {
  //   console.log(payload);
  // };

  addFavorite = (tokenID) => {
    dispatcher.dispatch({
      type: DB_ADD_FAVORITE,
      content: tokenID,
    });
    this.setState({ validSelection: false, selectedID: "", isAddingFav: true });
  };

  render() {
    const { classes } = this.props;
    const { account, selectedID } = this.state;

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
                    filterOptions={filterOptions}
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
                    {this.state.isAddingFav ? <CircularProgress /> : "Add"}
                  </Button>
                </Grid>
              </Grid>
              <Grid item className={classes.favList} xs={12}>
                <LinearProgress
                  variant="determinate"
                  value={this.state.progressBar}
                />
                <FavoriteList timeFrame={this.props.timeFrame} />
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
