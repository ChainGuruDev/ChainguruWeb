import config from "../config";
import async from "async";
import * as moment from "moment";

import Web3 from "web3";
import {
  ERROR,
  CONNECT_LEDGER,
  CONNECT_METAMASK,
  CONNECT_METAMASK_PASSIVE,
  GET_CONTRACT_EVENTS,
  GET_CURRENTEDITION,
  EDITION_RETURNED,
  GET_EDITION_DETAILS,
  EDITION_DETAILS_RETURNED,
  GET_TOKENJSON,
  TOKENJSON_RETURNED,
  BUY_EDITION,
  BUY_RETURNED,
  GET_AVAILABLE_ITEMS,
  GET_ITEMS_CIRCULATING,
  GET_SALES_VALUE,
  GET_ACCOUNT_ROLES,
  AVAILABLE_ITEMS_RETURNED,
  ITEMS_CIRCULATING_RETURNED,
  SALES_VALUE_RETURNED,
  ACCOUNT_ROLES_RETURNED,
} from "../constants";

import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
} from "./connectors";

const rp = require("request-promise");
const ethers = require("ethers");

const Dispatcher = require("flux").Dispatcher;
const Emitter = require("events").EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

class Store {
  constructor() {
    this.store = {
      universalGasPrice: "70",
      ethPrice: 0,
      account: {},
      web3: null,
      events: [],
      connectorsByName: {
        MetaMask: injected,
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        Frame: frame,
      },
      web3context: null,
      languages: [
        {
          language: "English",
          code: "en",
        },
        {
          language: "Español",
          code: "es",
        },
      ],
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONNECT_LEDGER:
            this.connectLedger(payload);
            break;
          case CONNECT_METAMASK:
            this.connectMetamask(payload);
            break;
          case CONNECT_METAMASK_PASSIVE:
            this.connectMetamaskPassive(payload);
            break;
          case GET_CONTRACT_EVENTS:
            this.getContractEvents(payload);
            break;
          case GET_CURRENTEDITION:
            this.getCurrentEdition(payload);
            break;
          case GET_EDITION_DETAILS:
            this.getEditionDetails(payload);
            break;
          case GET_TOKENJSON:
            this.getTokenJson(payload);
            break;
          case BUY_EDITION:
            this.buyEdition(payload);
            break;
          case GET_AVAILABLE_ITEMS:
            this.getAvailableItems(payload);
            break;
          case GET_ITEMS_CIRCULATING:
            this.getCirculatingItems(payload);
            break;
          case GET_SALES_VALUE:
            this.getSalesValue(payload);
            break;
          case GET_ACCOUNT_ROLES:
            this.getAccountRoles(payload);
            break;
          default: {
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
    //  console.log(this.store)
    return emitter.emit("StoreUpdated");
  }

  getTokenJson = async (url) => {
    let _tokenURI;
    await fetch(url.content)
      .then(function (response) {
        _tokenURI = response.json();
        return response.json();
      })
      .then(function (data) {
        //console.log('JSON from "' + fullurl + '" parsed successfully!');
        //console.log(data.image);
      })
      .catch(function (error) {
        //console.error(error.message);
      });

    return emitter.emit(TOKENJSON_RETURNED, await _tokenURI);
  };

  getAccountRoles = async () => {
    let isAdmin = false;
    let isMinter = false;
    let isLF = false;
    if (store.getStore("web3context")) {
      const account = store.getStore("account");
      const web3 = new Web3(store.getStore("web3context").library.provider);
      let lfOriginalsContract = new web3.eth.Contract(
        config.LFOriginalsABI,
        config.lfOriginalsContract
      );
      if (account.address) {
        isAdmin = await lfOriginalsContract.methods
          .hasRole(web3.utils.keccak256("ADMIN_ROLE"), account.address)
          .call();
        isMinter = await lfOriginalsContract.methods
          .hasRole(web3.utils.keccak256("MINTER_ROLE"), account.address)
          .call();
        isLF = await lfOriginalsContract.methods
          .hasRole(web3.utils.keccak256("LF_MEMBER"), account.address)
          .call();
      }
    } else {
    }
    /*
     */
    let roles = [isAdmin, isMinter, isLF];
    return emitter.emit(ACCOUNT_ROLES_RETURNED, roles);
  };

  getCurrentEdition = async () => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let curEdit = await lfOriginalsContract.methods.edition().call();
    return emitter.emit(EDITION_RETURNED, curEdit);
  };

  getAvailableItems = async () => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let itemsAvailable = await lfOriginalsContract.methods
      .totalItemsAvailable()
      .call();
    return emitter.emit(AVAILABLE_ITEMS_RETURNED, itemsAvailable);
  };

  getCirculatingItems = async () => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let itemsCirculating = await lfOriginalsContract.methods
      .totalSupply()
      .call();
    return emitter.emit(ITEMS_CIRCULATING_RETURNED, itemsCirculating);
  };

  getSalesValue = async () => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let salesValueinWEI = await lfOriginalsContract.methods
      .totalPurchaseValueInWei()
      .call();
    return emitter.emit(
      SALES_VALUE_RETURNED,
      web3.utils.fromWei(salesValueinWEI)
    );
  };

  getEditionDetails = async (curEdit) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let editions = await lfOriginalsContract.methods
      .detailsOfEdition(curEdit.content * 100)
      .call();

    return emitter.emit(EDITION_DETAILS_RETURNED, editions);
  };

  buyEdition = async (payload) => {
    const account = store.getStore("account");
    const { editNum, value } = payload;
    this._callBuy(editNum, value, account.address, (err, result) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(BUY_RETURNED, result);
    });
  };

  _callBuy = async (editNum, value, account, callback) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    lfOriginalsContract.methods
      .purchase(editNum)
      .send({
        from: account,
        value: value,
        gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
      })
      .on("transactionHash", function (hash) {
        console.log(hash);
        callback(null, hash);
      })
      .on("receipt", function (receipt) {
        console.log(receipt);
      })
      .on("error", function (error) {
        console.log(error);
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      });
  };

  _getGasPrice = async () => {
    try {
      const url = "https://gasprice.poa.network/";
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString);
      if (priceJSON) {
        return priceJSON.fast.toFixed(0);
      }
      return store.getStore("universalGasPrice");
    } catch (e) {
      console.log(e);
      return store.getStore("universalGasPrice");
    }
  };
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter,
};
