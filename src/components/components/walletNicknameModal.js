import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  CircularProgress,
  DialogContent,
  Dialog,
  Slide,
  Grid,
  TextField,
  Typography,
  Divider,
} from "@material-ui/core";

import {
  ERROR,
  DB_SET_USER_WALLET_NICKNAME,
  DB_SET_USER_WALLET_NICKNAME_RETURNED,
  DB_REMOVE_USER_WALLET_NICKNAME,
  DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
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

class WalletNicknameModal extends Component {
  constructor(props) {
    super();

    this.state = {
      error: null,
      loading: false,
      newNick: "",
      wallet: props.wallet,
      oldNickname: props.nickname,
    };
  }

  componentDidMount() {
    emitter.on(ERROR, this.error);
    emitter.on(DB_SET_USER_WALLET_NICKNAME_RETURNED, this.setNicknameReturned);
    emitter.on(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(
      DB_SET_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
    emitter.removeListener(
      DB_REMOVE_USER_WALLET_NICKNAME_RETURNED,
      this.setNicknameReturned
    );
  }

  error = (err) => {
    this.setState({
      loading: false,
      error: err,
    });
  };

  setNicknameReturned = (data) => {
    this.setState({
      loading: false,
    });
    this.props.closeModal();
  };

  handleNickname = (event) => {
    if (event.target.value.length > 0) {
      this.setState({
        newNickname: event.target.value,
      });
    } else {
      this.setState({ newNickname: "" });
    }
  };

  setNewNickname = (newNick, wallet) => {
    console.log(newNick, wallet);
    if (newNick) {
      dispatcher.dispatch({
        type: DB_SET_USER_WALLET_NICKNAME,
        wallet: wallet,
        nick: newNick,
      });
    } else {
      dispatcher.dispatch({
        type: DB_REMOVE_USER_WALLET_NICKNAME,
        wallet: wallet,
      });
    }

    this.setState({ loading: true });
  };

  render() {
    const { closeModal, modalOpen } = this.props;
    const { wallet, oldNickname, loading } = this.state;
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
              <Typography variant={"h4"}>Set wallet nickname</Typography>
              <Divider variant="middle" style={{ marginBottom: "10px" }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant={"body1"}>Wallet:</Typography>
              <Typography variant={"body1"} color={"primary"}>
                {wallet}
              </Typography>
              {oldNickname && (
                <>
                  <Typography variant={"body1"}>Current Nickname:</Typography>
                  <Typography variant={"body1"} color={"primary"}>
                    {oldNickname}
                  </Typography>
                </>
              )}
              <Divider style={{ margin: "10px" }} />
            </Grid>
            <TextField
              id="newNickname"
              label="New Nickname"
              placeholder={oldNickname ? oldNickname : ""}
              helperText={
                this.state.errorNick
                  ? this.state.errorMSG
                  : "Enter desired nickname/alias"
              }
              error={this.state.errorNick}
              margin="normal"
              onChange={this.handleNickname}
            />
            {!loading && (
              <>
                <Button
                  style={{ marginLeft: "10px" }}
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    this.setNewNickname(this.state.newNickname, wallet)
                  }
                >
                  Save
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

export default withStyles(styles)(WalletNicknameModal);
