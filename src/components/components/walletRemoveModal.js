import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  CircularProgress,
  DialogContent,
  Dialog,
  Slide,
  Grid,
  Typography,
  Divider,
} from "@material-ui/core";

import {
  ERROR,
  DB_DEL_WALLET,
  DB_DEL_WALLET_WATCHLIST,
  DB_DEL_WALLET_RETURNED,
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

class WalletRemoveModal extends Component {
  constructor(props) {
    super();

    this.state = {
      error: null,
      loading: false,
      wallet: props.wallet,
      nick: props.nickname,
    };
  }

  componentDidMount() {
    emitter.on(ERROR, this.error);
    emitter.on(DB_DEL_WALLET_RETURNED, this.walletDeleted);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(DB_DEL_WALLET_RETURNED, this.walletDeleted);
  }

  error = (err) => {
    this.setState({
      loading: false,
      error: err,
    });
  };

  walletDeleted = () => {
    this.setState({ loading: false });
    this.props.closeModal();
  };

  deleteWallet = (wallet) => {
    dispatcher.dispatch({
      type: DB_DEL_WALLET,
      wallet: wallet,
    });
    this.setState({ loading: true });
  };

  render() {
    const { closeModal, modalOpen, wallet, nickname } = this.props;
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
              <Typography variant={"h4"}>Confirm wallet removal</Typography>
              <Typography style={{ marginTop: 10 }} variant={"h5"}>
                You will stop tracking this wallet, and will remove it from your
                wallets list.
              </Typography>
              <Divider variant="middle" style={{ marginBottom: "10px" }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant={"body1"}>Wallet:</Typography>
              <Typography variant={"body1"} color={"primary"}>
                {nickname && nickname + "  (" + wallet + ")"}
                {!nickname && wallet}
              </Typography>
              <Divider style={{ margin: "10px" }} />
            </Grid>
            {!loading && (
              <>
                <Button
                  style={{ marginLeft: "10px" }}
                  variant="outlined"
                  color="primary"
                  onClick={() => this.deleteWallet(wallet)}
                >
                  Confirm
                </Button>
                <Button
                  style={{ marginLeft: "10px" }}
                  variant="outlined"
                  color="secondary"
                  onClick={() => this.props.closeModal()}
                >
                  Back
                </Button>
              </>
            )}
            {loading && (
              <Button
                style={{ marginLeft: "10px" }}
                variant="outlined"
                disabled
              >
                <CircularProgress />
              </Button>
            )}
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(WalletRemoveModal);
