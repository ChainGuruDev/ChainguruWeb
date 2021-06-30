import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";

//IMPORT MaterialUI
import { Card, Grid, LinearProgress } from "@material-ui/core";

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
    background: "rgba(255,255,255,0.05)",
  },
});

class Coins extends Component {
  constructor() {
    super();
    this._isMounted = false;

    this.state = {
      loading: false,
      geckoDataLoaded: false,
      sortBy: "marketcap",
      sortOrder: "desc",
      page: 1,
      rows: 10,
      rowsPerPage: 10,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.setState({ loading: false });
    //GECKO GET ALL COINS
    emitter.on(GECKO_GET_COINS_RETURNED, this.geckoCoinsReturned);
    this._isMounted &&
      dispatcher.dispatch({
        type: GECKO_GET_COINS,
      });
  }

  componentWillUnmount() {
    emitter.removeListener(GECKO_GET_COINS_RETURNED, this.geckoCoinsReturned);
    this._isMounted = false;
  }

  createData = (
    image,
    name,
    id,
    symbol,
    current_price,
    price_change_percentage_1h_in_currency,
    price_change_percentage_24h,
    price_change_percentage_7d_in_currency,
    price_change_percentage_30d_in_currency,
    price_change_percentage_1y_in_currency,
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
      price_change_percentage_1h_in_currency,
      price_change_percentage_24h,
      price_change_percentage_7d_in_currency,
      price_change_percentage_30d_in_currency,
      price_change_percentage_1y_in_currency,
      market_cap,
      market_cap_change_percentage_24h,
      sparkline_in_7d,
    };
  };

  geckoCoinsReturned = (data) => {
    console.log(data);

    let geckoData = [];
    data.forEach((item, i) => {
      let sortData = this.createData(
        item.image,
        item.name,
        item.id,
        item.symbol,
        item.current_price,
        item.price_change_percentage_1h_in_currency,
        item.price_change_percentage_24h,
        item.price_change_percentage_7d_in_currency,
        item.price_change_percentage_30d_in_currency,
        item.price_change_percentage_1y_in_currency,
        item.market_cap,
        item.market_cap_change_percentage_24h,
        item.sparkline_in_7d.price
      );
      geckoData.push(sortData);
    });

    if (data) {
      this.setState({
        loading: false,
        geckoDataLoaded: true,
        geckoData: geckoData,
      });
    }
  };

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

  TablePaginationActions = (props) => {
    const { classes } = this.props;
    const { formatedRows, page, rowsPerPage } = this.state;
    const count = formatedRows.length;

    const handleFirstPageButtonClick = (event) => {
      this.setState({ page: 1 });
    };

    const handleBackButtonClick = (event) => {
      // console.log(event);
      // console.log(count);
      this.setState({ page: page - 1 });
    };

    const handleNextButtonClick = (event) => {
      this.setState({ page: page + 1 });
    };

    return (
      <div className={classes.footer}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 1}
          aria-label="first page"
        >
          {<FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 1}
          aria-label="previous page"
        >
          {<KeyboardArrowLeft />}
        </IconButton>
        <IconButton onClick={handleNextButtonClick} aria-label="next page">
          {<KeyboardArrowRight />}
        </IconButton>
      </div>
    );
  };

  render() {
    const { classes, t } = this.props;
    const {
      loading,
      geckoDataLoaded,
      geckoData,
      sortBy,
      sortOrder,
      page,
      rowsPerPage,
    } = this.state;

    const handleChangePage = (newPage) => {
      this.setState({ page: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
      this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 });
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
          </Grid>
        </Card>
      </div>
    );
  }
}
