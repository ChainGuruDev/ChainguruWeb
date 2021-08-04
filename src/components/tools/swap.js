import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { formatMoney } from "../helpers";
import { withTranslation } from "react-i18next";

import {
  ONEINCH_GET_QUOTE,
  ONEINCH_GET_QUOTE_RETURNED,
  ONEINCH_DO_SWAP,
  ONEINCH_DO_SWAP_RETURNED,
  ONEINCH_CHECK_HEALTH,
  ONEINCH_CHECK_HEALTH_RETURNED,
  GET_SWAP_TOKENLIST,
  GET_SWAP_TOKENLIST_RETURNED,
  ONEINCH_GET_SPENDER,
  ONEINCH_GET_SPENDER_RETURNED,
  CHECK_ALLOWANCE,
  CHECK_ALLOWANCE_RETURNED,
  ONEINCH_SET_ALLOWANCE,
  ONEINCH_SET_ALLOWANCE_RETURNED,
  CHECK_BALANCE,
  CHECK_BALANCE_RETURNED,
} from "../../constants/constantsOneInch.js";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
} from "../../constants";

import Snackbar from "../snackbar";

import {
  Card,
  Paper,
  Grid,
  CircularProgress,
  Button,
  IconButton,
  Divider,
  TextField,
  Typography,
  Breadcrumbs,
} from "@material-ui/core";

import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import LinkRoundedIcon from "@material-ui/icons/LinkRounded";
import SwapCallsIcon from "@material-ui/icons/SwapCalls";

import SwapTokenSearch from "../components/SwapTokenSearch";
import OneInch_Store from "../../stores/1inch_store.js";

import Store from "../../stores";

const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const store1Inch = OneInch_Store.store;
const emitter1Inch = OneInch_Store.emitter;
const dispatcher1Inch = OneInch_Store.dispatcher;

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
    margin: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignContent: "center",
    textAlign: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
  },
  fromToGrid: {
    padding: 15,
    borderRadius: 5,
    background: "#0003",
    alignItems: "center",
  },
  fromToGridCustom: {
    padding: 15,
    borderRadius: 5,
    background: "#0003",
    alignItems: "center",
    borderStyle: "dashed",
    borderColor: "yellow",
    borderWidth: "thin",
  },
  swapButton: {
    padding: 10,
    transition: "transform .7s ease-in-out",
    "&:hover": {
      transform: "rotate(180deg)",
    },
  },
  maxButton: {
    cursor: "pointer",
    display: "inline",
    color: "blue",
    marginLeft: "10px",
  },
});

class Swap extends Component {
  constructor(props) {
    super();
    this._isMounted = false;

    const account = store.getStore("account");

    this.state = {
      timeout: null,
      oneInchStatusOK: false,
      account: account,
      loading: false,
      loadingSwap: false,
      loadingQuote: false,
      fromAmount: 0,
      fromAvailableBalance: 0,
      toAvailableBalance: 0,
      toAmount: "0",
      spender: "",
      currentAllowance: 0,
      fromToken: null,
      toToken: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    emitter1Inch.on(
      ONEINCH_CHECK_HEALTH_RETURNED,
      this.oneInchCheckHealthReturned
    );
    emitter1Inch.on(ONEINCH_GET_QUOTE_RETURNED, this.oneInchGetQuoteReturned);
    emitter1Inch.on(GET_SWAP_TOKENLIST_RETURNED, this.coinlistReturned);

    emitter.on(ERROR, this.error);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_GET_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
    emitter1Inch.on(CHECK_ALLOWANCE_RETURNED, this.checkAllowanceReturned);
    emitter1Inch.on(ONEINCH_SET_ALLOWANCE_RETURNED, this.setAllowanceReturned);
    emitter1Inch.on(CHECK_BALANCE_RETURNED, this.checkBalanceReturned);
    emitter1Inch.on(ONEINCH_DO_SWAP_RETURNED, this.swapReturned);
    emitter1Inch.on(ERROR, this.error);

    const account = store.getStore("account");

    this._isMounted &&
      dispatcher1Inch.dispatch({
        type: ONEINCH_CHECK_HEALTH,
      });
    this._isMounted &&
      dispatcher1Inch.dispatch({
        type: GET_SWAP_TOKENLIST,
      });
    this._isMounted &&
      account.address &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO,
        wallet: account.address,
      });
  }

  componentWillUnmount() {
    emitter1Inch.removeListener(
      ONEINCH_CHECK_HEALTH_RETURNED,
      this.oneInchCheckHealthReturned
    );
    emitter1Inch.removeListener(
      ONEINCH_GET_QUOTE_RETURNED,
      this.oneInchGetQuoteReturned
    );
    emitter1Inch.removeListener(
      GET_SWAP_TOKENLIST_RETURNED,
      this.coinlistReturned
    );
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(
      DB_GET_PORTFOLIO_RETURNED,
      this.dbGetPortfolioReturned
    );
    emitter1Inch.removeListener(
      CHECK_ALLOWANCE_RETURNED,
      this.checkAllowanceReturned
    );
    emitter1Inch.removeListener(
      ONEINCH_SET_ALLOWANCE_RETURNED,
      this.setAllowanceReturned
    );
    emitter1Inch.removeListener(
      CHECK_BALANCE_RETURNED,
      this.checkBalanceReturned
    );
    emitter1Inch.removeListener(ONEINCH_DO_SWAP_RETURNED, this.swapReturned);
    emitter1Inch.removeListener(ERROR, this.error);

    this._isMounted = false;
  }

  connectionConnected = () => {
    const { t } = this.props;

    const account = store.getStore("account");

    this.setState({ account: store.getStore("account") });

    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO,
        wallet: account.address,
      });

    this._isMounted &&
      dispatcher1Inch.dispatch({
        type: GET_SWAP_TOKENLIST,
      });

    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: t("Unlock.WalletConnected"),
        snackbarType: "Info",
      };
      that.setState(snackbarObj);
    });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  coinlistReturned = (payload) => {
    this.setState({ tokens: payload });
  };

  swapTokenCallback = (data, type) => {
    if (type === "FROM") {
      let userAvailableFromBalance = 0;
      if (this.state.userTokens) {
        for (var i = 0; i < this.state.userTokens.length; i++) {
          if (this.state.userTokens[i].contract_address === data.address) {
            userAvailableFromBalance = this.state.userTokens[i].balance;
          }
        }
      }
      if (data === this.state.toToken) {
        this.setState({
          fromToken: data,
          fromAmount: 0,
          fromAvailableBalance: userAvailableFromBalance,
          currentAllowance: 0,
          toToken: null,
        });
      } else {
        this.setState({
          fromToken: data,
          fromAvailableBalance: userAvailableFromBalance,
          currentAllowance: 0,
        });
        dispatcher1Inch.dispatch({
          type: CHECK_BALANCE,
          tokenContract: data.address,
          decimals: data.decimals,
        });
        dispatcher1Inch.dispatch({
          type: CHECK_ALLOWANCE,
          tokenContract: data.address,
          spenderContract: store1Inch.getStore("spenderContract"),
        });
      }
    } else {
      if (data === this.state.fromToken) {
        this.setState({ toToken: data, fromToken: null });
      } else {
        this.setState({ toToken: data });
        if (this.state.fromToken && this.state.fromAmount > 0) {
          this.getQuote(this.state.fromToken, this.state.fromAmount, data);
        }
      }
      dispatcher1Inch.dispatch({
        type: CHECK_BALANCE,
        tokenContract: data.address,
        decimals: data.decimals,
      });
    }
  };

  getQuote = (fromToken, fromAmount, toToken) => {
    this.setState({ swapReady: false, loadingQuote: true });
    if (fromToken && toToken && fromAmount > 0) {
      dispatcher1Inch.dispatch({
        type: ONEINCH_GET_QUOTE,
        from: fromToken.address,
        amount: fromAmount,
        fromDecimals: fromToken.decimals,
        to: toToken.address,
      });
    } else {
      if (!fromToken) {
        console.log("no from");
      }
      if (!toToken) {
        console.log("no To token");
      }
      if (!fromAmount) {
        console.log("no from amount");
      }
      if (fromAmount <= 0) {
        console.log("from must be greater than 0");
      }
      this.setState({ swapReady: false, loadingQuote: false });
    }
  };

  dbGetPortfolioReturned = (data) => {
    if (data) {
      const walletProfitValue = data[0].profit_value;
      let assets = data[0].assets;
      let userTokens = [];
      for (var i = 0; i < assets.length; i++) {
        if (assets[i].balance > 0 && assets[i].contract_ticker !== "UNI-V2") {
          userTokens.push(assets[i]);
        }
      }
      function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
        }
        return function (a, b) {
          var result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

          return result * sortOrder;
        };
      }
      // Sort tokens with most profit and losses and store as state
      userTokens = userTokens.sort(dynamicSort("-quote"));
      this.setState({
        error: false,
        loading: false,
        dbDataLoaded: true,
        userTokens: userTokens,
      });
    }
  };

  oneInchGetQuoteReturned = (data) => {
    console.log(data);
    let swapRoute = [];
    if (data.protocols > 0 < 6) {
      swapRoute.push(this.state.fromToken.symbol);
      data.protocols[0].forEach((item, i) => {
        if (item[0].toTokenName) {
          swapRoute.push(item[0].toTokenName);
        } else {
          swapRoute.push(this.state.toToken.name);
        }
      });
    }
    this.setState({
      toAmount: data.toTokenAmount / Math.pow(10, data.toToken.decimals),
      swapReady: this.state.fromAmount > 0 ? true : false,
      loadingQuote: false,
      swapRoute: swapRoute,
    });
  };

  oneInchCheckHealthReturned = (data) => {
    if (data.status === "OK") {
      this.setState({ oneInchStatusOK: true });
      dispatcher1Inch.dispatch({
        type: ONEINCH_GET_SPENDER,
      });
    } else {
      this.setState({ oneInchStatusOK: false });
    }
  };

  error = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false, loadingSwap: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: error.toString(),
        snackbarType: "Error",
      };
      that.setState(snackbarObj);
    });
  };

  checkBalanceReturned = (balance) => {
    if (this.state.fromToken && this.state.fromToken.address === balance[0]) {
      let _newBalance =
        balance[1] / Math.pow(10, this.state.fromToken.decimals);
      this.setState({
        fromAvailableBalance: formatMoney(_newBalance),
        fromAvailableBalanceBN: balance[1],
      });
    } else if (
      this.state.toToken &&
      this.state.toToken.address === balance[0]
    ) {
      let _newBalance = balance[1] / Math.pow(10, this.state.toToken.decimals);

      this.setState({
        toAvailableBalance: formatMoney(_newBalance),
        toAvailableBalanceBN: balance[1],
      });
    }
  };

  checkAllowanceReturned = (allowance) => {
    this.setState({ currentAllowance: allowance });
  };

  setMaxAvailableFrom = (maxAvailable) => {
    document.getElementById(`fromAmountInput`).value = maxAvailable;
    if (maxAvailable > 0) {
      this.newFromAmount(maxAvailable);
    }
    this.setState({
      fromAmount: maxAvailable,
    });
  };

  doDelayedQuote = (val) => {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    let that = this;
    this.state.timeout = setTimeout(function () {
      that.newFromAmount(val); //this is your existing function
    }, 600);
  };

  newFromAmount = (value) => {
    if (value && value > 0) {
      this.setState({
        fromAmount: value,
      });
      if (this.state.toToken) {
        this.getQuote(this.state.fromToken, value, this.state.toToken);
      }
    }
  };

  setAllowance = async () => {
    console.log("dispatch set allowance");
    let _fromAmountBN =
      this.state.fromAmount * Math.pow(10, this.state.fromToken.decimals);
    dispatcher1Inch.dispatch({
      type: ONEINCH_SET_ALLOWANCE,
      fromToken: this.state.fromToken.address,
      fromAmount: _fromAmountBN,
    });
    this.setState({ loading: true });
  };

  setUnlimitedAllowance = async () => {
    console.log("dispatch set allowance");
    let _fromAmountBN = "max";
    console.log(_fromAmountBN);
    dispatcher1Inch.dispatch({
      type: ONEINCH_SET_ALLOWANCE,
      fromToken: this.state.fromToken.address,
      fromAmount: _fromAmountBN,
    });
    this.setState({ loading: true });
  };

  setAllowanceReturned = async (data) => {
    const temp = this.state.fromAmount;
    this.setState({ currentAllowance: temp, loading: false });
  };

  doSwapCheck = async () => {
    this.setState({ loadingSwap: true });
    let _fromAmountBN =
      this.state.fromAmount * Math.pow(10, this.state.fromToken.decimals);
    if (
      parseInt(_fromAmountBN) >= parseInt(this.state.fromAvailableBalanceBN)
    ) {
      _fromAmountBN = this.state.fromAvailableBalanceBN;
    }
    dispatcher1Inch.dispatch({
      type: ONEINCH_DO_SWAP,
      from: this.state.fromToken.address,
      amount: _fromAmountBN,
      to: this.state.toToken.address,
    });
  };

  swapReturned = async (data) => {
    dispatcher1Inch.dispatch({
      type: CHECK_BALANCE,
      tokenContract: this.state.fromToken.address,
      decimals: this.state.fromToken.decimals,
    });
    this.setState({ loadingSwap: false });
  };

  swapFromTo = () => {
    const { fromToken, toToken, fromAmount, toAmount } = this.state;
    const oldFrom = fromToken;
    const oldTo = toToken;

    if (oldTo) {
      dispatcher1Inch.dispatch({
        type: CHECK_BALANCE,
        tokenContract: oldTo.address,
        decimals: oldTo.decimals,
      });
      dispatcher1Inch.dispatch({
        type: CHECK_ALLOWANCE,
        tokenContract: oldTo.address,
        spenderContract: store1Inch.getStore("spenderContract"),
      });
    }
    if (oldFrom) {
      dispatcher1Inch.dispatch({
        type: CHECK_BALANCE,
        tokenContract: oldFrom.address,
        decimals: oldFrom.decimals,
      });
    }
    this.setState({ fromToken: oldTo, toToken: oldFrom, toAmount: 0 }, () => {
      this.newFromAmount(fromAmount);
    });
  };

  openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };

  render() {
    const { classes } = this.props;
    const {
      account,
      loading,
      loadingSwap,
      oneInchStatusOK,
      userTokens,
      fromToken,
      toToken,
      fromAmount,
      currentAllowance,
      swapReady,
      fromAvailableBalance,
      loadingQuote,
      snackbarMessage,
    } = this.state;

    return (
      <div className={classes.root}>
        {!account.address && <div>CONNECT WALLET</div>}
        {account.address && (
          <Grid container item xs={6}>
            <Card className={classes.favCard} elevation={3} xs={6}>
              <Grid container direction="row" justify="center" spacing={3}>
                <Grid item container direction={"column"} xs={12}>
                  <Grid
                    container
                    justify="center"
                    direction={"row"}
                    item
                    className={
                      this.state.fromToken && this.state.fromToken.customToken
                        ? classes.fromToGridCustom
                        : classes.fromToGrid
                    }
                  >
                    <Grid item xs={fromToken ? 6 : 12}>
                      <SwapTokenSearch
                        parentCallback={this.swapTokenCallback}
                        items={userTokens}
                        type={"FROM"}
                        selected={this.state.fromToken}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      {fromToken && (
                        <TextField
                          label="Amount"
                          id="fromAmountInput"
                          defaultValue="0"
                          className={classes.textField}
                          onChange={(e) => this.doDelayedQuote(e.target.value)}
                        />
                      )}
                    </Grid>
                    {fromToken && (
                      <Grid
                        item
                        style={{
                          textAlign: "left",
                          marginTop: "5px",
                          cursor: "pointer",
                          marginLeft: "20px",
                        }}
                        onClick={() =>
                          this.setMaxAvailableFrom(
                            this.state.fromAvailableBalance
                          )
                        }
                        xs={12}
                      >
                        balance: {this.state.fromAvailableBalance}
                        <div className={classes.maxButton}>(max)</div>
                      </Grid>
                    )}
                    {fromToken && fromToken.customToken && (
                      <>
                        <Grid
                          item
                          xs={10}
                          onClick={() =>
                            this.openInNewTab(
                              `https://etherscan.io/token/${fromToken.address}`
                            )
                          }
                          style={{ marginTop: 10, cursor: "pointer" }}
                        >
                          <Typography variant={"h4"} color={"secondary"}>
                            You are using a custom token
                          </Typography>
                          <Typography color={"secondary"}>
                            {fromToken.address} <LinkRoundedIcon />
                          </Typography>
                          <Typography color={"secondary"}>
                            Please check it's the one you want
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                  <Grid style={{ padding: 10 }} item>
                    <IconButton
                      className={classes.swapButton}
                      onClick={this.swapFromTo}
                    >
                      <SwapCallsIcon />
                    </IconButton>
                  </Grid>
                  <Grid
                    container
                    justify="center"
                    direction={"row"}
                    item
                    className={
                      this.state.toToken && this.state.toToken.customToken
                        ? classes.fromToGridCustom
                        : classes.fromToGrid
                    }
                  >
                    <Grid item xs={toToken ? 6 : 12}>
                      <SwapTokenSearch
                        parentCallback={this.swapTokenCallback}
                        items={userTokens}
                        type={"TO"}
                        selected={this.state.toToken}
                        disabledToken={this.state.fromToken}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      {toToken && !loadingQuote && (
                        <Typography variant={"h4"}>
                          {formatMoney(this.state.toAmount)}
                        </Typography>
                      )}
                      {toToken && loadingQuote && <CircularProgress />}
                    </Grid>
                    {toToken && (
                      <Grid
                        item
                        style={{
                          textAlign: "left",
                          marginTop: "5px",
                          marginLeft: "20px",
                        }}
                        onClick={() =>
                          this.setMaxAvailableFrom(
                            this.state.fromAvailableBalance
                          )
                        }
                        xs={12}
                      >
                        balance: {this.state.toAvailableBalance}
                      </Grid>
                    )}
                    {toToken && toToken.customToken && (
                      <>
                        <Grid
                          item
                          xs={10}
                          onClick={() =>
                            this.openInNewTab(
                              `https://etherscan.io/token/${toToken.address}`
                            )
                          }
                          style={{ marginTop: 10, cursor: "pointer" }}
                        >
                          <Typography variant={"h4"} color={"secondary"}>
                            You are using a custom token
                          </Typography>
                          <Typography color={"secondary"}>
                            {toToken.address} <LinkRoundedIcon />
                          </Typography>
                          <Typography color={"secondary"}>
                            Please check it's the one you want
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                  <Grid
                    container
                    justify="center"
                    direction={"row"}
                    item
                    style={{ marginTop: 10 }}
                  >
                    {parseInt(currentAllowance) < parseInt(fromAmount) && (
                      <>
                        <Button
                          color={"primary"}
                          variant={"contained"}
                          onClick={() => this.setAllowance()}
                          disabled={loading}
                        >
                          {loading && <CircularProgress />}
                          {!loading && `Set ${this.state.fromAmount} Allowance`}
                        </Button>
                        {!loading && (
                          <Button
                            color={"primary"}
                            variant={"contained"}
                            onClick={() => this.setUnlimitedAllowance()}
                            disabled={loading}
                            style={{ marginLeft: 10 }}
                          >
                            {loading && <CircularProgress />}
                            {!loading && "Unlimited Allowance"}
                          </Button>
                        )}
                      </>
                    )}
                    {swapReady &&
                      parseInt(currentAllowance) > parseInt(fromAmount) &&
                      parseInt(fromAmount) <=
                      parseInt(fromAvailableBalance) && (
                        <Button
                          color={"primary"}
                          variant={"contained"}
                          onClick={() => this.doSwapCheck()}
                          disabled={loadingSwap}
                        >
                          {loadingSwap && <CircularProgress />}
                          {!loadingSwap && "Swap"}
                        </Button>
                      )}
                  </Grid>
                  {swapReady && (
                    <Grid>
                      <Divider variant="middle" style={{ marginTop: 10 }} />
                      <Typography>Swap Route</Typography>
                      <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="breadcrumb"
                        style={{
                          marginTop: 10,
                          justifyContent: "center",
                          display: "grid",
                        }}
                      >
                        {this.state.swapRoute.map((routeStep) => (
                          <Typography key={routeStep} color="textPrimary">
                            {routeStep}
                          </Typography>
                        ))}
                      </Breadcrumbs>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Card>
            {snackbarMessage && this.renderSnackbar()}
          </Grid>
        )}
      </div>
    );
  }

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Swap)));
