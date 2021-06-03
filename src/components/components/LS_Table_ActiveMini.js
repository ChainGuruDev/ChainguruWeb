//Table component to draw the active Long&Short

import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

//Import MaterialUI elements
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableFooter,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Paper,
  Button,
  ButtonGroup,
  CircularProgress,
} from "@material-ui/core";

//IMPORT icons
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";

//Import Constants
import {
  COINGECKO_POPULATE_FAVLIST,
  COINGECKO_POPULATE_FAVLIST_RETURNED,
  DB_CHECK_LS_RESULT,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    backgroundColor: "rgba(255, 255, 255, 0.0)",
    maxHeight: "440",
  },
  tokenLogo: {
    maxHeight: 45,
  },
  footer: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
  table: {
    display: "table",
  },
});

class LSTableActiveMini extends Component {
  constructor(props) {
    super();

    // console.log(props.data);

    //Get tokenIDs of active Long&Shorts to get data from CoinGecko
    let tokenIDs = [];
    props.data.forEach((item, i) => {
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
    this.state = {
      tokenIDs: tokenIDs,
      lsData: props.data,
      page: 0,
      rows: 5,
      rowsPerPage: 5,
      sortBy: "voteEnding",
      sortOrder: "asc",
      sortData: [],
      formatedRows: [],
      loadingResult: false,
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
      return hours + " Hrs";
    } else {
      return days + " Days";
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

  checkResult = (id) => {
    this.setState({ loadingResult: true });
    dispatcher.dispatch({
      type: DB_CHECK_LS_RESULT,
      tokenID: id,
    });
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
        <TableRow hover={true} key={row.name}>
          <TableCell
            style={{
              cursor: "pointer",
              padding: "0px 0px",
              textAlign: "center",
              width: "0px",
            }}
            onClick={() => this.detective(row.id)}
          >
            <img
              className={classes.tokenLogo}
              alt="coin-icon"
              src={row.image}
            />
          </TableCell>
          <TableCell
            style={{ cursor: "pointer" }}
            onClick={() => this.detective(row.id)}
            align="left"
          >
            <Typography variant={"h4"} onClick={() => this.detective(row.id)}>
              {row.name}
            </Typography>
            <Typography variant="subtitle1">{row.symbol}</Typography>
          </TableCell>
          <TableCell align="right" style={{ padding: "10px 0px" }}>
            <Typography variant={"subtitle2"}>price Start</Typography>
            <Typography variant={"h4"}>{row.priceStart}</Typography>
            <Typography variant={"subtitle2"}>current price</Typography>
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
              {row.current_price}
            </Typography>
          </TableCell>
          <TableCell style={{ padding: "10px 10px" }} align="center">
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
                startIcon={<AssignmentTurnedInIcon />}
                variant="outlined"
                onClick={() => this.checkResult(row.id)}
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
          </TableCell>
        </TableRow>
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

  detective = (id) => {
    this.nav("/short/detective/" + id);
  };

  TablePaginationActions = (props) => {
    const { classes } = this.props;
    const { formatedRows, page, rowsPerPage } = this.state;
    const count = formatedRows.length;

    const handleFirstPageButtonClick = (event) => {
      this.setState({ page: 0 });
    };

    const handleBackButtonClick = (event) => {
      // console.log(event);
      // console.log(count);
      this.setState({ page: page - 1 });
    };

    const handleNextButtonClick = (event) => {
      this.setState({ page: page + 1 });
    };

    const handleLastPageButtonClick = (event) => {
      this.setState({ page: Math.max(0, Math.ceil(count / rowsPerPage) - 1) });
    };

    return (
      <div className={classes.footer}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {<FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {<KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {<KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {<LastPageIcon />}
        </IconButton>
      </div>
    );
  };

  render() {
    const { classes } = this.props;
    const { sortData, page, rowsPerPage, formatedRows } = this.state;

    const handleChangePage = (newPage) => {
      console.log(newPage);
      this.setState({ page: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
      this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 });
    };

    return (
      <TableContainer
        className={classes.root}
        component={Paper}
        elevation={2}
        size="small"
      >
        <Table className={classes.table} aria-label="favoritesList">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography color="primary" variant="h4">
                  Active
                </Typography>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          {sortData && <TableBody>{this.sortedList(sortData)}</TableBody>}
        </Table>
      </TableContainer>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(
  withRouter(withStyles(styles)(LSTableActiveMini))
);
