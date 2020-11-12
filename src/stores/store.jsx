import config from "../config";
import Web3 from "web3";

import {
  ERROR,
  CONNECT_LEDGER,
  CONNECT_METAMASK,
  CONNECT_METAMASK_PASSIVE,
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
  ARTIST_EDITIONS_DETAILS_RETURNED,
  PING_COINGECKO,
  GET_COIN_LIST,
  GET_COIN_DATA,
  COIN_DATA_RETURNED,
  COINLIST_RETURNED,
  GET_WALLET_TOKENS_BALANCE,
  SET_ALLOWED_ARTIST,
  ALLOWED_ARTIST_RETURNED,
  SET_OPEN_TO_ALL_ARTISTS,
  IS_ALLOWED_ARTIST,
  IS_ALLOWED_RETURNED,
  GIFT_EDITION,
  GIFT_EDITION_ARTIST,
  GET_MAX_EDITIONSIZE,
  MAX_EDIT_SIZE_RETURNED,
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

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

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
      coinList: [],
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
          case GET_CONTRACT_EVENTS:
            this.getContractEvents(payload);
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
          case GET_WALLET_TOKENS_BALANCE:
            this.getWalletTokenBalance(payload);
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

  giftEdition = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    const account = store.getStore("account");

    let lfOriginalsContract = new web3.eth.Contract(
      config.LFOriginalsABI,
      config.lfOriginalsContract
    );

    let _isAccount = false;
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
      _isAccount = false;
      return emitter.emit(ERROR, "NOT A VALID ACCOUNT");
    }
  };

  createNewEdition = async (payload) => {
    const web3 = new Web3(store.getStore("web3context").library.provider);
    const account = store.getStore("account");

    const {
      artistAccount,
      artistCommission,
      price,
      tokenURI,
      maxSupply,
    } = payload.content;

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
    /*
     */
    let roles = [isAdmin, isMinter, isLF];
    return emitter.emit(ACCOUNT_ROLES_RETURNED, roles);
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
        const address = web3.utils.toChecksumAddress(_account.content);
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
        const address = web3.utils.toChecksumAddress(payload.account);
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
      let _isAllowed = false;
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
        const address = web3.utils.toChecksumAddress(payload.account);
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
        const address = web3.utils.toChecksumAddress(payload.account);
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
    }

    for (var i = 0; i < (await _userBalance); i++) {
      let _tokenDetails = await lfOriginalsContract.methods
        .tokenData(await _userTokens[i])
        .call();
      _userTokenDetails[i] = _tokenDetails;
    }

    for (var i = 0; i < (await _userBalance); i++) {
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

  _getGasPrice = async () => {
    try {
      const url = "https://gasprice.poa.network/";
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString);
      if (priceJSON) {
        return priceJSON.standard.toFixed(0);
      }
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
    let data = await CoinGeckoClient.ping();
    console.log(data.data);
  };

  getCoinList = async () => {
    if (this.store.coinList.length > 0) {
      emitter.emit(COINLIST_RETURNED, this.store.coinList);
    } else {
      let data = await CoinGeckoClient.coins.list();

      this.store.coinList = data.data;
      emitter.emit(COINLIST_RETURNED, this.store.coinList);
    }
    //let data = await CoinGeckoClient.coins.list();
  };

  getCoinData = async (coin) => {
    let data;
    try {
      let data = await CoinGeckoClient.coins.fetch(coin.content, {});
      emitter.emit(COIN_DATA_RETURNED, [await data.data, coin.BarID]);
    } catch (err) {
      console.log(err);
    }
  };

  getWalletTokenBalance = async () => {
    console.log("Getting balances");
    const web3 = new Web3(store.getStore("web3context").library.provider);

    var subscription = web3.eth
      .subscribe(
        "logs",
        {
          fromBlock: 1,
          address: "0xda0aed568d9a2dbdcbafc1576fedc633d28eee9a",
        },
        function () {}
      )
      .on("data", function (trxData) {
        function formatAddress(data) {
          var step1 = web3.utils.hexToBytes(data);
          for (var i = 0; i < step1.length; i++)
            if (step1[0] == 0) step1.splice(0, 1);
          return web3.utils.bytesToHex(step1);
        }

        console.log("Register new transfer: " + trxData.transactionHash);
        console.log(
          "Contract " +
            trxData.address +
            " has transaction of " +
            web3.utils.hexToNumberString(trxData.data) +
            " from " +
            formatAddress(trxData.topics["1"]) +
            " to " +
            formatAddress(trxData.topics["2"])
        );
        //console.log(trxData);
        web3.eth.getTransactionReceipt(trxData.transactionHash, function (
          error,
          reciept
        ) {
          console.log("Sent by " + reciept.from + " to contract " + reciept.to);
        });
      });
  };
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter,
};
