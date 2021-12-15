import config from "../config";
import Web3 from "web3";

import {
  ERROR,
  ONEINCH_GET_SPENDER,
  ONEINCH_GET_SPENDER_RETURNED,
  ONEINCH_GET_QUOTE,
  ONEINCH_GET_QUOTE_RETURNED,
  ONEINCH_DO_SWAP,
  ONEINCH_DO_SWAP_RETURNED,
  ONEINCH_CHECK_HEALTH,
  ONEINCH_CHECK_HEALTH_RETURNED,
  ONEINCH_TXHASH_RETURNED,
  GET_SWAP_TOKENLIST,
  GET_SWAP_TOKENLIST_RETURNED,
  CHECK_ALLOWANCE,
  CHECK_ALLOWANCE_RETURNED,
  ONEINCH_SET_ALLOWANCE,
  ONEINCH_SET_ALLOWANCE_RETURNED,
  CHECK_BALANCE,
  CHECK_BALANCE_RETURNED,
  GET_CUSTOM_TOKEN_DATA,
  GET_CUSTOM_TOKEN_DATA_RETURNED,
} from "../constants/constantsOneInch.js";

import Store from "./store.jsx";
const storeRoot = Store.store;

const ethNodeURL = config.infuraProviderMain;
const axios = require("axios").default;
const { ethers } = require("ethers");
const Dispatcher = require("flux").Dispatcher;
const Emitter = require("events").EventEmitter;
const dispatcher = new Dispatcher();
const emitter = new Emitter();

class OneInch_Store {
  constructor() {
    // network setting
    // 1 for ethMainnet, 56 for BSC, 137 for polygon
    this.store = {
      oneInchStatusOK: false,
      tokens: [],
      spender: "",
      connectorsERC20: [
        {
          name: "ETH",
          address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        },
        { name: "WETH", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
        {
          name: "1INCH",
          address: "0x111111111117dc0aa78b770fa6a738034120c302",
        },
        { name: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f" },
        { name: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
        { name: "USDT", address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
        { name: "WBTC", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
        {
          name: "stETH",
          address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
        },
        { name: "PAX", address: "0x8e870d67f660d95d5be530380d0ec0bd388289e1" },
        { name: "TUSD", address: "0x0000000000085d4780b73119b644ae5ecd22b376" },
        { name: "BNT", address: "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c" },
        { name: "BAL", address: "0xba100000625a3754423978a60c9317c58a424e3d" },
        { name: "sUSD", address: "0x57ab1ec28d129707052df4df418d58a2d46d5f51" },
      ],
      network: "1",
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case ONEINCH_GET_QUOTE:
            this.oneInchGetQuote(payload);
            break;
          case ONEINCH_DO_SWAP:
            this.oneInchDoSwap(payload);
            break;
          case ONEINCH_CHECK_HEALTH:
            this.oneInchCheckHealth();
            break;
          case GET_SWAP_TOKENLIST:
            this.getSwapTokenList();
            break;
          case ONEINCH_GET_SPENDER:
            this.getSpender();
            break;
          case CHECK_ALLOWANCE:
            this.checkAllowance(payload);
            break;
          case ONEINCH_SET_ALLOWANCE:
            this.setAllowance(payload);
            break;
          case CHECK_BALANCE:
            this.checkBalance(payload);
            break;
          case GET_CUSTOM_TOKEN_DATA:
            this.getCustomTokenData(payload);
            break;
          default:
            break;
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return this.store[index];
  }

  setStore(obj) {
    this.store = { ...this.store, ...obj };
    return emitter.emit("StoreUpdated");
  }

  _getGasPrice = async () => {
    try {
      const url = "https://chainguru-db.herokuapp.com/gas/checkGas";
      const priceString = await axios.get(url);

      return await priceString.data.result.ProposeGasPrice;
    } catch (e) {
      console.log(e.message);
    }
  };

  getSwapTokenList = async () => {
    const network = this.getStore("network");
    try {
      let data = await axios.get(
        `https://api.1inch.exchange/v3.0/${network}/tokens`
      );
      store.setStore({ tokens: await data.data.tokens });
      emitter.emit(GET_SWAP_TOKENLIST_RETURNED, await data.data.tokens);
    } catch (err) {
      emitter.emit(ERROR, err.message);
    }
  };

  checkBalance = async (payload) => {
    const account = storeRoot.getStore("account");
    const web3 = new Web3(storeRoot.getStore("web3context").library.provider);
    if (
      payload.tokenContract !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      try {
        if (storeRoot.getStore("web3context")) {
          let tokenToCheck = new web3.eth.Contract(
            config.erc20minABI,
            payload.tokenContract
          );
          if (account.address) {
            let balance = await tokenToCheck.methods
              .balanceOf(account.address)
              .call();

            emitter.emit(CHECK_BALANCE_RETURNED, [
              payload.tokenContract,
              await balance,
            ]);
          }
        }
      } catch (err) {
        console.log(err.message);
        emitter.emit(ERROR, err.message);
      }
    } else {
      try {
        if (storeRoot.getStore("web3context")) {
          if (account.address) {
            let balance = await web3.eth.getBalance(account.address);
            emitter.emit(CHECK_BALANCE_RETURNED, [
              payload.tokenContract,
              await balance.toString(),
            ]);
          }
        }
      } catch (err) {
        console.log(err.message);
        emitter.emit(ERROR, err.message);
      }
    }
  };

  getCustomTokenData = async (payload) => {
    const web3 = new Web3(storeRoot.getStore("web3context").library.provider);
    if (
      payload.tokenContract !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      try {
        if (storeRoot.getStore("web3context")) {
          let tokenToCheck = new web3.eth.Contract(
            config.erc20minABI,
            payload.tokenContract
          );
          let name = await tokenToCheck.methods.name().call();
          let decimals = await tokenToCheck.methods.decimals().call();
          let symbol = await tokenToCheck.methods.symbol().call();
          let address = payload.tokenContract;
          const customToken = true;
          const tokenData = { name, address, symbol, decimals, customToken };
          emitter.emit(GET_CUSTOM_TOKEN_DATA_RETURNED, await tokenData);
        }
      } catch (err) {
        console.log(err.message);
        emitter.emit(ERROR, err.message);
      }
    }
  };

  oneInchGetQuote = async (payload) => {
    const network = this.getStore("network");

    const web3 = new Web3(storeRoot.getStore("web3context").library.provider);
    let fromAmountDecimals;
    try {
      fromAmountDecimals = ethers.utils
        .parseUnits(payload.amount.toString(), payload.fromDecimals)
        .toString();
    } catch (err) {
      console.log(err.message);
    }
    try {
      let data = await axios.get(
        `https://api.1inch.exchange/v3.0/${network}/quote?fromTokenAddress=${payload.from.address}&toTokenAddress=${payload.to.address}&amount=${fromAmountDecimals}&fee=3`
      );
      // GET TOKEN ROUTE CONNECTORS TOKEN NAME
      data.data.protocols[0].forEach((item, i) => {
        let objIndex = this.store.connectorsERC20.findIndex(
          (obj) => obj.address === item[0].toTokenAddress
        );
        if (objIndex > -1) {
          data.data.protocols[0][i][0].toTokenName = this.store.connectorsERC20[
            objIndex
          ].name;
        }
      });

      // GET GAS COST AND TOKEN PRICES
      let _tokenTickers = `weth%2C${payload.from.symbol}%2C${payload.to.symbol}`;
      let pricesRequest = await axios.post(
        `https://chainguru-db-dev.herokuapp.com/covalent/getTokenPrices`,
        {
          tokenTickers: _tokenTickers,
        }
      );
      //Add token prices to response
      data.data.prices = pricesRequest.data;
      emitter.emit(ONEINCH_GET_QUOTE_RETURNED, data.data);
    } catch (err) {
      console.log(err);
      console.log(err.message);
      emitter.emit(ERROR, err.message);
    }
  };

  oneInchDoSwap = async (payload) => {
    const fromAccount = storeRoot.getStore("account");
    const web3 = new Web3(storeRoot.getStore("web3context").library.provider);
    const network = this.getStore("network");

    let data = await axios
      .get(
        `https://api.1inch.exchange/v3.0/${network}/swap?fromTokenAddress=${payload.from}&toTokenAddress=${payload.to}&amount=${payload.amount}&fromAddress=${fromAccount.address}&slippage=1&referrerAddress=${config.chainguruWallet}&fee=3`
      )
      .then((response) => {
        const tx = response.data.tx;
        tx.gas += parseInt(((tx.gas * 25) / 100).toFixed(0));

        web3.eth
          .sendTransaction({
            from: tx.from,
            to: tx.to,
            data: tx.data,
            value: tx.value,
          })
          .on("transactionHash", function (hash) {
            emitter.emit(ONEINCH_TXHASH_RETURNED, hash);
          })
          .on("receipt", function (receipt) {
            emitter.emit(ONEINCH_DO_SWAP_RETURNED, receipt);
          })
          .on("error", function (error) {
            emitter.emit(ERROR, error.message);
          });
      })
      .catch((error) => {
        emitter.emit(ERROR, error.response.data.message);
      });
  };

  oneInchCheckHealth = async () => {
    const network = this.getStore("network");

    try {
      let data = await axios.get(
        `https://api.1inch.exchange/v3.0/${network}/healthcheck`
      );
      emitter.emit(ONEINCH_CHECK_HEALTH_RETURNED, await data.data);
    } catch (err) {
      emitter.emit(ERROR, err.message);
    }
  };

  getSpender = async () => {
    const network = this.getStore("network");

    if (store.getStore("spenderContract")) {
    } else {
      try {
        let data = await axios.get(
          `https://api.1inch.exchange/v3.0/${network}/approve/spender`
        );
        this.setStore({ spenderContract: data.data.address });
        emitter.emit(ONEINCH_GET_SPENDER_RETURNED, await data.data);
        return data.data.address;
      } catch (err) {
        console.log(err.message);
        emitter.emit(ERROR, err.message);
      }
    }
  };

  checkAllowance = async (payload) => {
    if (
      payload.tokenContract !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      try {
        if (storeRoot.getStore("web3context")) {
          const account = storeRoot.getStore("account");
          const web3 = new Web3(
            storeRoot.getStore("web3context").library.provider
          );
          let tokenToCheck = new web3.eth.Contract(
            config.erc20minABI,
            payload.tokenContract
          );
          if (account.address) {
            let allowance = await tokenToCheck.methods
              .allowance(account.address, payload.spenderContract)
              .call();
            emitter.emit(CHECK_ALLOWANCE_RETURNED, await allowance);
          }
        }
      } catch (err) {
        console.log(err.message);
        emitter.emit(ERROR, err.message);
      }
    } else {
      emitter.emit(CHECK_ALLOWANCE_RETURNED, "9999999999999999999999999999");
    }
  };

  setAllowance = async (payload, callback) => {
    console.log(payload);
    try {
      if (storeRoot.getStore("web3context")) {
        const account = storeRoot.getStore("account");
        const web3 = new Web3(
          storeRoot.getStore("web3context").library.provider
        );
        let tokenToSetAllowance = new web3.eth.Contract(
          config.erc20minABI,
          payload.fromToken
        );
        if (account.address) {
          let spenderAddress = store.getStore("spenderContract");
          console.log("setting allowance");
          console.log(payload.fromAmount.toString(16));
          let _fromAmount;
          if (payload.fromAmount === "max") {
            _fromAmount = `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`;
          } else {
            _fromAmount = `0x` + payload.fromAmount.toString(16);
          }
          console.log(web3.utils.toWei(await this._getGasPrice(), "gwei"));
          let allowanceSet = await tokenToSetAllowance.methods
            .approve(spenderAddress, _fromAmount)
            .send({
              from: account.address,
              gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
            })
            .on("receipt", function (receipt) {
              return emitter.emit(ONEINCH_SET_ALLOWANCE_RETURNED, receipt);
            })
            .on("error", function (error) {
              emitter.emit(ERROR, error.message);
            });
        }
      }
    } catch (err) {
      console.log(err.message);
      emitter.emit(ERROR, err.message);
    }
  };
}

var store = new OneInch_Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter,
};
