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
} from "@material-ui/core";

//import Constants
import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  COIN_DATA_RETURNED,
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

    const account = store.getStore("account");
    this.state = {
      loadingFrom: true,
      loadingTo: true,
      fromData: null,
      toData: null,
      errorFrom: false,
      errorTo: false,
      fromAmount: 1,
      toAmmount: "",
    };
  }

  componentDidMount() {
    this._isMounted = true;
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(COINLIST_RETURNED, this.coinlistReturned);
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
    this._isMounted = false;
  }

  connectionConnected = () => {
    const { t } = this.props;
  };

  connectionDisconnected = () => {};

  coinlistReturned = (data) => {
    this._isMounted && this.setState({ coinList: data });
  };

  coinDataReturned = (data) => {
    console.log(data);
    if (data[1] === "from") {
      this.setState({ fromData: data[0], loadingFrom: false });
    } else {
      this.setState({ toData: data[0], loadingTo: false });
    }
  };

  handleChangeFrom = (event, newValue) => {
    this.setState({ fromAmount: event.target.value });
  };

  swapCalc = () => {
    const { fromData, toData, fromAmount } = this.state;
    if (fromData) {
      if (toData) {
        console.log(fromData.market_data.current_price.usd);
        console.log(toData.market_data.current_price.usd);
        let toAmmount =
          (fromData.market_data.current_price.usd * fromAmount) /
          toData.market_data.current_price.usd;
        console.log(toAmmount);
        this.setState({
          toAmmount: toAmmount,
          errorFrom: false,
          errorTo: false,
        });
      } else {
        this.setState({ errorTo: true });
      }
    } else {
      if (toData) {
        this.setState({ errorTo: true, errorFrom: true });
      }
      this.setState({ errorFrom: true });
    }
  };

  render() {
    const { classes, t } = this.props;
    const { loading } = this.state;

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
                  <Grid item xs={5}>
                    <CoinSearchBar id={"from"} style={{ marginTop: 10 }} />
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
                      <ShuffleIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={5}>
                    <CoinSearchBar id={"to"} style={{ marginTop: 10 }} />
                    <TextField
                      style={{ marginTop: 10 }}
                      id="toAmmount"
                      label="To amount"
                      variant="outlined"
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
