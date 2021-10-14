import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatMoney, formatMoneyMCAP } from "../helpers";

//Import UI elements
import {
  Typography,
  Grid,
  Paper,
  Card,
  IconButton,
  TextField,
  Button,
  CircularProgress,
} from "@material-ui/core";

import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

import BlueChipCard from "../components/BlueChipCard.js";

import SettingsIcon from "@material-ui/icons/Settings";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import KeyboardArrowDownRoundedIcon from "@material-ui/icons/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@material-ui/icons/KeyboardArrowUpRounded";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  ERROR,
  DB_GET_BLUECHIPS,
  DB_GET_BLUECHIPS_RETURNED,
  DB_GET_BLUECHIPS_USER,
  DB_GET_BLUECHIPS_USER_RETURNED,
  DB_BLUECHIPS_CHECK,
  DB_BLUECHIPS_RETURNED,
  DB_BLUECHIPS_CHECK_RETURNED,
  DB_ADD_BLUECHIPS_GURU,
  DB_ADD_BLUECHIPS_GURU_RETURNED,
  DB_DEL_BLUECHIPS_GURU_RETURNED,
  DB_ADD_BLUECHIPS,
  DB_ADD_BLUECHIPS_RETURNED,
  DB_DEL_BLUECHIPS_RETURNED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
} from "../../constants";

import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const filterOptions = createFilterOptions({
  matchFrom: "any",
  limit: 250,
});

const styles = (theme) => ({
  root: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    width: "100%",
    maxHeight: "100%",
  },
  paper: {
    textAlign: "center",
    color: theme.palette.text.primary,
  },
  paperDark: {
    textAlign: "center",
    color: theme.palette.text.primary,
  },
});

class BlueChips extends Component {
  constructor(props) {
    super();

    this.state = {
      chipData: [],
      chipDataUser: [],
      hasMore: true,
      count: { prev: 0, next: 6 },
      bluechipsGuru: [],
      bluechipsUser: [],
      isAdmin: false,
      editMode: false,
      editModeUser: false,
      selectedID: "",
      validSelection: false,
      isAddingBlueChip: false,
      loading: false,
      showGuruChips: true,
      showUserChips: true,
      items: [],
    };
  }

  componentDidMount() {
    emitter.setMaxListeners(this.state.chipData.length);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connected);
    emitter.on(DB_GET_BLUECHIPS_RETURNED, this.geckoBluechipData);
    emitter.on(DB_GET_BLUECHIPS_USER_RETURNED, this.geckoBluechipDataUser);
    emitter.on(DB_BLUECHIPS_CHECK_RETURNED, this.bluechipsCheckReturned);
    emitter.on(
      DB_DEL_BLUECHIPS_GURU_RETURNED,
      this.db_addDelBluechipGuruReturned
    );
    emitter.on(
      DB_ADD_BLUECHIPS_GURU_RETURNED,
      this.db_addDelBluechipGuruReturned
    );
    emitter.on(DB_ADD_BLUECHIPS_RETURNED, this.db_addDelBluechipReturned);
    emitter.on(DB_DEL_BLUECHIPS_RETURNED, this.db_addDelBluechipReturned);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    if (store.getStore("account").address) {
      dispatcher.dispatch({
        type: DB_GET_BLUECHIPS_USER,
      });
      dispatcher.dispatch({
        type: DB_BLUECHIPS_CHECK,
      });
    }
    dispatcher.dispatch({
      type: DB_GET_BLUECHIPS,
    });
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connected);
    emitter.removeListener(DB_GET_BLUECHIPS_RETURNED, this.geckoBluechipData);
    emitter.removeListener(
      DB_GET_BLUECHIPS_USER_RETURNED,
      this.geckoBluechipDataUser
    );

    emitter.removeListener(
      DB_BLUECHIPS_CHECK_RETURNED,
      this.bluechipsCheckReturned
    );
    emitter.removeListener(
      DB_DEL_BLUECHIPS_GURU_RETURNED,
      this.db_addDelBluechipGuruReturned
    );
    emitter.removeListener(
      DB_ADD_BLUECHIPS_GURU_RETURNED,
      this.db_addDelBluechipGuruReturned
    );
    emitter.removeListener(
      DB_ADD_BLUECHIPS_RETURNED,
      this.db_addDelBluechipReturned
    );
    emitter.removeListener(
      DB_DEL_BLUECHIPS_RETURNED,
      this.db_addDelBluechipReturned
    );

    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
  }

  coinlistReturned = (payload) => {
    // console.log(payload);
    this.setState({ loading: false, items: payload, progressBar: 0 });
  };

  connected = (data) => {
    if (store.getStore("account").address) {
      dispatcher.dispatch({
        type: DB_GET_BLUECHIPS_USER,
      });
      dispatcher.dispatch({
        type: DB_BLUECHIPS_CHECK,
      });
    }
  };

  db_addDelBluechipGuruReturned = (data) => {
    if (data.nModified >= 1) {
      let newbluechipsGuru = [];
      this.setState({
        chipData: [],
        hasMore: true,
        count: { prev: 0, next: 6 },
        bluechipsGuru: [],
        isAddingBlueChip: false,
      });
      dispatcher.dispatch({
        type: DB_GET_BLUECHIPS,
      });
    }
  };

  db_addDelBluechipReturned = (data) => {
    if (data.tokenIDs.length != 0) {
      this.setState({
        isAddingBlueChip: false,
      });
      dispatcher.dispatch({
        type: DB_GET_BLUECHIPS_USER,
      });
    } else {
      this.setState({
        isAddingBlueChip: false,
        bluechipsUser: [],
        editModeUser: true,
      });
    }
  };

  bluechipsCheckReturned = (isAdmin) => {
    this.setState({ isAdmin });
  };

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: error.toString(),
        snackbarType: "Error",
      };
      that.setState(snackbarObj);
    });
  };

  geckoBluechipData = (payload) => {
    const { count } = this.state;
    let chips = [];
    payload.forEach((item, i) => {
      let chipData = this.createBluechip(
        item.image,
        item.name,
        item.id,
        item.symbol,
        formatMoney(item.current_price, 2),
        parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
        formatMoneyMCAP(item.market_cap, 0),
        formatMoneyMCAP(item.fully_diluted_valuation, 0)
      );
      chips.push(chipData);
    });
    this.setState({
      hasMore: true,
      chipData: chips,
      bluechipsGuru: chips.slice(count.prev, count.next),
    });
  };

  geckoBluechipDataUser = (payload) => {
    const { countUser } = this.state;
    let chips = [];

    payload.forEach((item, i) => {
      let chipData = this.createBluechip(
        item.image,
        item.name,
        item.id,
        item.symbol,
        formatMoney(item.current_price),
        parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
        formatMoneyMCAP(item.market_cap, 0),
        formatMoneyMCAP(item.fully_diluted_valuation, 0)
      );
      chips.push(chipData);
    });

    this.setState({
      bluechipsUser: chips,
      editModeUser: chips.length === 0 ? true : this.state.editModeUser,
    });
  };

  createBluechip = (
    image,
    name,
    id,
    symbol,
    current_price,
    price_change_percentage_1y_in_currency,
    market_cap,
    fully_diluted_valuation
  ) => {
    return {
      image,
      name,
      id,
      symbol,
      current_price,
      price_change_percentage_1y_in_currency,
      market_cap,
      fully_diluted_valuation,
    };
  };

  toggleEditMode = () => {
    const edit = !this.state.editMode;
    this.setState({ editMode: edit });
  };

  toggleEditModeUser = () => {
    const edit = !this.state.editModeUser;
    this.setState({ editModeUser: edit });
  };

  coinSelect = (newValue) => {
    if (newValue) {
      this.setState({ validSelection: true, selectedID: newValue.id });
    } else {
      this.setState({ validSelection: false, selectedID: "" });
    }
  };

  coinSelectUser = (newValue) => {
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

  addBlueChip = (tokenID) => {
    dispatcher.dispatch({
      type: DB_ADD_BLUECHIPS_GURU,
      tokenID: tokenID,
    });
    this.setState({
      validSelection: false,
      selectedID: "",
      isAddingBlueChip: true,
    });
  };

  addBlueChipUser = (tokenID) => {
    dispatcher.dispatch({
      type: DB_ADD_BLUECHIPS,
      tokenID: tokenID,
    });
    this.setState({
      validSelection: false,
      selectedID: "",
      isAddingBlueChip: true,
    });
  };

  showHideGuruChips = () => {
    const { showGuruChips } = this.state;
    const display = !showGuruChips;
    this.setState({ showGuruChips: display });
  };

  showHideUserChips = () => {
    const { showUserChips } = this.state;
    const display = !showUserChips;
    this.setState({ showUserChips: display });
  };

  drawUserBluechips = (bluechipsUser, darkMode) => {
    const { classes } = this.props;
    const { showUserChips, editModeUser, items, selectedID } = this.state;

    return (
      <>
        <Grid item xs={12} style={{ padding: 0 }}>
          <Card
            className={darkMode ? classes.paperDark : classes.paper}
            elevation={3}
            style={{ justifyContent: "space-between" }}
          >
            <Grid container direction="row" style={{ padding: 10 }}>
              <Grid item xs={1}></Grid>
              <Grid item xs={10}>
                <Typography variant="h2">My BLUECHIPS</Typography>
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => this.toggleEditModeUser()}>
                  <SettingsIcon />
                </IconButton>
                {
                  <IconButton onClick={() => this.showHideUserChips()}>
                    {showUserChips ? (
                      <KeyboardArrowDownRoundedIcon />
                    ) : (
                      <KeyboardArrowUpRoundedIcon />
                    )}
                  </IconButton>
                }
              </Grid>
              {editModeUser && (
                <Grid item xs={12}>
                  <Grid
                    item
                    container
                    direction={"row"}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Grid item xs={9}>
                      <Autocomplete
                        id="coin-search-bar"
                        options={items}
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
                          this.coinSelectUser(newValue, this.props.id);
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
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
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
                          this.addBlueChipUser(selectedID);
                        }}
                      >
                        {this.state.isAddingBlueChip ? (
                          <CircularProgress />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction={"row"}
          justify="center"
          style={{ padding: 0, marginBottom: 10 }}
        >
          {showUserChips &&
            bluechipsUser.map((bluechip) => (
              <BlueChipCard
                key={bluechip.id}
                data={bluechip}
                editMode={editModeUser}
                type="USER"
              />
            ))}
        </Grid>
      </>
    );
  };

  render() {
    const { classes } = this.props;
    const {
      chipData,
      bluechipsGuru,
      bluechipsUser,
      hasMore,
      count,
      isAdmin,
      editMode,
      editModeUser,
      selectedID,
      showGuruChips,
      showUserChips,
    } = this.state;
    const darkMode = store.getStore("theme") === "dark" ? true : false;

    const getMoreData = () => {
      if (bluechipsGuru.length === chipData.length) {
        this.setState({ hasMore: false });
        return;
      }
      setTimeout(() => {
        this.setState({
          bluechipsGuru: bluechipsGuru.concat(
            chipData.slice(
              count.prev === 0 ? count.prev + 6 : count.prev + 4,
              count.next + 4
            )
          ),
        });
      }, 2000);
      this.setState((prevState) => ({
        count: {
          prev:
            prevState.count.prev === 0
              ? prevState.count.prev + 6
              : prevState.count.prev + 4,
          next: prevState.count.next + 4,
        },
      }));
    };

    return (
      <>
        <Grid container style={{ maxWidth: "90%", margin: "auto" }} spacing={3}>
          {this.drawUserBluechips(bluechipsUser, darkMode)}
          <Grid item xs={12} style={{ padding: 0 }}>
            <Card
              className={darkMode ? classes.paperDark : classes.paper}
              elevation={3}
              style={{ justifyContent: "space-between" }}
            >
              <Grid container direction="row" style={{ padding: 10 }}>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Typography variant="h2">GURU's BLUECHIPS</Typography>
                </Grid>
                <Grid item xs={1}>
                  {isAdmin && (
                    <IconButton onClick={() => this.toggleEditMode()}>
                      <SettingsIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => this.showHideGuruChips()}>
                    {showGuruChips ? (
                      <KeyboardArrowDownRoundedIcon />
                    ) : (
                      <KeyboardArrowUpRoundedIcon />
                    )}
                  </IconButton>
                </Grid>
                {editMode && (
                  <Grid item xs={12}>
                    <Grid
                      item
                      container
                      direction={"row"}
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
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
                                      <CircularProgress
                                        color="inherit"
                                        size={20}
                                      />
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
                            this.addBlueChip(selectedID);
                          }}
                        >
                          {this.state.isAddingBlueChip ? (
                            <CircularProgress />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>
          {showGuruChips && (
            <Grid item style={{ padding: 10, minWidth: "100%" }}>
              <InfiniteScroll
                dataLength={bluechipsGuru.length}
                next={getMoreData}
                hasMore={hasMore}
                loader={
                  <div style={{ textAlign: "center", marginTop: 15 }}>
                    Loading...
                  </div>
                }
                style={{ overflow: false, minWidth: "100%" }}
              >
                <Grid container spacing={2}>
                  {bluechipsGuru.map((bluechip) => (
                    <BlueChipCard
                      key={bluechip.id}
                      data={bluechip}
                      editMode={editMode}
                    />
                  ))}
                </Grid>
              </InfiniteScroll>
            </Grid>
          )}
        </Grid>
      </>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(BlueChips)));
