//Table component to draw the active Long&Short

import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

import { formatMoney } from "../helpers";

//Import MaterialUI elements
import {
  Grid,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Divider,
} from "@material-ui/core";

//IMPORT icons
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";

//Import Constants
import {
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
  DB_CHECK_LS_RESULT,
  GECKO_GET_PRICE_AT_DATE,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    backgroundColor: "rgba(255, 255, 255, 0.0)",
  },
  tokenLogo: {
    maxHeight: 45,
  },
  footer: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
  row: {
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.05)",
    },
  },
  header: {
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.05)",
    },
    padding: "12px",
  },
});

class LSTableActiveMini extends Component {
  constructor(props) {
    super();

    // console.log(props.data);

    //Get tokenIDs of active Long&Shorts to get data from CoinGecko
    let tokenIDs = [];
    let completedLS = [];
    const dateNow = new Date(Date.now());

    props.data.forEach((item, i) => {
      tokenIDs.push(item.tokenID);
      //SWITCH TO >
      if (dateNow.getTime() > new Date(item.voteEnding).getTime()) {
        completedLS.push(item);
      }
    });

    if (completedLS.length > 0) {
      dispatcher.dispatch({
        type: GECKO_GET_PRICE_AT_DATE,
        completedLS: completedLS,
        versus: "usd",
      });
    }

    // console.log(tokenIDs);
    if (tokenIDs.length > 0) {
      dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: tokenIDs,
        versus: "usd",
      });
    }
    this.state = {
      tokenIDs: tokenIDs,
      lsData: props.data,
      sortBy: "voteEnding",
      sortOrder: "asc",
      sortData: [],
      formatedRows: [],
      loadingResult: false,
      show: false,
    };
  }

  //TODO PROPS LS DATA UPDATED update toknIDS state and geckofavData from newids

  componentDidMount() {
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoDataReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoDataReturned
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.props.data.forEach((item, i) => {
        if (!item.priceClosing) {
          let index = prevProps.data
            .map(function (e) {
              return e.tokenID;
            })
            .indexOf(item.tokenID);

          if (prevProps.data[index] && prevProps.data[index].priceClosing) {
            item.priceClosing = prevProps.data[index].priceClosing;
          }
        }
      });

      let tokenIDs = [];
      this.props.data.forEach((item, i) => {
        tokenIDs.push(item.tokenID);
      });
      // console.log(tokenIDs);
      if (tokenIDs.length > 0) {
        dispatcher.dispatch({
          type: COINGECKO_POPULATE_FAVLIST,
          tokenIDs: tokenIDs,
          versus: "usd",
        });
      }
      this.setState({
        lsData: this.props.data,
      });
    }
  }

  createData = (
    image,
    name,
    id,
    symbol,
    current_price,
    priceStart,
    priceClosing,
    vote,
    voteEnding,
    timeRemaining,
    percentComplete
  ) => {
    return {
      image,
      name,
      id,
      symbol,
      current_price,
      priceStart,
      priceClosing,
      vote,
      voteEnding,
      timeRemaining,
      percentComplete,
    };
  };

  timeConversion = (millisec) => {
    var seconds = (millisec / 1000).toFixed(1);

    var minutes = (millisec / (1000 * 60)).toFixed(1);

    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) {
      return seconds + " Sec";
    } else if (minutes < 60) {
      return minutes + " Min";
    } else if (hours < 24) {
      if (hours <= 1) {
        return hours + " Hr";
      } else {
        return hours + " Hrs";
      }
    } else {
      if (days <= 1) {
        return days + " Day";
      } else {
        return days + " Days";
      }
    }
  };

  timeRemaining = (voteEnding) => {
    let dateEnd = new Date(voteEnding);
    let dateNow = new Date();
    let remaining = dateEnd - dateNow;
    // let timeLimit = 12 * 60 * 60 * 1000; // 12hs for beta testing
    let timeLimit = 24 * 60 * 60 * 1000; // 24hs for release
    // console.log(dateEnd);
    let percentComplete = 0;
    if (remaining <= 0) {
      percentComplete = 100;
    } else {
      percentComplete = ((timeLimit - remaining) / timeLimit) * 100;
    }
    let timeRemaining = 0;
    if (remaining <= 0) {
      timeRemaining = 0;
    } else {
      timeRemaining = this.timeConversion(remaining);
    }
    return [timeRemaining, percentComplete];
  };

  geckoDataReturned = (data) => {
    if (data[1] !== "complete") {
      // Create array with items to sort later in table
      let sort = [];
      //MERGE DATA FROM COINGECKO TOKENS and our DB LS positions
      const { lsData } = this.state;
      //MATCH DBs FROM TOKEN IDS
      data.forEach((item, i) => {
        let index = lsData
          .map(function (e) {
            return e.tokenID;
          })
          .indexOf(item.id);

        let timeRemaining = this.timeRemaining(lsData[index].voteEnding);

        let sortData = this.createData(
          item.image,
          item.name,
          item.id,
          item.symbol,
          item.current_price,
          lsData[index].priceStart,
          lsData[index].priceClosing,
          lsData[index].vote,
          lsData[index].voteEnding,
          timeRemaining[0],
          timeRemaining[1]
        );
        sort.push(sortData);
      });
      this.setState({ sortData: sort, coinData: data, loadingResult: false });
    }
  };

  checkResult = (event, id) => {
    if (event.target.id !== "row") {
      event.stopPropagation = true;
      event.preventDefault = true;
      this.setState({ loadingResult: true });
      dispatcher.dispatch({
        type: DB_CHECK_LS_RESULT,
        tokenID: id,
      });
    }
  };

  detective = (event, id) => {
    if (event.target.id === "row") {
      let timeframe = "short";
      if (this.props.match.path.includes("medium")) {
        timeframe = "medium";
      } else if (this.props.match.path.includes("long")) {
        timeframe = "long";
      }

      event.stopPropagation = true;
      event.preventDefault = true;
      this.nav(`/${timeframe}/detective/${id}`);
    }
  };

  sortedList = (rowData) => {
    const { classes } = this.props;
    const { sortBy, sortOrder, rowsPerPage, page, formatedRows } = this.state;

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
          item.current_price,
          item.priceStart,
          item.priceClosing,
          item.vote,
          item.voteEnding,
          item.timeRemaining,
          item.percentComplete
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
          item.current_price,
          item.priceStart,
          item.priceClosing,
          item.vote,
          item.voteEnding,
          item.timeRemaining,
          item.percentComplete
        );
        newRows.push(_rowData);
      });
    }

    if (newRows.length >= 1) {
      if (newRows.length !== formatedRows.length) {
        this.setState({ formatedRows: newRows });
      }
      return (rowsPerPage > 0
        ? newRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : newRows
      ).map((row) => (
        <Grid
          key={row.name}
          item
          container
          justify="space-between"
          onClick={(event) => {
            this.detective(event, row.id);
          }}
          className={classes.row}
          id={"row"}
        >
          <Divider style={{ width: "100%" }} />
          <Grid
            item
            style={{
              marginRight: "10px",
              textAlign: "center",
              alignSelf: "center",
              pointerEvents: "none",
            }}
          >
            <img
              className={classes.tokenLogo}
              alt="coin-icon"
              src={row.image}
            />
          </Grid>
          <Grid
            item
            style={{ alignSelf: "center", pointerEvents: "none" }}
            align="left"
          >
            <Typography variant={"h4"}>{row.name}</Typography>
            <Typography variant="subtitle1">{row.symbol}</Typography>
          </Grid>
          <Grid
            item
            align="right"
            style={{
              padding: "10px 0px",
              marginRight: "0px",
              marginLeft: "auto",
              pointerEvents: "none",
            }}
          >
            <Typography variant={"subtitle2"}>price Start</Typography>
            <Typography variant={"h4"}>
              {formatMoney(row.priceStart)}
            </Typography>
            <Typography variant={"subtitle2"}>current price</Typography>
            {row.percentComplete >= 100 ? (
              <Typography
                variant={"h4"}
                color={
                  row.priceClosing > row.priceStart && row.vote
                    ? "primary"
                    : row.priceClosing > row.priceStart && !row.vote
                    ? "secondary"
                    : row.priceClosing < row.priceStart && !row.vote
                    ? "primary"
                    : "secondary"
                }
              >
                {row.priceClosing ? (
                  formatMoney(row.priceClosing)
                ) : (
                  <CircularProgress />
                )}
              </Typography>
            ) : (
              <Typography
                variant={"h4"}
                color={
                  row.current_price > row.priceStart && row.vote
                    ? "primary"
                    : row.current_price > row.priceStart && !row.vote
                    ? "secondary"
                    : row.current_price < row.priceStart && !row.vote
                    ? "primary"
                    : "secondary"
                }
              >
                {formatMoney(row.current_price)}
              </Typography>
            )}
          </Grid>
          <Grid
            item
            style={{
              alignSelf: "center",
              marginRight: "0px",
              marginLeft: "10px",
            }}
            align="center"
          >
            {row.percentComplete < 100 && (
              <>
                <Typography variant={"subtitle2"} style={{ marginRight: 10 }}>
                  {row.timeRemaining}
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={row.percentComplete}
                />
              </>
            )}
            {row.percentComplete >= 100 && !this.state.loadingResult && (
              <Button
                id="checkBTN"
                startIcon={<AssignmentTurnedInIcon />}
                variant="outlined"
                onClick={(event) => this.checkResult(event, row.id)}
                color="primary"
              >
                Results
              </Button>
            )}
            {row.percentComplete >= 100 && this.state.loadingResult && (
              <Button disabled variant="outlined">
                <CircularProgress />
              </Button>
            )}
          </Grid>
        </Grid>
      ));
    }
  };

  sortBy(_sortBy) {
    let _prevSortBy = this.state.sortBy;
    if (_prevSortBy === _sortBy) {
      if (this.state.sortOrder === "asc") {
        this.setState({ sortBy: _sortBy, sortOrder: "dsc" });
      } else {
        this.setState({ sortBy: _sortBy, sortOrder: "asc" });
      }
    } else {
      this.setState({ sortBy: _sortBy, sortOrder: "dsc" });
    }
  }

  render() {
    const { classes } = this.props;
    const { sortData, formatedRows, show } = this.state;

    const handleActiveShow = (event) => {
      const newActive = !show;
      this.setState({ show: newActive });
    };

    return (
      <Grid container className={classes.root} aria-label="favoritesList">
        <Grid
          item
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.header}
          onClick={handleActiveShow}
        >
          <Grid item>
            <Typography color="primary" variant="h4">
              Active
            </Typography>
          </Grid>
          <Grid item style={{ textAlign: "end" }}>
            {show && (
              <IconButton disabled={formatedRows.length === 0}>
                {<ArrowDropUpRoundedIcon />}
              </IconButton>
            )}
            {!show && (
              <IconButton onClick={handleActiveShow}>
                {<ArrowDropDownRoundedIcon />}
              </IconButton>
            )}
          </Grid>
        </Grid>
        {sortData && show && (
          <Grid item container>
            {this.sortedList(sortData)}
          </Grid>
        )}
      </Grid>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(
  withRouter(withStyles(styles)(LSTableActiveMini))
);
