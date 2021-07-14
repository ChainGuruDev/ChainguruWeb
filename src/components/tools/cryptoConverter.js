import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import CoinSearchBar from "../components/CoinSearchBar.js";
import ShuffleIcon from "@material-ui/icons/Shuffle";

//Import Material UI components
import {
  Card,
  Typography,
  Grid,
  Divider,
  Button,
  ButtonGroup,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
} from "@material-ui/core";

//import Constants
import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
  GET_COIN_DATA,
  SWITCH_VS_COIN_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

//Define css Styling
const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  portfolioCard: {
    padding: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignItems: "stretch",
    background: "rgba(125,125,125,0.1)",
    border: `2px solid ${colors.cgGreen}`,
    textAlign: "center",
    justifyContent: "space-evenly",
  },
  button: {
    margin: 15,
  },
});

class CryptoConverter extends Component {
  constructor() {
    super();

    let vsCoin = store.getStore("vsCoin");
    const account = store.getStore("account");
    this.state = {
      loadingFrom: false,
      loadingTo: false,
      fromData: null,
      fromPrice: null,
      toPrice: null,
      toData: null,
      errorFrom: false,
      errorTo: false,
      fromAmount: 1,
      toAmmount: "",
      vsCoin: vsCoin,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
    emitter.on(GET_COIN_DATA, this.getCoinData);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    !this.state.vs && this.getVsCoin();
    this._isMounted &&
      dispatcher.dispatch({
        type: GET_COIN_LIST,
      });
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(COINLIST_RETURNED, this.coinlistReturned);
    emitter.removeListener(GET_COIN_DATA, this.getCoinData);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);

    this._isMounted = false;
  }

  getVsCoin = () => {
    let vsCoin;
    try {
      vsCoin = JSON.parse(localStorage.getItem("vsCoin"));
      if (!vsCoin) {
        vsCoin = "usd";
      }
      this.setState({ vsCoin: vsCoin });
    } catch (err) {
      vsCoin = "usd";
      this.setState({ vsCoin: vsCoin });
    }
  };

  vsCoinReturned = (vsCoin) => {
    const { fromData, toData } = this.state;
    let newPriceFrom = null;
    let newPriceTo = null;

    if (fromData != null) {
      switch (vsCoin) {
        case "usd":
          newPriceFrom = fromData.market_data.current_price.usd;
          break;
        case "eur":
          newPriceFrom = fromData.market_data.current_price.eur;
          break;
        case "btc":
          newPriceFrom = fromData.market_data.current_price.btc;
          break;
        case "eth":
          newPriceFrom = fromData.market_data.current_price.eth;
          break;
        default:
          break;
      }
    }
    if (toData != null) {
      switch (vsCoin) {
        case "usd":
          newPriceTo = toData.market_data.current_price.usd;
          break;
        case "eur":
          newPriceTo = toData.market_data.current_price.eur;
          break;
        case "btc":
          newPriceTo = toData.market_data.current_price.btc;
          break;
        case "eth":
          newPriceTo = toData.market_data.current_price.eth;
          break;
        default:
          break;
      }
    }
    this.setState({
      vsCoin: vsCoin,
      fromPrice: newPriceFrom,
      toPrice: newPriceTo,
    });
  };

  getCoinData = (payload) => {
    if (payload === "from") {
      this.setState({ loadingFrom: true });
    } else {
      this.setState({ loadingTo: true });
    }
  };

  connectionConnected = () => {
    const { t } = this.props;
  };

  connectionDisconnected = () => {};

  coinlistReturned = (data) => {
    this._isMounted && this.setState({ coinList: data });
  };

  coinDataReturned = async (data) => {
    let newPrice = 0;
    switch (this.state.vsCoin) {
      case "usd":
        newPrice = data[0].market_data.current_price.usd;
        break;
      case "eur":
        newPrice = data[0].market_data.current_price.eur;
        break;
      case "btc":
        newPrice = data[0].market_data.current_price.btc;
        break;
      case "eth":
        newPrice = data[0].market_data.current_price.eth;
        break;
      default:
        break;
    }

    if (data[1] === "from") {
      this.setState({
        fromData: data[0],
        fromPrice: newPrice,
        loadingFrom: false,
      });
    } else {
      this.setState({ toData: data[0], toPrice: newPrice, loadingTo: false });
    }
  };

  handleChangeFrom = (event, newValue) => {
    this.setState({ fromAmount: event.target.value });
    this.swapCalc(event.target.value);
  };

  swapCalc = (ammount) => {
    const { fromPrice, toPrice, fromAmount, vsCoin } = this.state;
    if (fromPrice) {
      if (toPrice) {
        if (ammount) {
          let toAmmount = (fromPrice * ammount) / toPrice;
          this.setState({
            toAmmount: toAmmount,
            errorFrom: false,
            errorTo: false,
          });
        } else {
          let toAmmount = (fromPrice * fromAmount) / toPrice;
          this.setState({
            toAmmount: toAmmount,
            errorFrom: false,
            errorTo: false,
          });
        }
      } else {
        this.setState({ errorTo: true });
      }
    } else {
      if (toPrice) {
        this.setState({ errorTo: true, errorFrom: true });
      }
      this.setState({ errorFrom: true });
    }
  };

  render() {
    const { classes, t } = this.props;
    const {
      fromData,
      fromPrice,
      toPrice,
      toData,
      loadingFrom,
      loadingTo,
      vsCoin,
    } = this.state;

    return (
      <div className={classes.root}>
        <Grid
          className={classes.portfolioGrid}
          spacing={3}
          container
          direction="column"
          justify="center"
          alignItems="center"
        >
          <Grid item>
            <Card className={classes.portfolioCard} elevation={3}>
              <Grid
                item
                container
                direction="column"
                justify="center"
                alignItems="center"
              >
                <Grid item style={{ marginBottom: 10 }}>
                  <Typography>Crypto Converter</Typography>
                </Grid>
                <Grid
                  item
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                  spacing={3}
                >
                  <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="stretch"
                    item
                    xs={5}
                  >
                    <CoinSearchBar
                      label="From"
                      id={"from"}
                      style={{ marginTop: 10 }}
                    />
                    <TextField
                      style={{ marginTop: 10 }}
                      id="fromPrice"
                      label="Price"
                      variant="filled"
                      InputProps={{
                        readOnly: true,
                      }}
                      value={this.state.fromPrice ? this.state.fromPrice : ""}
                    />
                    <TextField
                      style={{ marginTop: 10 }}
                      id="fromAmount"
                      label="From amount"
                      variant="outlined"
                      defaultValue="1"
                      onChange={(event, newValue) => {
                        this.handleChangeFrom(event, newValue);
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <IconButton
                      color="primary"
                      aria-label="calculate convertion"
                      onClick={() => {
                        this.swapCalc();
                      }}
                    >
                      {(loadingFrom || loadingTo) && <CircularProgress />}
                      {!loadingFrom && !loadingTo && <ShuffleIcon />}
                    </IconButton>
                  </Grid>
                  <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="stretch"
                    item
                    xs={5}
                  >
                    <CoinSearchBar
                      label="To"
                      id={"to"}
                      style={{ marginTop: 10 }}
                    />
                    <TextField
                      style={{ marginTop: 10 }}
                      id="toPrice"
                      label="Price"
                      variant="filled"
                      InputProps={{
                        readOnly: true,
                      }}
                      value={this.state.toPrice ? this.state.toPrice : ""}
                    />
                    <TextField
                      style={{ marginTop: 10 }}
                      id="toAmmount"
                      label="To amount"
                      variant="filled"
                      InputProps={{
                        readOnly: true,
                      }}
                      value={this.state.toAmmount ? this.state.toAmmount : ""}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withRouter(withStyles(styles)(CryptoConverter));
