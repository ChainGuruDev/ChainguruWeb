import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import { formatMoney, formatMoneyMCAP } from "../helpers";
import WalletNicknameModal from "../components/walletNicknameModal.js";

import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@material-ui/icons/ArrowDropUpRounded";
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";
import BackspaceRoundedIcon from "@material-ui/icons/BackspaceRounded";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";

import {
  Card,
  Grid,
  Divider,
  Button,
  CircularProgress,
  LinearProgress,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_USERDATA_RETURNED,
  DB_GET_PORTFOLIO,
  DB_GET_PORTFOLIO_RETURNED,
  DB_UPDATE_PORTFOLIO,
  DB_UPDATE_PORTFOLIO_RETURNED,
  DB_SET_USER_WALLET_NICKNAME_RETURNED,
  DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
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
  tokenLogo: {
    maxHeight: 30,
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
    background: `#7772`,
  },
  graphGrid: {
    borderColor: colors.cgYellow,
    borderRadius: "10px",
    borderStyle: "solid",
    borderWidth: "thin",
    padding: "10px",
    background: `${colors.cgYellow}25`,
    textAlign: "center",
    minHeight: "100%",
  },
});

class PortfolioBig extends Component {
  constructor() {
    super();
    this._isMounted = false;

    const account = store.getStore("account");
    this.state = {
      account: account,
      loading: false,
      dbDataLoaded: false,
      sortBy: "quote",
      sortOrder: "desc",
      hideBlacklisted: true,
      hideLowBalanceCoins: true,
      userWallets: [],
      walletNicknames: [],
      walletNicknameModal: false,
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
    this._isMounted = true;
    this.setState({ loading: false });
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_GET_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
    emitter.on(DB_UPDATE_PORTFOLIO_RETURNED, this.dbGetPortfolioReturned);
    emitter.on(DB_SET_USER_WALLET_NICKNAME_RETURNED, this.setNicknameReturned);
    emitter.on(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
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
    emitter.removeListener(
      DB_UPDATE_PORTFOLIO_RETURNED,
      this.dbGetPortfolioReturned
    );
    emitter.removeListener(
      DB_SET_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.removeListener(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    this._isMounted = false;
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
    let wallets = [];
    data.wallets.forEach((item, i) => {
      wallets.push(item.wallet);
    });
    if (!this.state.loading) {
      dispatcher.dispatch({
        type: DB_GET_PORTFOLIO,
        wallet: wallets[0],
      });
    }
    this.setState({
      loading: true,
      selectedWallet: wallets[0],
      userWallets: data.wallets,
      walletNicknames: data.walletNicknames,
    });
  };

  setNicknameReturned = (data) => {
    console.log(data);
    this.setState({
      walletNicknames: data,
    });
  };

  dbGetPortfolioReturned = (data) => {
    console.log(data);
    if (data) {
      this.setState({
        loading: false,
        dbDataLoaded: true,
        portfolioData: data,
      });
    }
  };

  //END EMITTER EVENT FUNCTIONS
  sortedList = () => {
    const { classes } = this.props;
    const {
      sortBy,
      sortOrder,
      portfolioData,
      hideLowBalanceCoins,
    } = this.state;

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

    let filteredData = [];

    if (hideLowBalanceCoins) {
      portfolioData[0].assets.forEach((item, i) => {
        if (item.balance > 0.00001) {
          filteredData.push(portfolioData[0].assets[i]);
        }
      });
    } else {
      filteredData = portfolioData[0].assets;
    }

    let sortedRows;
    let formatedRows = [];

    if (sortOrder === "asc") {
      sortedRows = filteredData.sort(dynamicSort(sortBy));
    } else {
      sortedRows = filteredData.sort(dynamicSort(`-${sortBy}`));
    }
    if (sortedRows.length > 0) {
      return sortedRows.map((row) => (
        <TableRow hover={true} key={row.contract_address}>
          <TableCell>
            <img className={classes.tokenLogo} alt="" src={row.logo_url} />
          </TableCell>
          <TableCell padding="none" align="left">
            <Typography variant={"h4"}>{row.contract_name}</Typography>
          </TableCell>
          <TableCell align="right">
            <div>
              <Typography variant={"body1"}>{row.balance}</Typography>
            </div>
            <div>
              <Typography style={{ opacity: 0.6 }} variant={"subtitle2"}>
                {row.contract_ticker}
              </Typography>
            </div>
          </TableCell>
          <TableCell align="right">
            <Typography variant={"body1"}>
              {formatMoney(row.quote_rate)}
            </Typography>
          </TableCell>
          <TableCell align="right">
            {row.avg_buy != 0 && (
              <>
                <Typography variant={"body1"}>
                  ${formatMoney(row.avg_buy)}
                </Typography>
                <Typography
                  variant={"body1"}
                  color={
                    ((row.quote_rate - row.avg_buy) / row.avg_buy) * 100 > 0
                      ? "primary"
                      : "secondary"
                  }
                >
                  {formatMoney(
                    ((row.quote_rate - row.avg_buy) / row.avg_buy) * 100
                  )}
                  %
                </Typography>
              </>
            )}
          </TableCell>
          <TableCell align="right">
            <Typography variant={"body1"}>{formatMoney(row.quote)}</Typography>
          </TableCell>
          <TableCell align="right">
            {row.profit_percent && (
              <>
                <Typography
                  className={
                    row.profit_percent > 0
                      ? classes.profit_green
                      : classes.profit_red
                  }
                  variant={"body1"}
                >
                  {row.profit_percent.toFixed(1)} %
                </Typography>
                <Typography
                  className={
                    row.profit_percent > 0
                      ? classes.profit_green
                      : classes.profit_red
                  }
                  variant={"body1"}
                >
                  ( $ {formatMoney(row.profit_value)} )
                </Typography>
              </>
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
    dispatcher.dispatch({
      type: DB_GET_PORTFOLIO,
      wallet: wallet,
    });
    this.setState({ selectedWallet: wallet, dbDataLoaded: false });
  };

  updateWallet = (wallet) => {
    dispatcher.dispatch({
      type: DB_UPDATE_PORTFOLIO,
      wallet: wallet,
    });
    this.setState({ dbDataLoaded: false });
  };

  renameWallet = (wallet) => {
    const data = this.state.walletNicknames.find(
      (ele) => ele.wallet === wallet
    );
    this.setState({
      walletNicknameModal: true,
      selectedWallet: wallet,
      oldNickname: data ? data.nickname : "",
      dbDataLoaded: false,
    });
    dispatcher.dispatch({
      type: DB_GET_PORTFOLIO,
      wallet: wallet,
    });
  };

  userWalletList = (wallets) => {
    const { walletNicknames } = this.state;
    const { classes, t } = this.props;
    const walletIndex = wallets.findIndex(
      (wallets) => wallets.wallet === wallets.wallet
    );
    if (wallets.length > 0) {
      let data;
      return wallets.map((wallet) => (
        <div key={wallet._id}>
          <Divider />
          <ListItem
            key={wallet._id}
            button
            selected={this.state.selectedWallet === wallet.wallet}
            onClick={() => this.walletClicked(wallet.wallet)}
            className={classes.list}
          >
            <ListItemText
              primary={
                <React.Fragment>
                  <Typography
                    display="inline"
                    noWrap={true}
                    className={classes.inline}
                    color="textPrimary"
                  >
                    {(data = walletNicknames.find(
                      (ele) => ele.wallet === wallet.wallet
                    )) &&
                      data.nickname +
                        " (" +
                        wallet.wallet.substring(0, 6) +
                        "..." +
                        wallet.wallet.substring(
                          wallet.wallet.length - 4,
                          wallet.wallet.length
                        ) +
                        ")"}
                    {!walletNicknames.some((e) => e.wallet === wallet.wallet) &&
                      wallet.wallet.substring(0, 6) +
                        "..." +
                        wallet.wallet.substring(
                          wallet.wallet.length - 4,
                          wallet.wallet.length
                        )}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                aria-label="rename"
                onClick={() => this.renameWallet(wallet.wallet)}
              >
                <MoreHorizIcon />
              </IconButton>
              <IconButton
                aria-label="update"
                onClick={() => this.updateWallet(wallet.wallet)}
              >
                <RefreshRoundedIcon />
              </IconButton>
              {
                // TODO DELETE WALLET FUNCTION
                // {this.state.account.address != wallet.wallet && (
                //   <IconButton
                //     aria-label="remove"
                //     onClick={() => this.removeWALLET(wallet.wallet)}
                //   >
                //     <BackspaceRoundedIcon />
                //   </IconButton>
                // )}
              }
            </ListItemSecondaryAction>
          </ListItem>
        </div>
      ));
    }
    wallets.forEach((item, i) => {
      console.log(item.wallet);
    });
  };

  render() {
    const { classes, t } = this.props;
    const {
      account,
      loading,
      dbDataLoaded,
      portfolioData,
      sortBy,
      sortOrder,
      userWallets,
      walletNicknameModal,
    } = this.state;

    return (
      <>
        <Card className={classes.favCard} elevation={3}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item xs={6}>
              <div className={classes.walletGrid}>
                <Typography variant={"h4"}>Wallets</Typography>
                <List
                  className={classes.walletList}
                  component="nav"
                  aria-label="user wallet list"
                >
                  {this.userWalletList(userWallets)}
                </List>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className={classes.graphGrid}>
                <Typography variant={"h4"}>Section in Development</Typography>
              </div>
            </Grid>
            {!dbDataLoaded && (
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <Typography variant={"h4"}>
                  Loading your wallet data...
                </Typography>
                <LinearProgress style={{ marginTop: "10px" }} />
              </Grid>
            )}
            {dbDataLoaded && (
              <>
                <Grid item xs={12}>
                  <Typography variant={"h4"}>Assets</Typography>
                  <Divider />
                  <TableContainer size="small">
                    <Table className={classes.table} aria-label="assetList">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            style={{ width: "30px", height: "30px" }}
                          ></TableCell>
                          <TableCell align="left" padding="none">
                            <TableSortLabel
                              active={sortBy === "contract_name"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("contract_name")}
                            >
                              Name
                            </TableSortLabel>
                          </TableCell>
                          <TableCell align="right">
                            <TableSortLabel
                              active={sortBy === "balance"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("balance")}
                            >
                              Balance
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("quote_rate")}
                          >
                            <TableSortLabel
                              active={sortBy === "quote_rate"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("quote_rate")}
                            >
                              Price
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("avg_buy")}
                          >
                            <TableSortLabel
                              active={sortBy === "avg_buy"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("avg_buy")}
                            >
                              Avg. Buy Price
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("quote")}
                          >
                            <TableSortLabel
                              active={sortBy === "quote"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("quote")}
                            >
                              Value
                            </TableSortLabel>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={() => this.sortBy("profit_percent")}
                          >
                            <TableSortLabel
                              active={sortBy === "profit_percent"}
                              direction={sortOrder}
                              onClick={() => this.sortBy("profit_percent")}
                            >
                              Profit %
                            </TableSortLabel>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>{this.sortedList(portfolioData)}</TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </>
            )}
          </Grid>
        </Card>
        {walletNicknameModal && this.renderModal()}
      </>
    );
  }

  nav = (screen) => {
    console.log(screen);
    this.props.history.push(screen);
  };

  closeModal = () => {
    this.setState({ walletNicknameModal: false });
  };

  renderModal = (wallet, nickname) => {
    return (
      <WalletNicknameModal
        closeModal={this.closeModal}
        modalOpen={this.state.walletNicknameModal}
        wallet={this.state.selectedWallet}
        nickname={this.state.oldNickname}
      />
    );
  };
}

export default withStyles(styles)(PortfolioBig);
