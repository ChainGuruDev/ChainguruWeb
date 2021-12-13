import config from "../config";
import Web3 from "web3";
import Bottleneck from "bottleneck";
import debounce from "lodash/throttle";
import {
  ERROR,
  CONNECT_LEDGER,
  CONNECT_METAMASK,
  CONNECT_METAMASK_PASSIVE,
  LOGIN,
  LOGIN_RETURNED,
  CHECK_ACCOUNT,
  CHECK_ACCOUNT_RETURNED,
  GET_CONTRACT_EVENTS,
  GET_CONTRACT_EVENTS_RETURNED,
  GET_CURRENTEDITION,
  EDITION_RETURNED,
  GET_EDITION_DETAILS,
  GET_EDITIONS_DETAILS,
  EDITION_DETAILS_RETURNED,
  EDITIONS_DETAILS_RETURNED,
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
  CHECK_ROLES,
  CHECK_ROLES_RETURNED,
  CREATE_NEW_EDITION,
  NEW_EDITION_RETURNED,
  SET_ROLES,
  REVOKE_ROLES,
  GET_ARTIST_EDITIONS,
  ARTIST_EDITIONS_RETURNED,
  GET_USER_EDITIONS,
  GET_USER_EDITIONS_DETAILS,
  USER_EDITIONS_RETURNED,
  GET_ARTIST_EDITIONS_DETAILS,
  PING_COINGECKO,
  PING_COINGECKO_RETURNED,
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
  COINGECKO_POPULATE_TXLIST,
  COINGECKO_POPULATE_TXLIST_RETURNED,
  GET_COIN_LIST,
  COINLIST_RETURNED,
  GET_COIN_DATA,
  COIN_DATA_RETURNED,
  GET_COIN_PRICECHART,
  COIN_PRICECHART_RETURNED,
  SET_ALLOWED_ARTIST,
  ALLOWED_ARTIST_RETURNED,
  IS_ALLOWED_ARTIST,
  IS_ALLOWED_RETURNED,
  GIFT_EDITION,
  GET_MAX_EDITIONSIZE,
  MAX_EDIT_SIZE_RETURNED,
  DB_GET_USERDATA,
  DB_USERDATA_RETURNED,
  DB_ADD_FAVORITE,
  DB_ADD_FAVORITE_RETURNED,
  DB_DEL_FAVORITE,
  DB_DEL_FAVORITE_RETURNED,
  DB_ADD_BLACKLIST,
  DB_DEL_BLACKLIST,
  DB_ADDDEL_BLACKLIST_RETURNED,
  DB_ADD_WALLET,
  DB_DEL_WALLET,
  DB_ADD_WALLET_RETURNED,
  DB_DEL_WALLET_RETURNED,
  DB_UPDATE_WALLET,
  DB_UPDATE_WALLET_RETURNED,
  DB_UPDATE_WALLET_MOVEMENTS,
  DB_UPDATE_WALLET_MOVEMENTS_RETURNED,
  DB_UPDATE_WALLET_MOVEMENTS_PRICES,
  DB_UPDATE_WALLET_MOVEMENTS_PRICES_RETURNED,
  COINGECKO_ALLTIME_CHART_RETURNED,
  COINGECKO_GET_ALLTIME_CHART,
  UNISWAP_TRADE,
  DARKMODE_SWITCH,
  DARKMODE_SWITCH_RETURN,
  CHECK_GASPRICE,
  GASPRICE_RETURNED,
  SWITCH_VS_COIN,
  DB_UPDATE_ONE_MOV,
  DB_UPDATE_ONE_MOV_RETURNED,
  DB_GET_COIN_CATEGORIES,
  DB_GET_COIN_CATEGORIES_RETURNED,
  DB_GET_TOKEN_LS,
  DB_GET_TOKEN_LS_RETURNED,
  DB_GET_USER_TOKEN_LS,
  DB_GET_USER_TOKEN_LS_RETURNED,
  DB_GET_USER_LS,
  DB_GET_USER_LS_RETURNED,
  DB_CREATE_LS,
  DB_CREATE_LS_RETURNED,
  DB_CHECK_LS_RESULT,
  DB_CHECK_LS_RESULT_RETURNED,
  DB_NEW_NICKNAME,
  DB_NEW_NICKNAME_RETURNED,
  DB_NEW_AVATAR,
  DB_NEW_AVATAR_RETURNED,
  DB_GET_LEADERBOARD,
  DB_GET_LEADERBOARD_RETURNED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
  DB_GET_PORTFOLIO_STATS,
  DB_GET_PORTFOLIO_STATS_RETURNED,
  DB_GET_PORTFOLIO_ASSET_STATS,
  DB_GET_PORTFOLIO_ASSET_STATS_RETURNED,
  DB_GET_PORTFOLIO_CHART,
  DB_GET_PORTFOLIO_CHART_RETURNED,
  DB_GET_ASSETSTATS,
  DB_GET_ASSETSTATS_RETURNED,
  DB_UPDATE_PORTFOLIO,
  DB_UPDATE_PORTFOLIO_RETURNED,
  DB_SET_USER_WALLET_NICKNAME,
  DB_SET_USER_WALLET_NICKNAME_RETURNED,
  DB_REMOVE_USER_WALLET_NICKNAME,
  DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
  GECKO_GET_COINS,
  GECKO_GET_COINS_RETURNED,
  GET_TRANSACTION_RECEIPT,
  GET_TRANSACTION_RECEIPT_RETURNED,
  DB_GET_BLUECHIPS,
  DB_GET_BLUECHIPS_RETURNED,
  DB_GET_BLUECHIPS_USER,
  DB_GET_BLUECHIPS_USER_RETURNED,
  DB_ADD_BLUECHIPS_GURU,
  DB_ADD_BLUECHIPS_GURU_RETURNED,
  DB_DEL_BLUECHIPS_GURU,
  DB_DEL_BLUECHIPS_GURU_RETURNED,
  DB_ADD_BLUECHIPS,
  DB_DEL_BLUECHIPS,
  DB_ADD_BLUECHIPS_RETURNED,
  DB_DEL_BLUECHIPS_RETURNED,
  DB_BLUECHIPS_CHECK,
  DB_BLUECHIPS_CHECK_RETURNED,
  DB_GET_ADDRESS_TX,
  DB_GET_ADDRESS_TX_RETURNED,
  DB_GET_CRYPTONEWS,
  DB_GET_CRYPTONEWS_RETURNED,
} from "../constants";

import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
} from "./connectors";

import { getHash } from "../components/helpers";

const limiterGecko = new Bottleneck({
  reservoir: 50, // initial value
  reservoirRefreshAmount: 50,
  reservoirRefreshInterval: 60 * 1100, // must be divisible by 250
  // also use maxConcurrent and/or minTime for safety
  maxConcurrent: 1,
  minTime: 1500, // pick a value that makes sense for your use case
});

const limiterChainguru = new Bottleneck({
  reservoir: 50, // initial value
  reservoirRefreshAmount: 50,
  reservoirRefreshInterval: 60 * 1100, // must be divisible by 250
  // also use maxConcurrent and/or minTime for safety
  maxConcurrent: 2,
  minTime: 1500, // pick a value that makes sense for your use case
});

const rp = require("request-promise");

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();
const axios = require("axios").default;
const Dispatcher = require("flux").Dispatcher;
const Emitter = require("events").EventEmitter;
const dispatcher = new Dispatcher();
const emitter = new Emitter();

let assetStatsRequest = null;

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
      coinList: [],
      userData: {},
      theme: "light",
      geckoOnline: false,
      chainId: null,
      authToken: null,
      authTokenExp: null,
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
          case CHECK_ACCOUNT:
            this.checkAccount(payload);
            break;
          case LOGIN:
            this.login(payload);
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
          case GET_EDITIONS_DETAILS:
            this.getEditionsDetails(payload);
            break;
          case GET_USER_EDITIONS:
            this.getUserEditions(payload);
            break;
          case GET_USER_EDITIONS_DETAILS:
            this.getUserEditionsDetails(payload);
            break;
          case GET_ARTIST_EDITIONS:
            this.getArtistEditions(payload);
            break;
          case GET_ARTIST_EDITIONS_DETAILS:
            this.getArtistEditionsDetails(payload);
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
          case CHECK_ROLES:
            this.checkRoles(payload);
            break;
          case SET_ROLES:
            this.setRoles(payload);
            break;
          case REVOKE_ROLES:
            this.revokeRoles(payload);
            break;
          case CREATE_NEW_EDITION:
            this.createNewEdition(payload);
            break;
          case PING_COINGECKO:
            this.pingCoinGecko(payload);
            break;
          case GET_COIN_LIST:
            this.getCoinList(payload);
            break;
          case GET_COIN_DATA:
            this.getCoinData(payload);
            break;
          case SET_ALLOWED_ARTIST:
            this.setAllowedArtist(payload);
            break;
          case IS_ALLOWED_ARTIST:
            this.isAllowedArtist(payload);
            break;
          case GIFT_EDITION:
            this.giftEdition(payload);
            break;
          case GET_MAX_EDITIONSIZE:
            this.getMaxEditSize(payload);
            break;
          case GET_COIN_PRICECHART:
            this.getCoinPriceChart(payload);
            break;
          case DB_GET_USERDATA:
            this.debouncedGetUserData(payload);
            break;
          case DB_ADD_WALLET:
            this.db_addWallet(payload);
            break;
          case DB_DEL_WALLET:
            this.db_delWallet(payload);
            break;
          case DB_ADD_FAVORITE:
            this.db_addFavorite(payload);
            break;
          case DB_DEL_FAVORITE:
            this.db_delFavorite(payload);
            break;
          case DB_ADD_BLACKLIST:
            this.db_addBlacklist(payload);
            break;
          case DB_DEL_BLACKLIST:
            this.db_delBlacklist(payload);
            break;
          case DB_UPDATE_WALLET:
            this.db_updateWallet(payload);
            break;
          case DB_UPDATE_WALLET_MOVEMENTS:
            this.db_updateWalletMovements(payload);
            break;
          case DB_UPDATE_ONE_MOV:
            this.db_updateOneMov(payload);
            break;
          case COINGECKO_POPULATE_FAVLIST:
            this.geckoPopulateFavList(payload);
            break;
          case COINGECKO_POPULATE_TXLIST:
            this.geckoPopulateTxList(payload);
            break;
          case COINGECKO_GET_ALLTIME_CHART:
            this.coingeckoGetAllTimeChart(payload);
            break;
          case UNISWAP_TRADE:
            this.uniswapTrade(payload);
            break;
          case DARKMODE_SWITCH:
            this.darkModeSwitch(payload);
            break;
          case CHECK_GASPRICE:
            this.checkGasPrice(payload);
            break;
          case SWITCH_VS_COIN:
            this.switchVsCoin(payload);
            break;
          case DB_UPDATE_WALLET_MOVEMENTS_PRICES:
            this.dbUpdateMovementPrices(payload);
            break;
          case DB_GET_COIN_CATEGORIES:
            this.db_getCoinCategories(payload);
            break;
          case DB_GET_TOKEN_LS:
            this.db_getTokenLS(payload);
            break;
          case DB_GET_USER_TOKEN_LS:
            this.db_getUserTokenLS(payload);
            break;
          case DB_GET_USER_LS:
            this.db_getUserLS(payload);
            break;
          case DB_CREATE_LS:
            this.db_createLS(payload);
            break;
          case DB_CHECK_LS_RESULT:
            this.db_checkLSResult(payload);
            break;
          case DB_NEW_NICKNAME:
            this.db_newNickname(payload);
            break;
          case DB_NEW_AVATAR:
            this.db_newAvatar(payload);
            break;
          case DB_GET_LEADERBOARD:
            this.db_getLeaderboard();
            break;
          case DB_GET_PORTFOLIO:
            this.db_getPortfolio(payload);
            break;
          case DB_GET_PORTFOLIO_STATS:
            this.db_getPortfolioStats(payload);
            break;
          case DB_GET_PORTFOLIO_ASSET_STATS:
            this.db_getPortfolioAssetStats(payload);
            break;
          case DB_GET_PORTFOLIO_CHART:
            this.db_getPortfolioChart(payload);
            break;
          case DB_GET_ASSETSTATS:
            this.debouncedGetAssetStats(payload);
            break;
          case DB_UPDATE_PORTFOLIO:
            this.db_updatePortfolio(payload);
            break;
          case DB_SET_USER_WALLET_NICKNAME:
            this.db_setUserWalletNickname(payload);
            break;
          case DB_REMOVE_USER_WALLET_NICKNAME:
            this.db_delUserWalletNickname(payload);
            break;
          case GECKO_GET_COINS:
            this.geckoGetCoins(payload);
            break;
          case GET_TRANSACTION_RECEIPT:
            this.getTransactionReceipt(payload);
            break;
          case DB_GET_BLUECHIPS:
            this.limitedGetChips();
            break;
          case DB_GET_BLUECHIPS_USER:
            this.db_getBluechipsUser();
            break;
          case DB_BLUECHIPS_CHECK:
            this.db_bluechipsCheck();
            break;
          case DB_ADD_BLUECHIPS_GURU:
            this.db_AddBluechipsGuru(payload);
            break;
          case DB_DEL_BLUECHIPS_GURU:
            this.db_DelBluechipsGuru(payload);
            break;
          case DB_ADD_BLUECHIPS:
            this.db_AddBluechips(payload);
            break;
          case DB_DEL_BLUECHIPS:
            this.db_DelBluechip(payload);
            break;
          case DB_GET_ADDRESS_TX:
            this.db_getAddressTx(payload);
            break;
          case DB_GET_CRYPTONEWS:
            this.db_getCryptoNews(payload);
            break;
          default: {
            break;
          }
        }
      }.bind(this)
    );

    this.getCoinList();
  }

  getStore(index) {
    return this.store[index];
  }

  setStore(obj) {
    this.store = { ...this.store, ...obj };
    return emitter.emit("StoreUpdated");
  }

  checkAccount = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let account = payload.content;
    let _isAccount = false;
    try {
      const address = web3.utils.toChecksumAddress(account);
      _isAccount = true;
    } catch (e) {
      _isAccount = false;
    }
    return emitter.emit(CHECK_ACCOUNT_RETURNED, _isAccount);
  };

  getNewAccessToken = async (expiry) => {
    console.log("token about to expire, getting a new one");
    let user = store.getStore("account");
    this.login({ address: user.address });
  };

  setNewAccessToken = (token, tokenExp) => {
    clearTimeout(this.tokenTimer);
    // console.log("new temp access token");

    store.setStore({
      authToken: token,
      authTokenExp: tokenExp,
      userAuth: true,
    });
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = tokenExp - currentTime - 30;
    this.tokenTimer = setTimeout(
      () => this.getNewAccessToken(timeLeft),
      timeLeft * 1000
    );
    emitter.emit(LOGIN_RETURNED, true);
  };

  giftEdition = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    const account = store.getStore("account");

    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );

    try {
      const address = web3.utils.toChecksumAddress(payload.destAccount);
      lfOriginalsContract.methods
        .safeTransferFrom(
          account.address,
          payload.destAccount,
          payload.giftToken
        )
        .send({
          from: account.address,
          gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
        });
    } catch (e) {
      return emitter.emit(ERROR, "NOT A VALID ACCOUNT");
    }
  };

  createNewEdition = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    const account = store.getStore("account");

    const { artistCommission, price, tokenURI, maxSupply } = payload.content;

    let _price = web3.utils.toWei(price);

    this._callCreateNew(
      account.address,
      artistCommission,
      _price,
      tokenURI,
      maxSupply,
      (err, result) => {
        if (err) {
          return emitter.emit(ERROR, err);
        }
      }
    );
    // console.log("from: " + account.address);
    // console.log("artistAccount: " + artistAccount);
    // console.log("artistCommission: " + artistCommission);
    // console.log("price: " + _price);
    // console.log("tokenURI: " + tokenURI);
    // console.log("max supply: " + maxSupply);
  };

  /*
  // _callCreateNew = async (
  //   account,
  //   artistAccount,
  //   artistCommission,
  //   price,
  //   tokenURI,
  //   maxSupply,
  //   callback
  // ) => {
  //   const web3 = new Web3(store.getStore("web3context").library.provider);
  //   let lfOriginalsContract = new web3.eth.Contract(
  //     config.LFOriginalsABI,
  //     config.lfOriginalsContract
  //   );
  //   const curEdit = await lfOriginalsContract.methods.edition().call();
  //   let _editionNumber = (1 + parseInt(await curEdit)) * 100;
  //   lfOriginalsContract.methods
  //     .createActiveEdition(
  //       _editionNumber,
  //       artistAccount,
  //       artistCommission,
  //       price,
  //       tokenURI,
  //       maxSupply
  //     )
  //     .send({
  //       from: account,
  //       gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
  //     })
  //     .on("receipt", function (receipt) {
  //       return emitter.emit(NEW_EDITION_RETURNED, receipt);
  //     })
  //     .on("error", function (error) {
  //       //console.log(error);
  //       if (!error.toString().includes("-32601")) {
  //         if (error.message) {
  //           return callback(error.message);
  //         }
  //         callback(error);
  //       } else {
  //         if (error.message) {
  //           return callback(error.message);
  //         }
  //         callback(error);
  //       }
  //     });
  // };
  */

  _callCreateNew = async (
    account,
    artistCommission,
    price,
    tokenURI,
    maxSupply,
    callback
  ) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let selfServiceEditionCurationContract = new web3.eth.Contract(
      config.SelfServiceEditionCurationABI,
      config.selfServiceEditionCurationContract
    );
    selfServiceEditionCurationContract.methods
      .createEdition(true, artistCommission, price, maxSupply, tokenURI)
      .send({
        from: account,
        gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
      })
      .on("receipt", function (receipt) {
        return emitter.emit(NEW_EDITION_RETURNED, receipt);
      })
      .on("error", function (error) {
        //console.log(error);
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        } else {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      });
  };

  getTokenJson = async (url) => {
    let _tokenURI;
    await fetch(url.content)
      .then(async (response) => {
        _tokenURI = await response.json();
        console.log(_tokenURI);
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
    let roles = [isAdmin, isMinter, isLF];
    return emitter.emit(ACCOUNT_ROLES_RETURNED, roles);
  };

  darkModeSwitch = (state) => {
    let theme = state.content ? "dark" : "light";
    store.setStore({ theme: theme });
    return emitter.emit(DARKMODE_SWITCH_RETURN, state.content);
  };

  checkRoles = async (_account) => {
    let isAdmin = false;
    let isMinter = false;
    let isLF = false;
    if (store.getStore("web3context")) {
      const web3 = new Web3(store.getStore("web3context").library.provider);
      let lfOriginalsContract = new web3.eth.Contract(
        config.LFOriginalsABI,
        config.lfOriginalsContract
      );
      console.log(_account.content);
      try {
        // const address = web3.utils.toChecksumAddress(_account.content);
        if (_account.content) {
          isAdmin = await lfOriginalsContract.methods
            .hasRole(web3.utils.keccak256("ADMIN_ROLE"), _account.content)
            .call();
          isMinter = await lfOriginalsContract.methods
            .hasRole(web3.utils.keccak256("MINTER_ROLE"), _account.content)
            .call();
          isLF = await lfOriginalsContract.methods
            .hasRole(web3.utils.keccak256("LF_MEMBER"), _account.content)
            .call();
        }
      } catch (e) {
        return emitter.emit(ERROR, e.message);
      }
    }
    /*
     */
    let roles = [isAdmin, isMinter, isLF];
    console.log(roles);
    return emitter.emit(CHECK_ROLES_RETURNED, roles);
  };

  setRoles = async (payload) => {
    if (store.getStore("web3context")) {
      const account = store.getStore("account");
      const web3 = new Web3(store.getStore("web3context").library.provider);
      let lfOriginalsContract = new web3.eth.Contract(
        config.LFOriginalsABI,
        config.lfOriginalsContract
      );
      let _isAccount = false;
      try {
        // const address = web3.utils.toChecksumAddress(payload.account);
        _isAccount = true;
        if (_isAccount) {
          if (payload.role === 1) {
            await lfOriginalsContract.methods
              .grantRole(web3.utils.keccak256("ADMIN_ROLE"), payload.account)
              .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
              })
              .on("transactionHash", function (hash) {
                console.log(hash);
                dispatcher.dispatch({
                  type: CHECK_ROLES,
                  content: payload.account,
                });
              })
              .on("receipt", function (receipt) {
                console.log(receipt);
              })
              .on("error", function (error) {
                console.log(error);
                if (!error.toString().includes("-32601")) {
                  if (error.message) {
                    return emitter.emit(ERROR, error.message);
                  }
                }
              });
          } else if (payload.role === 2) {
            await lfOriginalsContract.methods
              .grantRole(web3.utils.keccak256("MINTER_ROLE"), payload.account)
              .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
              })
              .on("transactionHash", function (hash) {
                console.log(hash);
                dispatcher.dispatch({
                  type: CHECK_ROLES,
                  content: payload.account,
                });
              })
              .on("receipt", function (receipt) {
                console.log(receipt);
              })
              .on("error", function (error) {
                console.log(error);
                if (!error.toString().includes("-32601")) {
                  if (error.message) {
                    return emitter.emit(ERROR, error.message);
                  }
                }
              });
          } else if (payload.role === 3) {
            await lfOriginalsContract.methods
              .grantRole(web3.utils.keccak256("LF_MEMBER"), payload.account)
              .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
              })
              .on("transactionHash", function (hash) {
                console.log(hash);
                dispatcher.dispatch({
                  type: CHECK_ROLES,
                  content: payload.account,
                });
              })
              .on("receipt", function (receipt) {
                console.log(receipt);
              })
              .on("error", function (error) {
                console.log(error);
                if (!error.toString().includes("-32601")) {
                  if (error.message) {
                    return emitter.emit(ERROR, error.message);
                  }
                }
              });
          }
        }
      } catch (e) {
        _isAccount = false;
        return emitter.emit(ERROR, e);
      }
    }
  };

  isAllowedArtist = async () => {
    if (store.getStore("web3context")) {
      // let _isAllowed = false;
      const account = store.getStore("account");
      const web3 = new Web3(store.getStore("web3context").library.provider);
      let selfServiceAccessControls = new web3.eth.Contract(
        config.SelfServiceAccessControlsABI,
        config.selfServiceAccessControlsContract
      );
      if (account.address) {
        let _isAllowed = await selfServiceAccessControls.methods
          .isEnabledForAccount(account.address)
          .call();
        return emitter.emit(IS_ALLOWED_RETURNED, await _isAllowed);
      }
    }
  };

  setAllowedArtist = async (payload) => {
    if (store.getStore("web3context")) {
      const account = store.getStore("account");
      const web3 = new Web3(store.getStore("web3context").library.provider);
      let selfServiceAccessControls = new web3.eth.Contract(
        config.SelfServiceAccessControlsABI,
        config.selfServiceAccessControlsContract
      );
      let _isAccount = false;
      try {
        // const address = web3.utils.toChecksumAddress(payload.account);
        _isAccount = true;
        if (_isAccount) {
          await selfServiceAccessControls.methods
            .setAllowedArtist(payload.account, payload.enabled)
            .send({
              from: account.address,
              gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
            })
            .on("transactionHash", function (hash) {
              //console.log(hash);
            })
            .on("receipt", function (receipt) {
              //console.log(receipt);
            })
            .on("error", function (error) {
              console.log(error.message);
              if (!error.toString().includes("-32601")) {
                if (error.message) {
                  return emitter.emit(ERROR, error.message);
                }
              }
            });
          return emitter.emit(ALLOWED_ARTIST_RETURNED, payload.enabled);
        }
      } catch (e) {
        _isAccount = false;
        return emitter.emit(ERROR, e);
      }
    }
  };

  revokeRoles = async (payload) => {
    if (store.getStore("web3context")) {
      const account = store.getStore("account");
      const web3 = new Web3(store.getStore("web3context").library.provider);
      let lfOriginalsContract = new web3.eth.Contract(
        config.LFOriginalsABI,
        config.lfOriginalsContract
      );
      let _isAccount = false;
      try {
        // const address = web3.utils.toChecksumAddress(payload.account);
        _isAccount = true;
        if (_isAccount) {
          if (payload.role === 1) {
            await lfOriginalsContract.methods
              .revokeRole(web3.utils.keccak256("ADMIN_ROLE"), payload.account)
              .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
              })
              .on("transactionHash", function (hash) {
                console.log(hash);
                dispatcher.dispatch({
                  type: CHECK_ROLES,
                  content: payload.account,
                });
              })
              .on("receipt", function (receipt) {
                console.log(receipt);
              })
              .on("error", function (error) {
                console.log(error);
                if (!error.toString().includes("-32601")) {
                  if (error.message) {
                    return emitter.emit(ERROR, error.message);
                  }
                }
              });
          }

          if (payload.role === 2) {
            await lfOriginalsContract.methods
              .revokeRole(web3.utils.keccak256("MINTER_ROLE"), payload.account)
              .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
              })
              .on("transactionHash", function (hash) {
                console.log(hash);
                dispatcher.dispatch({
                  type: CHECK_ROLES,
                  content: payload.account,
                });
              })
              .on("receipt", function (receipt) {
                console.log(receipt);
              })
              .on("error", function (error) {
                console.log(error);
                if (!error.toString().includes("-32601")) {
                  if (error.message) {
                    return emitter.emit(ERROR, error.message);
                  }
                }
              });
          }
          if (payload.role === 3) {
            await lfOriginalsContract.methods
              .revokeRole(web3.utils.keccak256("LF_MEMBER"), payload.account)
              .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
              })
              .on("transactionHash", function (hash) {
                console.log(hash);
                dispatcher.dispatch({
                  type: CHECK_ROLES,
                  content: payload.account,
                });
              })
              .on("receipt", function (receipt) {
                console.log(receipt);
              })
              .on("error", function (error) {
                console.log(error);
                if (!error.toString().includes("-32601")) {
                  if (error.message) {
                    return emitter.emit(ERROR, error.message);
                  }
                }
              });
          }
        }
      } catch (e) {
        _isAccount = false;
        return emitter.emit(ERROR, e);
      }
    }
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
      .detailsOfEdition(curEdit.content)
      .call();

    return emitter.emit(EDITION_DETAILS_RETURNED, editions);
  };

  getArtistEditions = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let _artistEditions = await lfOriginalsContract.methods
      .artistsEditions(payload.content)
      .call();
    dispatcher.dispatch({
      type: GET_ARTIST_EDITIONS_DETAILS,
      content: _artistEditions,
    });
    return emitter.emit(ARTIST_EDITIONS_RETURNED, _artistEditions);
  };

  getUserEditions = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let _userBalance = await lfOriginalsContract.methods
      .balanceOf(payload.content)
      .call();
    let _userTokens = [];
    let _userTokenDetails = [];

    let _userOwnedEditions = [];
    let _userOwnedTokens = {};
    for (var i = 0; i < (await _userBalance); i++) {
      let _tokenID = await lfOriginalsContract.methods
        .tokenOfOwnerByIndex(payload.content, i)
        .call();
      _userTokens[i] = _tokenID;

      let _tokenDetails = await lfOriginalsContract.methods
        .tokenData(await _userTokens[i])
        .call();
      _userTokenDetails[i] = _tokenDetails;

      if (_userOwnedEditions.includes(_userTokenDetails[i][0])) {
        _userOwnedTokens[_userTokenDetails[i][0]].push(_userTokens[i]);
      } else {
        _userOwnedEditions.push(_userTokenDetails[i][0]);
        _userOwnedTokens[_userTokenDetails[i][0]] = [_userTokens[i]];
      }
    }

    return emitter.emit(USER_EDITIONS_RETURNED, [
      _userBalance,
      _userTokens,
      _userTokenDetails,
      _userOwnedEditions,
      _userOwnedTokens,
    ]);
    //console.log(await _userBalance);
    //console.log(await _userTokens);
    //console.log(await _userTokenDetails);
  };

  getUserEditionsDetails = async (payload) => {
    console.log(payload);
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

  getArtistEditionsDetails = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let _artistEditions = payload.content;
    const editionDetails = await Promise.all(
      _artistEditions.map((editNum, index) => {
        return lfOriginalsContract.methods.detailsOfEdition(editNum).call();
      })
    );

    return emitter.emit(EDITIONS_DETAILS_RETURNED, editionDetails);
  };

  getMaxEditSize = async () => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let selfServiceEditionCurationContract = new web3.eth.Contract(
      config.SelfServiceEditionCurationABI,
      config.selfServiceEditionCurationContract
    );
    let maxEditSize = await selfServiceEditionCurationContract.methods
      .maxEditionSize()
      .call();
    return emitter.emit(MAX_EDIT_SIZE_RETURNED, maxEditSize);
  };

  getEditionsDetails = async (curEdit) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );
    let selfServiceEditionCurationContract = new web3.eth.Contract(
      config.SelfServiceEditionCurationABI,
      config.selfServiceEditionCurationContract
    );
    let maxEditSize = await selfServiceEditionCurationContract.methods
      .maxEditionSize()
      .call();
    const editionsDetails = await Promise.all(
      curEdit.content.editions.fill().map((element, index) => {
        return lfOriginalsContract.methods
          .detailsOfEdition((index + 1) * maxEditSize)
          .call();
      })
    );

    return emitter.emit(EDITIONS_DETAILS_RETURNED, editionsDetails);
  };

  buyEdition = async (payload) => {
    const account = store.getStore("account");
    const { editNum, value } = payload;
    this._callBuy(editNum, value, account.address, (err, result) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }
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
      .on("receipt", function (receipt) {
        return emitter.emit(BUY_RETURNED, receipt);
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

  checkGasPrice = async () => {
    const gasPrice = await this._getGasPrice();
    return emitter.emit(GASPRICE_RETURNED, gasPrice);
  };

  _getGasPrice = async () => {
    try {
      // const url = "https://chainguru-db.herokuapp.com/gas/checkGas";
      const url = "https://chainguru-db.herokuapp.com/gas/checkGas";

      const priceString = await axios.get(url);
      // console.log(priceString.data.result);

      if (priceString.data.result) {
        store.setStore({
          universalGasPrice: priceString.data.result.ProposeGasPrice,
        });
        return priceString.data.result.ProposeGasPrice;
      }
      console.log(priceString.data.result.ProposeGasPrice);
      return store.getStore("universalGasPrice");
    } catch (e) {
      console.log(e);
      return store.getStore("universalGasPrice");
    }
  };

  getContractEvents = (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );

    lfOriginalsContract
      .getPastEvents("allEvents", { fromBlock: 1, toBlock: "latest" })
      .then((res) => {
        const sorted = res
          .sort((a, b) => {
            return parseFloat(a.blockNumber) - parseFloat(b.blockNumber);
          })
          .filter((tx) => {
            if (tx.event !== "Transfer") {
              return false;
            }

            if (!tx.returnValues.value || tx.returnValues.value === 0) {
              return false;
            }

            if (
              tx.returnValues.from !==
              "0x0000000000000000000000000000000000000000"
            ) {
              return false;
            }

            return true;
          })
          .map(async (tx) => {
            const rawTx = await this._getTransaction(web3, tx.transactionHash);

            return {
              blockNumber: tx.blockNumber,
              transactionHash: tx.transactionHash,
              eth: web3.utils.fromWei(rawTx.value, "ether"),
              iEth: web3.utils.fromWei(tx.returnValues.value, "ether"),
              ethRatio: (tx.returnValues.value * 100) / rawTx.value,
              address: rawTx.from,
            };
          });

        Promise.all(sorted).then(async (transactions) => {
          const pricePerFullShare = await this._getPricePerFullShare(
            web3,
            lfOriginalsContract
          );

          const trxs = transactions.map(async (tx) => {
            //console.log(tx.address)
            const balance = await this._getIEthBalance(
              web3,
              lfOriginalsContract,
              tx.address
            );

            tx.ethRedeem = parseFloat(pricePerFullShare) * parseFloat(balance);
            tx.growth = (parseFloat(tx.ethRedeem) * 100) / parseFloat(tx.eth);
            return tx;
          });

          Promise.all(trxs).then(async (txs) => {
            store.setStore({ events: txs });
            return emitter.emit(GET_CONTRACT_EVENTS_RETURNED, txs);
          });
        });
      });
  };

  pingCoinGecko = async () => {
    if (!this.store.geckoOnline) {
      try {
        let data = await CoinGeckoClient.ping();
        if (data.code === 200) {
          this.store.geckoOnline = true;
          return emitter.emit(PING_COINGECKO_RETURNED, data.data.gecko_says);
        }
        //TODO DISPATCH GECKO PING OK >> SNACKBAR POWERED BY GECKO
      } catch (err) {
        this.store.geckoOnline = false;
        return emitter.emit(ERROR, err.message);
      }
    }
  };

  getCoinList = async () => {
    if (this.store.coinList.length > 0) {
      //ADD USER FAVORITES TO TOP OF THE LIST
      let list = this.store.coinList;
      if (this.store.userFavorites && this.store.userFavorites.length > 0) {
        const userFav = this.store.userFavorites;
        userFav.forEach((item, i) => {
          list.sort(function (x, y) {
            return x.id === item ? -1 : y.id === item ? 1 : 0;
          });
        });
      }
      list.sort(function (x, y) {
        return x.id === "ethereum" ? -1 : y.id === "ethereum" ? 1 : 0;
      });
      list.sort(function (x, y) {
        return x.id === "bitcoin" ? -1 : y.id === "bitcoin" ? 1 : 0;
      });
      emitter.emit(COINLIST_RETURNED, list);
    } else {
      let data = await CoinGeckoClient.coins.list();

      //ADD USER FAVORITES TO TOP OF THE LIST
      let list = data.data;
      if (this.store.userFavorites && this.store.userFavorites.length > 0) {
        const userFav = this.store.userFavorites;

        userFav.forEach((item, i) => {
          list.sort(function (x, y) {
            return x.id === item ? -1 : y.id === item ? 1 : 0;
          });
        });
      }
      list.sort(function (x, y) {
        return x.id === "ethereum" ? -1 : y.id === "ethereum" ? 1 : 0;
      });
      list.sort(function (x, y) {
        return x.id === "bitcoin" ? -1 : y.id === "bitcoin" ? 1 : 0;
      });
      store.setStore({ coinList: list });
      emitter.emit(COINLIST_RETURNED, this.store.coinList);
    }
    //console.log(this.store.coinList);
    //let data = await CoinGeckoClient.coins.list();
  };

  getCoinData = async (coin) => {
    if (coin.content.startsWith("0x") && coin.content.length > 3) {
      //TODO GET COINDATA FROM CONTRACT ADDRESS
      if (coin.content === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        try {
          let data = await CoinGeckoClient.coins.fetch("ethereum", {
            sparkline: true,
          });
          emitter.emit(COIN_DATA_RETURNED, [await data.data, coin.BarID]);
        } catch (err) {
          console.log(err);
        }
      }
      try {
        let data = await axios.get(
          `https://api.coingecko.com/api/v3/coins/ethereum/contract/${coin.content}`
        );
        emitter.emit(COIN_DATA_RETURNED, [await data.data, coin.BarID]);
      } catch (err) {
        console.log(err);
      }
    } else {
      if (coin.content === "eth") {
        try {
          let data = await CoinGeckoClient.coins.fetch("ethereum", {
            sparkline: true,
          });
          emitter.emit(COIN_DATA_RETURNED, [await data.data, coin.BarID]);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          let data = await CoinGeckoClient.coins.fetch(coin.content, {
            sparkline: true,
          });
          emitter.emit(COIN_DATA_RETURNED, [await data.data, coin.BarID]);
        } catch (err) {
          console.log(err);
        }
      }
    }
  };

  switchVsCoin = (vsCoin) => {
    let newVsCoin;
    switch (vsCoin.vsCoin) {
      case "usd":
        newVsCoin = "eur";
        store.setStore({ vsCoin: "eur" });
        break;
      case "eur":
        newVsCoin = "btc";
        store.setStore({ vsCoin: "btc" });

        break;
      case "btc":
        newVsCoin = "eth";
        store.setStore({ vsCoin: "eth" });

        break;
      case "eth":
        newVsCoin = "usd";
        store.setStore({ vsCoin: "usd" });

        break;
      default:
    }
  };

  geckoPopulateFavList = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    // console.log(payload);
    // console.log(payload.lsType);
    if (!payload.lsType) {
      try {
        let data = await CoinGeckoClient.coins.markets({
          ids: payload.tokenIDs,
          vs_currency: vsCoin,
          sparkline: true,
          price_change_percentage: "1h,24h,7d,30d,1y",
        });
        emitter.emit(COINGECKO_POPULATE_FAVLIST_RETURNED, await data.data);
      } catch (err) {
        console.log(err);
      }
    } else {
      // console.log("LongShort query type " + payload.lsType);
      try {
        let data = await CoinGeckoClient.coins.markets({
          ids: payload.tokenIDs,
          vs_currency: vsCoin,
          sparkline: true,
          price_change_percentage: "1h,24h,7d,30d,1y",
        });
        emitter.emit(
          COINGECKO_POPULATE_FAVLIST_RETURNED,
          await [data.data, payload.lsType]
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  geckoPopulateTxList = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    let itemIDs = [];
    for (var i = 0; i < payload.data.length; i++) {
      let newItem = payload.data[i].tokenID;
      if (newItem) {
        if (itemIDs.indexOf(newItem) === -1) {
          itemIDs.push(newItem);
        }
      }
    }

    try {
      let data = await CoinGeckoClient.coins.markets({
        ids: itemIDs,
        vs_currency: vsCoin,
      });
      console.log(await data);
      emitter.emit(COINGECKO_POPULATE_TXLIST_RETURNED, await data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  getCoinPriceChart = async (payload) => {
    let data;
    if (payload.content[2]) {
      try {
        data = await CoinGeckoClient.coins.fetchMarketChart(
          payload.content[0],
          {
            days: payload.content[2],
            vs_currency: payload.content[3],
          }
        );
      } catch (err) {
        console.log(err.message);
      }
    } else {
      data = await CoinGeckoClient.coins.fetchMarketChart(payload.content[0], {
        days: "7",
        vs_currency: payload.content[3],
      });
    }
    emitter.emit(COIN_PRICECHART_RETURNED, [
      await data.data,
      payload.content[1],
    ]);
  };

  handleSignMessage = async (user, nonce) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    const that = this;
    const msgParams = [
      {
        type: "string", // Any valid solidity type
        name: "Message", // Any string label you want
        value: `Welcome to ChainGuru!

Click "Sign" to sign in. No password needed!
This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will be reset after 24 hours.

Wallet address:
${user}

Nonce:
${nonce}`,
      },
    ];
    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData",
        params: [msgParams, user],
        from: user,
      },
      function (err, result) {
        if (err) return emitter.emit(ERROR, err.message);

        const signature = result.result;
        that.handleAuthenticate(user, signature);
      }
    );
  };

  handleAuthenticate = async (user, signature) => {
    const authToken = await axios.post(
      `https://chainguru-db.herokuapp.com/auth`,
      {
        publicAddress: user,
        signature,
      },
      { withCredentials: true }
    );
    // console.log(authToken);
    if (authToken.data.token && authToken.data.tokenExp) {
      this.setNewAccessToken(authToken.data.token, authToken.data.tokenExp);
    }
  };

  login = debounce(
    async (payload) => {
      return this.debouncedLogin(payload);
    },
    150,
    { leading: true, trailing: false }
  );

  debouncedLogin = async (payload) => {
    try {
      //
      // let _userExists = await axios.get(
      //   `https://chainguru-db.herokuapp.com/users/data`,
      //   {
      //     user: payload.address,
      //   }
      // );
      if (!payload.address) {
        const noAddress = "no valid address";
        throw noAddress;
      }
      //DEV ROUTE
      let _userExists = await axios.get(
        `https://chainguru-db.herokuapp.com/users/${payload.address}`
      );
      try {
        let login = await axios.post(
          `https://chainguru-db.herokuapp.com/auth/login`,
          {
            user: _userExists.data.user,
          },
          {
            withCredentials: true,
          }
        );
        this.setNewAccessToken(login.data.token, login.data.tokenExp);
      } catch (err) {
        console.log(err.message);
        if (_userExists.data.user && _userExists.data.nonce) {
          console.log("new signature needed");
          await this.handleSignMessage(
            _userExists.data.user,
            _userExists.data.nonce
          );
          return emitter.emit(ERROR, "Login expired. New signature required");
        }
      }

      // store.setStore({ userFavorites: _userExists.data.favorites.tokenIDs });
      // if (await _userExists) {
      //   emitter.emit(DB_USERDATA_RETURNED, _userExists.data);
      // }
    } catch (err) {
      try {
        console.log("new user detected");
        let _newUser = await axios.put(
          `https://chainguru-db.herokuapp.com/users/${payload.address}`
          // `http://localhost:3001/users/${payload.address}`
        );
        console.log("new user created");
        if (await _newUser) {
          dispatcher.dispatch({
            type: DB_GET_USERDATA,
            address: payload.address,
          });
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  debouncedGetUserData = debounce(
    async (payload) => {
      return this.db_getUserData(payload);
    },
    150,
    { leading: true, trailing: false }
  );

  db_getUserData = async (payload) => {
    try {
      let _user = await axios.post(
        `https://chainguru-db.herokuapp.com/users/data`,
        {
          user: payload.address,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      let wallets = [];
      _user.data.wallets.forEach((item, i) => {
        wallets.push(item.wallet);
      });

      store.setStore({
        userFavorites: _user.data.favorites.tokenIDs,
        userWallets: wallets,
      });
      if (await _user) {
        emitter.emit(DB_USERDATA_RETURNED, _user.data);
      }
    } catch (err) {
      console.log(err.message);
      try {
        console.log("new user detected");
        let _newUser = await axios.put(
          `https://chainguru-db.herokuapp.com/users/${payload.address}`
          // `http://localhost:3001/users/${payload.address}`
        );
        // console.log("new user created");
        if (await _newUser) {
          dispatcher.dispatch({
            type: DB_GET_USERDATA,
            address: payload.address,
          });
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  db_getCoinCategories = async (payload) => {
    // "https://chainguru-db.herokuapp.com"
    let _dbCategories;
    try {
      _dbCategories = await axios.put(
        `https://chainguru-db.herokuapp.com/tokens/getTokensbyIDs`,
        // `http://localhost:3001/tokens/getTokensbyIDs`,
        { tokenIDs: payload.tokenIDs }
      );
    } catch (err) {
      console.log(err.message);
    }

    emitter.emit(DB_GET_COIN_CATEGORIES_RETURNED, await _dbCategories);
  };

  db_addFavorite = async (payload) => {
    const account = store.getStore("account");

    let _dbAddFav = await axios.put(
      `https://chainguru-db.herokuapp.com/favorites/${account.address}`,
      { tokenID: payload.content },
      {
        headers: {
          Authorization: `Bearer ${store.getStore("authToken")}`,
        },
      }
    );
    store.setStore({ userFavorites: _dbAddFav.data.tokenIDs });

    emitter.emit(DB_ADD_FAVORITE_RETURNED, await _dbAddFav.data);
  };

  db_delFavorite = async (payload) => {
    const account = store.getStore("account");

    let _dbDelFav = await axios.delete(
      `https://chainguru-db.herokuapp.com/favorites/${account.address}`,
      {
        headers: {
          Authorization: `Bearer ${store.getStore("authToken")}`,
        },
        data: { tokenID: payload.content },
      }
    );
    store.setStore({ userFavorites: _dbDelFav.data.tokenIDs });
    emitter.emit(DB_DEL_FAVORITE_RETURNED, await _dbDelFav.data);
  };

  db_addBlacklist = async (payload) => {
    const account = store.getStore("account");

    let _dbAddBl = await axios.put(
      `https://chainguru-db.herokuapp.com/blacklist/${account.address}`,
      { tokenID: payload.content },
      {
        headers: {
          Authorization: `Bearer ${store.getStore("authToken")}`,
        },
      }
    );
    emitter.emit(DB_ADDDEL_BLACKLIST_RETURNED, await _dbAddBl.data);
  };

  db_delBlacklist = async (payload) => {
    const account = store.getStore("account");

    let _dbDelBl = await axios.delete(
      `https://chainguru-db.herokuapp.com/blacklist/${account.address}`,
      {
        headers: {
          Authorization: `Bearer ${store.getStore("authToken")}`,
        },
        data: { tokenID: payload.content },
      }
    );
    emitter.emit(DB_ADDDEL_BLACKLIST_RETURNED, await _dbDelBl.data);
  };

  db_addWallet = async (payload) => {
    const account = store.getStore("account");
    let _dbAddWallet = await axios.put(
      `https://chainguru-db.herokuapp.com/wallets/${account.address}`,
      { address: payload.wallet },
      {
        headers: {
          Authorization: `Bearer ${store.getStore("authToken")}`,
        },
      }
    );
    emitter.emit(DB_ADD_WALLET_RETURNED, await _dbAddWallet.data);
  };

  db_delWallet = async (payload) => {
    const account = store.getStore("account");

    let _dbDelWallet = await axios.delete(
      `https://chainguru-db.herokuapp.com/wallets/${account.address}`,
      {
        headers: {
          Authorization: `Bearer ${store.getStore("authToken")}`,
        },
        data: { address: payload.wallet },
      }
    );
    emitter.emit(DB_DEL_WALLET_RETURNED, await _dbDelWallet.data);
  };

  db_updateWallet = async (payload) => {
    let _dbUpdateWalletBal;
    try {
      await axios
        .put(`https://chainguru-db.herokuapp.com/wallets/updateOne`, {
          wallet: payload.wallet,
        })
        .then(
          (_dbUpdateWalletBal = await axios.put(
            `https://chainguru-db.herokuapp.com/wallets/balance`,
            {
              wallet: payload.wallet,
            }
          ))
        );
      emitter.emit(DB_UPDATE_WALLET_RETURNED, await _dbUpdateWalletBal.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_updateOneMov = async (payload) => {
    const account = store.getStore("account");
    try {
      let _dbUpdateWallet = await axios.put(
        `https://chainguru-db.herokuapp.com/movements/updateOne`,
        // `http://localhost:3001/movements/updateOne`,
        {
          userID: account.address,
          oldMovementId: payload.content._id,
          updatedMovement: {
            _id: payload.content._id,
            id: payload.content.id,
            image: payload.content.image,
            operation: payload.content.operation,
            timeStamp: payload.content.timeStamp,
            value: payload.content.value,
            wallet: payload.content.wallet,
            current_price: payload.content.current_price,
            buyPrice: payload.content.buyPrice,
            gasUsed: payload.content.gasUsed,
            gasPrice: payload.content.gasPrice,
            tokenSymbol: payload.content.tokenSymbol,
            tokenName: payload.content.tokenName,
            tokenDecimal: payload.content.tokenDecimal,
          },
        }
      );
      emitter.emit(DB_UPDATE_ONE_MOV_RETURNED, [
        await _dbUpdateWallet.data.movements,
        payload.content._id,
      ]);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_updateWalletMovements = async (payload) => {
    const account = store.getStore("account");
    let _dbUpdateWalletTX;

    try {
      await axios
        .put(`https://chainguru-db.herokuapp.com/wallets/updateOne`, {
          wallet: payload.wallet,
        })
        .then(
          (_dbUpdateWalletTX = await axios.put(
            `https://chainguru-db.herokuapp.com/movements/auto`,
            {
              user: account.address,
              wallet: payload.wallet,
            }
          ))
        );
      const returnData = [
        await _dbUpdateWalletTX.data.movements,
        payload.wallet,
      ];
      emitter.emit(DB_UPDATE_WALLET_MOVEMENTS_RETURNED, await returnData);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  dbUpdateMovementPrices = async (payload) => {
    const account = store.getStore("account");
    console.log(account.address);
    console.log(payload.selectedWallet);
    console.log(payload.newMovements);
    try {
      let _dbUpdateWallet = await axios.put(
        `https://chainguru-db.herokuapp.com/movements/updateWallet`,
        {
          userID: account.address,
          wallet: payload.selectedWallet,
          newMovements: payload.newMovements,
        }
      );
      emitter.emit(
        DB_UPDATE_WALLET_MOVEMENTS_PRICES_RETURNED,
        await _dbUpdateWallet
      );
      console.log(await _dbUpdateWallet);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_getBluechips = async () => {
    // TODO UPDATE TO ONLINE DB https://chainguru-db.herokuapp.com/
    const vs = store.getStore("vsCoin");

    let data = await axios.get(
      `https://chainguru-db.herokuapp.com/bluechips/guru`
    );

    const tokenIDs = data.data[0].tokenIDs;
    try {
      let data = await CoinGeckoClient.coins.markets({
        ids: tokenIDs,
        vs_currency: vs,
        price_change_percentage: "1y",
      });
      emitter.emit(DB_GET_BLUECHIPS_RETURNED, await data.data);
    } catch (err) {
      console.log(err);
    }
  };

  db_getBluechipsUser = async () => {
    const from = store.getStore("account").address;
    const vs = store.getStore("vsCoin");

    // TODO UPDATE TO ONLINE DB https://chainguru-db.herokuapp.com/
    let data = await axios.post(
      `https://chainguru-db.herokuapp.com/bluechips/user/`,
      {
        user: from,
      },
      {
        headers: {
          Authorization: `Bearer ${store.getStore("authToken")}`,
        },
      }
    );

    const tokenIDs = data.data.tokenIDs;
    try {
      if (tokenIDs.length > 0) {
        let data = await CoinGeckoClient.coins.markets({
          ids: tokenIDs,
          vs_currency: vs,
          price_change_percentage: "1y",
        });
        emitter.emit(DB_GET_BLUECHIPS_USER_RETURNED, await data.data);
      } else {
        emitter.emit(DB_GET_BLUECHIPS_USER_RETURNED, []);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  db_bluechipsCheck = async () => {
    if (store.getStore("account").address) {
      const user = store.getStore("account").address;
      const from = getHash(user);
      try {
        let data = await axios.post(
          "https://chainguru-db.herokuapp.com/blueChips/guru/check",
          {
            user: user,
            from: from,
          },
          {
            headers: {
              Authorization: `Bearer ${store.getStore("authToken")}`,
            },
          }
        );
        emitter.emit(DB_BLUECHIPS_CHECK_RETURNED, await data.data);
      } catch (err) {
        if (err) {
          console.log(err.message);
        }
      }
    }
  };

  db_AddBluechips = async (payload) => {
    const from = store.getStore("account").address;
    try {
      let data = await axios.post(
        "https://chainguru-db.herokuapp.com/bluechips/user/add",
        {
          user: from,
          tokenID: payload.tokenID,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_ADD_BLUECHIPS_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_DelBluechip = async (payload) => {
    const from = store.getStore("account").address;
    try {
      let data = await axios.delete(
        "https://chainguru-db.herokuapp.com/bluechips/user/del",
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
          data: {
            user: from,
            tokenID: payload.tokenID,
          },
        }
      );
      emitter.emit(DB_DEL_BLUECHIPS_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_AddBluechipsGuru = async (payload) => {
    const user = store.getStore("account").address;
    const from = getHash(user);

    try {
      let data = await axios.post(
        "https://chainguru-db.herokuapp.com/blueChips/guru",
        {
          user: user,
          from: from,
          tokenID: payload.tokenID,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_ADD_BLUECHIPS_GURU_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_DelBluechipsGuru = async (payload) => {
    const user = store.getStore("account").address;
    const from = getHash(user);
    try {
      let data = await axios.delete(
        "https://chainguru-db.herokuapp.com/blueChips/guru",
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
          data: {
            user: user,
            from: from,
            tokenID: payload.tokenID,
          },
        }
      );
      emitter.emit(DB_DEL_BLUECHIPS_GURU_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_getTokenLS = async (payload) => {
    try {
      let data = await axios.get(
        `https://chainguru-db.herokuapp.com/longShort/token?tokenID=${payload.tokenID}`
      );
      emitter.emit(DB_GET_TOKEN_LS_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_getUserTokenLS = async (payload) => {
    const account = await store.getStore("account");
    try {
      let data = await axios.get(
        `https://chainguru-db.herokuapp.com/longShort/token?tokenID=${payload.tokenID}&userID=${account.address}`
      );
      emitter.emit(DB_GET_USER_TOKEN_LS_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_createLS = async (payload) => {
    const account = store.getStore("account");
    try {
      let data = await axios.put(
        "https://chainguru-db.herokuapp.com/longShort/new",
        {
          tokenID: payload.tokenID,
          user: account.address,
          vote: payload.vote,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_CREATE_LS_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_checkLSResult = async (payload) => {
    const account = store.getStore("account");
    try {
      let data = await axios.put(
        "https://chainguru-db.herokuapp.com/longShort/checkResult",
        {
          user: account.address,
          tokenID: payload.tokenID,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_CHECK_LS_RESULT_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_newNickname = async (payload) => {
    const account = store.getStore("account");
    try {
      let data = await axios.put(
        `https://chainguru-db.herokuapp.com/users/${account.address}/setNickname`,
        {
          newNickname: payload.nickname,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_NEW_NICKNAME_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_newAvatar = async (payload) => {
    const account = store.getStore("account");
    try {
      let data = await axios.put(
        `https://chainguru-db.herokuapp.com/users/${account.address}/setAvatar`,
        {
          newAvatar: payload.avatar,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_NEW_AVATAR_RETURNED, await data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  db_getUserLS = async (payload) => {
    const account = store.getStore("account");
    try {
      if (payload.onlyActive) {
        // let data = await axios.get(
        //   `https://chainguru-db.herokuapp.com/longShort/user?userID=${account.address}&onlyActive=true`
        // );
        let data = await axios.get(
          `https://chainguru-db.herokuapp.com/longShort/user?userID=${account.address}&onlyActive=true`
        );

        emitter.emit(DB_GET_USER_LS_RETURNED, await data.data);
      } else {
        let data = await axios.get(
          `https://chainguru-db.herokuapp.com/longShort/user?userID=${account.address}`
        );
        emitter.emit(DB_GET_USER_LS_RETURNED, await data.data);
      }
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  db_getLeaderboard = async () => {
    try {
      let data = await axios.get(
        `https://chainguru-db.herokuapp.com/users/leaderboard`
      );
      emitter.emit(DB_GET_LEADERBOARD_RETURNED, await data.data);
    } catch (err) {
      if (err) {
        console.log(err.message);
      }
    }
  };

  limitedGetChips = limiterGecko.wrap(this.db_getBluechips);

  limitedGetChipsUser = limiterGecko.wrap(this.db_getBluechipsUser);

  coingeckoGetAllTimeChart = async (payload) => {
    let chartData = [];
    const vsCoin = store.getStore("vsCoin");
    try {
      chartData = await CoinGeckoClient.coins.fetchMarketChart(
        payload.payload,
        {
          days: "max",
          vs_currency: vsCoin,
        }
      );
      emitter.emit(COINGECKO_ALLTIME_CHART_RETURNED, [
        await chartData.data,
        payload.payload,
      ]);
    } catch (err) {
      console.log(err.message);
    }
  };

  uniswapTrade = async (payload) => {
    try {
      let data = await CoinGeckoClient.coins.fetch(payload.id, {});
      if (data.data.contract_address) {
        window.open(
          `https://app.uniswap.org/#/swap?outputCurrency=${data.data.contract_address}`,
          "_blank"
        );
      } else {
        return emitter.emit(ERROR, "Token not listed on Uniswap");
      }
    } catch (err) {
      console.log(err);
    }
  };

  geckoGetCoins = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    try {
      let data = await CoinGeckoClient.coins.markets({
        vs_currency: vsCoin,
        page: payload.page,
        per_page: payload.perPage,
        sparkline: payload.sparkline,
        price_change_percentage: payload.priceChangePercentage,
        order: payload.order,
      });
      emitter.emit(GECKO_GET_COINS_RETURNED, await data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  getTransactionReceipt = async (payload) => {
    if (store.getStore("web3context")) {
      const web3 = new Web3(store.getStore("web3context").library.provider);
      var answer = web3.eth.getTransactionReceipt(
        payload.txHash,
        (error, result) => {
          if (!error) {
            emitter.emit(GET_TRANSACTION_RECEIPT_RETURNED, result);
          } else {
            emitter.emit(ERROR, error.message);
          }
        }
      );
    }
  };

  debouncedGetAssetStats = debounce(
    async (payload) => {
      return this.db_getAssetStats(payload);
    },
    150,
    { leading: true, trailing: false }
  );

  db_getAssetStats = async (data) => {
    let vsCoin = store.getStore("vsCoin");
    let wallets = data.payload.wallet;
    let assetData;
    try {
      //IF multiple wallets check which ones have the asset
      if (data.payload.wallet.length > 1) {
        wallets = [];
        assetData = await axios.post(
          `https://chainguru-db.herokuapp.com/zerion/address/assets`,
          {
            addresses: data.payload.wallet,
            currency: vsCoin,
            asset_codes: [data.payload.assetCode],
          }
        );
        for (var i = 0; i < (await assetData.data.length); i++) {
          wallets.push(assetData.data[i].wallet_address);
        }
      }
      let portfolioAssetStats = await axios.post(
        `https://chainguru-db.herokuapp.com/zerion/assets/stats`,
        {
          address: wallets,
          currency: vsCoin,
          asset_code: [data.payload.assetCode],
        }
      );
      emitter.emit(
        DB_GET_ASSETSTATS_RETURNED,
        await portfolioAssetStats.data,
        await assetData.data
      );
    } catch (err) {
      console.log(err.message);
    }
  };

  //ROUTES FOR ZERION WALLET PORTFOLIO stats
  db_getPortfolio = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    const account = store.getStore("account");
    function createData(
      wallet_address,
      asset_code,
      name,
      symbol,
      decimals,
      type,
      icon_url,
      price,
      is_displayable,
      is_verified,
      quantity,
      stats,
      profit_percent
    ) {
      return {
        wallet_address,
        asset_code,
        name,
        symbol,
        decimals,
        type,
        icon_url,
        price,
        is_displayable,
        is_verified,
        quantity,
        stats,
        profit_percent,
      };
    }

    try {
      const portfolioAssets = await axios.post(
        `https://chainguru-db.herokuapp.com/zerion/address/assets`,
        {
          addresses: payload.wallet,
          currency: vsCoin,
        }
      );
      portfolioAssets.data.forEach((item, i) => {
        if (item.price) {
          let quantityDecimals = item.quantity / Math.pow(10, item.decimals);
          let balance = quantityDecimals * item.price.value;
          item.balance = balance;
          item.quantityDecimals = quantityDecimals;
        } else {
          let quantityDecimals = item.quantity / Math.pow(10, item.decimals);
          item.balance = 0;
          item.quantityDecimals = quantityDecimals;
        }
        if (item.quantityDecimals === 1) {
          item.type = "NFT";
        }
      });
      emitter.emit(DB_GET_PORTFOLIO_RETURNED, portfolioAssets.data);
    } catch (err) {
      emitter.emit(ERROR, await err.message);
      console.log(err.message);
    }
  };

  db_getAddressTx = async (data) => {
    let vsCoin = store.getStore("vsCoin");
    let wallets = [];
    data.wallet.forEach((item, i) => {
      wallets.push(item.toLowerCase());
    });
    let payload = {};
    payload.addresses = wallets;
    payload.currency = vsCoin;
    if (data.query) {
      payload.query = data.query;
    }
    if (data.limit) {
      payload.limit = data.limit;
    }
    if (data.offset) {
      payload.offset = data.offset;
    }
    try {
      const addressTx = await axios.post(
        `https://chainguru-db.herokuapp.com/zerion/address/tx`,
        payload
      );
      emitter.emit(DB_GET_ADDRESS_TX_RETURNED, addressTx.data);
    } catch (err) {
      emitter.emit(ERROR, await err.message);
      console.log(err.message);
    }
  };

  db_getPortfolioStats = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    try {
      const portfolioStats = await axios.post(
        `https://chainguru-db.herokuapp.com/zerion/address/portfolio`,
        {
          addresses: payload.wallet,
          currency: vsCoin,
        }
      );

      emitter.emit(
        DB_GET_PORTFOLIO_STATS_RETURNED,
        portfolioStats.data.portfolio
      );
    } catch (err) {
      emitter.emit(ERROR, await err.message);
      console.log(err.message);
    }
  };

  db_getPortfolioAssetStats = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    const account = store.getStore("account");
    if (assetStatsRequest) {
      assetStatsRequest.cancel("req. cancelled");
    }
    const CancelToken = axios.CancelToken;
    assetStatsRequest = CancelToken.source();

    function createData(wallet_address, asset_code, stats, profit_percent) {
      return {
        wallet_address,
        asset_code,
        stats,
        profit_percent,
      };
    }
    try {
      let finalData = [];
      for (var i = 0; i < payload.wallet.length; i++) {
        const assets = payload.portfolioData.filter(
          (data) =>
            JSON.stringify(data.wallet_address).toLowerCase() ===
            JSON.stringify(payload.wallet[i]).toLowerCase()
        );
        let keys = [];
        let prices = [];
        keys.length = 0;
        prices.length = 0;
        assets.forEach((asset, i) =>
          prices.push(asset.price ? asset.price.value : null)
        );
        assets.forEach((asset, i) => keys.push(asset.asset_code));
        const portfolioAssetStats = await axios
          .post(
            `https://chainguru-db.herokuapp.com/zerion/assets/stats`,
            {
              address: payload.wallet[i],
              currency: vsCoin,
              asset_code: keys,
            },
            {
              cancelToken: assetStatsRequest.token,
            }
          )
          .catch(function (thrown) {
            if (axios.isCancel(thrown)) {
              console.log("Request canceled");
            }
          });
        if (portfolioAssetStats) {
          keys.forEach((key, index) => {
            let profit_percent;
            if (
              portfolioAssetStats.data[index].stats &&
              portfolioAssetStats.data[index].stats.avg_buy_price &&
              prices[index]
            ) {
              profit_percent =
                ((prices[index] -
                  portfolioAssetStats.data[index].stats.avg_buy_price) /
                  portfolioAssetStats.data[index].stats.avg_buy_price) *
                100;
            } else {
              profit_percent = null;
            }

            finalData.push(
              createData(
                payload.wallet[i],
                keys[index],
                portfolioAssetStats.data[index].stats,
                profit_percent
              )
            );
          });
        }
      }
      emitter.emit(DB_GET_PORTFOLIO_ASSET_STATS_RETURNED, finalData);
    } catch (err) {
      console.log(err.message);
      emitter.emit(ERROR, await err.message);
    }
  };

  db_getPortfolioChart = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    //TODO WAIT FOR MULTIPLE ADDRESS ENDPOINT
    try {
      if (Array.isArray(payload.wallet)) {
        let charts = await axios.post(
          `https://chainguru-db.herokuapp.com/zerion/address/chart`,
          {
            addresses: payload.wallet,
            currency: vsCoin,
            timeframe: payload.timeframe,
          }
        );
        emitter.emit(
          DB_GET_PORTFOLIO_CHART_RETURNED,
          await charts.data.charts.others
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  db_getAddressTransactions = async (payload) => {
    let vsCoin = store.getStore("vsCoin");
    try {
      if (Array.isArray(payload.wallet)) {
        let charts = await axios.post(
          `https://chainguru-db.herokuapp.com/zerion/address/tx`,
          {
            addresses: payload.wallet,
            currency: vsCoin,
          }
        );
        emitter.emit(
          DB_GET_PORTFOLIO_CHART_RETURNED,
          await charts.data.charts.others
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  db_updatePortfolio = async (payload) => {
    //TODO NOT FINAL API ENDPOINT ROUTE
    //         `https://daetrik.site/api/portfolio/wallet?address=${payload.wallet}&update=true`

    console.log(payload);
    try {
      let data = await axios.get(
        `https://chainguru.fun/api/portfolio/wallet?address=${payload.wallet}&update=true`
      );
      console.log(await data.data);
      emitter.emit(DB_UPDATE_PORTFOLIO_RETURNED, await data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  db_setUserWalletNickname = async (payload) => {
    const account = store.getStore("account");

    try {
      let data = await axios.put(
        `https://chainguru-db.herokuapp.com/users/${account.address}/walletnick`,
        {
          wallet: payload.wallet,
          nick: payload.nick,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_SET_USER_WALLET_NICKNAME_RETURNED, await data.data);
    } catch (err) {
      console.log(err.message);
      emitter.emit(ERROR, err.message);
    }
  };

  db_delUserWalletNickname = async (payload) => {
    const account = store.getStore("account");
    try {
      let data = await axios.put(
        `https://chainguru-db.herokuapp.com/users/${account.address}/walletnickRemove`,
        {
          wallet: payload.wallet,
        },
        {
          headers: {
            Authorization: `Bearer ${store.getStore("authToken")}`,
          },
        }
      );
      emitter.emit(DB_REMOVE_USER_WALLET_NICKNAME_RETURNED, await data.data);
    } catch (err) {
      console.log(err.message);
      emitter.emit(ERROR, err.message);
    }
  };

  db_getCryptoNews = async (payload) => {
    try {
      let searchParams = {};
      if (payload.params.currencies) {
        searchParams.currencies = payload.params.currencies;
      }
      if (payload.params.filter) {
        searchParams.filter = payload.params.filter;
      }
      if (payload.params.regions) {
        searchParams.regions = payload.params.regions;
      }
      if (payload.params.page) {
        searchParams.page = payload.params.page;
      }
      let news = await axios.post(
        `https://chainguru-db.herokuapp.com/cryptopanic/getNews`,
        {
          params: searchParams,
        }
      );
      emitter.emit(DB_GET_CRYPTONEWS_RETURNED, await news.data);
    } catch (err) {
      console.log(err.message);
      emitter.emit(ERROR, err.message);
    }
  };
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter,
};
