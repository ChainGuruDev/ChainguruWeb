import React, { Component, Suspense } from "react";
import { withStyles } from "@material-ui/core/styles";

import { colors } from "../../theme";
import { formatMoney, getVsSymbol } from "../helpers";

import {
  Grid,
  CardActionArea,
  Typography,
  Divider,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Select,
  Tooltip,
} from "@material-ui/core";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";

import StakingDetailsModal from "./stakingDetailsModal.js";
import UniswapDetailsModal from "./uniswapDetailsModal.js";

import {
  DB_GET_ASSET_FULLDATA,
  DB_GET_ASSET_FULLDATA_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    display: "flexGrow",
  },
  nonAssetsGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    padding: "10px",
    background: `#9991`,
    minHeight: "100%",
  },
  assetGridRoot: {
    display: "flex",
    marginBottom: 10,
  },
  assetLogoGrid: {
    right: "4vh",
    top: "-3vh",
    position: "relative",
    width: "30px",
    opacity: "25%",
    transition: "0.3s all",
    height: "inherit",
  },
  assetTokenLogo: {
    width: 125,
    height: 125,
  },
  showPyLBTN: {
    height: 100,
    minWidth: 50,
    width: 50,
    backgroundColor: "#0004",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    cursor: "pointer",
    "&:hover": {
      width: 60,
      backgroundColor: "#0003",
      scale: "1.2",
    },
  },
  assetCard: {
    height: 75,
    background: "#5553",
    width: "100%",
    alignItems: "center",
    overflow: "clip",
    display: "flex",
    transition: "all 0.25s",
    boxShadow: "1px 3px 5px -2px rgba(0, 0, 0, 0.5)",
    "&:hover": {
      boxShadow: "2px 5px 5px 3px rgba(0, 0, 0, 0.3)",
      "& $assetLogoGrid": {
        right: "2vh",
        transition: "all 0.3s ease-in-out",
      },
    },
    zIndex: 5,
  },
  expandIcon: {
    webkitTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    mozTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    oTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transform: "rotate(180deg)",
  },
  unexpandIcon: {
    webkitTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    mozTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    oTransition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transition: "all 0.5s cubic-bezier(.22,.61,.36,1)",
    transform: "rotate(0deg)",
  },
  expand: {
    opacity: 1,
    transition: "all .5s cubic-bezier(.65,.05,.36,1)",
  },
  contract: {
    opacity: 0,
    maxHeight: "0px",
    transition: "all .5s cubic-bezier(.65,.05,.36,1)",
  },
  chainIcon: { maxWidth: 25, maxHeight: 25, scale: 0.8 },
});

class PortfolioAssets extends Component {
  constructor(props) {
    super(props);

    const walletNicknames = store.getStore("userData").walletNicknames;

    this.state = {
      assets: props.assetData,
      type: props.type,
      vsCoin: props.vsCoin,
      selectedWallet: props.selectedWallet,
      walletColors: props.walletColors,
      assetsPerPage: 10,
      assetsPage: 1,
      assetsExpanded: true,
      walletNicknames: walletNicknames,
      uniswapDetailsModal: false,
      uniswapDetails: null,
      uniswapDetailsLoading: false,
    };
  }

  componentDidMount() {
    emitter.on(DB_GET_ASSET_FULLDATA_RETURNED, this.uniswapDetailsReturned);
    this._isMounted = true;
  }

  componentWillUnmount() {
    emitter.removeListener(
      DB_GET_ASSET_FULLDATA_RETURNED,
      this.uniswapDetailsReturned
    );
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.assetData) {
      if (prevProps.assetData !== this.props.assetData) {
        this.setState({
          assetData: this.props.assetData,
        });
      }
    }
    if (this.props.vsCoin) {
      if (prevProps.vsCoin !== this.props.vsCoin) {
        this.setState({
          vsCoin: this.props.vsCoin,
        });
      }
    }
    if (this.props.selectedWallet) {
      if (prevProps.selectedWallet !== this.props.selectedWallet) {
        this.setState({
          selectedWallet: this.props.selectedWallet,
        });
      }
    }
    if (this.props.walletColors) {
      if (prevProps.walletColors !== this.props.walletColors) {
        this.setState({
          walletColors: this.props.walletColors,
        });
      }
    }
  }

  getUniswapDetails = (univ2Asset, balance) => {
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_ASSET_FULLDATA,
        payload: univ2Asset,
      });
    this.setState({
      uniswapDetailsLoading: true,
      uniswapDetailsBalance: balance,
    });
  };

  uniswapDetailsReturned = (uniswapAsset) => {
    console.log(uniswapAsset);
    this.setState({
      uniswapDetailsLoading: false,
      uniswapDetailsModal: true,
      uniswapDetails: uniswapAsset,
    });
  };

  changeAssetsPerPage = (event) => {
    let wallets = [];
    let newAssetsPerPage = event.target.value;

    this.setState({ assetsPerPage: newAssetsPerPage });
  };

  changeAssetPage = (action) => {
    const { assetsPage, assetsPerPage } = this.state;

    let newPage;
    switch (action) {
      case "prev":
        newPage = assetsPage - 1;
        this.setState({ assetsPage: newPage });
        break;
      case "next":
        newPage = assetsPage + 1;
        this.setState({ assetsPage: newPage });

        break;
      default:
        break;
    }
  };

  expandContract = (currentState, section) => {
    let newState = !currentState;
    var rotated = currentState;

    var expandContract = document.getElementById("expandContract");
    var expandedContainer = document.getElementById("expandedItemsContainer");

    if (!this.state.expandedHeight) {
      if (expandedContainer) {
        var expandedHeight = expandedContainer.clientHeight + 10 + "px";
      }
    } else {
      var expandedHeight = this.state.expandedHeight;
    }
    if (expandedContainer) {
      expandedContainer.style.transform = newState
        ? "translateY(0%)"
        : `translateY(-${expandedHeight})`;
      expandContract.style.opacity = newState ? 1 : 0;
    }
    expandContract.style.maxHeight = newState ? expandedHeight : 0;

    console.log(newState);
    this._isMounted &&
      this.setState({
        assetsExpanded: newState,
      });
  };

  dynamicSort = (property) => {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    if (property === "value") {
      return function (a, b) {
        const a_prices = a.value ? a.value : 0;
        const b_prices = b.value ? b.value : 0;

        var result = a_prices < b_prices ? -1 : a_prices > b_prices ? 1 : 0;

        return result * sortOrder;
      };
    } else if (property === "total_returned") {
      return function (a, b) {
        const a_stats = a.stats ? a.stats[property] : 0;
        const b_stats = b.stats ? b.stats[property] : 0;

        var result = a_stats < b_stats ? -1 : a_stats > b_stats ? 1 : 0;

        return result * sortOrder;
      };
    } else if (property === "avg_buy_price") {
      return function (a, b) {
        const a_stats =
          a.stats && a.price
            ? ((a.price.value - a.stats.avg_buy_price) /
                a.stats.avg_buy_price) *
              100
            : 0;
        const b_stats =
          b.stats && b.price
            ? ((b.price.value - b.stats.avg_buy_price) /
                b.stats.avg_buy_price) *
              100
            : 0;

        var result = a_stats < b_stats ? -1 : a_stats > b_stats ? 1 : 0;

        return result * sortOrder;
      };
    } else if (property === "price") {
      return function (a, b) {
        const a_stats = a.asset && a.asset.price ? a.asset.price.value : 0;
        const b_stats = b.asset && b.asset.price ? b.asset.price.value : 0;

        var result = a_stats < b_stats ? -1 : a_stats > b_stats ? 1 : 0;

        return result * sortOrder;
      };
    } else {
      return function (a, b) {
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

        return result * sortOrder;
      };
    }
  };

  drawAssets(assetData, type) {
    const {
      sortOrder,
      sortBy,
      assetsPerPage,
      assetsPage,
      walletNicknames,
      walletColors,
      selectedWallet,
      uniswapDetailsLoading,
      dbStatsData,
      vsCoin,
      loadingStats,
    } = this.state;
    const { classes } = this.props;

    let allAssets = [];

    if (type === "univ2") {
      for (var i = 0; i < assetData.length; i++) {
        if (assetData[i].quantity > 0) {
          allAssets.push(assetData[i]);
        }
      }
    }
    if (type === "staked") {
      var stakedAssets = assetData.filter(function (el) {
        return el.quantity > 0;
      });

      let protocols = [];
      let protocolAssetsGrouped = {};
      stakedAssets.forEach((item, i) => {
        if (protocols.indexOf(item.protocol) === -1) {
          protocols.push(item.protocol);
        }
      });

      protocols.forEach((item, i) => {
        var protocolItems = stakedAssets.filter(function (el) {
          return el.protocol === item;
        });
        protocolItems.forEach((asset, x) => {
          if (!(asset.name in protocolAssetsGrouped)) {
            protocolAssetsGrouped[asset.name] = {};
            if (!(asset.wallet in protocolAssetsGrouped[asset.name])) {
              protocolAssetsGrouped[asset.name][asset.wallet] = {
                items: [],
                value: 0,
                name: asset.name,
                type: "nonAssetGrouped",
                quantityDecimals: 1,
                protocol: asset.protocol,
                id: asset.name + "_" + Math.random() + "_grouped",
                wallet: asset.wallet,
                icon_url: { deposited: [], rewards: [] },
                symbol: { deposited: [], rewards: [] },
                chain: asset.chain,
              };
            }
            protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(
              asset
            );
            if (asset.type !== "reward") {
              protocolAssetsGrouped[asset.name][asset.wallet]["icon_url"][
                "deposited"
              ].push(asset.asset.icon_url);
              protocolAssetsGrouped[asset.name][asset.wallet]["symbol"][
                "deposited"
              ].push(asset.asset.symbol);
            } else {
              protocolAssetsGrouped[asset.name][asset.wallet]["icon_url"][
                "rewards"
              ].push(asset.asset.icon_url);
              protocolAssetsGrouped[asset.name][asset.wallet]["symbol"][
                "rewards"
              ].push(asset.asset.symbol);
            }
          } else {
            if (!(asset.wallet in protocolAssetsGrouped[asset.name])) {
              protocolAssetsGrouped[asset.name][asset.wallet] = {
                items: [],
                value: 0,
                name: asset.name,
                type: "nonAssetGrouped",
                quantityDecimals: 1,
                protocol: asset.protocol,
                id: asset.name + "_" + Math.random() + "_grouped",
                wallet: asset.wallet,
                icon_url: { deposited: [], rewards: [] },
                symbol: { deposited: [], rewards: [] },
                chain: asset.chain,
              };
            }
            protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(
              asset
            );
            if (asset.type !== "reward") {
              protocolAssetsGrouped[asset.name][asset.wallet]["icon_url"][
                "deposited"
              ].push(asset.asset.icon_url);
              protocolAssetsGrouped[asset.name][asset.wallet]["symbol"][
                "deposited"
              ].push(asset.asset.symbol);
            } else {
              protocolAssetsGrouped[asset.name][asset.wallet]["icon_url"][
                "rewards"
              ].push(asset.asset.icon_url);
              protocolAssetsGrouped[asset.name][asset.wallet]["symbol"][
                "rewards"
              ].push(asset.asset.symbol);
            }
          }
        });
      });
      for (var protocol in protocolAssetsGrouped) {
        for (var wallet in protocolAssetsGrouped[protocol]) {
          protocolAssetsGrouped[protocol][wallet].items.forEach((item, i) => {
            protocolAssetsGrouped[protocol][wallet].value += item.value;
          });
          allAssets.push(protocolAssetsGrouped[protocol][wallet]);
        }
      }
    }

    let sortedAssets = [];
    if (this.state.sortOrder === "asc") {
      sortedAssets = allAssets.sort(this.dynamicSort(sortBy));
    } else {
      sortedAssets = allAssets.sort(this.dynamicSort(`-${sortBy}`));
    }

    const assetPage = sortedAssets.slice(
      (assetsPage - 1) * assetsPerPage,
      assetsPerPage * assetsPage
    );

    console.log(sortedAssets);
    console.log(assetPage);
    let data;
    return assetPage.map((row) => (
      <React.Fragment key={Math.random() + row.id}>
        {type === "stakedAssets" && (
          <Grid
            container
            id={`${row.id + row.wallet.substring(2, 5) + "nonAsset"}`}
            className={classes.assetGridRoot}
            direction="row"
            justify="flex-start"
            alignItems="center"
            onClick={() => this.nav("/short/detective/" + row.asset.asset_code)}
          >
            <Card
              className={classes.assetCard}
              style={{
                borderRadius: row.hideStats === false ? "20px 20px 0 0" : 20,
              }}
            >
              <CardActionArea
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Grid className={classes.assetLogoGrid}>
                  <div
                    style={{
                      width: "max-content",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {this.drawMultipleAssetIcons(row.icon_url, row.symbol)}
                  </div>
                </Grid>
                <Grid
                  padding="none"
                  align="left"
                  style={{
                    zIndex: 1,
                    width: "30%",
                    maxWidth: "30%",
                    minWidth: "30%",
                    margin: "0 10px 0 0",
                  }}
                >
                  <div>
                    <Typography variant={"h4"}>{row.name}</Typography>
                  </div>
                  {selectedWallet === "all" && (
                    <div style={{ display: "flex" }}>
                      {walletColors[
                        walletColors
                          .map((e) => e.wallet)
                          .indexOf(row.wallet.toLowerCase())
                      ] && (
                        <>
                          {this.drawChainIcon(row.chain)}
                          <FiberManualRecordIcon
                            style={{
                              scale: 0.75,
                              color:
                                walletColors[
                                  walletColors
                                    .map((e) => e.wallet)
                                    .indexOf(row.wallet.toLowerCase())
                                ].color,
                            }}
                          />
                          <Typography
                            style={{
                              opacity: 0.6,
                              color:
                                walletColors[
                                  walletColors
                                    .map((e) => e.wallet)
                                    .indexOf(row.wallet.toLowerCase())
                                ].color,
                            }}
                            variant={"subtitle2"}
                          >
                            at wallet:{" "}
                            {(data = walletNicknames.find(
                              (ele) => ele.wallet === row.wallet
                            )) &&
                              data.nickname +
                                " (" +
                                row.wallet.substring(0, 6) +
                                "..." +
                                row.wallet.substring(
                                  row.wallet.length - 4,
                                  row.wallet.length
                                ) +
                                ")"}
                            {!walletNicknames.some(
                              (e) => e.wallet === row.wallet
                            ) &&
                              row.wallet.substring(0, 6) +
                                "..." +
                                row.wallet.substring(
                                  row.wallet.length - 4,
                                  row.wallet.length
                                )}
                          </Typography>
                        </>
                      )}
                    </div>
                  )}
                  {selectedWallet !== "all" && (
                    <div style={{ display: "flex" }}>
                      {walletColors[
                        walletColors
                          .map((e) => e.wallet)
                          .indexOf(row.wallet.toLowerCase())
                      ] && <>{this.drawChainIcon(row.chain)}</>}
                    </div>
                  )}
                </Grid>
                <Grid
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    width: "100%",
                  }}
                  align="right"
                >
                  {row.items.map((item, i) => (
                    <div key={i + item.asset.symbol}>
                      <Divider
                        orientation="vertical"
                        flexItem
                        style={{
                          marginRight: 5,
                          display: i === 0 ? "none" : "",
                        }}
                      />
                      <Grid
                        style={{
                          marginRight: 5,
                          zIndex: 2,
                          textAlign: "left",
                        }}
                      >
                        <Typography variant={"body1"} style={{ fontSize: 22 }}>
                          {formatMoney(item.quantityDecimals)}
                        </Typography>
                        <Typography style={{ opacity: 0.7 }} variant={"body1"}>
                          {item.asset.symbol}
                        </Typography>
                      </Grid>
                    </div>
                  ))}
                  <Grid
                    style={{ marginLeft: "auto", marginRight: 10 }}
                    align="right"
                  >
                    <Typography variant={"h2"} color="primary">
                      {row.value &&
                        getVsSymbol(vsCoin) + " " + formatMoney(row.value)}
                    </Typography>
                  </Grid>
                  {row.items && (
                    <Grid
                      className={classes.showPyLBTN}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.setState({
                          stakingDetailsModal: true,
                          stakingDetails: row,
                        });
                      }}
                    >
                      {loadingStats && <CircularProgress size={25} />}
                      {!loadingStats &&
                        (row.hideStats === undefined ||
                          row.hideStats === true) && <SearchIcon />}
                      {!loadingStats && row.hideStats === false && (
                        <ArrowDropUpRoundedIcon />
                      )}
                    </Grid>
                  )}
                </Grid>
              </CardActionArea>
            </Card>
          </Grid>
        )}
        {type === "univ2" && (
          <Grid
            container
            id={`${row.id + row.wallet.substring(2, 5) + "univ2"}`}
            className={classes.assetGridRoot}
            direction="row"
            justify="flex-start"
            alignItems="center"
            onClick={() => this.nav("/short/detective/" + row.asset.asset_code)}
          >
            <Card
              className={classes.assetCard}
              style={{
                borderRadius: row.hideStats === false ? "20px 20px 0 0" : 20,
              }}
            >
              <CardActionArea
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Grid className={classes.assetLogoGrid}>
                  <div
                    style={{
                      width: "max-content",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      className={classes.assetTokenLogo}
                      alt=""
                      src={row.asset.icon_url}
                    />
                  </div>
                </Grid>
                <Grid
                  padding="none"
                  align="left"
                  style={{
                    zIndex: 1,
                    width: "30%",
                    maxWidth: "30%",
                    minWidth: "30%",
                    margin: "0 10px 0 0",
                  }}
                >
                  <div>
                    <Typography variant={"h4"}>{row.asset.name}</Typography>
                  </div>
                  {selectedWallet === "all" && (
                    <div style={{ display: "flex" }}>
                      {walletColors[
                        walletColors
                          .map((e) => e.wallet)
                          .indexOf(row.wallet.toLowerCase())
                      ] && (
                        <>
                          {this.drawChainIcon(row.chain)}
                          <FiberManualRecordIcon
                            style={{
                              scale: 0.75,
                              color:
                                walletColors[
                                  walletColors
                                    .map((e) => e.wallet)
                                    .indexOf(row.wallet.toLowerCase())
                                ].color,
                            }}
                          />
                          <Typography
                            style={{
                              opacity: 0.6,
                              color:
                                walletColors[
                                  walletColors
                                    .map((e) => e.wallet)
                                    .indexOf(row.wallet.toLowerCase())
                                ].color,
                            }}
                            variant={"subtitle2"}
                          >
                            at wallet:{" "}
                            {(data = walletNicknames.find(
                              (ele) => ele.wallet === row.wallet
                            )) &&
                              data.nickname +
                                " (" +
                                row.wallet.substring(0, 6) +
                                "..." +
                                row.wallet.substring(
                                  row.wallet.length - 4,
                                  row.wallet.length
                                ) +
                                ")"}
                            {!walletNicknames.some(
                              (e) => e.wallet === row.wallet
                            ) &&
                              row.wallet.substring(0, 6) +
                                "..." +
                                row.wallet.substring(
                                  row.wallet.length - 4,
                                  row.wallet.length
                                )}
                          </Typography>
                        </>
                      )}
                    </div>
                  )}
                  {selectedWallet !== "all" && (
                    <div style={{ display: "flex" }}>
                      {walletColors[
                        walletColors
                          .map((e) => e.wallet)
                          .indexOf(row.wallet.toLowerCase())
                      ] && <>{this.drawChainIcon(row.chain)}</>}
                    </div>
                  )}
                </Grid>
                <Grid
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    width: "100%",
                  }}
                  align="right"
                >
                  <Grid style={{ textAlign: "left" }}>
                    <Typography variant={"body1"} style={{ fontSize: 22 }}>
                      {formatMoney(row.quantityDecimals)}
                    </Typography>
                    <Typography style={{ opacity: 0.7 }} variant={"body1"}>
                      {row.asset.symbol}
                    </Typography>
                  </Grid>
                  <Grid
                    style={{ marginLeft: 10, textAlign: "left" }}
                    align="right"
                  >
                    {row.asset.price && (
                      <>
                        <Typography style={{ fontSize: 22 }} variant={"body1"}>
                          {getVsSymbol(vsCoin) +
                            " " +
                            formatMoney(row.asset.price.value)}
                        </Typography>
                        {row.asset.price.relative_change_24h && (
                          <div
                            style={{ display: "flex", justifyContent: "end" }}
                          >
                            {row.asset.price.relative_change_24h > 0 && (
                              <ArrowDropUpRoundedIcon
                                color="primary"
                                size="small"
                              />
                            )}
                            {row.asset.price.relative_change_24h < 0 && (
                              <ArrowDropDownRoundedIcon
                                color="secondary"
                                size="small"
                              />
                            )}
                            <Typography
                              color={
                                row.asset.price.relative_change_24h > 0
                                  ? "primary"
                                  : "secondary"
                              }
                              variant={"subtitle2"}
                            >
                              {row.asset.price.relative_change_24h.toFixed(2)} %
                            </Typography>
                          </div>
                        )}
                      </>
                    )}
                  </Grid>
                  <Grid
                    style={{ marginLeft: "auto", marginRight: 10 }}
                    align="right"
                  >
                    <Typography variant={"h2"} color="primary">
                      $ {row.value && formatMoney(row.value)}
                    </Typography>
                  </Grid>
                  <Grid
                    className={classes.showPyLBTN}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.getUniswapDetails(
                        row.asset.asset_code,
                        row.quantityDecimals
                      );
                    }}
                  >
                    {uniswapDetailsLoading && <CircularProgress size={25} />}
                    {!uniswapDetailsLoading && <SearchIcon />}
                  </Grid>
                </Grid>
              </CardActionArea>
            </Card>
          </Grid>
        )}
      </React.Fragment>
    ));
  }

  drawTitle(type) {
    switch (type) {
      case "univ2":
        return (
          <Typography color="primary" variant={"h3"}>
            Uniswap LP Assets
          </Typography>
        );
        break;
      default:
        return (
          <Typography color="primary" variant={"h3"}>
            Assets
          </Typography>
        );
        break;
    }
  }

  drawTotalValue = (assets) => {
    const onlyAssetsWithValue = assets.filter(function (el) {
      return el.value > 0; // Changed this so a home would match
    });
    const totalValue = onlyAssetsWithValue
      .map((item) => item.value)
      .reduce((prev, curr) => prev + curr, 0);

    return (
      <Typography color="primary" variant={"h3"} style={{ marginRight: 5 }}>
        {getVsSymbol(this.state.vsCoin) + " " + formatMoney(totalValue)}
      </Typography>
    );
  };

  drawChainIcon = (chain) => {
    const { classes } = this.props;
    switch (chain) {
      case "ethereum":
        return (
          <Tooltip
            title={<Typography color="inherit">Asset in {chain}</Typography>}
          >
            <img src="/chainIcons/ethereum.png" className={classes.chainIcon} />
          </Tooltip>
        );
        break;
      case "xdai":
        return (
          <Tooltip
            title={<Typography color="inherit">Asset in {chain}</Typography>}
          >
            <img src="/chainIcons/xdai.png" className={classes.chainIcon} />
          </Tooltip>
        );
        break;
      case "avalanche":
        return (
          <Tooltip
            title={<Typography color="inherit">Asset in {chain}</Typography>}
          >
            <img
              src="/chainIcons/avalanche.png"
              className={classes.chainIcon}
            />
          </Tooltip>
        );
        break;
      case "optimism":
        return (
          <Tooltip
            title={<Typography color="inherit">Asset in {chain}</Typography>}
          >
            <img src="/chainIcons/optimism.png" className={classes.chainIcon} />
          </Tooltip>
        );
        break;
      case "arbitrum":
        return (
          <Tooltip
            title={<Typography color="inherit">Asset in {chain}</Typography>}
          >
            <img src="/chainIcons/arbitrum.png" className={classes.chainIcon} />
          </Tooltip>
        );
        break;
      case "binance-smart-chain":
        return (
          <Tooltip
            title={<Typography color="inherit">Asset in BSC</Typography>}
          >
            <img src="/chainIcons/bsc.png" className={classes.chainIcon} />
          </Tooltip>
        );
        break;
      case "polygon":
        return (
          <Tooltip
            title={<Typography color="inherit">Asset in {chain}</Typography>}
          >
            <img src="/chainIcons/polygon.png" className={classes.chainIcon} />
          </Tooltip>
        );
        break;
      default:
        return <div>{chain}</div>;
        break;
    }
  };

  render() {
    const { classes } = this.props;
    const {
      assetsExpanded,
      type,
      assets,
      assetsPage,
      assetsPerPage,
      uniswapDetailsModal,
    } = this.state;

    return (
      <>
        <Grid
          item
          xs={12}
          key="StakingsGridRoot"
          style={{ display: "grid", minHeight: "100%" }}
        >
          <div className={classes.nonAssetsGrid}>
            <Grid
              item
              xs={12}
              container
              direction="row"
              justify="space-between"
            >
              {this.drawTitle(type)}
              <Grid item container direction="row" style={{ width: "auto" }}>
                {this.drawTotalValue(assets)}
                <IconButton
                  color="primary"
                  aria-label="Show Portfolio Data"
                  size="small"
                  onClick={() => this.expandContract(assetsExpanded)}
                >
                  {
                    <ExpandMoreIcon
                      className={
                        assetsExpanded
                          ? classes.expandIcon
                          : classes.unexpandIcon
                      }
                      id="expandIcon"
                    />
                  }
                </IconButton>
              </Grid>
            </Grid>
            <Grid style={{ overflow: "hidden", padding: "1px" }}>
              <Grid
                className={assetsExpanded ? classes.expand : classes.contract}
                id="expandContract"
                style={{ transition: "all 0.7s ease-in-out" }}
              >
                <div id="expandedItemsContainer">
                  <Divider variant="middle" />
                  <Grid
                    item
                    xs={12}
                    style={{
                      height: "100%",
                      maxHeight: 500,
                      overflowY: "auto",
                      marginTop: 10,
                      scrollbarColor:
                        "rgb(121, 216, 162) rgba(48, 48, 48, 0.5)",
                      paddingRight: 10,
                      scrollbarWidth: "thin",
                    }}
                  >
                    {this.drawAssets(assets, type)}
                  </Grid>
                  <Divider variant="middle" />
                  <Grid
                    container
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                    style={{ marginTop: 10 }}
                  >
                    <IconButton
                      disabled={assetsPage === 1}
                      onClick={() => this.changeAssetPage("prev")}
                    >
                      <KeyboardArrowLeftRoundedIcon />
                    </IconButton>
                    <div className={classes.pageCounter}>{assetsPage}</div>
                    <IconButton onClick={() => this.changeAssetPage("next")}>
                      <KeyboardArrowRightRoundedIcon />
                    </IconButton>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <InputLabel id="demo-simple-select-outlined-label">
                        per page
                      </InputLabel>
                      <Select
                        labelId="assetsPerPage-Select-label"
                        id="assetsPerPage-Select-outlined"
                        value={assetsPerPage}
                        onChange={this.changeAssetsPerPage}
                        label="assetsPerPage"
                      >
                        <MenuItem key={"10"} value={10}>
                          10
                        </MenuItem>
                        <MenuItem key={"25"} value={25}>
                          25
                        </MenuItem>
                        <MenuItem key={"50"} value={50}>
                          50
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
        {uniswapDetailsModal &&
          this.renderUniswapDetailsModal(
            this.state.uniswapDetails,
            this.state.uniswapDetailsBalance
          )}
      </>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
  closeModalUniswapDetails = () => {
    this.setState({ uniswapDetailsModal: false });
  };

  renderUniswapDetailsModal = (uniswapDetails, uniswapDetailsBalance) => {
    return (
      <UniswapDetailsModal
        data={uniswapDetails}
        closeModalUni={this.closeModalUniswapDetails}
        modalOpen={this.state.uniswapDetailsModal}
        vsCoin={this.state.vsCoin}
        assetBalance={uniswapDetailsBalance}
      />
    );
  };

  renderstakingDetailsModal = (stakingDetails) => {
    return (
      <StakingDetailsModal
        data={stakingDetails}
        closeModal={this.closeModalStakingDetails}
        modalOpen={this.state.stakingDetailsModal}
        vsCoin={this.state.vsCoin}
      />
    );
  };
}

export default withStyles(styles)(PortfolioAssets);
