import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import {
  formatMoney,
  formatBigNumbers,
  differenceInPercentage,
} from "../helpers";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_USERDATA_RETURNED,
  DB_GET_ADDRESS_TX,
  DB_GET_ADDRESS_TX_RETURNED,
  CHECK_ACCOUNT,
  CHECK_ACCOUNT_RETURNED,
  LOGIN_RETURNED,
} from "../../constants";

import {
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  MenuItem,
  Card,
  InputLabel,
  LinearProgress,
  FormControl,
  Select,
} from "@material-ui/core";

//confirmed
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
//failed
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";

//send
// receive Transform(rotateY(180deg))
import ForwardRoundedIcon from "@material-ui/icons/ForwardRounded";
import RoomIcon from "@material-ui/icons/Room";
// trade
import SyncAltRoundedIcon from "@material-ui/icons/SyncAltRounded";

// authorize
import LockOpenRoundedIcon from "@material-ui/icons/LockOpenRounded";

// execution
import InsertDriveFileRoundedIcon from "@material-ui/icons/InsertDriveFileRounded";

// deployment
import NoteAddRoundedIcon from "@material-ui/icons/NoteAddRounded";

// cancel
import CancelScheduleSendRoundedIcon from "@material-ui/icons/CancelScheduleSendRounded";

// deposit
import AssignmentReturnedRoundedIcon from "@material-ui/icons/AssignmentReturnedRounded";

// withdraw
import AssignmentReturnRoundedIcon from "@material-ui/icons/AssignmentReturnRounded";

// borrow
import AssignmentRoundedIcon from "@material-ui/icons/AssignmentRounded";

// repay
import AssignmentTurnedInRoundedIcon from "@material-ui/icons/AssignmentTurnedInRounded";

// stake
import ArchiveRoundedIcon from "@material-ui/icons/ArchiveRounded";

// unstake
import UnarchiveRoundedIcon from "@material-ui/icons/UnarchiveRounded";

// claim
import SystemUpdateAltRoundedIcon from "@material-ui/icons/SystemUpdateAltRounded";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";

import { colors } from "../../theme";

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
  walletGrid: {
    borderRadius: "10px",
    padding: "10px",
    background: `#9991`,
    minHeight: "100%",
  },
  favCard: {
    padding: 10,
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  card: {
    padding: 10,
    margin: 10,
  },
  tokenLogo: {
    maxHeight: 30,
    minWidth: 30,
    margin: "0 5px",
  },
  container: {
    maxHeight: 500,
  },
  subtitle: {
    opacity: 0.8,
    textColor: "primary",
  },
  dateGrid: {
    minWidth: "160px",
    textAlign: "center",
  },
  fromToSpenderGrid: {
    margin: "0px 5px 0px 5px",
    minWidth: 175,
  },
  mainTx: {
    transition: "all .33s ease-in-out",
    background:
      "linear-gradient(90deg, rgba(121, 216, 162, 0.1) 0%, rgba(0,0,0,0.2) 10%)",
    boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.5)",
    borderRadius: 10,
    margin: "5px 0",
    padding: 10,
    [theme.breakpoints.down("xl")]: {
      justifyContent: "center",
    },
    [theme.breakpoints.up("xl")]: {
      justifyContent: "space-between",
    },
    "&:hover": {
      boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.3)",
    },
  },
  mainTxFailed: {
    transition: "all .33s ease-in-out",
    background:
      "linear-gradient(90deg, rgba(247, 157, 107, 0.1) 0%, rgba(0,0,0,0.2) 10%)",
    boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.5)",
    borderRadius: 10,
    margin: "5px 0",
    padding: 10,
    [theme.breakpoints.down("xl")]: {
      justifyContent: "center",
    },
    [theme.breakpoints.up("xl")]: {
      justifyContent: "space-between",
    },
    "&:hover": {
      boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.3)",
    },
  },
  mainData: {
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    height: "auto",
    [theme.breakpoints.down("xl")]: {
      height: "30%",
    },
    [theme.breakpoints.up("xl")]: {
      height: "100%",
    },
  },
  extraData: {
    margin: "0 0 0 auto",
    maxWidth: "max-content",
  },
  divVert: {
    width: "1px",
    height: "2rem",
  },
  linkButton: {
    padding: ".5rem",
    marginLeft: 5,
  },
  txLink: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  formControl: {
    minWidth: 120,
  },
});

class TransactionsBig extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    const account = store.getStore("account");
    const userAuth = store.getStore("userAuth");

    this.state = {
      account: account,
      loading: false,
      dbDataLoaded: false,
      error: false,
      sortBy: "mined_at",
      sortOrder: "desc",
      transactions: null,
      txLimit: 50,
      txOffset: 0,
      txQuery: props.query,
      userWallets: props.wallets,
      transactions: props.tx,
      selectedWallet: props.selected,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.on(DB_GET_ADDRESS_TX_RETURNED, this.dbGetAddressTxReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DB_USERDATA_RETURNED, this.dbUserDataReturned);
    emitter.removeListener(
      DB_GET_ADDRESS_TX_RETURNED,
      this.dbGetAddressTxReturned
    );

    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (this._isMounted) {
      if (prevProps.selected !== this.props.selected) {
        this.setState({
          selectedWallet: this.props.selected,
        });
      }
      if (prevProps.wallets !== this.props.wallets) {
        this.setState({
          userWallets: this.props.wallets,
        });
      }
      if (prevProps.query !== this.props.query) {
        console.log(this.props.query);
        this.setState({
          txQuery: this.props.query,
        });
      }
      if (prevProps.tx !== this.props.tx) {
        this.setState({
          transactions: this.props.tx,
        });
      }
    }
  }

  connectionConnected = () => {
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
      this._isMounted &&
        dispatcher.dispatch({
          type: DB_GET_ADDRESS_TX,
          wallet: wallets,
        });
    }
    this.setState({
      loading: true,
      selectedWallet: "all",
      userWallets: data.wallets,
      walletNicknames: data.walletNicknames,
    });
  };

  dbGetAddressTxReturned = (data) => {
    if (data) {
      this.setState({
        error: false,
        loading: false,
        dbDataLoaded: true,
        transactions: data.transactions,
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

  drawTransactions = (data) => {
    const { classes } = this.props;
    const { sortBy } = this.state;

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

    let allTX = [];
    let sortedTXs = [];
    // MERGE all transactions from all tokens in user wallet
    // Create new empty array where to store all the TX
    // Append to this array Asset specific data (Name, contract, ticker, and logo url)
    // Push Tx to this new array, then sort by block_signed_at (date of TX)

    if (this.state.sortOrder === "asc") {
      sortedTXs = data.sort(dynamicSort(sortBy));
    } else {
      sortedTXs = data.sort(dynamicSort(`-${sortBy}`));
    }

    if (sortedTXs.length > 0) {
      return sortedTXs.map((tx, idx) => (
        <div key={`row_${idx}`}>
          <Grid
            item
            container
            direction="row"
            alignItems="center"
            key={`rootTxRow_${idx}`}
            className={
              tx.status === "confirmed" ? classes.mainTx : classes.mainTxFailed
            }
          >
            {tx.type === "send" && (
              <>
                <Grid
                  key={`rootSendTx_Grid1_${idx}`}
                  item
                  container
                  direction="row"
                  justify="center"
                  style={{ width: "auto", minWidth: "fit-content" }}
                >
                  {tx.status === "confirmed" && (
                    <CheckCircleOutlineIcon
                      style={{ alignSelf: "center" }}
                      color="primary"
                    />
                  )}
                  {tx.status === "failed" && (
                    <div
                      style={{
                        display: "grid",
                        justifyItems: "center",
                        alignItems: "center",
                        alignSelf: "center",
                      }}
                    >
                      <ErrorOutlineIcon color="secondary" />
                      <Typography variant={"subtitle2"} color="secondary">
                        Failed
                      </Typography>
                    </div>
                  )}
                  <Grid item className={classes.dateGrid}>
                    <Typography variant={"body2"} className={classes.subtitle}>
                      {new Date(tx.mined_at * 1000).toLocaleString()}
                    </Typography>
                    <Link
                      style={{ color: "inherit", textDecoration: "inherit" }}
                      target="_blank"
                      href={`https://etherscan.io/tx/${tx.hash}`}
                    >
                      <div className={classes.txLink}>
                        <Typography
                          variant={"subtitle2"}
                          className={classes.subtitle}
                        >
                          Tx: {tx.hash.substring(0, 6) + "..."}
                        </Typography>
                        <IconButton className={classes.linkButton} size="small">
                          <ExitToAppIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </Link>
                  </Grid>
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid
                  item
                  key={`rootSendTx_Grid2_${idx}`}
                  container
                  direction="column"
                  style={{
                    alignItems: "center",
                    maxWidth: "100px",
                  }}
                >
                  <Typography variant={"body2"} className={classes.subtitle}>
                    {tx.type}
                  </Typography>
                  <ForwardRoundedIcon style={{ color: colors.cgRed }} />
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Link
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  target="_blank"
                  href={`https://etherscan.io/address/${tx.changes[0].address_to}`}
                >
                  <Grid item className={classes.fromToSpenderGrid} align="left">
                    {tx.changes[0] && (
                      <Grid
                        container
                        key={`rootSendTx_ToGrid_${idx}`}
                        direction={"row"}
                        justify={"center"}
                        align="right"
                        style={{ alignItems: "center" }}
                      >
                        <Grid
                          item
                          style={{ marginLeft: "10px", textAlign: "left" }}
                        >
                          <Typography
                            variant={"body2"}
                            className={classes.subtitle}
                          >
                            To:
                          </Typography>
                          <Typography variant={"h4"}>
                            {tx.changes[0].address_to.substring(0, 6) +
                              "..." +
                              tx.changes[0].address_to.substring(
                                tx.changes[0].address_to.length - 4,
                                tx.changes[0].address_to.length
                              )}
                          </Typography>
                        </Grid>
                        <IconButton className={classes.linkButton} size="small">
                          <ExitToAppIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                </Link>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid item style={{ margin: "0px auto 0px 5px" }} align="left">
                  <Grid
                    key={`rootSendTx_AssetGrid_${idx}`}
                    container
                    direction={"row"}
                    justify={"center"}
                    align="right"
                    style={{ alignItems: "center" }}
                  >
                    <img
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                      className={classes.tokenLogo}
                      alt=""
                      src={tx.changes[0].asset.icon_url}
                    />
                    <Grid
                      item
                      style={{ marginLeft: "10px", textAlign: "left" }}
                    >
                      <Typography>
                        -{" "}
                        {formatMoney(
                          formatBigNumbers(
                            tx.changes[0].value,
                            tx.changes[0].asset.decimals
                          )
                        )}
                      </Typography>
                      <Typography
                        variant={"body2"}
                        className={classes.subtitle}
                      >
                        {tx.changes[0].asset.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {tx.type === "receive" && (
              <>
                <Grid
                  item
                  key={`rootReceiveTx_Grid1_${idx}`}
                  container
                  direction="row"
                  justify="center"
                  style={{ width: "auto", minWidth: "fit-content" }}
                >
                  {tx.status === "confirmed" && (
                    <CheckCircleOutlineIcon
                      style={{ alignSelf: "center" }}
                      color="primary"
                    />
                  )}
                  {tx.status === "failed" && (
                    <div
                      style={{
                        display: "grid",
                        justifyItems: "center",
                        alignItems: "center",
                        alignSelf: "center",
                      }}
                    >
                      <ErrorOutlineIcon color="secondary" />
                      <Typography variant={"subtitle2"} color="secondary">
                        Failed
                      </Typography>
                    </div>
                  )}
                  <Grid item className={classes.dateGrid}>
                    <Typography variant={"body2"} className={classes.subtitle}>
                      {new Date(tx.mined_at * 1000).toLocaleString()}
                    </Typography>
                    <Link
                      style={{ color: "inherit", textDecoration: "inherit" }}
                      target="_blank"
                      href={`https://etherscan.io/tx/${tx.hash}`}
                    >
                      <div className={classes.txLink}>
                        <Typography
                          variant={"subtitle2"}
                          className={classes.subtitle}
                        >
                          Tx: {tx.hash.substring(0, 6) + "..."}
                        </Typography>
                        <IconButton className={classes.linkButton} size="small">
                          <ExitToAppIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </Link>
                  </Grid>
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid
                  key={tx.hash}
                  item
                  container
                  direction="column"
                  style={{
                    alignItems: "center",
                    maxWidth: "100px",
                  }}
                >
                  <Typography variant={"body2"} className={classes.subtitle}>
                    {tx.type}
                  </Typography>
                  <ForwardRoundedIcon
                    style={{
                      color: colors.cgGreen,
                      transform: "rotateY(180deg)",
                    }}
                  />
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                {tx.changes[0] && (
                  <>
                    <Grid
                      item
                      className={classes.fromToSpenderGrid}
                      align="left"
                    >
                      <Link
                        style={{
                          color: "inherit",
                          textDecoration: "inherit",
                        }}
                        target="_blank"
                        href={`https://etherscan.io/address/${tx.changes[0].address_from}`}
                      >
                        <Grid
                          container
                          direction={"row"}
                          justify={"center"}
                          align="right"
                          style={{ alignItems: "center" }}
                        >
                          <Grid
                            item
                            style={{ marginLeft: "10px", textAlign: "left" }}
                          >
                            <Typography
                              variant={"body2"}
                              className={classes.subtitle}
                            >
                              From:
                            </Typography>
                            <Typography variant={"h4"}>
                              {tx.changes[0].address_from.substring(0, 6) +
                                "..." +
                                tx.changes[0].address_from.substring(
                                  tx.changes[0].address_from.length - 4,
                                  tx.changes[0].address_from.length
                                )}
                            </Typography>
                          </Grid>
                          <IconButton
                            className={classes.linkButton}
                            size="small"
                          >
                            <ExitToAppIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Link>
                    </Grid>
                    <Divider
                      orientation="vertical"
                      className={classes.divVert}
                    />
                    <Grid
                      item
                      style={{ margin: "0px auto 0px 5px" }}
                      align="left"
                    >
                      <Grid
                        container
                        direction={"row"}
                        justify={"center"}
                        align="right"
                        style={{ alignItems: "center" }}
                      >
                        <img
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                          className={classes.tokenLogo}
                          alt=""
                          src={tx.changes[0].asset.icon_url}
                        />
                        <Grid
                          item
                          style={{ marginLeft: "10px", textAlign: "left" }}
                        >
                          <Typography>
                            {formatMoney(
                              formatBigNumbers(
                                tx.changes[0].value,
                                tx.changes[0].asset.decimals
                              )
                            )}
                          </Typography>
                          <Typography
                            variant={"body2"}
                            className={classes.subtitle}
                          >
                            {tx.changes[0].asset.name}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                )}
              </>
            )}
            {tx.type === "trade" && tx.changes[0] && tx.changes[1] && (
              <>
                <Grid
                  key={`rootTradeTx_Grid1_${idx}`}
                  item
                  container
                  direction="row"
                  alignItems="center"
                  className={classes.mainData}
                  xl={6}
                  lg={12}
                >
                  <Grid
                    item
                    key={`sendTx_Grid1_${idx}`}
                    container
                    direction="row"
                    justify="center"
                    style={{ width: "auto", minWidth: "fit-content" }}
                  >
                    {tx.status === "confirmed" && (
                      <CheckCircleOutlineIcon
                        style={{ alignSelf: "center" }}
                        color="primary"
                      />
                    )}
                    {tx.status === "failed" && (
                      <div
                        style={{
                          display: "grid",
                          justifyItems: "center",
                          alignItems: "center",
                          alignSelf: "center",
                        }}
                      >
                        <ErrorOutlineIcon color="secondary" />
                        <Typography variant={"subtitle2"} color="secondary">
                          Failed
                        </Typography>
                      </div>
                    )}
                    <Grid item className={classes.dateGrid}>
                      <Typography
                        variant={"body2"}
                        className={classes.subtitle}
                      >
                        {new Date(tx.mined_at * 1000).toLocaleString()}
                      </Typography>
                      <Link
                        style={{ color: "inherit", textDecoration: "inherit" }}
                        target="_blank"
                        href={`https://etherscan.io/tx/${tx.hash}`}
                      >
                        <div className={classes.txLink}>
                          <Typography
                            variant={"subtitle2"}
                            className={classes.subtitle}
                          >
                            Tx: {tx.hash.substring(0, 6) + "..."}
                          </Typography>
                          <IconButton
                            className={classes.linkButton}
                            size="small"
                          >
                            <ExitToAppIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </Link>
                    </Grid>
                  </Grid>
                  <Divider orientation="vertical" className={classes.divVert} />
                  <Grid
                    key={`sendTx_Grid2_${idx}`}
                    item
                    container
                    direction="column"
                    style={{
                      alignItems: "center",
                      maxWidth: "100px",
                    }}
                  >
                    <Typography variant={"body2"} className={classes.subtitle}>
                      {tx.type}
                    </Typography>
                    <SyncAltRoundedIcon
                      style={{
                        color: colors.cgGreen,
                      }}
                    />
                  </Grid>
                  <Divider orientation="vertical" className={classes.divVert} />
                  {tx.changes[0].direction === "out" && (
                    <>
                      <Grid
                        item
                        style={{ margin: "0px 5px 0px 5px" }}
                        align="left"
                      >
                        <Grid
                          key={`sendTx_OUT_Grid1_${idx}`}
                          container
                          direction={"row"}
                          justify={"center"}
                          align="right"
                          style={{ alignItems: "center" }}
                        >
                          <img
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            className={classes.tokenLogo}
                            alt=""
                            src={tx.changes[0].asset.icon_url}
                          />
                          <Grid
                            item
                            style={{
                              marginLeft: "10px",
                              textAlign: "left",
                            }}
                          >
                            <Typography>
                              {"-"}
                              {formatMoney(
                                formatBigNumbers(
                                  tx.changes[0].value,
                                  tx.changes[0].asset.decimals
                                )
                              )}
                            </Typography>
                            <Typography
                              variant={"body2"}
                              className={classes.subtitle}
                            >
                              {tx.changes[0].asset.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <KeyboardArrowRightRoundedIcon />
                      <Grid
                        item
                        style={{
                          margin: "0px 5px 0px 5px",
                        }}
                        align="left"
                      >
                        <Grid
                          container
                          direction={"row"}
                          justify={"center"}
                          align="right"
                          style={{ alignItems: "center" }}
                        >
                          <img
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            className={classes.tokenLogo}
                            alt=""
                            src={tx.changes[1].asset.icon_url}
                          />
                          <Grid
                            item
                            style={{
                              marginLeft: "10px",
                              textAlign: "left",
                            }}
                          >
                            <Typography>
                              {formatMoney(
                                formatBigNumbers(
                                  tx.changes[1].value,
                                  tx.changes[1].asset.decimals
                                )
                              )}
                            </Typography>
                            <Typography
                              variant={"body2"}
                              className={classes.subtitle}
                            >
                              {tx.changes[1].asset.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )}
                  {tx.changes[0].direction === "in" && (
                    <>
                      <Grid
                        item
                        style={{ margin: "0px 5px 0px 5px" }}
                        align="left"
                      >
                        <Grid
                          container
                          key={`sendTx_IN_Grid1_${idx}`}
                          direction={"row"}
                          justify={"center"}
                          align="right"
                          style={{ alignItems: "center" }}
                        >
                          <img
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            className={classes.tokenLogo}
                            alt=""
                            src={tx.changes[1].asset.icon_url}
                          />
                          <Grid
                            item
                            style={{
                              marginLeft: "10px",
                              textAlign: "left",
                            }}
                          >
                            <Typography>
                              {"- " +
                                formatMoney(
                                  formatBigNumbers(
                                    tx.changes[1].value,
                                    tx.changes[1].asset.decimals
                                  )
                                )}
                            </Typography>
                            <Typography
                              variant={"body2"}
                              className={classes.subtitle}
                            >
                              {tx.changes[1].asset.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <KeyboardArrowRightRoundedIcon
                        style={{ color: colors.cgGreen }}
                      />
                      <Grid
                        item
                        style={{ margin: "0px 5px 0px 5px" }}
                        align="left"
                      >
                        <Grid
                          container
                          direction={"row"}
                          justify={"center"}
                          align="right"
                          style={{ alignItems: "center" }}
                        >
                          <img
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            className={classes.tokenLogo}
                            alt=""
                            src={tx.changes[0].asset.icon_url}
                          />
                          <Grid
                            item
                            style={{
                              marginLeft: "10px",
                              textAlign: "left",
                            }}
                          >
                            <Typography>
                              {formatMoney(
                                formatBigNumbers(
                                  tx.changes[0].value,
                                  tx.changes[0].asset.decimals
                                )
                              )}
                            </Typography>
                            <Typography
                              variant={"body2"}
                              className={classes.subtitle}
                            >
                              {tx.changes[0].asset.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Grid>
                {tx.changes[0].direction === "in" && (
                  <Grid
                    item
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                    className={classes.extraData}
                    xl={6}
                    lg={12}
                  >
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Price at tx
                      </Typography>
                      {tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price <
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {tx.changes[0].asset.symbol} ${" "}
                          {formatMoney(tx.changes[0].price)}
                        </Typography>
                      )}
                      {tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price >
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {tx.changes[1].asset.symbol} ${" "}
                          {formatMoney(tx.changes[1].price)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Price now
                      </Typography>
                      {tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price <
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          $ {formatMoney(tx.changes[0].asset.price.value)}
                        </Typography>
                      )}
                      {tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price >
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          $ {formatMoney(tx.changes[1].asset.price.value)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Value at tx
                      </Typography>
                      {tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price <
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[0].value,
                              tx.changes[0].asset.decimals
                            ) * tx.changes[0].price
                          )}
                        </Typography>
                      )}
                      {tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price >
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[1].value,
                              tx.changes[1].asset.decimals
                            ) * tx.changes[1].price
                          )}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Value now
                      </Typography>
                      {tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price <
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[0].value,
                              tx.changes[0].asset.decimals
                            ) * tx.changes[0].asset.price.value
                          )}
                        </Typography>
                      )}
                      {tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price >
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[1].value,
                              tx.changes[1].asset.decimals
                            ) * tx.changes[1].asset.price.value
                          )}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        % P/L
                      </Typography>
                      {tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price <
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {differenceInPercentage(
                            tx.changes[0].price,
                            tx.changes[0].asset.price.value
                          )}{" "}
                          %
                        </Typography>
                      )}
                      {tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price >
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {differenceInPercentage(
                            tx.changes[1].asset.price.value,
                            tx.changes[1].price
                          )}{" "}
                          %{" "}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        $ P/L
                      </Typography>
                      {tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price <
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {(
                            tx.changes[0].asset.price.value *
                              formatBigNumbers(
                                tx.changes[0].value,
                                tx.changes[0].asset.decimals
                              ) -
                            tx.changes[0].price *
                              formatBigNumbers(
                                tx.changes[0].value,
                                tx.changes[0].asset.decimals
                              )
                          ).toFixed(2)}
                        </Typography>
                      )}
                      {tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price >
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {(
                            tx.changes[1].price *
                              formatBigNumbers(
                                tx.changes[1].value,
                                tx.changes[1].asset.decimals
                              ) -
                            tx.changes[1].asset.price.value *
                              formatBigNumbers(
                                tx.changes[1].value,
                                tx.changes[1].asset.decimals
                              )
                          ).toFixed(2)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Fees
                      </Typography>
                      <Typography color={"secondary"}>
                        ${" "}
                        {(
                          formatMoney(formatBigNumbers(tx.fee.value, 18)) *
                          tx.fee.price
                        ).toFixed(2)}
                      </Typography>
                    </Grid>
                    {tx.changes[0].asset.price &&
                      tx.changes[1].asset.price &&
                      tx.changes[0].value &&
                      tx.changes[1].value && (
                        <Grid
                          item
                          align={"right"}
                          style={{ margin: "0 0 0 5px" }}
                        >
                          <Typography
                            variant={"subtitle1"}
                            className={classes.subtitle}
                          >
                            Total P/L
                          </Typography>
                          <Typography
                            color={
                              (
                                tx.changes[0].asset.price.value *
                                  formatBigNumbers(
                                    tx.changes[0].value,
                                    tx.changes[0].asset.decimals
                                  ) -
                                tx.changes[0].price *
                                  formatBigNumbers(
                                    tx.changes[0].value,
                                    tx.changes[0].asset.decimals
                                  ) +
                                tx.changes[1].price *
                                  formatBigNumbers(
                                    tx.changes[1].value,
                                    tx.changes[1].asset.decimals
                                  ) -
                                tx.changes[1].asset.price.value *
                                  formatBigNumbers(
                                    tx.changes[1].value,
                                    tx.changes[1].asset.decimals
                                  ) -
                                formatMoney(
                                  formatBigNumbers(tx.fee.value, 18)
                                ) *
                                  tx.fee.price
                              ).toFixed(2) > 0
                                ? "primary"
                                : "secondary"
                            }
                          >
                            ${" "}
                            {(
                              tx.changes[0].asset.price.value *
                                formatBigNumbers(
                                  tx.changes[0].value,
                                  tx.changes[0].asset.decimals
                                ) -
                              tx.changes[0].price *
                                formatBigNumbers(
                                  tx.changes[0].value,
                                  tx.changes[0].asset.decimals
                                ) +
                              tx.changes[1].price *
                                formatBigNumbers(
                                  tx.changes[1].value,
                                  tx.changes[1].asset.decimals
                                ) -
                              tx.changes[1].asset.price.value *
                                formatBigNumbers(
                                  tx.changes[1].value,
                                  tx.changes[1].asset.decimals
                                ) -
                              formatMoney(formatBigNumbers(tx.fee.value, 18)) *
                                tx.fee.price
                            ).toFixed(2)}
                          </Typography>
                        </Grid>
                      )}
                  </Grid>
                )}
                {tx.changes[0].direction === "out" && (
                  <Grid
                    item
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                    className={classes.extraData}
                    xl={6}
                    lg={12}
                  >
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Price at tx
                      </Typography>

                      {tx.changes[1].price && tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price <
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {tx.changes[1].asset.symbol} ${" "}
                          {formatMoney(tx.changes[1].price)}
                        </Typography>
                      )}
                      {tx.changes[0].price && tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price >
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {tx.changes[0].asset.symbol} ${" "}
                          {formatMoney(tx.changes[0].price)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Price now
                      </Typography>
                      {tx.changes[1].price && tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price <
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          $ {formatMoney(tx.changes[1].asset.price.value)}
                        </Typography>
                      )}
                      {tx.changes[0].price && tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price >
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          $ {formatMoney(tx.changes[0].asset.price.value)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Value at tx
                      </Typography>
                      {tx.changes[1].price && tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price <
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[1].value,
                              tx.changes[1].asset.decimals
                            ) * tx.changes[1].price
                          )}
                        </Typography>
                      )}
                      {tx.changes[0].price && tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price >
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[0].value,
                              tx.changes[0].asset.decimals
                            ) * tx.changes[0].price
                          )}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Value now
                      </Typography>
                      {tx.changes[1].price && tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price <
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[1].value,
                              tx.changes[1].asset.decimals
                            ) * tx.changes[1].asset.price.value
                          )}
                        </Typography>
                      )}
                      {tx.changes[0].price && tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price >
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {formatMoney(
                            formatBigNumbers(
                              tx.changes[0].value,
                              tx.changes[0].asset.decimals
                            ) * tx.changes[0].asset.price.value
                          )}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        % P/L
                      </Typography>
                      {tx.changes[1].price && tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price <
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {differenceInPercentage(
                            tx.changes[1].price,
                            tx.changes[1].asset.price.value
                          )}{" "}
                          %
                        </Typography>
                      )}
                      {tx.changes[0].price && tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price >
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {differenceInPercentage(
                            tx.changes[0].asset.price.value,
                            tx.changes[0].price
                          )}{" "}
                          %{" "}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        $ P/L
                      </Typography>
                      {tx.changes[1].price && tx.changes[1].asset.price && (
                        <Typography
                          color={
                            tx.changes[1].price <
                            tx.changes[1].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {(
                            tx.changes[1].asset.price.value *
                              formatBigNumbers(
                                tx.changes[1].value,
                                tx.changes[1].asset.decimals
                              ) -
                            tx.changes[1].price *
                              formatBigNumbers(
                                tx.changes[1].value,
                                tx.changes[1].asset.decimals
                              )
                          ).toFixed(2)}
                        </Typography>
                      )}
                      {tx.changes[0].price && tx.changes[0].asset.price && (
                        <Typography
                          color={
                            tx.changes[0].price >
                            tx.changes[0].asset.price.value
                              ? "primary"
                              : "secondary"
                          }
                        >
                          ${" "}
                          {(
                            tx.changes[0].price *
                              formatBigNumbers(
                                tx.changes[0].value,
                                tx.changes[0].asset.decimals
                              ) -
                            tx.changes[0].asset.price.value *
                              formatBigNumbers(
                                tx.changes[0].value,
                                tx.changes[0].asset.decimals
                              )
                          ).toFixed(2)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item align={"right"} style={{ margin: "0 5px" }}>
                      <Typography
                        variant={"subtitle1"}
                        className={classes.subtitle}
                      >
                        Fees
                      </Typography>
                      <Typography color={"secondary"}>
                        ${" "}
                        {(
                          formatMoney(formatBigNumbers(tx.fee.value, 18)) *
                          tx.fee.price
                        ).toFixed(2)}
                      </Typography>
                    </Grid>
                    {tx.changes[1].price &&
                      tx.changes[1].asset.price &&
                      tx.changes[0].price &&
                      tx.changes[0].asset.price && (
                        <Grid
                          item
                          align={"right"}
                          style={{ margin: "0 0 0 5px" }}
                        >
                          <Typography
                            variant={"subtitle1"}
                            className={classes.subtitle}
                          >
                            Total P/L
                          </Typography>
                          <Typography
                            color={
                              tx.changes[1].price <
                              tx.changes[1].asset.price.value
                                ? "primary"
                                : "secondary"
                            }
                          >
                            ${" "}
                            {(
                              tx.changes[1].asset.price.value *
                                formatBigNumbers(
                                  tx.changes[1].value,
                                  tx.changes[1].asset.decimals
                                ) -
                              tx.changes[1].price *
                                formatBigNumbers(
                                  tx.changes[1].value,
                                  tx.changes[1].asset.decimals
                                ) +
                              tx.changes[0].price *
                                formatBigNumbers(
                                  tx.changes[0].value,
                                  tx.changes[0].asset.decimals
                                ) -
                              tx.changes[0].asset.price.value *
                                formatBigNumbers(
                                  tx.changes[0].value,
                                  tx.changes[0].asset.decimals
                                ) -
                              formatMoney(formatBigNumbers(tx.fee.value, 18)) *
                                tx.fee.price
                            ).toFixed(2)}
                          </Typography>
                        </Grid>
                      )}
                  </Grid>
                )}
              </>
            )}
            {tx.type === "authorize" && (
              <>
                <Grid
                  item
                  container
                  direction="row"
                  justify="center"
                  style={{ width: "auto", minWidth: "fit-content" }}
                >
                  {tx.status === "confirmed" && (
                    <CheckCircleOutlineIcon
                      style={{ alignSelf: "center" }}
                      color="primary"
                    />
                  )}
                  {tx.status === "failed" && (
                    <div
                      style={{
                        display: "grid",
                        justifyItems: "center",
                        alignItems: "center",
                        alignSelf: "center",
                      }}
                    >
                      <ErrorOutlineIcon color="secondary" />
                      <Typography variant={"subtitle2"} color="secondary">
                        Failed
                      </Typography>
                    </div>
                  )}
                  <Grid item className={classes.dateGrid}>
                    <Typography variant={"body2"} className={classes.subtitle}>
                      {new Date(tx.mined_at * 1000).toLocaleString()}
                    </Typography>
                    <Link
                      style={{ color: "inherit", textDecoration: "inherit" }}
                      target="_blank"
                      href={`https://etherscan.io/tx/${tx.hash}`}
                    >
                      <div className={classes.txLink}>
                        <Typography
                          variant={"subtitle2"}
                          className={classes.subtitle}
                        >
                          Tx: {tx.hash.substring(0, 6) + "..."}
                        </Typography>
                        <IconButton className={classes.linkButton} size="small">
                          <ExitToAppIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </Link>
                  </Grid>
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid
                  key={tx.hash}
                  item
                  container
                  direction="column"
                  style={{
                    alignItems: "center",
                    maxWidth: "100px",
                  }}
                >
                  <Typography variant={"body2"} className={classes.subtitle}>
                    {tx.type}
                  </Typography>
                  <LockOpenRoundedIcon
                    style={{
                      color: colors.cgYellow,
                    }}
                  />
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid item className={classes.fromToSpenderGrid} align="left">
                  <Link
                    style={{ color: "inherit", textDecoration: "inherit" }}
                    target="_blank"
                    href={`https://etherscan.io/address/${tx.meta.spender}`}
                  >
                    <Grid
                      container
                      direction={"row"}
                      justify={"center"}
                      align="right"
                      style={{ alignItems: "center" }}
                    >
                      <Grid
                        item
                        style={{ marginLeft: "10px", textAlign: "left" }}
                      >
                        <Typography
                          variant={"body2"}
                          className={classes.subtitle}
                        >
                          Spender:
                        </Typography>
                        <Typography variant={"h4"}>
                          {tx.meta.spender.substring(0, 6) +
                            "..." +
                            tx.meta.spender.substring(
                              tx.meta.spender.length - 4,
                              tx.meta.spender.length
                            )}
                        </Typography>
                      </Grid>
                      <IconButton className={classes.linkButton} size="small">
                        <ExitToAppIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Link>
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid item style={{ margin: "0px auto 0px 5px" }} align="left">
                  <Grid
                    container
                    direction={"row"}
                    justify={"center"}
                    align="right"
                    style={{ alignItems: "center" }}
                  >
                    <img
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                      className={classes.tokenLogo}
                      alt=""
                      src={tx.meta.asset.icon_url}
                    />
                    <Grid
                      item
                      style={{ marginLeft: "10px", textAlign: "left" }}
                    >
                      <Typography>
                        {formatMoney(
                          formatBigNumbers(
                            tx.meta.amount,
                            tx.meta.asset.decimals
                          )
                        )}
                      </Typography>
                      <Typography
                        variant={"body2"}
                        className={classes.subtitle}
                      >
                        {tx.meta.asset.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {tx.type === "execution" && (
              <>
                <Grid item className={classes.dateGrid}>
                  <Typography variant={"body2"} className={classes.subtitle}>
                    {new Date(tx.mined_at * 1000).toLocaleString()}
                  </Typography>
                  <Link
                    style={{ color: "inherit", textDecoration: "inherit" }}
                    target="_blank"
                    href={`https://etherscan.io/tx/${tx.hash}`}
                  >
                    <div className={classes.txLink}>
                      <Typography
                        variant={"subtitle2"}
                        className={classes.subtitle}
                      >
                        Tx: {tx.hash.substring(0, 6) + "..."}
                      </Typography>
                      <IconButton className={classes.linkButton} size="small">
                        <ExitToAppIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </Link>
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid
                  key={tx.hash}
                  item
                  container
                  direction="column"
                  style={{
                    alignItems: "center",
                    maxWidth: "100px",
                  }}
                >
                  <Typography variant={"body2"} className={classes.subtitle}>
                    {tx.type}
                  </Typography>
                  <InsertDriveFileRoundedIcon
                    style={{
                      color: colors.cgBlue,
                    }}
                  />
                </Grid>
                <Divider orientation="vertical" className={classes.divVert} />
                <Grid
                  item
                  className={classes.fromToSpenderGrid}
                  align="left"
                  style={{ margin: "0px auto 0px 5px" }}
                >
                  <Link
                    style={{ color: "inherit", textDecoration: "inherit" }}
                    target="_blank"
                    href={`https://etherscan.io/address/${tx.address_to}`}
                  >
                    <Grid
                      container
                      direction={"row"}
                      justify={"center"}
                      align="right"
                      style={{ alignItems: "center" }}
                    >
                      <Grid
                        item
                        style={{ marginLeft: "10px", textAlign: "left" }}
                      >
                        <Typography
                          variant={"body2"}
                          className={classes.subtitle}
                        >
                          Contract:
                        </Typography>
                        <Typography variant={"h4"}>
                          {tx.address_to.substring(0, 6) +
                            "..." +
                            tx.address_to.substring(
                              tx.address_to.length - 4,
                              tx.address_to.length
                            )}
                        </Typography>
                      </Grid>
                      <IconButton className={classes.linkButton} size="small">
                        <ExitToAppIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Link>
                </Grid>
              </>
            )}
          </Grid>
          <Divider key={`divRow_${idx}`} variant="middle" />
        </div>
      ));
    }
  };

  changeMaxTXs = (event) => {
    let wallets = [];
    let newTxLimit = event.target.value;
    if (this.state.selectedWallet === "all") {
      this.state.userWallets.forEach((item, i) => {
        wallets.push(item);
      });
    } else {
      wallets = [this.state.selectedWallet];
    }

    this.setState({ txLimit: newTxLimit, loading: true });

    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_ADDRESS_TX,
        wallet: wallets,
        limit: newTxLimit,
        offset: this.state.txOffset,
        query: this.state.txQuery,
      });
  };

  changeTxPage = (action) => {
    const {
      txOffset,
      txLimit,
      selectedWallet,
      userWallets,
      txQuery,
    } = this.state;

    let wallets = [];

    if (selectedWallet === "all") {
      userWallets.forEach((item, i) => {
        wallets.push(item);
      });
    } else {
      wallets = [selectedWallet];
    }

    let newOffset;
    switch (action) {
      case "prev":
        newOffset = txOffset - 1;
        this.setState({ txOffset: newOffset, loading: true });
        dispatcher.dispatch({
          type: DB_GET_ADDRESS_TX,
          wallet: wallets,
          limit: txLimit,
          offset: newOffset * txLimit,
          query: txQuery,
        });
        break;
      case "next":
        newOffset = txOffset + 1;
        this.setState({ txOffset: newOffset, loading: true });
        dispatcher.dispatch({
          type: DB_GET_ADDRESS_TX,
          wallet: wallets,
          limit: txLimit,
          offset: newOffset * txLimit,
          query: txQuery,
        });
        break;
      default:
        break;
    }
  };

  render() {
    const { classes, tx, selected, wallets, query } = this.props;
    const {
      loading,
      account,
      dbDataLoaded,
      addWallet,
      newWallet,
      error,
      sortBy,
      sortOrder,
      txLimit,
      txOffset,
    } = this.state;

    return (
      <div className={classes.root}>
        <>
          <Card className={classes.favCard} elevation={3}>
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="stretch"
              style={{
                height: "max-content",
                overflowY: "scroll",
                flexWrap: "noWrap",
                scrollbarWidth: "thin",
                scrollbarColor: `${colors.cgGreen} #30303080`,
                paddingRight: 10,
                maxHeight: "600px",
              }}
            >
              {loading && <LinearProgress />}
              {!loading && this.drawTransactions(tx)}
            </Grid>
            <Grid
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
              style={{ marginTop: 10 }}
            >
              <IconButton
                disabled={txOffset === 0}
                onClick={() => this.changeTxPage("prev")}
              >
                <KeyboardArrowLeftRoundedIcon />
              </IconButton>
              <div className={classes.pageCounter}>{txOffset}</div>
              <IconButton onClick={() => this.changeTxPage("next")}>
                <KeyboardArrowRightRoundedIcon />
              </IconButton>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="demo-simple-select-outlined-label">
                  per page
                </InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={txLimit}
                  onChange={this.changeMaxTXs}
                  label="Age"
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
                  <MenuItem key={"100"} value={100}>
                    100
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Card>
        </>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withRouter(withStyles(styles)(TransactionsBig));
