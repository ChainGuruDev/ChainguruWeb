import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { formatMoney, formatMoneyMCAP, getVsSymbol } from "../helpers";
import SparklineChart from "../components/SparklineChart.js";
import LastPageIcon from "@material-ui/icons/LastPage";

//IMPORT MaterialUI
import {
  Card,
  Grid,
  LinearProgress,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  TableSortLabel,
  Typography,
  TableBody,
} from "@material-ui/core";

import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import {
  GECKO_GET_COINS,
  GECKO_GET_COINS_RETURNED,
  SWITCH_VS_COIN_RETURNED,
  COINLIST_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  favCard: {
    padding: 10,
    margin: 10,
    display: "flex",
    flex: 1,
    direction: "row",
    alignContent: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  tokenLogo: {
    maxHeight: 30,
  },
  footer: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
});

class CoinList extends Component {
  constructor(props) {
    super();
    this._isMounted = false;

    const coinList = store.getStore("coinList");
    const vs = store.getStore("vsCoin");

    let reqPercentage = "";
    let labelA = "";
    let labelB = "";
    let labelC = "";
    let labelD = "";
    let labelE = "";

    switch (props.timeFrame) {
      case "short":
        reqPercentage = "1h,24h,7d,30d,1y";
        labelA = "price 1h";
        labelB = "price 24h";
        labelC = "price 7d";
        labelD = "price 30d";
        labelE = "price 1y";
        break;
      case "medium":
        reqPercentage = "24h,14d,30d,200d,1y";
        labelA = "price 24h";
        labelB = "price 14d";
        labelC = "price 30d";
        labelD = "price 200d";
        labelE = "price 1y";
        break;
      case "long":
        reqPercentage = "7d,14d,30d,200d,1y";
        labelA = "price 7d";
        labelB = "price 14d";
        labelC = "price 30d";
        labelD = "price 200d";
        labelE = "price 1y";
        break;
      default:
        reqPercentage = "24h,7d,30d,200d,1y";
        labelA = "price 24h";
        labelB = "price 7d";
        labelC = "price 30d";
        labelD = "price 200d";
        labelE = "price 1y";
        break;
    }

    this.state = {
      coins: coinList ? coinList.length : 0,
      vsCoin: vs,
      geckoDataLoaded: false,
      sortBy: "market_cap",
      sortOrder: "desc",
      page: 0,
      rows: 0,
      perPage: 25,
      reqPercentage: reqPercentage,
      timeFrame: props.timeFrame,
      labelA: labelA,
      labelB: labelB,
      labelC: labelC,
      labelD: labelD,
      labelE: labelE,
    };
  }

  componentDidMount() {
    const { page, perPage, sortBy, sortOrder, reqPercentage } = this.state;

    this._isMounted = true;
    this.setState({ geckoDataLoaded: false });

    emitter.on(GECKO_GET_COINS_RETURNED, this.geckoCoinsReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.on(COINLIST_RETURNED, this.getCoinList);

    //

    this._isMounted &&
      dispatcher.dispatch({
        type: GECKO_GET_COINS,
        page: page,
        perPage: perPage,
        sparkline: true,
        priceChangePercentage: reqPercentage,
        order: sortBy + "_" + sortOrder,
      });
  }

  componentWillUnmount() {
    emitter.removeListener(GECKO_GET_COINS_RETURNED, this.geckoCoinsReturned);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.vsCoinReturned);
    emitter.removeListener(COINLIST_RETURNED, this.getCoinList);
    this._isMounted = false;
  }

  getCoinList = (coins) => {
    this.setState({
      coins: coins.lenght,
    });
  };

  vsCoinReturned = (vs) => {
    const { page, perPage, sortBy, sortOrder, reqPercentage } = this.state;
    this.setState({ vsCoin: vs });
    this._isMounted &&
      dispatcher.dispatch({
        type: GECKO_GET_COINS,
        page: page + 1,
        perPage: perPage,
        sparkline: true,
        priceChangePercentage: reqPercentage,
        order: sortBy + "_" + sortOrder,
      });
  };

  createData = (
    image,
    name,
    id,
    symbol,
    current_price,
    price_change_percentage_A,
    price_change_percentage_B,
    price_change_percentage_C,
    price_change_percentage_D,
    price_change_percentage_E,
    market_cap,
    market_cap_change_percentage_24h,
    sparkline_in_7d
  ) => {
    return {
      image,
      name,
      id,
      symbol,
      current_price,
      price_change_percentage_A,
      price_change_percentage_B,
      price_change_percentage_C,
      price_change_percentage_D,
      price_change_percentage_E,
      market_cap,
      market_cap_change_percentage_24h,
      sparkline_in_7d,
    };
  };

  geckoCoinsReturned = (data) => {
    let priceChangeA;
    let priceChangeB;
    let priceChangeC;
    let priceChangeD;
    let priceChangeE;

    let geckoData = [];

    switch (this.state.timeFrame) {
      case "short":
        priceChangeA = "price_change_percentage_1h_in_currency";
        priceChangeB = "price_change_percentage_24h_in_currency";
        priceChangeC = "price_change_percentage_7d_in_currency";
        priceChangeD = "price_change_percentage_30d_in_currency";
        priceChangeE = "price_change_percentage_1y_in_currency";
        break;
      case "medium":
        priceChangeA = "price_change_percentage_24h_in_currency";
        priceChangeB = "price_change_percentage_14d_in_currency";
        priceChangeC = "price_change_percentage_30d_in_currency";
        priceChangeD = "price_change_percentage_200d_in_currency";
        priceChangeE = "price_change_percentage_1y_in_currency";
        break;
      case "long":
        priceChangeA = "price_change_percentage_7d_in_currency";
        priceChangeB = "price_change_percentage_14d_in_currency";
        priceChangeC = "price_change_percentage_30d_in_currency";
        priceChangeD = "price_change_percentage_200d_in_currency";
        priceChangeE = "price_change_percentage_1y_in_currency";
        break;
      default:
        priceChangeA = "price_change_percentage_24h_in_currency";
        priceChangeB = "price_change_percentage_7d_in_currency";
        priceChangeC = "price_change_percentage_30d_in_currency";
        priceChangeD = "price_change_percentage_200d_in_currency";
        priceChangeE = "price_change_percentage_1y_in_currency";
        break;
    }
    data.forEach((item, i) => {
      let sortData = this.createData(
        item.image,
        item.name,
        item.id,
        item.symbol,
        item.current_price,
        item[priceChangeA],
        item[priceChangeB],
        item[priceChangeC],
        item[priceChangeD],
        item[priceChangeE],
        item.market_cap,
        item.market_cap_change_percentage_24h,
        item.sparkline_in_7d.price
      );
      geckoData.push(sortData);
    });

    if (data) {
      this.setState({
        geckoDataLoaded: true,
        geckoData: geckoData,
      });
    }
  };

  sortBy(_sortBy) {
    const { page, perPage, sortBy, reqPercentage } = this.state;
    let _prevSortBy = sortBy;
    let _sortOrder;
    if (_prevSortBy === _sortBy) {
      if (this.state.sortOrder === "asc") {
        _sortOrder = "desc";
        this._isMounted &&
          this.setState({
            sortBy: _sortBy,
            sortOrder: _sortOrder,
            geckoDataLoaded: false,
          });
      } else {
        _sortOrder = "asc";
        this._isMounted &&
          this.setState({
            sortBy: _sortBy,
            sortOrder: _sortOrder,
            geckoDataLoaded: false,
          });
      }
    } else {
      _sortOrder = "desc";
      this._isMounted &&
        this.setState({
          sortBy: _sortBy,
          sortOrder: _sortOrder,
          geckoDataLoaded: false,
        });
    }
    this._isMounted &&
      dispatcher.dispatch({
        type: GECKO_GET_COINS,
        page: page + 1,
        perPage: perPage,
        sparkline: true,
        priceChangePercentage: reqPercentage,
        order: _sortBy + "_" + _sortOrder,
      });
  }

  sortedList = () => {
    const { classes } = this.props;
    const { geckoData, vsCoin } = this.state;

    if (geckoData.length > 0) {
      return geckoData.map((row) => (
        <TableRow
          hover={true}
          key={row.id}
          style={{ cursor: "pointer" }}
          onClick={() => this.detective(row.id)}
        >
          <TableCell>
            <img className={classes.tokenLogo} alt="" src={row.image} />
          </TableCell>
          <TableCell padding="none" align="left">
            <Typography variant={"h4"}>{row.name}</Typography>
            <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
              {row.symbol}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"body1"}>
              {formatMoney(row.current_price) + " " + getVsSymbol(vsCoin)}
            </Typography>
          </TableCell>
          <TableCell align="right">
            {row.price_change_percentage_A && (
              <Typography
                variant={"body1"}
                color={
                  row.price_change_percentage_A > 0 ? "primary" : "secondary"
                }
              >
                {formatMoney(row.price_change_percentage_A)} %
              </Typography>
            )}
          </TableCell>
          <TableCell align="right">
            {row.price_change_percentage_B && (
              <Typography
                variant={"body1"}
                color={
                  row.price_change_percentage_B > 0 ? "primary" : "secondary"
                }
              >
                {formatMoney(row.price_change_percentage_B)} %
              </Typography>
            )}
          </TableCell>
          <TableCell align="right">
            {row.price_change_percentage_C && (
              <Typography
                variant={"body1"}
                color={
                  row.price_change_percentage_C > 0 ? "primary" : "secondary"
                }
              >
                {formatMoney(row.price_change_percentage_C)} %
              </Typography>
            )}
          </TableCell>
          <TableCell align="right">
            {row.price_change_percentage_D && (
              <Typography
                variant={"body1"}
                color={
                  row.price_change_percentage_D > 0 ? "primary" : "secondary"
                }
              >
                {formatMoney(row.price_change_percentage_D)} %
              </Typography>
            )}
          </TableCell>
          <TableCell align="right">
            {row.price_change_percentage_E && (
              <Typography
                variant={"body1"}
                color={
                  row.price_change_percentage_E > 0 ? "primary" : "secondary"
                }
              >
                {formatMoney(row.price_change_percentage_E)} %
              </Typography>
            )}
          </TableCell>
          <TableCell align="right">
            <Typography variant={"body1"}>
              {formatMoneyMCAP(row.market_cap, 0)}
            </Typography>
            <Typography
              variant={"body1"}
              color={
                row.market_cap_change_percentage_24h > 0
                  ? "primary"
                  : "secondary"
              }
            >
              {formatMoneyMCAP(row.market_cap_change_percentage_24h)} %
            </Typography>
          </TableCell>
          <TableCell align="center">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SparklineChart id={row.symbol} data={row.sparkline_in_7d} />
            </div>
          </TableCell>
        </TableRow>
      ));
    }
  };

  TablePaginationActions = (props) => {
    const { classes } = this.props;
    const {
      geckoData,
      page,
      perPage,
      sortBy,
      sortOrder,
      reqPercentage,
    } = this.state;
    const count = geckoData.length;

    const handleFirstPageButtonClick = (event) => {
      this.setState({ page: 0, geckoDataLoaded: false });
      this._isMounted &&
        dispatcher.dispatch({
          type: GECKO_GET_COINS,
          page: 0,
          perPage: perPage,
          sparkline: true,
          priceChangePercentage: reqPercentage,
          order: sortBy + "_" + sortOrder,
        });
    };

    const handleBackButtonClick = (event) => {
      const newPage = page - 1;
      this.setState({ page: newPage, geckoDataLoaded: false });
      this._isMounted &&
        dispatcher.dispatch({
          type: GECKO_GET_COINS,
          page: newPage + 1,
          perPage: perPage,
          sparkline: true,
          priceChangePercentage: reqPercentage,
          order: sortBy + "_" + sortOrder,
        });
    };

    const handleNextButtonClick = (event) => {
      const newPage = page + 1;
      this.setState({ page: newPage, geckoDataLoaded: false });
      this._isMounted &&
        dispatcher.dispatch({
          type: GECKO_GET_COINS,
          page: newPage + 1,
          perPage: perPage,
          sparkline: true,
          priceChangePercentage: reqPercentage,
          order: sortBy + "_" + sortOrder,
        });
    };

    const handleLastPageButtonClick = (event) => {
      this.setState({ page: Math.max(0, Math.ceil(count / perPage) - 1) });
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
        <IconButton onClick={handleNextButtonClick} aria-label="next page">
          {<KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / perPage) - 1}
          aria-label="last page"
        >
          {<LastPageIcon />}
        </IconButton>
      </div>
    );
  };

  render() {
    const { classes } = this.props;
    const {
      geckoDataLoaded,
      geckoData,
      sortBy,
      sortOrder,
      page,
      perPage,
      coins,
      reqPercentage,
      labelA,
      labelB,
      labelC,
      labelD,
      labelE,
    } = this.state;

    const handleChangeRowsPerPage = (event) => {
      const newPerPage = parseInt(event.target.value, 10);
      this.setState({
        perPage: parseInt(event.target.value, 10),
        page: 0,
        geckoDataLoaded: false,
      });

      this._isMounted &&
        dispatcher.dispatch({
          type: GECKO_GET_COINS,
          page: 0,
          perPage: newPerPage,
          sparkline: true,
          priceChangePercentage: reqPercentage,
          order: sortBy + "_" + sortOrder,
        });
    };

    return (
      <div className={classes.root}>
        <Card className={classes.favCard} elevation={3}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            spacing={3}
          >
            {!geckoDataLoaded && (
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <LinearProgress style={{ margin: "10px" }} />
              </Grid>
            )}
            {geckoDataLoaded && (
              <TableContainer size="small">
                <Table className={classes.table} aria-label="coinList">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{ width: "30px", height: "30px" }}
                      ></TableCell>
                      <TableCell align="left" padding="none">
                        Name
                      </TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">{labelA}</TableCell>
                      <TableCell align="right">{labelB}</TableCell>
                      <TableCell align="right">{labelC}</TableCell>
                      <TableCell align="right">{labelD}</TableCell>
                      <TableCell align="right">{labelE}</TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sortBy === "market_cap"}
                          direction={sortOrder}
                          onClick={() => this.sortBy("market_cap")}
                        >
                          Marketcap
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Chart (7d)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{this.sortedList(geckoData)}</TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        colSpan={3}
                        count={coins}
                        rowsPerPage={perPage}
                        page={page}
                        SelectProps={{
                          inputProps: { "aria-label": "rows per page" },
                          native: true,
                        }}
                        onChangePage={() => console.log()}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        ActionsComponent={this.TablePaginationActions}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Card>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
  detective = (id) => {
    this.nav(`/${this.props.timeFrame}/detective/` + id);
  };
}

export default withRouter(withStyles(styles)(CoinList));
