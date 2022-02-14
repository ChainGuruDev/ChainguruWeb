import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";

import { debounce } from "lodash";
import ENS from "ethjs-ens";

import {
  Button,
  TextField,
  CircularProgress,
  DialogContent,
  Dialog,
  Slide,
  Grid,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import {
  ERROR,
  DB_ADD_WALLET,
  DB_ADD_WALLET_WATCHLIST,
  DB_ADD_WALLET_RETURNED,
  CHECK_ACCOUNT,
  CHECK_ACCOUNT_RETURNED,
} from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    flex: 1,
    height: "auto",
    display: "flex",
    position: "relative",
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

class WalletAddModal extends Component {
  constructor(props) {
    super();

    this.state = {
      error: false,
      loading: false,
      newWallet: "",
      errMsgWallet: "",
      errorWallet: true,
      type: props.type,
    };
  }

  componentDidMount() {
    emitter.on(ERROR, this.error);
    emitter.on(DB_ADD_WALLET_RETURNED, this.walletAdded);
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(DB_ADD_WALLET_RETURNED, this.walletAdded);
    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
  }

  error = (err) => {
    this.setState({
      loading: false,
      error: err,
    });
  };

  walletAdded = () => {
    this.setState({ loading: false });
    this.props.closeModal();
  };

  addWallet = (wallet, type) => {
    if (type === "portfolio") {
      if (wallet) {
        dispatcher.dispatch({
          type: DB_ADD_WALLET,
          wallet: wallet,
        });
        this.setState({ loading: true });
      } else {
        this.setState({ errorWallet: true });
      }
    } else {
      if (wallet) {
        dispatcher.dispatch({
          type: DB_ADD_WALLET_WATCHLIST,
          wallet: wallet,
        });
        this.setState({ loading: true });
      } else {
        this.setState({ errorWallet: true });
      }
    }
  };

  debouncedWalletCheck = debounce(async (newWallet) => {
    if (newWallet.length > 0) {
      this.setState({ newWallet: newWallet, errorWallet: false });
      dispatcher.dispatch({
        type: CHECK_ACCOUNT,
        content: newWallet,
      });
    }
  }, 300);

  handleChange = async (e) => {
    this.debouncedWalletCheck(e.target.value);
  };

  handleChangeType = (event) => {
    this.setState({ type: event.target.value });
  };

  toggleAddWallet = () => {
    let _addingWallet = this.state.addWallet;
    this.setState({
      addWallet: !_addingWallet,
      newWallet: "",
      errorWallet: true,
    });
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

  render() {
    const { classes, closeModal, modalOpen } = this.props;
    const { newWallet, type } = this.state;
    const { loading } = this.state;
    const fullScreen = window.innerWidth < 450;
    return (
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        fullWidth={true}
        maxWidth={"sm"}
        TransitionComponent={Transition}
        fullScreen={fullScreen}
      >
        <DialogContent>
          <Grid
            id="rootGrid"
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item style={{ textAlign: "center" }} xs={12}>
              <Typography variant={"h4"}>Add new wallet</Typography>
              <Divider variant="middle" style={{ marginBottom: "10px" }} />
            </Grid>
            <Divider style={{ marginTop: 10 }} />
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
              xs={12}
            >
              <Grid item xs={9}>
                <TextField
                  className={classes.walletInput}
                  id="walletAdd"
                  label="Wallet Address"
                  onChange={this.handleChange}
                  helperText={this.state.errMsgWallet}
                  error={this.state.errorWallet}
                  style={{ display: "flex" }}
                />
              </Grid>
              <Grid item style={{ textAlign: "end" }} xs={3}>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel id="demo-simple-select-outlined-label">
                    Add to
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={type}
                    onChange={this.handleChangeType}
                    label="Add to"
                  >
                    <MenuItem value={"portfolio"}>Portfolio</MenuItem>
                    <MenuItem value={"watchlist"}>Watchlist</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid item style={{ textAlign: "end", marginTop: 5 }} xs={12}>
              {!loading && (
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  className={classes.button}
                  startIcon={<AddCircleRoundedIcon />}
                  onClick={() => {
                    this.addWallet(newWallet, type);
                  }}
                  disabled={this.state.errorWallet}
                >
                  Add
                </Button>
              )}
              {loading && (
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  className={classes.button}
                  disabled={this.state.errorWallet}
                >
                  <CircularProgress />
                </Button>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(WalletAddModal);
