import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import {
  Card,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_USERDATA_RETURNED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
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
  },
  favCard: {
    background: "rgba(255,255,255,0.05)",
    padding: 10,
    margin: 10,
    display: "flex",
    flex: 1,
  },
});

class PortfolioBig extends Component {
  constructor() {
    super();

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      dbDataLoaded: false,
      sortBy: "quote",
      sortOrder: "dsc",
    };

    // IF USER IS CONNECTED GET THE PORTFOLIO DATA
    // if(account && account.address) {
    //   dispatcher.dispatch({
    //     type: DB_GET_USERPORTFOLIO,
    //     address: account.address,
    //   })
    // }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_GET_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      DB_GET_PORTFOLIO_RETURNED,
      this.dbGetPortfolioReturned
    );
  }

  //EMITTER EVENTS FUNCTIONS
  connectionConnected = () => {
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  dbUserDataReturned = (data) => {
    console.log(data.wallets);
    let wallets = [];
    data.wallets.forEach((item, i) => {
      wallets.push(item.wallet);
    });
    console.log(wallets[1]);
    if (this.state.loading) {
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO,
        wallet: wallets[1],
      });
    }
    this.setState({ loading: true });
  };

  dbGetPortfolioReturned = (data) => {
    console.log(data);
    this.setState({
      loading: false,
      dbDataLoaded: true,
      portfolioData: data,
    });
  };

  //END EMITTER EVENT FUNCTIONS
  sortedList = () => {
    const { classes } = this.props;
    const { sortBy, sortOrder, portfolioData } = this.state;

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
    let formatedRows = [];

    if (sortOrder === "asc") {
      sortedRows = portfolioData[0].assets.sort(dynamicSort(sortBy));
    } else {
      sortedRows = portfolioData[0].assets.sort(dynamicSort(`-${sortBy}`));
    }
    console.log(sortedRows);
    if (sortedRows.length > 0) {
      return sortedRows.map((row) => (
        <TableRow hover={true} key={row.contract_address}>
          <TableCell>LOGO</TableCell>
          <TableCell align="left">
            <Typography variant={"h4"}>{row.contract_name}</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant={"body1"}>{row.balance}</Typography>
            <Typography variant={"subtitle2"}>{row.contract_ticker}</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant={"body1"}>{row.quote_rate}</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant={"body1"}>{row.quote}</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant={"body1"}>{row.profit_percent}%</Typography>
            <Typography variant={"body1"}>({row.profit_value})</Typography>
          </TableCell>
        </TableRow>
      ));
    }
  };

  render() {
    const { classes, t } = this.props;
    const { account, loading, dbDataLoaded, portfolioData } = this.state;

    return (
      <Card className={classes.favCard} elevation={3}>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <Typography variant={"h3"}>Assets</Typography>
          </Grid>
          {loading && (
            <Grid item xs={12}>
              <Typography variant={"h4"}>Loading...</Typography>
            </Grid>
          )}
          {dbDataLoaded && (
            <TableContainer size="small">
              <Table className={classes.table} aria-label="assetList">
                <TableHead>
                  <TableRow>
                    <TableCell>Icon</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Profit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{this.sortedList(portfolioData)}</TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Card>
    );
  }

  nav = (screen) => {
    console.log(screen);
    this.props.history.push(screen);
  };
}

export default withStyles(styles)(PortfolioBig);
