import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import { formatMoney, formatMoneyMCAP, getVsSymbol } from "../helpers";

import {
  CircularProgress,
  Grid,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";

import {
  DB_USERDATA_RETURNED,
  SWITCH_VS_COIN_RETURNED,
  DB_GET_NFTS,
  DB_GET_NFTS_RETURNED,
  DB_GET_NFTS_VALUE,
  DB_GET_NFTS_VALUE_RETURNED,
} from "../../constants";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import NFTCarousel from "./nftCarousel.js";
import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {},
  nftAssetsGrid: {
    borderColor: "#777",
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    padding: "10px",
    background: `#9991`,
    minHeight: "100%",
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

class NFTPortfolio extends Component {
  constructor(props) {
    super();

    let vs = store.getStore("vsCoin");
    let userWallets = store.getStore("userWallets");

    this.state = {
      vsCoin: vs,
      expanded: false,
      userWallets: userWallets,
      nftValueType: "floor_price",
      nftTotalValue: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(DB_GET_NFTS_VALUE_RETURNED, this.dbGetNftValueReturned);
    emitter.on(DB_GET_NFTS_RETURNED, this.dbGetNftsReturned);
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_NFTS_VALUE,
        addresses: this.state.userWallets,
        value_type: this.state.nftValueType,
      });
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_NFTS,
        addresses: this.state.userWallets,
      });
  }

  componentWillUnmount() {
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.removeListener(DB_GET_NFTS_RETURNED, this.dbGetNftsReturned);
    emitter.removeListener(
      DB_GET_NFTS_VALUE_RETURNED,
      this.dbGetNftValueReturned
    );

    this._isMounted = false;
  }

  vsCoinReturned = (vsCoin) => {
    this.setState({ vsCoin: vsCoin });
  };

  dbUserDataReturned = (data) => {
    console.log(data);
  };

  dbGetNftValueReturned = (data) => {
    this.setState({
      nftTotalValue: data["nft-total-value"],
    });
  };

  dbGetNftsReturned = (nfts) => {
    this.setState({
      nftData: nfts,
    });
  };

  sortedList = (rowData) => {
    const { classes } = this.props;
    const {
      sortBy,
      sortOrder,
      rowsPerPage,
      page,
      formatedRows,
      isDeleting,
      vsCoin,
    } = this.state;

    function dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

        return result * sortOrder;
      };
    }
    let sortedRows;
    let newRows = [];
    if (sortOrder === "asc") {
      sortedRows = rowData.sort(dynamicSort(sortBy));
      sortedRows.forEach((item, i) => {
        let _rowData = this.createData(
          item.image,
          item.name,
          item.id,
          item.symbol,
          formatMoney(item.current_price),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          formatMoneyMCAP(item.market_cap, 0),
          parseFloat(item.market_cap_change_percentage_24h).toFixed(2),
          item.sparkline_in_7d
        );
        newRows.push(_rowData);
      });
    } else {
      sortedRows = rowData.sort(dynamicSort(`-${sortBy}`));
      sortedRows.forEach((item, i) => {
        let _rowData = this.createData(
          item.image,
          item.name,
          item.id,
          item.symbol,
          formatMoney(item.current_price),
          parseFloat(item.price_change_percentage_1h_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_24h).toFixed(2),
          parseFloat(item.price_change_percentage_7d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_30d_in_currency).toFixed(2),
          parseFloat(item.price_change_percentage_1y_in_currency).toFixed(2),
          formatMoneyMCAP(item.market_cap, 0),
          parseFloat(item.market_cap_change_percentage_24h).toFixed(2),
          item.sparkline_in_7d
        );
        newRows.push(_rowData);
      });
    }

    if (newRows.length >= 1) {
      // if (newRows.length !== formatedRows.length) {
      //   this.setState({ formatedRows: newRows });
      // }
      return (rowsPerPage > 0
        ? newRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : newRows
      ).map((row) => <div>row</div>);
    }
  };

  sortBy(_sortBy) {
    let _prevSortBy = this.state.sortBy;
    if (_prevSortBy === _sortBy) {
      if (this.state.sortOrder === "asc") {
        this.setState({ sortBy: _sortBy, sortOrder: "desc" });
      } else {
        this.setState({ sortBy: _sortBy, sortOrder: "asc" });
      }
    } else {
      this.setState({ sortBy: _sortBy, sortOrder: "desc" });
    }
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  expandContract = (currentState) => {
    let newState = !currentState;
    var rotated = currentState;

    var expandContract = document.getElementById("expandContractNft");
    var expandedContainer = document.getElementById(
      "expandedNFTItemsContainer"
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
        expanded: newState,
      });
  };

  drawNFTs = (userNfts) => {
    return;
  };

  render() {
    const { classes } = this.props;
    const { vsCoin, expanded, nftTotalValue, nftData } = this.state;

    return (
      <Grid
        item
        xs={12}
        key="NFTGridRoot"
        style={{ display: "grid", minHeight: "100%" }}
      >
        <div className={classes.nftAssetsGrid}>
          <Grid item xs={12} container direction="row" justify="space-between">
            <Typography color="primary" variant={"h3"}>
              NFTs
            </Typography>
            <Grid item container direction="row" style={{ width: "auto" }}>
              <Typography
                color="primary"
                variant={"h3"}
                style={{ marginRight: 5 }}
              >
                {getVsSymbol(this.state.vsCoin) +
                  " " +
                  formatMoney(nftTotalValue)}
              </Typography>
              <IconButton
                color="primary"
                aria-label="Show Portfolio Data"
                size="small"
                onClick={() => this.expandContract(expanded)}
              >
                {
                  <ExpandMoreIcon
                    className={
                      expanded ? classes.expandIcon : classes.unexpandIcon
                    }
                    id="expandIcon"
                  />
                }
              </IconButton>
            </Grid>
          </Grid>
          <Grid style={{ overflow: "hidden", padding: "1px" }}>
            <Grid
              className={expanded ? classes.expand : classes.contract}
              id="expandContractNft"
              style={{ transition: "all 0.7s ease-in-out" }}
            >
              <div
                id="expandedNFTItemsContainer"
                className={classes.itemContainer}
              >
                <NFTCarousel galleryItems={nftData} />
              </div>
            </Grid>
          </Grid>
        </div>
      </Grid>
    );
  }
}
export default withRouter(withStyles(styles)(NFTPortfolio));
