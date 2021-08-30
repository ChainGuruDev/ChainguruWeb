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
  ONEINCH_TXHASH_RETURNED,
} from "../../constants/constantsOneInch.js";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
  GET_TRANSACTION_RECEIPT,
  GET_TRANSACTION_RECEIPT_RETURNED,
} from "../../constants";

import Snackbar from "../snackbar";

import {
  Card,
  Paper,
  Grid,
  CircularProgress,
  Button,
  ButtonGroup,
  IconButton,
  Divider,
  TextField,
  Typography,
  Breadcrumbs,
  Tooltip,
  Link,
} from "@material-ui/core";

import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import ExitToAppRoundedIcon from "@material-ui/icons/ExitToAppRounded";
import LinkRoundedIcon from "@material-ui/icons/LinkRounded";
import SwapCallsIcon from "@material-ui/icons/SwapCalls";
import RefreshIcon from "@material-ui/icons/Refresh";
import TuneRoundedIcon from "@material-ui/icons/TuneRounded";
import CancelRoundedIcon from "@material-ui/icons/CancelRounded";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

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
      fromAmountBN: 0,
      fromAvailableBalance: 0,
      toAvailableBalance: 0,
      toAmount: "0",
      spender: "",
      currentAllowance: 0,
      fromToken: null,
      toToken: null,
      valueFrom: null,
      valueTo: null,
      txCostFiat: null,
      slippage: 1,
      customSlippage: "",
      errorCustomSlippage: false,
      customSlippageErrorMessage: "Wrong",
      errorMsgFromAmount: "",
      pendingTX: [],
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
    emitter.on(
      GET_TRANSACTION_RECEIPT_RETURNED,
      this.getTransactionReceiptReturned
    );

    emitter1Inch.on(CHECK_ALLOWANCE_RETURNED, this.checkAllowanceReturned);
    emitter1Inch.on(ONEINCH_SET_ALLOWANCE_RETURNED, this.setAllowanceReturned);
    emitter1Inch.on(CHECK_BALANCE_RETURNED, this.checkBalanceReturned);
    emitter1Inch.on(ONEINCH_DO_SWAP_RETURNED, this.swapReturned);
    emitter1Inch.on(ONEINCH_TXHASH_RETURNED, this.txHashReturned);
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
    emitter.removeListener(
      GET_TRANSACTION_RECEIPT_RETURNED,
      this.getTransactionReceiptReturned
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
    emitter1Inch.removeListener(ONEINCH_TXHASH_RETURNED, this.txHashReturned);

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
    this.setState({
      swapReady: false,
      loadingQuote: true,
      valueFrom: null,
      valueTo: null,
      txCostFiat: null,
    });
    if (fromToken && toToken && fromAmount > 0) {
      dispatcher1Inch.dispatch({
        type: ONEINCH_GET_QUOTE,
        from: fromToken,
        amount: fromAmount,
        fromDecimals: fromToken.decimals,
        to: toToken,
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
    //Get current gas price
    let _gasPrice = store.getStore("universalGasPrice");
    //estimatedGas cost + 25%
    let _txGas =
      data.estimatedGas + parseInt(((data.estimatedGas * 25) / 100).toFixed(0));
    //estimatedGas in gwei to Eth
    let costInEth = (_txGas * _gasPrice) / Math.pow(10, 9);

    const _txCostFiat = formatMoney(costInEth * data.prices[0].quote_rate);
    let _valueFrom = 0;
    let _valueTo = 0;

    if (data.prices.length === 3) {
      if (data.prices[1].contract_address === this.state.fromToken.address) {
        _valueFrom = formatMoney(
          (data.fromTokenAmount / Math.pow(10, data.fromToken.decimals)) *
            data.prices[1].quote_rate
        );
      }
      if (data.prices[2].contract_address === this.state.toToken.address) {
        _valueTo = formatMoney(
          (data.toTokenAmount / Math.pow(10, data.toToken.decimals)) *
            data.prices[2].quote_rate
        );
      }
    } else {
      if (data.prices.length === 2) {
        if (data.prices[1].contract_address === this.state.fromToken.address) {
          _valueFrom = formatMoney(
            (data.fromTokenAmount / Math.pow(10, data.fromToken.decimals)) *
              data.prices[1].quote_rate
          );
        }
        if (data.prices[1].contract_address === this.state.toToken.address) {
          _valueTo = formatMoney(
            (data.toTokenAmount / Math.pow(10, data.toToken.decimals)) *
              data.prices[1].quote_rate
          );
        }
      }
    }
    if (this.state.fromToken.symbol === "ETH") {
      _valueFrom = formatMoney(
        (data.fromTokenAmount / Math.pow(10, data.fromToken.decimals)) *
          data.prices[0].quote_rate
      );
    } else if (this.state.toToken.symbol === "ETH") {
      _valueTo = formatMoney(
        (data.toTokenAmount / Math.pow(10, data.toToken.decimals)) *
          data.prices[0].quote_rate
      );
    }

    this.setState({
      toAmount: data.toTokenAmount / Math.pow(10, data.toToken.decimals),
      swapReady: this.state.fromAmount > 0 ? true : false,
      loadingQuote: false,
      swapRoute: swapRoute,
      txCostFiat: _txCostFiat,
      valueFrom: parseInt(_valueFrom) > 0 ? _valueFrom : "-",
      valueTo: parseInt(_valueTo) > 0 ? _valueTo : "-",
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
    const { fromToken } = this.state;
    const position = maxAvailable.length - fromToken.decimals;
    let maxAvailableDecimals;
    if (position > 0) {
      maxAvailableDecimals = [
        maxAvailable.slice(0, position),
        ".",
        maxAvailable.slice(position),
      ].join("");
    } else if (position < 0) {
      maxAvailableDecimals = [
        "0.",
        "0".repeat(Math.abs(position)),
        maxAvailable,
      ].join("");
    } else {
      maxAvailableDecimals = ["0.", maxAvailable].join("");
    }
    if (maxAvailable > 0) {
      this.doDelayedQuote(maxAvailableDecimals);
    }
    this.setState({
      fromAmount: maxAvailableDecimals,
    });
  };

  doDelayedQuote = (val) => {
    const {
      fromToken,
      fromAvailableBalance,
      fromAvailableBalanceBN,
    } = this.state;
    let valBN = val * Math.pow(10, fromToken.decimals);
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    let that = this;
    let errorMsg = "";
    if (parseFloat(valBN) > parseFloat(fromAvailableBalanceBN)) {
      errorMsg = "token balance is not enough";
    }
    if (val) {
      this.setState({
        fromAmount: val,
        fromAmountBN: valBN,
        errorMsgFromAmount: errorMsg,
      });
    } else {
      this.setState({
        fromAmount: "",
        fromAmountBN: "",
        errorMsgFromAmount: errorMsg,
      });
    }
    this.state.timeout = setTimeout(function () {
      that.newFromAmount(val); //this is your existing function
    }, 600);
  };

  newFromAmount = (value) => {
    const { fromToken, toToken } = this.state;
    if (value && value > 0) {
      if (toToken) {
        this.getQuote(fromToken, value, toToken);
      }
    }
  };

  setAllowance = async () => {
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
    const temp =
      this.state.fromAmount * Math.pow(10, this.state.fromToken.decimals);
    console.log({ answer: data, newAllowance: temp });
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

  txHashReturned = async (hash) => {
    const { pendingTX } = this.state;
    var updatedTX = [...pendingTX];
    let newTX = { hash: hash, status: null };
    updatedTX.unshift(newTX);
    this.setState({ pendingTX: updatedTX });
  };

  swapReturned = async (data) => {
    dispatcher1Inch.dispatch({
      type: CHECK_BALANCE,
      tokenContract: this.state.fromToken.address,
      decimals: this.state.fromToken.decimals,
    });
    this.getTransactionReceiptReturned(data);
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

  setSlippage = (newSlippage) => {
    const { customSlippage } = this.state;
    this.setState({
      slippage: newSlippage,
      customSlippage: "",
      errorCustomSlippage: false,
      customSlippageErrorMessage: "",
    });
  };

  handleChangeCustomSlippage = (event) => {
    let newValueString = event.target.value.replace(",", ".");
    let newSlippage = 1;
    if (newValueString[0] === ".") {
      newSlippage = parseFloat("0" + newValueString);
      newValueString = "0" + newValueString;
    } else {
      newSlippage = parseFloat(newValueString);
    }
    let error = false;
    let errorMessage = "";
    if (event.target.value === "") {
      newSlippage = 1;
      error = false;
    }
    if (!isNaN(newValueString)) {
      if (newSlippage <= 0) {
        newSlippage = 1;
      } else if (newSlippage <= 50) {
        if (newSlippage > 5) {
          errorMessage = `You may receive ${newSlippage}% less with this level of slippage tolerance`;
        }
      } else {
        errorMessage = `Slippage tolerance can't be more than 50%`;
        error = true;
        newSlippage = 1;
      }
    } else {
      error = true;
      errorMessage = `Slippage has to be a number`;
      newSlippage = 1;
    }

    this.setState({
      customSlippage: newValueString,
      slippage: newSlippage,
      errorCustomSlippage: error,
      customSlippageErrorMessage: errorMessage,
    });
  };

  renderPendingTX = (pendingTX) => {
    const { classes } = this.props;

    return (
      <>
        <Typography color="primary" style={{ marginBottom: 10 }}>
          Your transactions
        </Typography>
        <Grid container direction="column" justify="flex-start" align="stretch">
          {pendingTX.map((tx) => (
            <Grid
              container
              direction="row"
              justify="center"
              align="flex-start"
              item
              key={tx.hash}
            >
              <Tooltip title="delete tx">
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => this.deletePendingTX(tx.hash)}
                >
                  <DeleteForeverIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Check tx at etherscan">
                <Link
                  target="_blank"
                  href={`https://bscscan.com/tx/${tx.hash}`}
                >
                  <IconButton aria-label="check tx at etherscan" size="small">
                    <ExitToAppRoundedIcon fontSize="inherit" />
                  </IconButton>
                </Link>
              </Tooltip>
              <div style={{ marginRight: 10 }}>
                {[
                  tx.hash.slice(0, 6),
                  "...",
                  tx.hash.slice(tx.hash.length - 6, tx.hash.length),
                ].join("")}
              </div>
              {tx.status === "confirmed" ? (
                <CheckCircleRoundedIcon color="primary" />
              ) : tx.status === "failed" ? (
                <CancelRoundedIcon color="secondary" />
              ) : (
                <CircularProgress size={20} />
              )}
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  deletePendingTX = (hash) => {
    const { pendingTX } = this.state;
    const allPendingTX = pendingTX;

    const updatedPendingTX = allPendingTX.filter((tx) => tx.hash !== hash);
    this.setState({ pendingTX: updatedPendingTX });
  };

  getTransactionReceiptReturned = (data) => {
    const { pendingTX } = this.state;
    var updatedTX = [...pendingTX];
    const oldTX = updatedTX.filter((tx) => tx.hash === data.transactionHash)[0];
    var newTX = { ...oldTX };

    if (!data) {
      newTX.status = null;
    } else {
      if (data.status) {
        newTX.status = "confirmed";
      } else {
        newTX.status = "failed";
      }
    }
    if (oldTX.status !== newTX.status) {
      updatedTX = updatedTX.map((tx) =>
        tx.hash === newTX.hash ? { ...tx, status: newTX.status } : tx
      );

      this.setState({ pendingTX: updatedTX });
    }
  };

  getTransactionReceipt = (hash) => {
    dispatcher.dispatch({
      type: GET_TRANSACTION_RECEIPT,
      txHash: hash,
    });
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
      fromAmountBN,
      currentAllowance,
      swapReady,
      fromAvailableBalance,
      fromAvailableBalanceBN,
      loadingQuote,
      snackbarMessage,
      slippage,
      customSlippage,
      errorMsgFromAmount,
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
                          className={classes.textField}
                          value={fromAmount}
                          onChange={(e) => this.doDelayedQuote(e.target.value)}
                          helperText={errorMsgFromAmount}
                          error={errorMsgFromAmount.length > 0}
                        />
                      )}
                    </Grid>
                    {fromToken && (
                      <Grid
                        item
                        container
                        direction="row"
                        style={{ marginInline: "15px", marginTop: "15px" }}
                      >
                        <Grid
                          item
                          style={{
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            this.setMaxAvailableFrom(
                              this.state.fromAvailableBalanceBN
                            )
                          }
                          xs={6}
                        >
                          balance: {this.state.fromAvailableBalance}
                          <div className={classes.maxButton}>(max)</div>
                        </Grid>
                        {swapReady && (
                          <Grid
                            item
                            style={{
                              textAlign: "right",
                            }}
                            xs={6}
                          >
                            value: ${this.state.valueFrom}
                          </Grid>
                        )}
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
                    {fromToken && fromAmount > 0 && toToken && (
                      <IconButton
                        style={{ marginLeft: 10 }}
                        onClick={() =>
                          this.getQuote(fromToken, fromAmount, toToken)
                        }
                      >
                        <RefreshIcon />
                      </IconButton>
                    )}
                    {
                      // <IconButton style={{ marginLeft: 10 }}>
                      // <TuneRoundedIcon />
                      // </IconButton>
                    }
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
                        container
                        direction="row"
                        style={{ marginInline: "15px", marginTop: "15px" }}
                      >
                        <Grid
                          item
                          style={{
                            textAlign: "left",
                          }}
                          onClick={() =>
                            this.setMaxAvailableFrom(
                              this.state.fromAvailableBalance
                            )
                          }
                          xs={6}
                        >
                          balance: {this.state.toAvailableBalance}
                        </Grid>
                        {swapReady && (
                          <Grid
                            item
                            style={{
                              textAlign: "right",
                            }}
                            xs={6}
                          >
                            value: ${this.state.valueTo}
                          </Grid>
                        )}
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
                  {swapReady && (
                    <Grid
                      container
                      justify="center"
                      direction={"row"}
                      item
                      className={classes.fromToGrid}
                      style={{ marginTop: 10 }}
                    >
                      <Grid
                        item
                        container
                        xs={12}
                        direction="row"
                        justify="center"
                        alignItems="center"
                      >
                        Slippage
                        <ButtonGroup
                          color="primary"
                          aria-label="slippage tolerance button group"
                          style={{ marginLeft: 10 }}
                        >
                          <Button
                            onClick={() => this.setSlippage(0.1)}
                            variant={slippage === 0.1 ? "contained" : ""}
                          >
                            0.1%
                          </Button>
                          <Button
                            onClick={() => this.setSlippage(0.5)}
                            variant={slippage === 0.5 ? "contained" : ""}
                          >
                            0.5%
                          </Button>
                          <Button
                            onClick={() => this.setSlippage(1)}
                            variant={slippage === 1 ? "contained" : ""}
                          >
                            1%
                          </Button>
                          <Button
                            onClick={() => this.setSlippage(3)}
                            variant={slippage === 3 ? "contained" : ""}
                          >
                            3%
                          </Button>
                        </ButtonGroup>
                        <TextField
                          id="custom-slippage"
                          label={customSlippage > 0 ? "Custom" : ""}
                          variant="outlined"
                          style={{
                            marginLeft: 10,
                            width: "70px",
                          }}
                          value={customSlippage}
                          onChange={(event) =>
                            this.handleChangeCustomSlippage(event)
                          }
                          error={this.state.errorCustomSlippage}
                        />
                        {this.state.errorCustomSlippage && (
                          <Grid item xs={12} style={{ marginTop: 10 }}>
                            <Typography color={"secondary"}>
                              {this.state.customSlippageErrorMessage}
                            </Typography>
                            <Typography color={"secondary"}>
                              Using default value of 1% instead
                            </Typography>
                          </Grid>
                        )}
                        {parseFloat(customSlippage) > 5 &&
                          !this.state.errorCustomSlippage && (
                            <Grid item xs={12} style={{ marginTop: 10 }}>
                              <Typography color={"secondary"}>
                                {this.state.customSlippageErrorMessage}
                              </Typography>
                            </Grid>
                          )}
                      </Grid>
                    </Grid>
                  )}
                  <Grid
                    container
                    justify="center"
                    direction={"row"}
                    item
                    style={{ marginTop: 10 }}
                  >
                    <Grid item xs={12}>
                      {fromToken &&
                        parseInt(currentAllowance) <
                          parseFloat(fromAmount) *
                            Math.pow(10, fromToken.decimals) && (
                          <>
                            <Button
                              color={"primary"}
                              variant={"contained"}
                              onClick={() => this.setAllowance()}
                              disabled={loading}
                            >
                              {loading && <CircularProgress />}
                              {!loading &&
                                `Set ${this.state.fromAmount} Allowance`}
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
                        parseInt(currentAllowance) > parseInt(fromAmountBN) &&
                        parseInt(fromAmountBN) <=
                          parseInt(fromAvailableBalanceBN) && (
                          <Button
                            color={"primary"}
                            variant={"contained"}
                            onClick={() => this.doSwapCheck()}
                            disabled={loadingSwap}
                            style={{ marginLeft: 10 }}
                          >
                            {loadingSwap && <CircularProgress />}
                            {!loadingSwap && "Swap"}
                          </Button>
                        )}
                    </Grid>
                    {this.state.pendingTX.length > 0 && (
                      <Grid item xs={12}>
                        <Divider variant="middle" style={{ marginTop: 10 }} />
                        <Grid item xs={12}>
                          {this.renderPendingTX(this.state.pendingTX)}
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                  {
                    // Display swapRoute
                    swapReady && (
                      <Grid>
                        <Divider variant="middle" style={{ marginTop: 10 }} />
                        <Typography color="primary">
                          Estimated Swap Tx Cost ${this.state.txCostFiat}
                        </Typography>

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
                    )
                  }
                  <Grid>
                    <Divider variant="middle" style={{ marginTop: 10 }} />
                    <Typography color="primary" style={{ textAlign: "right" }}>
                      Swap engine powered by 1inch
                    </Typography>
                  </Grid>
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
