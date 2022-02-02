import config from "../config";
import {
  ERROR_ZERION,
  ZERION_GET_ADDRESS_CHART,
  ZERION_ADDRESS_CHART_RETURNED,
  ZERION_ADDRESS_PORTFOLIO_RETURNED,
  ZERION_GET_ADDRESS_PORTFOLIO,
  ZERION_GET_ASSETSTATS,
  ZERION_ASSETSTATS_RETURNED,
} from "../constants/zerion.js";

import Store from "./store.jsx";

const storeRoot = Store.store;

const axios = require("axios").default;
const Dispatcher = require("flux").Dispatcher;
const Emitter = require("events").EventEmitter;
const dispatcher = new Dispatcher();
const emitter = new Emitter();

let io = require("socket.io-client");
const BASE_URL = "wss://api-v4.zerion.io/";

//DEFINE ZERION SOCKETS
const addressSocket = {
  namespace: "address",
  socket: io(`${BASE_URL}address`, {
    transports: ["websocket"],
    timeout: 30000,
    query: {
      api_token: process.env.REACT_APP_ZERION_API,
    },
  }),
};

const assetsSocket = {
  namespace: "assets",
  socket: io(`${BASE_URL}assets`, {
    transports: ["websocket"],
    timeout: 30000,
    query: {
      api_token: process.env.REACT_APP_ZERION_API,
    },
  }),
};

function verify(request, response) {
  // each value in request payload must be found in response meta
  return Object.keys(request.payload).every((key) => {
    const requestValue = request.payload[key];
    const responseMetaValue = response.meta[key];

    if (typeof requestValue === "object") {
      return (
        JSON.stringify(requestValue).toLowerCase() ===
        JSON.stringify(responseMetaValue).toLowerCase()
      );
    }
    return responseMetaValue === requestValue;
  });
}

class Zerion_Store {
  constructor() {
    // network setting
    // 1 for ethMainnet, 56 for BSC, 137 for polygon
    this.store = {
      chartData: null,
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case ZERION_GET_ADDRESS_CHART:
            this.getAddressChart(payload);
            break;
          case ZERION_GET_ADDRESS_PORTFOLIO:
            this.getAddressPortfolio(payload);
            break;
          case ZERION_GET_ASSETSTATS:
            this.getAssetStats(payload);
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

  get(socketNamespace, requestBody) {
    return new Promise((resolve) => {
      const { socket, namespace } = socketNamespace;
      function handleReceive(data) {
        if (verify(requestBody, data)) {
          unsubscribe();
          resolve(data.payload);
        } else {
          console.log("failed verify");
          console.log("error in expectected response");
          console.log("-----------------------------");
          console.log(requestBody);
          console.log(data);
        }
      }

      const model = requestBody.scope[0];
      function unsubscribe() {
        socket.off(`received ${namespace} ${model}`, handleReceive);
        socket.emit("unsubscribe", requestBody);
      }
      socket.emit("get", requestBody);
      socket.on(`received ${namespace} ${model}`, handleReceive);
    });
  }

  getAddressChart = async (payload) => {
    const { wallet, timeframe } = payload;
    let vsCoin = storeRoot.getStore("vsCoin");
    try {
      if (!wallet) {
        const noAddress = "no valid address";
        throw noAddress;
      }
      if (!timeframe) {
        const notimeframe = "no valid timeframe";
        throw notimeframe;
      }

      let addressLowerCase = [];
      wallet.forEach((item, i) => {
        addressLowerCase.push(item.toLowerCase());
      });

      const data = await this.get(addressSocket, {
        scope: ["charts"],
        payload: {
          addresses: wallet,
          currency: vsCoin,
          charts_type: timeframe,
        },
      });
      const chartInMs = await data;
      chartInMs.charts.others.forEach((item, i) => {
        item[0] = item[0] * 1000;
      });

      store.setStore({ chartData: await chartInMs.charts.others });
      emitter.emit(
        ZERION_ADDRESS_CHART_RETURNED,
        await chartInMs.charts.others
      );
    } catch (err) {
      console.log(err);
      emitter.emit(ERROR_ZERION, err.message);
    }
  };

  getAddressPortfolio = async (payload) => {
    const { address, addresses } = payload;
    let _address = address ? address[0].toLowerCase() : null;
    const currency = storeRoot.getStore("vsCoin");

    try {
      if (!addresses && !address) {
        console.log("no valid address");
        const noAddress = "no valid address";
        throw noAddress;
      }

      let addressesLowerCase = [];
      if (addresses) {
        addresses.forEach((item, i) => {
          addressesLowerCase.push(item.toLowerCase());
        });
      }

      const data = await this.get(addressSocket, {
        scope: ["portfolio"],
        payload: {
          address: _address,
          addresses: addressesLowerCase,
          currency: currency,
        },
      });
      store.setStore({ userPortfolio: await data.portfolio });
      emitter.emit(ZERION_ADDRESS_PORTFOLIO_RETURNED, await data.portfolio);
    } catch (err) {
      console.log(err.message);
      emitter.emit(ERROR_ZERION, err.message);
    }
  };

  getAssetStats = async (payload) => {
    let vsCoin = storeRoot.getStore("vsCoin");
    const { wallet, asset } = payload;

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
      let keys = [];
      let prices = [];
      keys.length = 0;
      prices.length = 0;
      prices.push(asset.price ? asset.price.value : null);
      keys.push(asset.asset_code);

      let addressesLowerCase = [];
      if (Array.isArray(wallet)) {
        wallet.forEach((item, i) => {
          addressesLowerCase.push(item.toLowerCasev());
        });
      }

      let allStats = [];

      if (Array.isArray(keys)) {
        for (var i = 0; i < keys.length; i++) {
          let data;
          if (Array.isArray(wallet)) {
            data = await this.get(assetsSocket, {
              scope: ["stats"],
              payload: {
                addresses: addressesLowerCase,
                currency: vsCoin,
                asset_code: asset.asset_code.toLowerCase(),
              },
            });
          } else {
            data = await this.get(assetsSocket, {
              scope: ["stats"],
              payload: {
                address: wallet.toLowerCase(),
                currency: vsCoin,
                asset_code: asset.asset_code.toLowerCase(),
              },
            });
          }
          data.asset_code = asset.asset_code;
          data.wallet = wallet;
          allStats.push(data);
        }
      }

      if (allStats.length > 0) {
        let profit_percent;
        if (allStats[0].stats && allStats[0].stats.avg_buy_price && prices[0]) {
          profit_percent =
            ((prices[0] - allStats[0].stats.avg_buy_price) /
              allStats[0].stats.avg_buy_price) *
            100;
        } else {
          profit_percent = null;
        }

        finalData.push(
          createData(payload.wallet, keys[0], allStats[0].stats, profit_percent)
        );
      }
      emitter.emit(ZERION_ASSETSTATS_RETURNED, finalData);
    } catch (err) {
      console.log(err.message);
      emitter.emit(ERROR_ZERION, await err.message);
    }
  };
}

var store = new Zerion_Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter,
};
