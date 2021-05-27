//KEY.ID de los rows cambiar por el ID de la votacion de la DB

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
    maxHeight: 30,
  },
  footer: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
});

class LSTableHistory extends Component {
  constructor(props) {
    super();

    //Get tokenIDs of active Long&Shorts to get data from CoinGecko
    let tokenIDs = [];
    props.data.forEach((item, i) => {
      tokenIDs.push(item.tokenID);
    });

    if (tokenIDs.length > 0) {
      dispatcher.dispatch({
        type: COINGECKO_POPULATE_FAVLIST,
        tokenIDs: tokenIDs,
        versus: "usd",
        lsType: "complete",
      });
    }

    this.state = {
      tokenIDs: tokenIDs,
      lsData: props.data,
      page: 0,
      rows: 5,
      rowsPerPage: 5,
      sortBy: "voteEnding",
      sortOrder: "dsc",
      sortData: [],
      formatedRows: [],
      loadingResult: false,
    };
  }

  componentDidMount() {
    emitter.on(COINGECKO_POPULATE_FAVLIST_RETURNED, this.geckoDataReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(
      COINGECKO_POPULATE_FAVLIST_RETURNED,
      this.geckoDataReturned
    );
  }

  //TODO PROPS LS DATA UPDATED update toknIDS state and geckofavData from newids
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
          lsType: "complete",
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
    priceStart,
    vote,
    voteEnding,
    endingFormatted,
    priceEnd,
    result,
    dbid
  ) => {
    return {
      image,
      name,
      id,
      symbol,
      priceStart,
      vote,
      voteEnding,
      endingFormatted,
      priceEnd,
      result,
      dbid,
    };
  };

  timeRemaining = (voteEnding) => {
    let dateEnd = new Date(voteEnding);
    let dateNow = new Date();
    let remaining = dateEnd - dateNow;
    // let timeLimit = 120 * 1000; // 2min for testing
    let timeLimit = 12 * 60 * 60 * 1000; // 12hs for beta testing
    // let timeLimit = 24 * 60 * 60 * 1000; // 12hs for release

    let percentComplete = 0;
    if (remaining <= 0) {
      percentComplete = 100;
    } else {
      percentComplete = ((timeLimit - remaining) / timeLimit) * 100;
    }
    return percentComplete;
  };

  geckoDataReturned = (data) => {
    if (data[1] === "complete") {
      // console.log("data returned to complete list");
      // Create array with items to sort later in table
      let sort = [];
      //MERGE DATA FROM COINGECKO TOKENS and our DB LS positions
      const { lsData } = this.state;
      //MATCH DBs FROM TOKEN IDS
      lsData.forEach((item, i) => {
        let index = data[0]
          .map(function (e) {
            return e.id;
          })
          .indexOf(item.tokenID);

        var d = new Date(item.voteEnding);
        let dformat =
          [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/") +
          " " +
          [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");

        let sortData = this.createData(
          data[0][index].image,
          data[0][index].name,
          data[0][index].id,
          data[0][index].symbol,
          item.priceStart,
          item.vote,
          item.voteEnding,
          dformat.toString(),
          item.priceEnd.toFixed(2),
          item.result,
          item._id
        );
        sort.push(sortData);
      });
      this.setState({ sortData: sort, coinData: data });
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
          item.priceStart,
          item.vote,
          item.voteEnding,
          item.endingFormatted,
          item.priceEnd,
          item.result,
          item.dbid
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
          item.priceStart,
          item.vote,
          item.voteEnding,
          item.endingFormatted,
          item.priceEnd,
          item.result,
          item.dbid
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
        <TableRow hover={true} key={row.dbid}>
          <TableCell
            style={{ cursor: "pointer" }}
            onClick={() => this.detective(row.id)}
            component="th"
            scope="row"
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
          <TableCell align="right">
            <Typography variant={"h4"}>{row.priceStart}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography
              variant={"h4"}
              color={
                row.priceEnd > row.priceStart && row.vote
                  ? "primary"
                  : row.priceEnd > row.priceStart && !row.vote
                  ? "secondary"
                  : row.priceEnd < row.priceStart && !row.vote
                  ? "primary"
                  : "secondary"
              }
            >
              {row.priceEnd}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"h4"}>{row.endingFormatted}</Typography>
          </TableCell>
          <TableCell align="center">
            {row.vote && (
              <ButtonGroup color="primary" aria-label="LongShort_ButtonGroup">
                <Button
                  startIcon={<TrendingUpIcon />}
                  color="primary"
                  variant="contained"
                ></Button>
                <Button
                  disabled
                  endIcon={<TrendingDownIcon />}
                  color="secondary"
                ></Button>
              </ButtonGroup>
            )}
            {!row.vote && (
              <ButtonGroup color="primary" aria-label="LongShort_ButtonGroup">
                <Button
                  disabled
                  startIcon={<TrendingUpIcon />}
                  color="primary"
                ></Button>
                <Button
                  endIcon={<TrendingDownIcon />}
                  disableRipple={true}
                  disableFocusRipple={true}
                  variant="contained"
                  color="secondary"
                ></Button>
              </ButtonGroup>
            )}
          </TableCell>
          <TableCell align="center">
            {row.result && (
              <Button
                startIcon={<AssignmentTurnedInIcon />}
                variant="outlined"
                color="primary"
              >
                Good
              </Button>
            )}
            {!row.result && (
              <Button
                startIcon={<AssignmentTurnedInIcon />}
                variant="outlined"
                color="secondary"
              >
                Bad
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
        style={{ marginTop: "10px" }}
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
                  Completed
                </Typography>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell onClick={() => this.sortBy("name")} align="left">
                {this.state.sortBy === "name" &&
                  this.state.sortOrder === "asc" && (
                    <ArrowDropUpRoundedIcon align="right" />
                  )}
                {this.state.sortBy === "name" &&
                  this.state.sortOrder === "dsc" && (
                    <ArrowDropDownRoundedIcon align="right" />
                  )}
                Name
              </TableCell>
              <TableCell
                onClick={() => this.sortBy("priceStart")}
                align="right"
              >
                {this.state.sortBy === "priceStart" &&
                  this.state.sortOrder === "asc" && (
                    <ArrowDropUpRoundedIcon align="right" />
                  )}
                {this.state.sortBy === "priceStart" &&
                  this.state.sortOrder === "dsc" && (
                    <ArrowDropDownRoundedIcon align="right" />
                  )}
                Start Price
              </TableCell>
              <TableCell onClick={() => this.sortBy("priceEnd")} align="right">
                {this.state.sortBy === "priceEnd" &&
                  this.state.sortOrder === "asc" && (
                    <ArrowDropUpRoundedIcon align="right" />
                  )}
                {this.state.sortBy === "priceEnd" &&
                  this.state.sortOrder === "dsc" && (
                    <ArrowDropDownRoundedIcon align="right" />
                  )}
                End Price
              </TableCell>
              <TableCell
                onClick={() => this.sortBy("voteEnding")}
                align="right"
              >
                {this.state.sortBy === "voteEnding" &&
                  this.state.sortOrder === "asc" && (
                    <ArrowDropUpRoundedIcon align="right" />
                  )}
                {this.state.sortBy === "voteEnding" &&
                  this.state.sortOrder === "dsc" && (
                    <ArrowDropDownRoundedIcon align="right" />
                  )}
                Date End
              </TableCell>
              <TableCell onClick={() => this.sortBy("vote")} align="center">
                {this.state.sortBy === "vote" &&
                  this.state.sortOrder === "asc" && (
                    <ArrowDropUpRoundedIcon align="center" />
                  )}
                {this.state.sortBy === "vote" &&
                  this.state.sortOrder === "dsc" && (
                    <ArrowDropDownRoundedIcon align="center" />
                  )}
                Vote
              </TableCell>
              <TableCell onClick={() => this.sortBy("result")} align="center">
                {this.state.sortBy === "result" &&
                  this.state.sortOrder === "asc" && <ArrowDropUpRoundedIcon />}
                {this.state.sortBy === "result" &&
                  this.state.sortOrder === "dsc" && (
                    <ArrowDropDownRoundedIcon />
                  )}
                Result
              </TableCell>
            </TableRow>
          </TableHead>
          {sortData && <TableBody>{this.sortedList(sortData)}</TableBody>}
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={0}
                count={formatedRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={this.TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(
  withRouter(withStyles(styles)(LSTableHistory))
);
