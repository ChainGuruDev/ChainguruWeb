import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Button,
  CircularProgress,
  TextField,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { withTranslation } from "react-i18next";

import {
  ERROR,
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTED,
  GIFT_EDITION,
  GIFT_EDITION_ARTIST,
} from "../../../constants";

import Store from "../../../stores";
const emitter = Store.emitter;
const store = Store.store;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    flex: 1,
    height: "auto",
    display: "flex",
    position: "relative",
  },
  form: {
    flex: 1,
    display: "flex",
  },
  contentContainer: {
    margin: "auto",
    textAlign: "center",
    padding: "12px",
    display: "flex",
    flexWrap: "wrap",
  },
  closeIcon: {
    position: "fixed",
    right: "12px",
    top: "12px",
    cursor: "pointer",
  },
  button: {
    marginTop: 15,
  },
});

class Gift extends Component {
  constructor(props) {
    super();

    this.state = {
      error: null,
      loading: false,
      destAccount: "",
    };
  }

  componentWillMount() {
    emitter.on(ERROR, this.error);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
  }

  error = (err) => {
    this.setState({
      loading: false,
      error: err,
      errorAccount: true,
    });
  };

  handleChange = (event) => {
    switch (event.target.id) {
      case "destinationAccount":
        this.setState({ destAccount: event.target.value });
        this.setState({ errorAccount: false });
        break;

      default:
        break;
    }
  };

  render() {
    const { classes, closeModal, t, editionNumber, account } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.closeIcon} onClick={closeModal}>
          <CloseIcon />
        </div>
        <div className={classes.contentContainer}>
          <form noValidate autoComplete="off">
            <TextField
              fullWidth
              id="destinationAccount"
              label="Gift to"
              onChange={this.handleChange}
              helperText={this.state.errMsgAccount}
              error={this.state.errorAccount}
            />
            <Button
              variant="outlined"
              disabled={this.state.isUploading}
              onClick={this.onSubmit}
              color="primary"
              className={classes.button}
            >
              {this.state.loading && <CircularProgress size={24} />}
              {!this.state.loading && "Gift"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  onSubmit = () => {
    let edition = this.props.editionNumber;
    let destAccount = this.state.destAccount;
    let giftToken = this.props.tokens[this.props.tokens.length - 1];
    dispatcher.dispatch({
      type: GIFT_EDITION,
      edition: edition,
      destAccount: destAccount,
      giftToken: giftToken,
    });
  };

  startLoading = () => {
    this.setState({ loading: true });
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Gift)));
