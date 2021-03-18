import config from "../config";
import contractABI from "../config/Contracts/AdapterRegistry.json";
import Web3 from "web3";

import {
  GET_CONTRACT_ABI,
  GET_PROTOCOL_NAMES,
  GET_TOKENADAPTER_NAMES,
  GET_PROTOCOL_BALANCE,
  GET_PROTOCOLS_BALANCES,
  GET_TOKEN_COMPONENTS,
} from "../constants/defiSDK.js";

import { DeFiSDK } from "defi-sdk";

const nodeUrl = config.infuraProviderMain;
const defiSdk = new DeFiSDK(nodeUrl);
const axios = require("axios").default;

const Dispatcher = require("flux").Dispatcher;
const Emitter = require("events").EventEmitter;
const dispatcher = new Dispatcher();
const emitter = new Emitter();

class DefiSDKStore {
  constructor() {
    this.store = {
      protocolNames: [],
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case GET_CONTRACT_ABI:
            this.getContractABI();
            break;
          case GET_PROTOCOL_NAMES:
            this.getProtocolNames();
            break;
          case GET_TOKENADAPTER_NAMES:
            this.getTokenAdapterNames();
            break;
          case GET_PROTOCOL_BALANCE:
            this.getProtocolBalance();
            break;
          case GET_PROTOCOLS_BALANCES:
            this.getProtocolsBalances();
            break;
          case GET_TOKEN_COMPONENTS:
            this.getTokenComponents();
            break;
          default: {
            break;
          }
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

  getContractABI = async () => {
    console.log("getting ABI");
    const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
    // const _abi = JSON.parse(contractABI);

    console.log(contractABI.abi);
    if (contractABI != "") {
      const defiSDK = new web3.eth.Contract(
        contractABI.abi,
        "0x06fe76b2f432fdfecaef1a7d4f6c3d41b5861672"
      );

      const result = await defiSDK.methods
        .getProtocolBalances("wallet", ["dYdX"])
        .call();
      console.log(await result);
    } else {
      console.log("Error");
    }
  };

  getProtocolNames = async () => {
    defiSdk.getProtocolNames().then((protocols) => console.log(protocols));
  };

  getTokenAdapterNames = async () => {
    defiSdk.getTokenAdapterNames().then((adapters) => console.log(adapters));
  };

  getProtocolBalance = async () => {
    const account = "wallet";
    const protocol = `dYdX`;
    defiSdk
      .getProtocolBalance(account, protocol)
      .then((balance) => console.log(balance));
  };

  getProtocolsBalances = async () => {
    const account = "wallet";
    defiSdk
      .getAccountBalances(account)
      .then((balances) => console.log(balances));
  };

  getTokenComponents = async () => {
    const tokenType = "Uniswap V2 pool token";
    const tokenAddress = "0xc5be99a02c6857f9eac67bbce58df5572498f40c";
    defiSdk.getTokenComponents(tokenType, tokenAddress).then((components) => {
      console.log("Base", components.base);
      console.log("Underlying", components.underlying);
    });
  };
}

var store = new DefiSDKStore();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter,
};
