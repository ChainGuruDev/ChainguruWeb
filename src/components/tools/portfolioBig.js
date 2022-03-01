import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors, colorsGuru } from "../../theme";
import { formatMoney, getVsSymbol } from "../helpers";

import WalletNicknameModal from "../components/walletNicknameModal.js";
import WalletRemoveModal from "../components/walletRemoveModal.js";
import WalletAddModal from "../components/walletAddModal.js";
import PortfolioChart from "../components/PortfolioChart.js";
import StakingDetailsModal from "../components/stakingDetailsModal.js";
import UniswapDetailsModal from "../components/uniswapDetailsModal.js";
import SparklineChart from "../components/SparklineChart.js";

import ProfileMini from "../profile/profileMini.js";

import AccountBalanceWalletRoundedIcon from "@material-ui/icons/AccountBalanceWalletRounded";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import PieChartIcon from "@material-ui/icons/PieChart";
import LockIcon from "@material-ui/icons/Lock";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";
import BarChartRoundedIcon from "@material-ui/icons/BarChartRounded";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import ReplayIcon from "@material-ui/icons/Replay";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LabelIcon from "@material-ui/icons/Label";

import StarRoundedIcon from "@material-ui/icons/StarRounded";
import StarHalfRoundedIcon from "@material-ui/icons/StarHalfRounded";
import StarBorderRoundedIcon from "@material-ui/icons/StarBorderRounded";

import {
  Card,
  CardActionArea,
  Grid,
  Divider,
  Button,
  LinearProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  CircularProgress,
  Tooltip,
  Avatar,
  Badge,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  Paper,
  Grow,
  Popper,
} from "@material-ui/core";

import Skeleton from "@material-ui/lab/Skeleton";
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import {
  ERROR,
  LOGIN_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_USERDATA_RETURNED,
  DB_GET_PORTFOLIO_STATS,
  DB_GET_PORTFOLIO_STATS_RETURNED,
  DB_GET_PORTFOLIO_ASSET_STATS,
  DB_GET_PORTFOLIO_ASSET_STATS_RETURNED,
  DB_GET_PORTFOLIO_CHART,
  DB_GET_PORTFOLIO_CHART_RETURNED,
  DB_UPDATE_PORTFOLIO_RETURNED,
  DB_SET_USER_WALLET_NICKNAME_RETURNED,
  DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
  CHECK_ACCOUNT,
  CHECK_ACCOUNT_RETURNED,
  DB_ADD_WALLET,
  DB_ADD_WALLET_WATCHLIST,
  DB_ADD_WALLET_RETURNED,
  DB_DEL_WALLET_WATCHLIST,
  DB_DEL_WALLET_RETURNED,
  DB_GET_PORTFOLIO_POSITIONS,
  DB_GET_PORTFOLIO_POSITIONS_RETURNED,
  DB_GET_ASSET_FULLDATA,
  DB_GET_ASSET_FULLDATA_RETURNED,
  GECKO_GET_SPARKLINE_FROM_CONTRACT,
  GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
  SWITCH_VS_COIN_RETURNED,
  LOGIN,
  DB_ADD_FAVORITE,
} from "../../constants";

import {
  ERROR_ZERION,
  ZERION_GET_ADDRESS_CHART,
  ZERION_ADDRESS_CHART_RETURNED,
  ZERION_GET_ADDRESS_PORTFOLIO,
  ZERION_ADDRESS_PORTFOLIO_RETURNED,
  ZERION_GET_ASSETSTATS,
  ZERION_ASSETSTATS_RETURNED,
} from "../../constants/zerion.js";

import Store from "../../stores";
import Zerion_Store from "../../stores/zerionStore.js";

const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const storeZerion = Zerion_Store.store;
const emitterZerion = Zerion_Store.emitter;
const dispatcherZerion = Zerion_Store.dispatcher;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
  },
  favCard: {
    padding: 10,
    display: "flex",
    flex: 1,
  },
  tokenLogo: {
    maxHeight: 100,
    minWidth: 100,
  },
  winLoseGrid: {
    cursor: "pointer",
    alignItems: "center",
    "&:hover": {
      background: "rgba(255,255,255, 0.05)",
      transition: "0.5s",
    },
  },
  profit_green: {
    color: colors.cgGreen,
  },
  profit_red: {
    color: colors.cgRed,
  },
  walletGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    padding: "10px",
    background: `#9991`,
  },
  profileGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    padding: "10px",
    background: `#9991`,
    marginBottom: 10,
    height: "fit-content",
  },
  assetsGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    padding: "10px",
    background: `#9991`,
    minHeight: "100%",
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
  graphGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    background: store.getStore("theme") === "dark" ? "#0005" : "#9991",
    minHeight: "100%",
    height: "100%",
    overflow: "clip",
    display: "grid",
  },
  walletInput: {
    width: "100%",
    minWidth: "-moz-available" /* WebKit-based browsers will ignore this. */,
    minWidth:
      "-webkit-fill-available" /* Mozilla-based browsers will ignore this. */,
  },
  timeframeBTN: {
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255,255,255, 0.05)",
      transition: "0.5s",
    },
  },
  timeframeBTNSelected: {
    backgroundColor: colors.cgGreen + "50",
  },
  chainIcon: { maxWidth: 25, maxHeight: 25, scale: 0.8 },
  customCell: {
    backgroundColor: "inherit",
  },
  smallAvatar: {
    maxWidth: 20,
    maxHeight: 20,
    padding: "35px 25px",
  },
  rewardBadge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "75%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "2px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(1.2)",
      opacity: 0,
    },
  },
  formControl: {
    minWidth: 120,
    marginLeft: 10,
  },
  assetGridRoot: {
    display: "flex",
    marginBottom: 10,
  },
  largeProfile: {
    width: "75px",
    height: "75px",
  },
  assetLogoGrid: {
    right: "4vh",
    top: "-3vh",
    position: "relative",
    width: "10px",
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

  "@keyframes slideDown": {
    "0%": {
      marginTop: "-50px",
      opacity: 0,
    },
    "100%": {
      marginTop: "5px",
      opacity: 1,
    },
  },

  assetCardDetails: {
    display: "flex",
    justifyContent: "space-evenly",
    borderRadius: "0 0 20px 20px",
    height: 75,
    background: "#2227",
    width: "100%",
    alignItems: "center",
    overflow: "clip",
    transition: "all 0.5s",
    animation: "slideDown 0.5s",
    boxShadow: "1px 3px 5px -2px rgba(0, 0, 0, 0.5)",
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
});

class PortfolioBig extends Component {
  constructor() {
    super();
    this._isMounted = false;

    const account = store.getStore("account");
    const vsCoin = store.getStore("vsCoin");

    this.state = {
      account: account,
      loading: false,
      dbDataLoaded: false,
      dbStatsData: false,
      sortBy: "value",
      sortOrder: "desc",
      hideBlacklisted: true,
      hideLowBalanceCoins: true,
      userWallets: [],
      walletNicknames: [],
      walletNicknameModal: false,
      error: false,
      addWallet: false,
      errMsgWallet: "",
      errorWallet: true,
      portfolioChartData: null,
      chartDataLoaded: false,
      timeFrame: "w",
      chartVariation: null,
      stakingDetailsModal: false,
      stakingDetails: null,
      vsCoin: vsCoin,
      uniswapDetailsModal: false,
      uniswapDetails: null,
      uniswapDetailsLoading: false,
      assetsPage: 1,
      nonAssetsPage: 1,
      uniV2AssetsPage: 1,
      uniV2AssetsPerPage: 10,
      assetsPerPage: 25,
      nonAssetsPerPage: 10,
      loadingStats: false,
      stakedAssetsExpanded: false,
      assetsExpanded: true,
      univ2AssetsExpanded: false,
      walletMenuOpen: false,
      anchorWalletElement: null,
      addWalletType: null,
      maxPagesUniV2: 0,
      maxPagesAssets: 0,
      maxPagesStaked: 0,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.setState({ loading: false });
    emitter.on(ERROR, this.error);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);

    emitter.on(DB_UPDATE_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
    emitter.on(DB_SET_USER_WALLET_NICKNAME_RETURNED, this.setNicknameReturned);
    emitter.on(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.on(
      DB_GET_PORTFOLIO_POSITIONS_RETURNED,
      this.db_getPortfolioPositionsReturned
    );
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(DB_GET_ASSET_FULLDATA_RETURNED, this.uniswapDetailsReturned);
    emitter.on(
      GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
      this.sparklineDataReturned
    );
    emitter.on(LOGIN_RETURNED, this.loginReturned);
    emitterZerion.on(
      ZERION_ADDRESS_CHART_RETURNED,
      this.db_getPortfolioChartReturned
    );
    emitterZerion.on(
      ZERION_ADDRESS_PORTFOLIO_RETURNED,
      this.dbGetPortfolioStatsReturned
    );
    emitterZerion.on(
      ZERION_ASSETSTATS_RETURNED,
      this.dbGetPortfolioAssetStatsReturned
    );
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitterZerion.removeListener(
      ZERION_ASSETSTATS_RETURNED,
      this.dbGetPortfolioAssetStatsReturned
    );
    emitter.removeListener(
      DB_UPDATE_PORTFOLIO_RETURNED,
      this.dbGetPortfolioReturned
    );
    emitter.removeListener(
      DB_GET_ASSET_FULLDATA_RETURNED,
      this.uniswapDetailsReturned
    );
    emitter.removeListener(
      DB_SET_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.removeListener(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);

    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.removeListener(DB_ADD_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(DB_DEL_WALLET_RETURNED, this.dbWalletReturned);
    emitter.removeListener(
      DB_GET_PORTFOLIO_POSITIONS_RETURNED,
      this.db_getPortfolioPositionsReturned
    );
    emitter.removeListener(
      GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
      this.sparklineDataReturned
    );
    emitter.removeListener(LOGIN_RETURNED, this.loginReturned);
    emitterZerion.removeListener(
      ZERION_ADDRESS_CHART_RETURNED,
      this.db_getPortfolioChartReturned
    );
    emitterZerion.removeListener(
      ZERION_ADDRESS_PORTFOLIO_RETURNED,
      this.dbGetPortfolioStatsReturned
    );
    this._isMounted = false;
  }

  //EMITTER EVENTS FUNCTIONS
  connectionConnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  loginReturned = () => {
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");
    if (userAuth && account && account.address) {
      this.setState({
        error: false,
        dbDataLoaded: false,
      });
    }
  };

  vsCoinReturned = (vsCoin) => {
    console.log(`NEW VS COIN ${vsCoin}`);
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO_POSITIONS,
        wallet: this.state.userWallets,
      });

    this.setState({
      loading: true,
      dbDataLoaded: false,
      vsCoin: vsCoin,
    });
  };

  dbUserDataReturned = (data) => {
    let wallets = [];
    let watchlistWallets = [];
    let walletColors = [];

    data.wallets.forEach((item, i) => {
      wallets.push(item.wallet);
      var x = i;
      x %= Object.keys(colorsGuru).length;
      let data = {
        wallet: item.wallet.toLowerCase(),
        color: colorsGuru[Object.keys(colorsGuru)[x]],
      };
      walletColors.push(data);
    });

    data.watchlistWallets.forEach((item, i) => {
      watchlistWallets.push(item.wallet);
    });

    if (!this.state.dbDataLoaded) {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_POSITIONS,
          wallet: wallets,
        });

      if (wallets.length > 0) {
        this.setState({
          loading: true,
          selectedWallet: "all",
          userWallets: wallets,
          watchlistWallets: watchlistWallets,
          walletColors: walletColors,
          walletNicknames: data.walletNicknames,
        });
      } else {
        this.setState({
          loading: true,
          selectedWallet: wallets[0],
          walletColors: walletColors,
          userWallets: wallets,
          watchlistWallets: watchlistWallets,
          walletNicknames: data.walletNicknames,
        });
      }
    }
  };

  removeWALLET = (e, wallet, type) => {
    e.stopPropagation();
    e.preventDefault();

    const walletNick = this.state.walletNicknames.find(
      (ele) => ele.wallet === wallet
    );
    if (walletNick) {
      this.setState({
        deleteWalletModal: true,
        removeWALLET: [wallet, walletNick.nickname],
        anchorWalletElement: null,
        deleteType: type,
      });
    } else {
      this.setState({
        deleteWalletModal: true,
        removeWALLET: [wallet],
        anchorWalletElement: null,
        deleteType: type,
      });
    }
  };

  setNicknameReturned = (data) => {
    this.setState({
      walletNicknames: data,
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

  dbGetPortfolioReturned = (portfolioData) => {
    let keys = [];
    let assetPrice = [];
    portfolioData.mainnetAssets.forEach((item, i) => {
      keys.push(item.asset_code);
      assetPrice.push(item.price ? item.price.value : null);
    });
    const mainnetAssets = portfolioData.mainnetAssets;
    if (this.state.selectedWallet === "all") {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: this.state.userWallets,
          timeframe: "w",
        });
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_PORTFOLIO,
          addresses: this.state.userWallets,
        });
      // this._isMounted &&
      //   dispatcher.dispatch({
      //     type: DB_GET_PORTFOLIO_ASSET_STATS,
      //     wallet: this.state.userWallets,
      //     portfolioData: mainnetAssets,
      //   });
    } else {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: [mainnetAssets[0].wallet_address],
          timeframe: "w",
        });
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_PORTFOLIO,
          address: [this.state.selectedWallet],
        });
      // this._isMounted &&
      //   dispatcher.dispatch({
      //     type: DB_GET_PORTFOLIO_ASSET_STATS,
      //     wallet: [mainnetAssets[0].wallet_address],
      //     portfolioData: mainnetAssets,
      //   });
    }
    this.setState({
      error: false,
      loading: false,
      dbDataLoaded: true,
      dbStatsData: false,
      portfolioData: portfolioData,
      chartVariation: null,
    });
  };

  db_getPortfolioChart = () => {
    this.setState({
      error: false,
      chartVariation: null,
      portfolioChartData: null,
      chartDataLoaded: false,
    });

    // if (this.state.selectedWallet === "all") {
    //   this._isMounted &&
    //     dispatcher.dispatch({
    //       type: DB_GET_PORTFOLIO_CHART,
    //       wallet: this.state.userWallets,
    //       timeframe: "w",
    //     });
    // } else {
    //   this._isMounted &&
    //     dispatcher.dispatch({
    //       type: DB_GET_PORTFOLIO_CHART,
    //       wallet: [this.state.selectedWallet],
    //       timeframe: "w",
    //     });
    // }

    if (this.state.selectedWallet === "all") {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: this.state.userWallets,
          timeframe: "w",
        });
    } else {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: [this.state.selectedWallet],
          timeframe: "w",
        });
    }
  };

  db_getPortfolioStats = () => {
    this.setState({
      error: false,
      dbStatsData: false,
    });

    if (this.state.selectedWallet === "all") {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_PORTFOLIO,
          addresses: this.state.userWallets,
        });
    } else {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_PORTFOLIO,
          address: [this.state.selectedWallet],
        });
    }
  };

  db_getPortfolioPositionsReturned = (portfolioData) => {
    const portfolioDataSorted = portfolioData.sort(this.dynamicSort("-value"));

    //separate between assets and non assets (LPs, deposit, staked, rewards)
    var assetsData = portfolioData.filter(function (el) {
      return el.type === "asset" && el.asset.type !== "uniswap-v2"; // Changed this so a home would match
    });
    var nonAssetsData = portfolioData.filter(function (el) {
      return el.type !== "asset" && el.type !== "uniswap-v2"; // Changed this so a home would match
    });
    var univ2Assets = portfolioData.filter(function (el) {
      return el.asset.type === "uniswap-v2";
    });

    //separate between different protocols (pancake, alchemist, etc)
    let protocols = [];
    let protocolAssetsGrouped = {};
    nonAssetsData.forEach((item, i) => {
      if (protocols.indexOf(item.protocol) === -1) {
        protocols.push(item.protocol);
      }
    });
    protocols.forEach((item, i) => {
      var protocolItems = nonAssetsData.filter(function (el) {
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
          protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(asset);
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
          protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(asset);
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
      }
    }

    for (var i = 0; i < univ2Assets.length; i++) {
      univ2Assets[i].type = "uniswap-v2";
    }

    // item.asset.name === favorites
    // console.log(univ2Assets);

    if (this.state.selectedWallet === "all") {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: this.state.userWallets,
          timeframe: "w",
        });
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_PORTFOLIO,
          addresses: this.state.userWallets,
        });
      // this._isMounted &&
      //   dispatcher.dispatch({
      //     type: DB_GET_PORTFOLIO_ASSET_STATS,
      //     wallet: this.state.userWallets,
      //     portfolioData: portfolioDataSorted,
      //     page: 1,
      //   });
    } else {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: [this.state.selectedWallet],
          timeframe: "w",
        });
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_PORTFOLIO,
          address: [this.state.selectedWallet],
        });
      // this._isMounted &&
      //   dispatcher.dispatch({
      //     type: DB_GET_PORTFOLIO_ASSET_STATS,
      //     wallet: [this.state.selectedWallet],
      //     portfolioData: portfolioDataSorted,
      //     page: 1,
      //   });
    }

    this.setState({
      error: false,
      loading: false,
      dbDataLoaded: true,
      dbStatsData: false,
      portfolioData: portfolioDataSorted,
      chartVariation: null,
      assetsData: assetsData,
      univ2Assets: univ2Assets,
      nonAssetsData: nonAssetsData,
    });
  };

  db_getPortfolioChartReturned = (portfolioChart) => {
    const priceEnd = portfolioChart[0][1];
    const priceStart = portfolioChart[portfolioChart.length - 1][1];
    const differenceValue = priceEnd - priceStart;
    const differencePercent = ((priceEnd - priceStart) / priceStart) * 100;
    // console.log(chartVariation);
    let timeFrame = "";
    switch (this.state.timeFrame) {
      case "w":
        timeFrame = "Week change";
        break;
      case "m":
        timeFrame = "Month change";
        break;
      case "y":
        timeFrame = "Year change";
        break;
      default:
    }
    this.setState({
      chartVariation: { timeFrame, differenceValue, differencePercent },
      portfolioChartData: portfolioChart,
      chartDataLoaded: true,
    });
  };

  dbGetPortfolioStatsReturned = (portfolioStats) => {
    this.setState({
      portfolioStats: portfolioStats,
    });
  };

  dbGetPortfolioAssetStatsReturned = (portfolioStats) => {
    const { portfolioData } = this.state;
    portfolioStats.forEach((item, i) => {
      if (item.stats) {
        const index = portfolioData.findIndex(
          (x) =>
            x.asset.asset_code === item.asset_code &&
            x.wallet === item.wallet_address.toLowerCase()
        );
        portfolioData[index].profit_percent = item.profit_percent;
        portfolioData[index].stats = item.stats;
        portfolioData[index].hideStats = false;
      }
    });

    // portfolioData.forEach((item, i) => {
    //   if (item.chain === "ethereum") {
    //     item.profit_percent = portfolioStats[i].profit_percent;
    //     item.stats = portfolioStats[i].stats;
    //   }
    // });

    // let winnersLosers;
    // winnersLosers = portfolioData.sort(this.dynamicSort("total_returned"));
    // winnersLosers.reverse();
    //
    // winners: winnersLosers.slice(0, 5),
    // losers: winnersLosers
    //   .slice(winnersLosers.length - 5, winnersLosers.length)
    //   .reverse(),
    this.setState({
      error: false,
      loading: false,
      dbStatsData: true,
      loadingStats: false,
      portfolioData: portfolioData,
    });
  };

  error = () => {
    this.setState({ error: true });
  };

  getLP_Tokens = () => {
    console.log(this.state.lpTokens);
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

  drawMultipleAssetIcons = (icons, symbols) => {
    const { classes } = this.props;

    //TODO, draw in a cool way multiple assets for multiple staking/rewards obj
    return (
      <>
        {symbols.rewards.length === 0 && (
          <AvatarGroup>
            {icons.deposited.map((icon, i) => (
              <Avatar
                className={classes.assetTokenLogo}
                key={`staking ${symbols.deposited[i]}`}
                alt={symbols.deposited[i]}
                src={icon}
                style={{
                  border: `solid 4px ${colors.cgRed}`,
                  marginRight: -50,
                }}
              >
                {!icon && symbols.deposited[i]}
              </Avatar>
            ))}
          </AvatarGroup>
        )}
        {symbols.rewards.length !== 0 && (
          <>
            <AvatarGroup>
              {icons.deposited.map((icon, i) => (
                <Avatar
                  className={classes.assetTokenLogo}
                  key={`deposited ${symbols.deposited[i]}`}
                  alt={symbols.deposited[i]}
                  src={icon}
                  style={{
                    border: `solid 4px ${colors.cgRed}`,
                    marginRight: -50,
                  }}
                >
                  {!icon && symbols.deposited[i]}
                </Avatar>
              ))}
              {icons.rewards.map((icon, i) => (
                <Avatar
                  className={classes.assetTokenLogo}
                  key={`rewards ${symbols.rewards[i]}`}
                  alt={symbols.rewards[i]}
                  src={icon}
                  style={{
                    border: `solid 4px ${colors.cgGreen}`,
                    marginRight: -50,
                  }}
                >
                  {!icon && symbols.rewards[i]}
                </Avatar>
              ))}
            </AvatarGroup>
          </>
        )}
      </>
    );
  };

  sortedList = (portfolioData) => {
    const { classes } = this.props;
    const {
      vsCoin,
      sortBy,
      hideLowBalanceCoins,
      dbStatsData,
      walletNicknames,
      walletColors,
      selectedWallet,
      uniswapDetailsLoading,
    } = this.state;

    let filteredData = [];
    if (hideLowBalanceCoins && (vsCoin === "usd" || vsCoin === "eur")) {
      portfolioData.forEach((item, i) => {
        if (item.value > 0.01) {
          filteredData.push(portfolioData[i]);
        }
      });
    } else if (hideLowBalanceCoins) {
      portfolioData.forEach((item, i) => {
        if (item.quantity > 0) {
          filteredData.push(portfolioData[i]);
        }
      });
    } else {
      filteredData = portfolioData;
    }

    //separate between assets and non assets (LPs, deposit, staked, rewards)
    var assetsData = filteredData.filter(function (el) {
      return el.type === "asset" && el.asset.type !== "uniswap-v2"; // Changed this so a home would match
    });
    var nonAssetsData = filteredData.filter(function (el) {
      return el.type !== "asset" && el.type !== "uniswap-v2"; // Changed this so a home would match
    });
    var univ2Assets = filteredData.filter(function (el) {
      return el.asset.type === "uniswap-v2";
    });

    //separate between different protocols (pancake, alchemist, etc)
    let protocols = [];
    let protocolAssetsGrouped = {};
    nonAssetsData.forEach((item, i) => {
      if (protocols.indexOf(item.protocol) === -1) {
        protocols.push(item.protocol);
      }
    });
    protocols.forEach((item, i) => {
      var protocolItems = nonAssetsData.filter(function (el) {
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
          protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(asset);
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
          protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(asset);
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
        assetsData.push(protocolAssetsGrouped[protocol][wallet]);
      }
    }

    for (var i = 0; i < univ2Assets.length; i++) {
      univ2Assets[i].type = "uniswap-v2";
      assetsData.push(univ2Assets[i]);
    }
    //Sort Rows by sortBy State criteria
    let sortedRows;
    if (this.state.sortOrder === "asc") {
      sortedRows = assetsData.sort(this.dynamicSort(sortBy));
    } else {
      sortedRows = assetsData.sort(this.dynamicSort(`-${sortBy}`));
    }
    if (sortedRows.length > 0) {
      let data;
      return sortedRows.map((row) => (
        <React.Fragment key={Math.random() + row.id}>
          {row.type !== "nonAssetGrouped" && row.type !== "uniswap-v2" && (
            <TableRow
              hover={true}
              key={`${row.id}+${Math.random(0, 99999)}`}
              style={{ cursor: "pointer" }}
              onClick={() =>
                this.nav("/short/detective/" + row.asset.asset_code)
              }
            >
              <TableCell>
                <div
                  style={{
                    width: "max-content",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    className={classes.tokenLogo}
                    alt=""
                    src={row.asset.icon_url}
                  />
                </div>
              </TableCell>
              <TableCell padding="none" align="left">
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
              </TableCell>
              <TableCell align="right">
                <div>
                  <Typography variant={"body1"}>
                    {formatMoney(row.quantityDecimals)}
                  </Typography>
                </div>
                <div>
                  <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
                    {row.asset.symbol}
                  </Typography>
                </div>
              </TableCell>
              <TableCell align="right">
                <Typography variant={"body1"}>
                  $ {row.value && formatMoney(row.value)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {row.asset.price && (
                  <>
                    <div>
                      <Typography variant={"body1"}>
                        {formatMoney(row.asset.price.value)}
                      </Typography>
                    </div>
                    {row.asset.price.relative_change_24h && (
                      <div>
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
              </TableCell>
              <TableCell align="right">
                {dbStatsData &&
                  (row.profit_percent && (
                    <>
                      <Typography
                        variant={"body1"}
                        color={row.profit_percent > 0 ? "primary" : "secondary"}
                      >
                        {formatMoney(row.profit_percent)} %
                      </Typography>
                      <Typography variant={"body1"}>
                        ($ {formatMoney(row.stats.avg_buy_price)})
                      </Typography>
                    </>
                  ),
                  row.profit_percent && (
                    <>
                      <Typography
                        variant={"body1"}
                        color={row.profit_percent > 0 ? "primary" : "secondary"}
                      >
                        {formatMoney(row.profit_percent)} %
                      </Typography>
                      <Typography variant={"body1"}>
                        ($ {formatMoney(row.stats.avg_buy_price)})
                      </Typography>
                    </>
                  ))}
                {!dbStatsData && (
                  <>
                    <CircularProgress />
                  </>
                )}
              </TableCell>
              <TableCell align="right">
                {row.stats && row.stats.total_returned && (
                  <>
                    <Typography
                      className={
                        row.stats.total_returned > 0
                          ? classes.profit_green
                          : classes.profit_red
                      }
                      variant={"body1"}
                    >
                      $ {row.stats.total_returned.toFixed(1)}
                    </Typography>
                    {row.stats.total_returned_net && (
                      <Typography
                        className={
                          row.stats.total_returned_net > 0
                            ? classes.profit_green
                            : classes.profit_red
                        }
                        variant={"body1"}
                      >
                        $ {row.stats.total_returned_net.toFixed(1)}
                      </Typography>
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          )}
          {row.type === "nonAssetGrouped" && (
            <TableRow
              hover={true}
              key={`${row.id}+${Math.random(0, 99999)}`}
              style={{ cursor: "pointer" }}
              onClick={() =>
                this.nav(
                  "/short/detective/" +
                    row.items[row.items.length - 1].asset.asset_code
                )
              }
            >
              <TableCell>
                {this.drawMultipleAssetIcons(row.icon_url, row.symbol)}
              </TableCell>
              <TableCell padding="none" align="left">
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
              </TableCell>
              <TableCell align="right">
                <div>
                  <Typography variant={"body1"}>
                    {row.quantityDecimals}
                  </Typography>
                </div>
                <div>
                  <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
                    {row.symbol.deposited[0]}
                  </Typography>
                </div>
              </TableCell>
              <TableCell align="right">
                <Typography variant={"body1"}>
                  $ {row.value && formatMoney(row.value)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {row.items.length > 1 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    style={{ display: "flex", minWidth: "max-content" }}
                    startIcon={<SearchIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({
                        stakingDetailsModal: true,
                        stakingDetails: row,
                      });
                    }}
                  >
                    Show Details
                  </Button>
                )}
              </TableCell>
              <TableCell align="right"></TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          )}
          {row.type === "uniswap-v2" && (
            <TableRow
              hover={true}
              key={`${row.id}+${Math.random(0, 99999)}`}
              style={{ cursor: "pointer" }}
              onClick={() =>
                this.nav("/short/detective/" + row.asset.asset_code)
              }
            >
              <TableCell>
                <div
                  style={{
                    width: "max-content",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    className={classes.tokenLogo}
                    alt=""
                    src={row.asset.icon_url}
                  />
                  <IconButton
                    style={{ marginLeft: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.getUniswapDetails(
                        row.asset.asset_code,
                        row.quantityDecimals
                      );
                    }}
                  >
                    {uniswapDetailsLoading && <CircularProgress />}
                    {!uniswapDetailsLoading && <SearchIcon />}
                  </IconButton>
                </div>
              </TableCell>
              <TableCell padding="none" align="left">
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
              </TableCell>
              <TableCell align="right">
                <div>
                  <Typography variant={"body1"}>
                    {formatMoney(row.quantityDecimals)}
                  </Typography>
                </div>
                <div>
                  <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
                    {row.asset.symbol}
                  </Typography>
                </div>
              </TableCell>
              <TableCell align="right">
                <Typography variant={"body1"}>
                  $ {row.value && formatMoney(row.value)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {row.asset.price && (
                  <>
                    <div>
                      <Typography variant={"body1"}>
                        {formatMoney(row.asset.price.value)}
                      </Typography>
                    </div>
                    {row.asset.price.relative_change_24h && (
                      <div>
                        <Typography
                          color={
                            row.asset.price.relative_change_24h > 0
                              ? "primary"
                              : "secondary"
                          }
                          variant={"subtitle2"}
                        >
                          {row.asset.price.relative_change_24h.toFixed(2)} % (${" "}
                          {(
                            ((row.asset.price.relative_change_24h *
                              row.asset.price.value) /
                              100) *
                            row.quantityDecimals
                          ).toFixed(2)}
                          )
                        </Typography>
                      </div>
                    )}
                  </>
                )}
              </TableCell>
              <TableCell align="right">
                {dbStatsData &&
                  (row.profit_percent && (
                    <>
                      <Typography
                        variant={"body1"}
                        color={row.profit_percent > 0 ? "primary" : "secondary"}
                      >
                        {formatMoney(row.profit_percent)} %
                      </Typography>
                      <Typography variant={"body1"}>
                        ($ {formatMoney(row.stats.avg_buy_price)})
                      </Typography>
                    </>
                  ),
                  row.profit_percent && (
                    <>
                      <Typography
                        variant={"body1"}
                        color={row.profit_percent > 0 ? "primary" : "secondary"}
                      >
                        {formatMoney(row.profit_percent)} %
                      </Typography>
                      <Typography variant={"body1"}>
                        ($ {formatMoney(row.stats.avg_buy_price)})
                      </Typography>
                    </>
                  ))}
                {!dbStatsData && (
                  <>
                    <CircularProgress />
                  </>
                )}
              </TableCell>
              <TableCell align="right">
                {row.stats && row.stats.total_returned && (
                  <>
                    <Typography
                      className={
                        row.stats.total_returned > 0
                          ? classes.profit_green
                          : classes.profit_red
                      }
                      variant={"body1"}
                    >
                      $ {row.stats.total_returned.toFixed(1)}
                    </Typography>
                    {row.stats.total_returned_net && (
                      <Typography
                        className={
                          row.stats.total_returned_net > 0
                            ? classes.profit_green
                            : classes.profit_red
                        }
                        variant={"body1"}
                      >
                        $ {row.stats.total_returned_net.toFixed(1)}
                      </Typography>
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ));
    }
  };

  changeAssetsPerPage = (event) => {
    let wallets = [];
    let newAssetsPerPage = event.target.value;

    this.setState({ assetsPerPage: newAssetsPerPage, loading: true });
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

  sparklineDataReturned = (payload) => {
    const { portfolioData } = this.state;
    if (payload[0] && payload[0].chain === "optimistic-ethereum") {
      payload[0].chain = "optimism";
    }
    if (payload[0]) {
      for (var i = 0; i < portfolioData.length; i++) {
        if (
          portfolioData[i].asset.asset_code === payload[0].asset_code ||
          portfolioData[i].asset.symbol === payload[0].symbol
        ) {
          portfolioData[i].sparklineData = payload[0].price;
          if (
            portfolioData[i].wallet === payload[0].wallet &&
            portfolioData[i].chain === payload[0].chain
          )
            portfolioData[i].hideStats = false;
        }
      }
    }
    this.setState({
      loadingStats: false,
      portfolioData: portfolioData,
    });
  };

  getAssetDetails = (data) => {
    const { portfolioData } = this.state;
    const vsCoin = store.getStore("vsCoin");
    if (data.hideStats === undefined || data.hideStats === true) {
      this.setState({
        loadingStats: true,
      });
      if (data.chain === "ethereum") {
        this._isMounted &&
          dispatcherZerion.dispatch({
            type: ZERION_GET_ASSETSTATS,
            wallet: data.wallet,
            asset: data.asset,
          });
        this._isMounted &&
          dispatcher.dispatch({
            type: GECKO_GET_SPARKLINE_FROM_CONTRACT,
            assetCodes: [data.asset.asset_code],
            vsCoin: vsCoin,
            wallet: [data.wallet],
          });
      } else if (data.stats && !data.hideStats) {
        const index = portfolioData.findIndex(
          (x) =>
            x.asset.asset_code === data.asset.asset_code &&
            x.wallet === data.wallet.toLowerCase()
        );
        portfolioData[index].hideStats = true;
        this.setState({
          portfolioData: portfolioData,
        });
      } else {
        this._isMounted &&
          dispatcher.dispatch({
            type: GECKO_GET_SPARKLINE_FROM_CONTRACT,
            assetCodes: [data.asset.implementations[data.chain].address],
            vsCoin: vsCoin,
            chain: [data.chain],
            tokenSymbol: [data.asset.symbol],
            wallet: [data.wallet],
          });
      }
    } else {
      const index = portfolioData.findIndex(
        (x) =>
          x.asset.asset_code === data.asset.asset_code &&
          x.wallet === data.wallet.toLowerCase() &&
          x.chain === data.chain
      );
      portfolioData[index].hideStats = true;
      this.setState({
        portfolioData: portfolioData,
      });
    }
  };

  modifyUserFavorites = (type, tokenData) => {
    if (type === "add") {
      console.log("adding");

      const account = store.getStore("account");
      const userAuth = store.getStore("userAuth");
      if (!userAuth && account && account.address) {
        dispatcher.dispatch({
          type: LOGIN,
          address: account.address,
        });
      }
      if (userAuth) {
        dispatcher.dispatch({
          type: DB_ADD_FAVORITE,
          content: tokenData,
          contractToken: true,
        });
        this.setState({
          isAddingFav: true,
        });
      }
    } else {
      console.log("removing");
      console.log(tokenData);
    }
  };

  drawAssets(assetsData) {
    const {
      sortOrder,
      sortBy,
      assetsPerPage,
      assetsPage,
      selectedWallet,
      walletColors,
      walletNicknames,
      dbStatsData,
      vsCoin,
      loadingStats,
    } = this.state;
    const { classes } = this.props;

    let sortedAssets = [];
    if (this.state.sortOrder === "asc") {
      sortedAssets = assetsData.sort(this.dynamicSort(sortBy));
    } else {
      sortedAssets = assetsData.sort(this.dynamicSort(`-${sortBy}`));
    }

    const assetPage = sortedAssets.slice(
      (assetsPage - 1) * assetsPerPage,
      assetsPerPage * assetsPage
    );

    const newMaxPages = Math.ceil(sortedAssets.length / assetsPerPage);
    if (newMaxPages !== this.state.maxPagesAssets) {
      this.setState({
        maxPagesAssets: newMaxPages,
      });
    }

    const isFavorite = async (token, tokenData) => {
      const userFavorites = store.getStore("userFavorites");
      if (userFavorites.includes(token.toLowerCase())) {
        return userFavorites.includes(token.toLowerCase());
      } else {
        //TODO FIX MATCH BETWEEN COINGECKO ID AND ZERION
        // console.log(token);
        // console.log("token not found by name");
        // console.log(tokenData);
        // console.log(userFavorites);
      }
    };

    let data;
    return assetPage.map((asset) => (
      <React.Fragment key={Math.random() + asset.id}>
        <Grid
          container
          id={`${
            asset.id +
            asset.wallet.substring(2, 5) +
            asset.wallet.substring(asset.wallet.length - 3, asset.wallet.length)
          }`}
          className={classes.assetGridRoot}
          direction="row"
          justify="flex-start"
          alignItems="center"
          onClick={() => this.nav("/short/detective/" + asset.asset.asset_code)}
        >
          <Card
            className={classes.assetCard}
            style={{
              borderRadius: asset.hideStats === false ? "20px 20px 0 0" : 20,
            }}
          >
            <CardActionArea
              style={{
                height: "inherit",
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
                    style={{ display: asset.asset.icon_url ? "" : "none" }}
                    alt=""
                    src={asset.asset.icon_url}
                  />
                </div>
              </Grid>
              <Grid
                padding="none"
                align="left"
                style={{
                  zIndex: 1,
                  margin: "0 10px 0 0",
                }}
              >
                {isFavorite(asset.asset.name, asset) ? (
                  <Tooltip
                    title={
                      <Typography color="inherit">
                        Remove from favorites
                      </Typography>
                    }
                  >
                    <IconButton
                      color="primary"
                      style={{
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => {
                        e.preventDefault();
                        const target = e.target.children[0];
                        if (target && e.target.children[0].childNodes[0]) {
                          e.target.children[0].childNodes[0].style.display =
                            "none";
                        }
                        if (target && e.target.children[0].childNodes[1]) {
                          e.target.children[0].childNodes[1].style.display =
                            "inline-block";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        const target = e.target.children[0];
                        if (target && e.target.children[0].childNodes[0]) {
                          e.target.children[0].childNodes[0].style.display =
                            "inline-block";
                        }
                        if (target && e.target.children[0].childNodes[1]) {
                          e.target.children[0].childNodes[1].style.display =
                            "none";
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.modifyUserFavorites("remove", asset);
                      }}
                    >
                      <StarRoundedIcon />
                      <StarHalfRoundedIcon style={{ display: "none" }} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip
                    title={
                      <Typography color="inherit">Add To favorites</Typography>
                    }
                  >
                    <IconButton
                      style={{
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => {
                        e.preventDefault();
                        const target = e.target.children[0];
                        if (target && e.target.children[0].childNodes[0]) {
                          e.target.children[0].childNodes[0].style.display =
                            "none";
                        }
                        if (target && e.target.children[0].childNodes[1]) {
                          e.target.children[0].childNodes[1].style.display =
                            "inline-block";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        const target = e.target.children[0];
                        if (target && e.target.children[0].childNodes[0]) {
                          e.target.children[0].childNodes[0].style.display =
                            "inline-block";
                        }
                        if (target && e.target.children[0].childNodes[1]) {
                          e.target.children[0].childNodes[1].style.display =
                            "none";
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.modifyUserFavorites("add", asset);
                      }}
                    >
                      <StarBorderRoundedIcon />
                      <StarHalfRoundedIcon style={{ display: "none" }} />
                    </IconButton>
                  </Tooltip>
                )}
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
                  <Typography
                    variant={"h3"}
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {asset.asset.name}
                  </Typography>
                </div>
                {selectedWallet === "all" && (
                  <div style={{ display: "flex" }}>
                    {walletColors[
                      walletColors
                        .map((e) => e.wallet)
                        .indexOf(asset.wallet.toLowerCase())
                    ] && (
                      <>
                        {this.drawChainIcon(asset.chain)}
                        <FiberManualRecordIcon
                          style={{
                            scale: 0.75,
                            color:
                              walletColors[
                                walletColors
                                  .map((e) => e.wallet)
                                  .indexOf(asset.wallet.toLowerCase())
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
                                  .indexOf(asset.wallet.toLowerCase())
                              ].color,
                          }}
                          variant={"subtitle2"}
                        >
                          at wallet:{" "}
                          {(data = walletNicknames.find(
                            (ele) => ele.wallet === asset.wallet
                          )) &&
                            data.nickname +
                              " (" +
                              asset.wallet.substring(0, 6) +
                              "..." +
                              asset.wallet.substring(
                                asset.wallet.length - 4,
                                asset.wallet.length
                              ) +
                              ")"}
                          {!walletNicknames.some(
                            (e) => e.wallet === asset.wallet
                          ) &&
                            asset.wallet.substring(0, 6) +
                              "..." +
                              asset.wallet.substring(
                                asset.wallet.length - 4,
                                asset.wallet.length
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
                        .indexOf(asset.wallet.toLowerCase())
                    ] && <>{this.drawChainIcon(asset.chain)}</>}
                  </div>
                )}
              </Grid>
              <Grid
                container
                direction={"row"}
                alignItems={"center"}
                style={{
                  marginLeft: "auto",
                }}
                align="right"
              >
                <Grid style={{ minWidth: 120 }}>
                  <Typography variant={"body1"} style={{ fontSize: 22 }}>
                    {formatMoney(asset.quantityDecimals)}
                  </Typography>
                  <Grid style={{ marginLeft: 10 }} align="right">
                    {asset.asset.price && (
                      <Typography variant={"subtitle2"}>
                        {getVsSymbol(this.state.vsCoin) +
                          " " +
                          formatMoney(asset.asset.price.value)}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                <Grid style={{ margin: "6px 0px auto 5px" }}>
                  <Typography style={{ opacity: 0.7 }} variant={"body1"}>
                    {asset.asset.symbol}
                  </Typography>
                </Grid>
                <Grid
                  style={{ marginLeft: "auto", marginRight: 10 }}
                  align="right"
                >
                  <Typography variant={"h3"} color="primary">
                    $ {asset.value && formatMoney(asset.value)}
                  </Typography>
                  {asset.asset.price && asset.asset.price.relative_change_24h && (
                    <div style={{ display: "flex", justifyContent: "end" }}>
                      {asset.asset.price.relative_change_24h > 0 && (
                        <ArrowDropUpRoundedIcon color="primary" size="small" />
                      )}
                      {asset.asset.price.relative_change_24h < 0 && (
                        <ArrowDropDownRoundedIcon
                          color="secondary"
                          size="small"
                        />
                      )}
                      <Typography
                        color={
                          asset.asset.price.relative_change_24h > 0
                            ? "primary"
                            : "secondary"
                        }
                        variant={"subtitle2"}
                      >
                        {asset.asset.price.relative_change_24h.toFixed(2)} % (
                        {getVsSymbol(vsCoin) +
                          " " +
                          (
                            ((asset.asset.price.relative_change_24h *
                              asset.asset.price.value) /
                              100) *
                            asset.quantityDecimals
                          ).toFixed(2)}
                        )
                      </Typography>
                    </div>
                  )}
                </Grid>
              </Grid>
              <Grid
                className={classes.showPyLBTN}
                onClick={(e) => {
                  e.stopPropagation();
                  this.getAssetDetails(asset);
                }}
              >
                {loadingStats && <CircularProgress size={25} />}
                {!loadingStats &&
                  (asset.hideStats === undefined ||
                    asset.hideStats === true) && <BarChartRoundedIcon />}
                {!loadingStats && asset.hideStats === false && (
                  <ArrowDropUpRoundedIcon />
                )}
              </Grid>
            </CardActionArea>
          </Card>
          {asset.hideStats === false && (
            <Card className={classes.assetCardDetails}>
              {asset.stats && (
                <>
                  {asset.profit_percent && (
                    <Grid align="left">
                      <>
                        <Typography
                          variant={"body1"}
                          color={
                            asset.profit_percent > 0 ? "primary" : "secondary"
                          }
                        >
                          current profit: {formatMoney(asset.profit_percent)} %
                        </Typography>
                        <Typography
                          variant={"body1"}
                          color={
                            asset.profit_percent > 0 ? "primary" : "secondary"
                          }
                        >
                          avg. buy Price: {getVsSymbol(vsCoin)}
                          {formatMoney(asset.stats.avg_buy_price)}
                        </Typography>
                      </>
                    </Grid>
                  )}
                  {asset.stats.total_returned && (
                    <Grid align="left">
                      <>
                        <Typography
                          className={
                            asset.stats.total_returned > 0
                              ? classes.profit_green
                              : classes.profit_red
                          }
                          variant={"body1"}
                        >
                          Total returned {getVsSymbol(vsCoin)}{" "}
                          {asset.stats.total_returned.toFixed(1)}
                        </Typography>
                        {asset.stats.total_returned_net && (
                          <Typography
                            className={
                              asset.stats.total_returned_net > 0
                                ? classes.profit_green
                                : classes.profit_red
                            }
                            variant={"body1"}
                          >
                            Returned - Fees: {getVsSymbol(vsCoin)}
                            {asset.stats.total_returned_net.toFixed(1)}
                          </Typography>
                        )}
                      </>
                    </Grid>
                  )}
                </>
              )}
              {!asset.stats && (
                <Grid align="left" style={{ width: "60%" }}>
                  {asset.chain === "ethereum" && (
                    <Skeleton
                      variant="rect"
                      width="60%"
                      height={"60px"}
                      style={{ borderRadius: 5 }}
                    />
                  )}
                  {asset.chain !== "ethereum" && (
                    <Grid align="left">
                      <>
                        <Typography variant={"body1"}>
                          Profit & Loss Stats for other networks
                        </Typography>
                        <Typography variant={"body1"}>
                          Coming Soon...
                        </Typography>
                      </>
                    </Grid>
                  )}
                </Grid>
              )}
              <Grid align="left">
                {asset.sparklineData && (
                  <SparklineChart id={asset.id} data={asset.sparklineData} />
                )}
                {!asset.sparklineData && (
                  <Skeleton
                    variant="rect"
                    width={"200px"}
                    height={"60px"}
                    style={{ borderRadius: 5 }}
                  />
                )}
              </Grid>
            </Card>
          )}
        </Grid>
      </React.Fragment>
    ));
  }

  changeNonAssetsPerPage = (event) => {
    let wallets = [];
    let newAssetsPerPage = event.target.value;

    this.setState({ nonAssetsPerPage: newAssetsPerPage });
  };

  changeNonAssetPage = (action) => {
    const { nonAssetsPage, nonAssetsPerPage } = this.state;

    let newPage;
    switch (action) {
      case "prev":
        newPage = nonAssetsPage - 1;
        this.setState({ nonAssetsPage: newPage });
        break;
      case "next":
        newPage = nonAssetsPage + 1;
        this.setState({ nonAssetsPage: newPage });

        break;
      default:
        break;
    }
  };

  changeUniV2AssetsPerPage = (event) => {
    let wallets = [];
    let newAssetsPerPage = event.target.value;

    this.setState({ uniV2AssetsPerPage: newAssetsPerPage });
  };

  changeUniV2AssetPage = (action) => {
    const { uniV2AssetsPage, uniV2AssetsPerPage, univ2Assets } = this.state;
    let uniAssets = [];

    for (var i = 0; i < univ2Assets.length; i++) {
      if (univ2Assets[i].value > 0.01) {
        uniAssets.push(univ2Assets[i]);
      }
    }

    let newPage;
    switch (action) {
      case "prev":
        newPage = uniV2AssetsPage - 1;
        this.setState({ uniV2AssetsPage: newPage });
        break;
      case "next":
        newPage = uniV2AssetsPage + 1;
        this.setState({ uniV2AssetsPage: newPage });

        break;
      default:
        break;
    }
  };

  drawNonAssets(nonAssetsData) {
    const {
      sortOrder,
      sortBy,
      nonAssetsPerPage,
      nonAssetsPage,
      walletNicknames,
      walletColors,
      selectedWallet,
      uniswapDetailsLoading,
      dbStatsData,
      vsCoin,
      loadingStats,
    } = this.state;
    const { classes } = this.props;

    var nonAssets = nonAssetsData.filter(function (el) {
      return el.quantity > 0;
    });

    let allNonAssets = [];

    let protocols = [];
    let protocolAssetsGrouped = {};
    nonAssets.forEach((item, i) => {
      if (protocols.indexOf(item.protocol) === -1) {
        protocols.push(item.protocol);
      }
    });

    protocols.forEach((item, i) => {
      var protocolItems = nonAssets.filter(function (el) {
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
          protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(asset);
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
          protocolAssetsGrouped[asset.name][asset.wallet]["items"].push(asset);
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
        allNonAssets.push(protocolAssetsGrouped[protocol][wallet]);
      }
    }

    let sortedAssets = [];
    if (this.state.sortOrder === "asc") {
      sortedAssets = allNonAssets.sort(this.dynamicSort(sortBy));
    } else {
      sortedAssets = allNonAssets.sort(this.dynamicSort(`-${sortBy}`));
    }

    const assetPage = sortedAssets.slice(
      (nonAssetsPage - 1) * nonAssetsPerPage,
      nonAssetsPerPage * nonAssetsPage
    );

    const newMaxPages = Math.ceil(sortedAssets.length / nonAssetsPerPage);
    if (this.state.maxPagesStaked !== newMaxPages) {
      this.setState({
        maxPagesStaked: newMaxPages,
      });
    }
    let data;
    return assetPage.map((row) => (
      <React.Fragment key={Math.random() + row.id}>
        {row.type === "nonAssetGrouped" && (
          <Grid
            container
            id={`${row.id + row.wallet.substring(2, 5) + "nonAsset"}`}
            className={classes.assetGridRoot}
            direction="row"
            justify="flex-start"
            alignItems="center"
            onClick={() =>
              this.nav("/short/detective/" + row.items[0].asset.asset_code)
            }
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
      </React.Fragment>
    ));
  }

  drawUniV2Assets(univ2Assets) {
    const {
      sortOrder,
      sortBy,
      uniV2AssetsPerPage,
      uniV2AssetsPage,
      walletNicknames,
      walletColors,
      selectedWallet,
      uniswapDetailsLoading,
      dbStatsData,
      vsCoin,
      loadingStats,
    } = this.state;
    const { classes } = this.props;

    let allNonAssets = [];

    for (var i = 0; i < univ2Assets.length; i++) {
      if (univ2Assets[i].value > 0.01) {
        allNonAssets.push(univ2Assets[i]);
      }
    }

    let sortedAssets = [];
    if (this.state.sortOrder === "asc") {
      sortedAssets = allNonAssets.sort(this.dynamicSort(sortBy));
    } else {
      sortedAssets = allNonAssets.sort(this.dynamicSort(`-${sortBy}`));
    }

    const newMaxPages = Math.ceil(sortedAssets.length / uniV2AssetsPerPage);
    if (this.state.maxPagesUniV2 !== newMaxPages) {
      this.setState({
        maxPagesUniV2: newMaxPages,
      });
    }

    const assetPage = sortedAssets.slice(
      (uniV2AssetsPage - 1) * uniV2AssetsPerPage,
      uniV2AssetsPerPage * uniV2AssetsPage
    );
    let data;
    return assetPage.map((row) => (
      <React.Fragment key={Math.random() + row.id}>
        {row.type === "uniswap-v2" && (
          <Grid
            container
            id={`${row.id + row.wallet.substring(2, 5) + "univ2"}`}
            className={classes.assetGridRoot}
            direction="row"
            justify="flex-start"
            alignItems="center"
            onClick={(e) => {
              this.getUniswapDetails(
                row.asset.asset_code,
                row.quantityDecimals
              );
            }}
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
                  <Grid className={classes.showPyLBTN}>
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

  sortBy(_sortBy) {
    let _prevSortBy = this.state.sortBy;
    if (_prevSortBy === _sortBy) {
      if (this.state.sortOrder === "asc") {
        this._isMounted &&
          this.setState({ sortBy: _sortBy, sortOrder: "desc" });
      } else {
        this._isMounted && this.setState({ sortBy: _sortBy, sortOrder: "asc" });
      }
    } else {
      this._isMounted && this.setState({ sortBy: _sortBy, sortOrder: "desc" });
    }
  }

  walletClicked = (wallet) => {
    if (Array.isArray(wallet)) {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_POSITIONS,
          wallet: wallet,
        });
      this.setState({
        selectedWallet: "all",
        dbDataLoaded: false,
        chartDataLoaded: false,
        portfolioStats: null,
        error: false,
        anchorWalletElement: null,
      });
    } else {
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_PORTFOLIO_POSITIONS,
          wallet: [wallet],
        });
      this.setState({
        selectedWallet: wallet,
        dbDataLoaded: false,
        chartDataLoaded: false,
        portfolioStats: null,
        error: false,
        anchorWalletElement: null,
      });
    }
  };

  expandContract = (currentState, section) => {
    if (section === "staked") {
      let newState = !currentState;
      var rotated = currentState;

      var expandContract = document.getElementById("expandContractStaked");
      var expandedContainer = document.getElementById(
        "expandedStakedItemsContainer"
      );

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

      this._isMounted &&
        this.setState({
          stakedAssetsExpanded: newState,
        });
    } else if (section === "assets") {
      let newState = !currentState;
      var rotated = currentState;

      var expandContract = document.getElementById("expandContractAssets");
      var expandedContainer = document.getElementById(
        "expandedAssetsItemsContainer"
      );

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

      this._isMounted &&
        this.setState({
          assetsExpanded: newState,
        });
    } else if (section === "univ2") {
      let newState = !currentState;
      var rotated = currentState;

      var expandContract = document.getElementById("expandContractUniV2");
      var expandedContainer = document.getElementById(
        "expandedUniV2ItemsContainer"
      );

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

      this._isMounted &&
        this.setState({
          univ2AssetsExpanded: newState,
        });
    }
  };

  handleClickWalletMenu = (event) => {
    event.currentTarget.focus();
    this.setState({ anchorWalletElement: event.currentTarget });
  };

  handleCloseWalletMenu = () => {
    this.setState({ anchorWalletElement: null });
  };

  //ARREGLAR ACA
  updateWallet = (wallets) => {
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO_POSITIONS,
        wallet: wallets,
      });
    this.setState({ dbDataLoaded: false });
  };

  renameWallet = (ev, wallet) => {
    ev.stopPropagation();
    ev.preventDefault();
    const data = this.state.walletNicknames.find(
      (ele) => ele.wallet === wallet
    );
    this.setState({
      walletNicknameModal: true,
      renamingWallet: wallet,
      oldNickname: data ? data.nickname : "",
      anchorWalletElement: null,
    });
    // this._isMounted &&
    //   dispatcher.dispatch({
    //     type: DB_GET_PORTFOLIO_POSITIONS,
    //     wallet: [wallet],
    //   });
  };

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
    this.setState({
      uniswapDetailsLoading: false,
      uniswapDetailsModal: true,
      uniswapDetails: uniswapAsset,
    });
  };

  toggleAddWallet = (type) => {
    let _addingWallet = this.state.addWallet;
    this.setState({
      addWallet: !_addingWallet,
      addWalletType: type,
      newWallet: "",
      anchorWalletElement: null,
    });
  };

  handleChange = (event) => {
    switch (event.target.id) {
      case "walletAdd":
        this.setState({ newWallet: event.target.value });
        this.setState({ errorWallet: false });
        dispatcher.dispatch({
          type: CHECK_ACCOUNT,
          content: event.target.value,
        });
        break;
      default:
        break;
    }
  };

  addWallet = (wallet) => {
    if (wallet) {
      dispatcher.dispatch({
        type: DB_ADD_WALLET,
        wallet: wallet,
      });
    } else {
      this.setState({ errorWallet: true, anchorWalletElement: null });
    }
  };

  checkAccountReturned = (_isAccount) => {
    if (!_isAccount) {
      this.setState({ errMsgWallet: "Not a valid ethereum address" });
      this.setState({ errorWallet: true });
    } else {
      this.setState({ errMsgWallet: "" });
      this.setState({ errorWallet: false });
    }
    this.setState({ errorAccount: !_isAccount });
  };

  dbWalletReturned = (payload) => {
    let userWallets = [];
    let walletColors = [];
    let watchlistWallets = [];

    payload.wallets.forEach((item, i) => {
      var x = i;
      userWallets.push(item.wallet);
      x %= Object.keys(colorsGuru).length;
      let data = {
        wallet: item.wallet.toLowerCase(),
        color: colorsGuru[Object.keys(colorsGuru)[x]],
      };
      walletColors.push(data);
    });

    payload.watchlistWallets.forEach((item, i) => {
      watchlistWallets.push(item.wallet);
    });

    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO_POSITIONS,
        wallet: userWallets,
      });

    this.setState({
      selectedWallet: "all",
      dbDataLoaded: false,
      chartDataLoaded: false,
      portfolioStats: null,
      userWallets,
      watchlistWallets,
      addWallet: false,
      walletColors: walletColors,
    });
  };

  //Send token data as data and type "win" / "lose"
  //Returns a list of items sorted by most profit / most loses
  drawWinnersLosers = (data, type) => {
    const { classes } = this.props;
    if (data.length > 0) {
      let filtered = [];
      if (type === "win") {
        for (var i = 0; i < data.length; i++) {
          if (data[i].stats) {
            if (data[i].stats.total_returned > 0) filtered.push(data[i]);
          }
        }
      } else {
        for (var j = 0; j < data.length; j++) {
          if (data[j].stats) {
            if (data[j].stats.total_returned < 0) filtered.push(data[j]);
          }
        }
      }

      return (
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch"
          key={type === "win" ? "winList" : "loseList"}
        >
          {filtered.map((row) => (
            <>
              <Grid
                item
                key={row.id}
                container
                direction="row"
                justify="space-between"
                align="center"
                className={classes.winLoseGrid}
                onClick={() => this.winLoseClick(row.asset_code)}
              >
                <Grid item>
                  <img
                    className={classes.tokenLogo}
                    alt=""
                    src={row.icon_url}
                  />
                </Grid>
                <Grid style={{ textAlign: "left" }} item>
                  <Typography color={type === "win" ? "primary" : "secondary"}>
                    {row.asset.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography color={type === "win" ? "primary" : "secondary"}>
                    {formatMoney(row.stats.total_returned)}
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
            </>
          ))}
        </Grid>
      );
    }
  };

  winLoseClick = (tokenName) => {
    this.nav(`/short/detective/${tokenName}`);
  };

  timeframeBTNClicked = (newTimeframe) => {
    if (this.state.selectedWallet === "all") {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: this.state.userWallets,
          timeframe: newTimeframe,
        });
    } else {
      this._isMounted &&
        dispatcherZerion.dispatch({
          type: ZERION_GET_ADDRESS_CHART,
          wallet: [this.state.selectedWallet],
          timeframe: newTimeframe,
        });
    }

    this.setState({ timeFrame: newTimeframe, chartDataLoaded: false });
  };

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

  render() {
    const { classes } = this.props;
    const {
      dbDataLoaded,
      portfolioData,
      portfolioChartData,
      sortBy,
      sortOrder,
      userWallets,
      watchlistWallets,
      walletNicknameModal,
      deleteWalletModal,
      error,
      addWallet,
      newWallet,
      chartDataLoaded,
      timeFrame,
      portfolioStats,
      stakingDetailsModal,
      uniswapDetailsModal,
      assetsData,
      nonAssetsData,
      univ2Assets,
      assetsPage,
      assetsPerPage,
      nonAssetsPage,
      nonAssetsPerPage,
      uniV2AssetsPage,
      uniV2AssetsPerPage,
      stakedAssetsExpanded,
      assetsExpanded,
      univ2AssetsExpanded,
      walletMenuOpen,
      walletNicknames,
      maxPagesUniV2,
      maxPagesAssets,
      maxPagesStaked,
      anchorWalletElement,
    } = this.state;

    const openWalletMenu = Boolean(anchorWalletElement);
    let data;
    return (
      <>
        <Card className={classes.favCard} elevation={3}>
          <Grid container direction="row" justify="flex-start">
            {!error && !dbDataLoaded && (
              <Grid
                item
                xs={12}
                style={{
                  textAlign: "center",
                  minWidth: "100%",
                  paddingBottom: "10px",
                }}
              >
                <Typography variant={"h4"}>Please give us a moment</Typography>
                <Typography variant={"h4"}>
                  while we prepare your portfolio data...
                </Typography>
                <Typography style={{ marginTop: "10px" }} variant={"h4"}>
                  (The first time on a wallet with lots of transactions
                </Typography>
                <Typography variant={"h4"}>
                  might take a couple of minutes to complete)
                </Typography>
                <LinearProgress style={{ marginTop: "10px" }} />
              </Grid>
            )}
            {dbDataLoaded && (
              <Grid
                container
                direction="column"
                justify="flex-start"
                style={{ height: "fit-content" }}
              >
                <Grid
                  id="topUI"
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="flex-start"
                  style={{ maxHeight: "500px", height: "500px" }}
                  spacing={1}
                >
                  <Grid
                    item
                    xs={12}
                    style={{ height: "100%", maxHeight: "100%" }}
                  >
                    <div className={classes.graphGrid}>
                      <Grid
                        container
                        item
                        justify="space-around"
                        alignItems="center"
                      >
                        {this.state.portfolioStats ? (
                          <Grid
                            item
                            xs={6}
                            style={{
                              textAlign: "center",
                              marginBottom: 5,
                              marginTop: 5,
                            }}
                            direction="row"
                            container
                            justify="flex-start"
                            alignItems="center"
                          >
                            <Typography
                              variant={"h3"}
                              style={{ marginLeft: 12 }}
                              color={"primary"}
                            >
                              Balance: ${" "}
                              {formatMoney(
                                this.state.portfolioStats.total_value
                              )}
                            </Typography>
                            <Tooltip
                              arrow
                              title={
                                <React.Fragment>
                                  {portfolioStats.assets_value > 0 && (
                                    <Typography color="inherit">
                                      Mainnet:{" "}
                                      {formatMoney(
                                        portfolioStats.assets_value -
                                          (portfolioStats.arbitrum_assets_value +
                                            portfolioStats.bsc_assets_value +
                                            portfolioStats.polygon_assets_value +
                                            portfolioStats.optimism_assets_value)
                                      )}
                                    </Typography>
                                  )}
                                  {portfolioStats.arbitrum_assets_value > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        marginBottom: 5,
                                      }}
                                    >
                                      <img
                                        src="/chainIcons/arbitrum.png"
                                        style={{
                                          maxWidth: 25,
                                          marginRight: 10,
                                        }}
                                      />
                                      <Typography color="inherit">
                                        Arbitrum:{" "}
                                        {formatMoney(
                                          portfolioStats.arbitrum_assets_value
                                        )}
                                      </Typography>
                                    </div>
                                  )}
                                  {portfolioStats.bsc_assets_value > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        marginBottom: 5,
                                      }}
                                    >
                                      <img
                                        src="/chainIcons/bsc.png"
                                        style={{
                                          maxWidth: 25,
                                          marginRight: 10,
                                        }}
                                      />
                                      <Typography color="inherit">
                                        BSC:{" "}
                                        {formatMoney(
                                          portfolioStats.bsc_assets_value
                                        )}
                                      </Typography>
                                    </div>
                                  )}
                                  {portfolioStats.optimism_assets_value > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        marginBottom: 5,
                                      }}
                                    >
                                      <img
                                        src="/chainIcons/optimism.png"
                                        style={{
                                          maxWidth: 25,
                                          marginRight: 10,
                                        }}
                                      />

                                      <Typography color="inherit">
                                        Optimism:{" "}
                                        {formatMoney(
                                          portfolioStats.optimism_assets_value
                                        )}
                                      </Typography>
                                    </div>
                                  )}
                                  {portfolioStats.polygon_assets_value > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        marginBottom: 5,
                                      }}
                                    >
                                      <img
                                        src="/chainIcons/polygon.png"
                                        style={{
                                          maxWidth: 25,
                                          marginRight: 10,
                                        }}
                                      />

                                      <Typography color="inherit">
                                        Polygon:{" "}
                                        {formatMoney(
                                          portfolioStats.polygon_assets_value
                                        )}
                                      </Typography>
                                    </div>
                                  )}
                                  {portfolioStats.deposited_value > 0 && (
                                    <Typography color="inherit">
                                      Deposited:{" "}
                                      {formatMoney(
                                        portfolioStats.deposited_value
                                      )}
                                    </Typography>
                                  )}
                                  {portfolioStats.locked_value > 0 && (
                                    <Typography color="inherit">
                                      Locked:{" "}
                                      {formatMoney(portfolioStats.locked_value)}
                                    </Typography>
                                  )}
                                  {portfolioStats.staked_value > 0 && (
                                    <Typography color="inherit">
                                      Staked:{" "}
                                      {formatMoney(portfolioStats.staked_value)}
                                    </Typography>
                                  )}
                                </React.Fragment>
                              }
                            >
                              <PieChartIcon style={{ marginLeft: 10 }} />
                            </Tooltip>
                          </Grid>
                        ) : !error ? (
                          <Skeleton
                            variant="rect"
                            width={"50%"}
                            height={"40px"}
                            style={{ borderRadius: 5 }}
                          />
                        ) : (
                          <Grid
                            style={{
                              borderRadius: 10,
                              width: "100%",
                              height: "60px",
                              background: "#5555",
                            }}
                            onClick={() => this.db_getPortfolioStats()}
                          >
                            <IconButton>
                              <ReplayIcon />
                            </IconButton>
                          </Grid>
                        )}
                        <Grid
                          item
                          xs={6}
                          style={{
                            textAlign: "center",
                            marginBottom: 5,
                            marginTop: 5,
                          }}
                          direction="row"
                          container
                          justify="flex-end"
                          alignItems="center"
                        >
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<AccountBalanceWalletRoundedIcon />}
                            endIcon={
                              walletMenuOpen ? (
                                <ArrowDropUpRoundedIcon />
                              ) : (
                                <ArrowDropDownRoundedIcon />
                              )
                            }
                            style={{ marginLeft: 10, marginRight: 12 }}
                            aria-label="user wallets"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={this.handleClickWalletMenu}
                          >
                            {this.state.selectedWallet === "all" && "Portfolio"}
                            {this.state.selectedWallet !== "all" &&
                              (data = walletNicknames.find(
                                (ele) =>
                                  ele.wallet === this.state.selectedWallet
                              )) &&
                              data.nickname +
                                " (" +
                                this.state.selectedWallet.substring(0, 6) +
                                "..." +
                                this.state.selectedWallet.substring(
                                  this.state.selectedWallet.length - 4,
                                  this.state.selectedWallet.length
                                ) +
                                ")"}
                            {this.state.selectedWallet !== "all" &&
                              !walletNicknames.some(
                                (e) => e.wallet === this.state.selectedWallet
                              ) &&
                              this.state.selectedWallet.substring(0, 6) +
                                "..." +
                                this.state.selectedWallet.substring(
                                  this.state.selectedWallet.length - 4,
                                  this.state.selectedWallet.length
                                )}
                          </Button>
                          <Menu
                            id="wallet-menu"
                            anchorEl={anchorWalletElement}
                            keepMounted
                            open={openWalletMenu}
                            onClose={this.handleCloseWalletMenu}
                            PaperProps={{
                              style: {
                                maxHeight: "400px",
                              },
                            }}
                          >
                            <div
                              style={{
                                paddingLeft: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <LabelIcon
                                  color="primary"
                                  fontSize="small"
                                  style={{ marginRight: 5 }}
                                />
                                <Typography
                                  color="primary"
                                  style={{
                                    paddingLeft: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  My Wallets
                                </Typography>
                              </div>
                              <div>
                                <Button
                                  startIcon={<AddCircleRoundedIcon />}
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    this.toggleAddWallet("portfolio")
                                  }
                                  style={{ marginRight: 12, marginBottom: 5 }}
                                >
                                  New
                                </Button>
                              </div>
                            </div>
                            <MenuItem
                              key={"all"}
                              selected={"all" === this.state.selectedWallet}
                              onClick={() => this.walletClicked(userWallets)}
                            >
                              Portfolio
                            </MenuItem>
                            {userWallets.map((wallet) => (
                              <MenuItem
                                key={wallet}
                                selected={wallet === this.state.selectedWallet}
                                onClick={() => this.walletClicked(wallet)}
                                style={{ justifyContent: "space-between" }}
                              >
                                {(data = walletNicknames.find(
                                  (ele) => ele.wallet === wallet
                                )) &&
                                  data.nickname +
                                    " (" +
                                    wallet.substring(0, 6) +
                                    "..." +
                                    wallet.substring(
                                      wallet.length - 4,
                                      wallet.length
                                    ) +
                                    ")"}
                                {!walletNicknames.some(
                                  (e) => e.wallet === wallet
                                ) &&
                                  wallet.substring(0, 6) +
                                    "..." +
                                    wallet.substring(
                                      wallet.length - 4,
                                      wallet.length
                                    )}
                                <div>
                                  <IconButton
                                    aria-label="rename"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.renameWallet(e, wallet);
                                    }}
                                  >
                                    <MoreHorizIcon />
                                  </IconButton>
                                  {this.state.account.address !== wallet && (
                                    <IconButton
                                      aria-label="remove"
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        this.removeWALLET(
                                          ev,
                                          wallet,
                                          "portfolio"
                                        );
                                      }}
                                    >
                                      <BackspaceRoundedIcon />
                                    </IconButton>
                                  )}
                                </div>
                              </MenuItem>
                            ))}
                            <div
                              style={{
                                paddingLeft: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <LabelIcon
                                  color="primary"
                                  fontSize="small"
                                  style={{ marginRight: 5 }}
                                />
                                <Typography
                                  color="primary"
                                  style={{
                                    paddingLeft: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  Watchlist
                                </Typography>
                              </div>
                              <div>
                                <Button
                                  startIcon={<AddCircleRoundedIcon />}
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    this.toggleAddWallet("watchlist")
                                  }
                                  style={{ marginRight: 12, marginBottom: 5 }}
                                >
                                  New
                                </Button>
                              </div>
                            </div>
                            {watchlistWallets.map((wallet) => (
                              <MenuItem
                                key={wallet}
                                selected={wallet === this.state.selectedWallet}
                                onClick={() => this.walletClicked(wallet)}
                                style={{ justifyContent: "space-between" }}
                              >
                                {(data = walletNicknames.find(
                                  (ele) => ele.wallet === wallet
                                )) &&
                                  data.nickname +
                                    " (" +
                                    wallet.substring(0, 6) +
                                    "..." +
                                    wallet.substring(
                                      wallet.length - 4,
                                      wallet.length
                                    ) +
                                    ")"}
                                {!walletNicknames.some(
                                  (e) => e.wallet === wallet
                                ) &&
                                  wallet.substring(0, 6) +
                                    "..." +
                                    wallet.substring(
                                      wallet.length - 4,
                                      wallet.length
                                    )}
                                <div>
                                  <IconButton
                                    aria-label="rename"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.renameWallet(e, wallet);
                                    }}
                                  >
                                    <MoreHorizIcon />
                                  </IconButton>
                                  {this.state.account.address !== wallet && (
                                    <IconButton
                                      aria-label="remove"
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        this.removeWALLET(
                                          ev,
                                          wallet,
                                          "watchlist"
                                        );
                                      }}
                                    >
                                      <BackspaceRoundedIcon />
                                    </IconButton>
                                  )}
                                </div>
                              </MenuItem>
                            ))}
                            <MenuItem
                              key="addNew"
                              onClick={() => this.toggleAddWallet("watchlist")}
                            >
                              <AddCircleRoundedIcon
                                style={{ marginRight: 5 }}
                                color="primary"
                              />
                              <Typography color="primary">
                                Add new Wallet
                              </Typography>
                            </MenuItem>
                          </Menu>
                        </Grid>
                        {this.state.portfolioStats && (
                          <Grid
                            item
                            container
                            justify="space-around"
                            style={{
                              backgroundColor: "rgba(125,125,125,0.2)",
                            }}
                          >
                            <Grid item>24Hs Change</Grid>
                            <Grid
                              item
                              style={{
                                color:
                                  this.state.portfolioStats
                                    .absolute_change_24h > 0
                                    ? colors.cgGreen
                                    : colors.cgRed,
                              }}
                            >
                              ${" "}
                              {formatMoney(
                                this.state.portfolioStats.absolute_change_24h
                              )}
                            </Grid>
                            <Grid
                              item
                              style={{
                                color:
                                  this.state.portfolioStats
                                    .relative_change_24h > 0
                                    ? colors.cgGreen
                                    : colors.cgRed,
                              }}
                            >
                              {formatMoney(
                                this.state.portfolioStats.relative_change_24h
                              )}
                              %
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                      {this.state.chartDataLoaded &&
                        this.state.chartVariation &&
                        this.state.timeFrame !== "d" && (
                          <Grid container item justify="space-around">
                            <Grid
                              item
                              container
                              justify="space-around"
                              style={{
                                backgroundColor: "rgba(125,125,125,0.2)",
                              }}
                            >
                              <Grid item>
                                {this.state.chartVariation.timeFrame}
                              </Grid>
                              <Grid
                                item
                                style={{
                                  color:
                                    this.state.chartVariation.differenceValue >
                                    0
                                      ? colors.cgGreen
                                      : colors.cgRed,
                                }}
                              >
                                ${" "}
                                {formatMoney(
                                  this.state.chartVariation.differenceValue
                                )}
                              </Grid>
                              <Grid
                                item
                                style={{
                                  color:
                                    this.state.chartVariation
                                      .differencePercent > 0
                                      ? colors.cgGreen
                                      : colors.cgRed,
                                }}
                              >
                                {formatMoney(
                                  this.state.chartVariation.differencePercent
                                )}
                                %
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      <Grid
                        item
                        container
                        justify="flex-end"
                        align="space-between"
                      >
                        {!error && !this.state.chartVariation && (
                          <Skeleton
                            variant="rect"
                            width={"100%"}
                            height={"20x"}
                            style={{ borderRadius: 5 }}
                          />
                        )}
                        {!error && chartDataLoaded && (
                          <PortfolioChart
                            height="375px"
                            data={portfolioChartData}
                          />
                        )}
                        {!error && !chartDataLoaded && (
                          <Skeleton
                            variant="rect"
                            width={"100%"}
                            height={"375px"}
                            style={{ borderRadius: 10 }}
                          />
                        )}
                        {error && !chartDataLoaded && (
                          <Grid
                            style={{
                              borderRadius: 10,
                              width: "100%",
                              height: "375px",
                              background: "#5555",
                            }}
                            onClick={() => this.db_getPortfolioChart()}
                          >
                            <IconButton>
                              <ReplayIcon />
                            </IconButton>
                          </Grid>
                        )}
                        {
                          // <Typography variant={"h4"}>
                          //   Balance: {this.state.portfolioBalance}
                          // </Typography>
                          // <Typography variant={"h4"}>
                          //   Profit/Loss: {this.state.portfolioProfit}
                          // </Typography>
                          // <Grid
                          //   style={{ marginTop: 10, minWidth: "100%" }}
                          //   container
                          //   direction="column"
                          //   justify="flex-start"
                          //   alignItems="stretch"
                          // >
                          //   <Grid
                          //   item
                          //   container
                          //   direction="row"
                          //   justify="space-around"
                          //   alignItems="center"
                          // >
                          //   <Grid item>Winners</Grid>
                          //   <Grid item>Losers</Grid>
                          // </Grid>
                          // <Divider />
                          // <Grid
                          //   direction="row"
                          //   item
                          //   container
                          //   spacing={3}
                          //   style={{ marginTop: 1 }}
                          // >
                          //   <Grid xs={6} item>
                          //     {this.drawWinnersLosers(this.state.winners, "win")}
                          //   </Grid>
                          //   <Grid item xs={6}>
                          //     {this.drawWinnersLosers(this.state.losers, "lose")}
                          //   </Grid>
                          // </Grid>
                          // </Grid>
                        }
                      </Grid>
                      <Grid
                        item
                        container
                        justify="space-around"
                        style={{
                          backgroundColor: "rgba(125,125,125,0.2)",
                          textAlign: "center",
                          height: "fit-content",
                          alignSelf: "end",
                        }}
                      >
                        <Grid
                          item
                          className={
                            timeFrame === "d"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("d")}
                          xs={3}
                        >
                          Day
                        </Grid>
                        <Grid
                          item
                          className={
                            timeFrame === "w"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("w")}
                          xs={3}
                        >
                          Week
                        </Grid>
                        <Grid
                          item
                          className={
                            timeFrame === "m"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("m")}
                          xs={3}
                        >
                          Month
                        </Grid>
                        <Grid
                          item
                          className={
                            timeFrame === "y"
                              ? classes.timeframeBTNSelected
                              : classes.timeframeBTN
                          }
                          onClick={() => this.timeframeBTNClicked("y")}
                          xs={3}
                        >
                          Year
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
                <Grid
                  id="BottomUI"
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="flex-start"
                  style={{ marginTop: 8 }}
                  spacing={1}
                >
                  {assetsData && (
                    <Grid
                      key="assetsGridRoot"
                      item
                      xs={12}
                      style={{ display: "grid" }}
                    >
                      <div className={classes.assetsGrid}>
                        <Grid
                          item
                          xs={12}
                          container
                          direction="row"
                          justify="space-between"
                        >
                          <Typography color="primary" variant={"h3"}>
                            Assets
                          </Typography>
                          <Grid
                            item
                            container
                            direction="row"
                            style={{ width: "auto" }}
                          >
                            {portfolioStats && (
                              <Typography
                                color="primary"
                                variant={"h3"}
                                style={{ marginRight: 5 }}
                              >
                                {getVsSymbol(this.state.vsCoin) +
                                  " " +
                                  formatMoney(
                                    portfolioStats.total_value -
                                      (portfolioStats.deposited_value +
                                        portfolioStats.locked_value +
                                        portfolioStats.staked_value)
                                  )}
                              </Typography>
                            )}
                            <IconButton
                              color="primary"
                              aria-label="Show Portfolio Data"
                              size="small"
                              onClick={() =>
                                this.expandContract(assetsExpanded, "assets")
                              }
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
                            className={
                              assetsExpanded ? classes.expand : classes.contract
                            }
                            id="expandContractAssets"
                            style={{ transition: "all 0.7s ease-in-out" }}
                          >
                            <div
                              id="expandedAssetsItemsContainer"
                              className={classes.itemContainer}
                            >
                              <Divider variant="middle" />
                              <Grid
                                item
                                xs={12}
                                style={{
                                  maxHeight: 500,
                                  height: "100%",
                                  overflowY: "auto",
                                  marginTop: 10,
                                  scrollbarColor:
                                    "rgb(121, 216, 162) rgba(48, 48, 48, 0.5)",
                                  paddingRight: 10,
                                  scrollbarWidth: "thin",
                                }}
                              >
                                {this.drawAssets(assetsData, assetsPage)}
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
                                <div className={classes.pageCounter}>
                                  {assetsPage}
                                </div>
                                <IconButton
                                  disabled={assetsPage === maxPagesAssets}
                                  onClick={() => this.changeAssetPage("next")}
                                >
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
                  )}
                  {nonAssetsData && (
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
                          <Typography color="primary" variant={"h3"}>
                            Staked Assets
                          </Typography>
                          <Grid
                            item
                            container
                            direction="row"
                            style={{ width: "auto" }}
                          >
                            {portfolioStats && (
                              <Typography
                                color="primary"
                                variant={"h3"}
                                style={{ marginRight: 5 }}
                              >
                                {getVsSymbol(this.state.vsCoin) +
                                  " " +
                                  formatMoney(
                                    portfolioStats.deposited_value +
                                      portfolioStats.locked_value +
                                      portfolioStats.staked_value
                                  )}
                              </Typography>
                            )}

                            <IconButton
                              color="primary"
                              aria-label="Show Portfolio Data"
                              size="small"
                              onClick={() =>
                                this.expandContract(
                                  stakedAssetsExpanded,
                                  "staked"
                                )
                              }
                            >
                              {
                                <ExpandMoreIcon
                                  className={
                                    stakedAssetsExpanded
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
                            className={
                              stakedAssetsExpanded
                                ? classes.expand
                                : classes.contract
                            }
                            id="expandContractStaked"
                            style={{ transition: "all 0.7s ease-in-out" }}
                          >
                            <div
                              id="expandedStakedItemsContainer"
                              className={classes.itemContainer}
                            >
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
                                {this.drawNonAssets(nonAssetsData)}
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
                                  disabled={nonAssetsPage === 1}
                                  onClick={() =>
                                    this.changeNonAssetPage("prev")
                                  }
                                >
                                  <KeyboardArrowLeftRoundedIcon />
                                </IconButton>
                                <div className={classes.pageCounter}>
                                  {nonAssetsPage}
                                </div>
                                <IconButton
                                  disabled={nonAssetsPage === maxPagesStaked}
                                  onClick={() =>
                                    this.changeNonAssetPage("next")
                                  }
                                >
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
                                    value={nonAssetsPerPage}
                                    onChange={this.changeNonAssetsPerPage}
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
                  )}
                  {univ2Assets && (
                    <Grid
                      item
                      xs={12}
                      key="Univ2GridRoot"
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
                          <Typography color="primary" variant={"h3"}>
                            Uniswap LP Assets
                          </Typography>
                          <Grid
                            item
                            container
                            direction="row"
                            style={{ width: "auto" }}
                          >
                            {this.drawTotalValue(univ2Assets)}

                            <IconButton
                              color="primary"
                              aria-label="Show Portfolio Data"
                              size="small"
                              onClick={() =>
                                this.expandContract(
                                  univ2AssetsExpanded,
                                  "univ2"
                                )
                              }
                            >
                              {
                                <ExpandMoreIcon
                                  className={
                                    univ2AssetsExpanded
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
                            className={
                              univ2AssetsExpanded
                                ? classes.expand
                                : classes.contract
                            }
                            id="expandContractUniV2"
                            style={{ transition: "all 0.7s ease-in-out" }}
                          >
                            <div
                              id="expandedUniV2ItemsContainer"
                              className={classes.itemContainer}
                            >
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
                                {this.drawUniV2Assets(univ2Assets)}
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
                                  disabled={uniV2AssetsPage === 1}
                                  onClick={() =>
                                    this.changeUniV2AssetPage("prev")
                                  }
                                >
                                  <KeyboardArrowLeftRoundedIcon />
                                </IconButton>
                                <div className={classes.pageCounter}>
                                  {uniV2AssetsPage}
                                </div>
                                <IconButton
                                  disabled={uniV2AssetsPage === maxPagesUniV2}
                                  onClick={() =>
                                    this.changeUniV2AssetPage("next")
                                  }
                                >
                                  <KeyboardArrowRightRoundedIcon />
                                </IconButton>
                                <FormControl
                                  variant="outlined"
                                  className={classes.formControl}
                                >
                                  <InputLabel id="select-outlined-label">
                                    per page
                                  </InputLabel>
                                  <Select
                                    labelId="univ2assetsPerPage-Select-label"
                                    id="univ2assetsPerPage-Select-outlined"
                                    value={uniV2AssetsPerPage}
                                    onChange={this.changeUniV2AssetsPerPage}
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
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>
        </Card>
        {uniswapDetailsModal &&
          this.renderUniswapDetailsModal(
            this.state.uniswapDetails,
            this.state.uniswapDetailsBalance
          )}
        {stakingDetailsModal &&
          this.renderstakingDetailsModal(this.state.stakingDetails)}
        {walletNicknameModal && this.renderWalletNicknameModal()}
        {deleteWalletModal &&
          this.renderWalletDeleteModal(
            this.state.removeWALLET[0],
            this.state.deleteType
          )}
        {addWallet && this.renderWalletAddModal(this.state.addWalletType)}
      </>
    );
  }

  //
  //

  nav = (screen) => {
    this.props.history.push(screen);
  };

  closeModalNick = () => {
    this.setState({ walletNicknameModal: false });
  };

  closeModalDelete = () => {
    this.setState({ deleteWalletModal: false });
  };

  closeModalAdd = () => {
    this.setState({ addWallet: false });
  };

  closeModalStakingDetails = () => {
    this.setState({ stakingDetailsModal: false });
  };

  closeModalUniswapDetails = () => {
    this.setState({ uniswapDetailsModal: false });
  };

  renderWalletNicknameModal = (wallet, nickname) => {
    return (
      <WalletNicknameModal
        closeModal={this.closeModalNick}
        modalOpen={this.state.walletNicknameModal}
        wallet={this.state.renamingWallet}
        nickname={this.state.oldNickname}
      />
    );
  };

  renderWalletDeleteModal = (wallet, walletType) => {
    return (
      <WalletRemoveModal
        closeModal={this.closeModalDelete}
        modalOpen={this.state.deleteWalletModal}
        wallet={wallet}
        nickname={this.state.removeWALLET[1]}
        type={walletType}
      />
    );
  };

  renderWalletAddModal = (wallet) => {
    return (
      <WalletAddModal
        closeModal={this.closeModalAdd}
        modalOpen={this.state.addWallet}
        type={this.state.addWalletType}
      />
    );
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

export default withRouter(withStyles(styles)(PortfolioBig));
