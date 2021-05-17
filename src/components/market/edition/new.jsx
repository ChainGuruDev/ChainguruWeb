import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Card, TextField, CircularProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ipfs from "../../ipfs";

import Loader from "../../loader";
import Snackbar from "../../snackbar";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_CURRENTEDITION,
  EDITION_RETURNED,
  CREATE_NEW_EDITION,
  NEW_EDITION_RETURNED,
  ACCOUNT_ROLES_RETURNED,
  GET_ACCOUNT_ROLES,
  CHECK_ACCOUNT,
  CHECK_ACCOUNT_RETURNED,
  IS_ALLOWED_RETURNED,
  IS_ALLOWED_ARTIST,
} from "../../../constants";

import { withTranslation } from "react-i18next";

import Store from "../../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  background: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: "100%",
    minHeight: "100vh",
    alignItems: "center",
    background: "linear-gradient(to top, #3cba92, #68efcf)",
  },
  root: {
    marginTop: "40px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: "1000px",
    width: "90%",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(10),
    textAlign: "center",
  },
  paperHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",

    padding: theme.spacing(1),
    borderRadius: "35px",
  },
  header: {
    marginLeft: "auto",
  },
  buttonWallet: {
    marginLeft: "auto",
    borderRadius: "35px",
  },
  gridList: {
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBar: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
  input: {
    display: "none",
  },
  editionCreate: {
    display: "flex",
    minHeight: "110%",
    alignItems: "center",
    justifyContent: "center",
  },
  editionForm: {
    display: "inline-flex",
    flexDirection: "column",
    position: "relative",
    // Reset fieldset default style.
    minWidth: 0,
    padding: 0,
    margin: 0,
    border: 0,
    verticalAlign: "top", // Fix alignment issue on Safari.
  },
  form: {
    borderRadius: "5px",
  },
  bigDisplay: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
    minWidth: "50%",
    minHeight: "100%",
  },
  image: {
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "5px",
    width: "250px",
  },
});

class NewEdit extends Component {
  constructor(props) {
    super();
    this.state = {
      isAllowedArtist: false,
      canCreate: false,
      name: "",
      description: "",
      artistName: "",
      artistAccount: "",
      commision: "",
      price: "",
      maxSupply: "",
      external_url: "",
      tokenURI: "",
      imagePath: "",
      isUploading: false,
      loading: false,
      account: "",
      buffer: null,
      errorName: false,
      errorDesc: false,
      errorArtistName: false,
      errorAccount: false,
      errorCommission: false,
      errorPrice: false,
      errorSupply: false,
      errMsgAccount: "Artist's ethereum Wallet address.",
      errMsgCommission: "Artist commission share %",
      errMsgPrice: "Edition price in Eth",
      errMsgSupply: "Maximum ammount available.",
    };
    const account = store.getStore("account");

    if (account && account.address) {
      dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
      dispatcher.dispatch({
        type: IS_ALLOWED_ARTIST,
        content: {},
      });
    }
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(EDITION_RETURNED, this.editionReturned);
    emitter.on(NEW_EDITION_RETURNED, this.newEditionReturned);
    emitter.on(ACCOUNT_ROLES_RETURNED, this.accountRolesReturned);
    emitter.on(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.on(IS_ALLOWED_RETURNED, this.isAllowedReturned);
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
    dispatcher.dispatch({
      type: IS_ALLOWED_ARTIST,
      content: {},
    });
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(EDITION_RETURNED, this.editionReturned);
    emitter.removeListener(NEW_EDITION_RETURNED, this.newEditionReturned);
    emitter.removeListener(ACCOUNT_ROLES_RETURNED, this.accountRolesReturned);
    emitter.removeListener(CHECK_ACCOUNT_RETURNED, this.checkAccountReturned);
    emitter.removeListener(IS_ALLOWED_RETURNED, this.isAllowedReturned);
  }

  checkAccountReturned = (_isAccount) => {
    if (!_isAccount) {
      this.setState({ errMsgAccount: "Not a valid ethereum address" });
    } else {
      this.setState({ errMsgAccount: "Artist's ethereum Wallet address." });
    }
    this.setState({ errorAccount: !_isAccount });
  };

  editionReturned = (curEdit) => {
    this.setState({ curEdit: curEdit });
  };

  newEditionReturned = () => {
    this.nav(`/market`);
  };

  accountRolesReturned = (payload) => {
    this.setState({ isAdmin: payload[0] });
    this.setState({ isMinter: payload[1] });
    this.setState({ isLF: payload[2] });
    if (payload[0] || payload[2]) {
      this.setState({ canCreate: true });
    }
  };

  isAllowedReturned = (payload) => {
    this.setState({ isAllowedArtist: payload });
    if (this.state.isAdmin || payload) {
      this.setState({ canCreate: true });
      console.log("CAN CREATE");
    }
  };

  refresh = () => {
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
    dispatcher.dispatch({
      type: IS_ALLOWED_ARTIST,
      content: {},
    });
  };

  connectionConnected = () => {
    const account = store.getStore("account").address;
    const { t } = this.props;
    this.setState({ account: store.getStore("account") });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: t("Unlock.WalletConnected"),
        snackbarType: "Info",
      };
      that.setState(snackbarObj);
    });
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
    dispatcher.dispatch({
      type: IS_ALLOWED_ARTIST,
      content: {},
    });
  };

  connectionDisconnected = () => {
    const account = store.getStore("account");

    this.setState({ account: store.getStore("account") });
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
    dispatcher.dispatch({
      type: IS_ALLOWED_ARTIST,
      content: {},
    });
  };

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    this.setState({ isUploading: false });

    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: error.toString(),
        snackbarType: "Error",
      };
      that.setState(snackbarObj);
    });
  };

  handleFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.convertToBuffer(reader);
    };
  };

  convertToBuffer = async (reader) => {
    this.setState({ isUploading: true });
    const buffer = await Buffer.from(reader.result);
    this.uploadImage(await buffer);
  };

  uploadImage = async (buffer) => {
    let results = await ipfs.add(buffer);
    this.setState({
      imagePath: "https://cloudflare-ipfs.com/ipfs/" + (await results.path),
      isUploading: false,
    });
  };

  uploadTokenURI = async (buffer) => {
    let results = await ipfs.add(buffer);
    this.setState({
      tokenURI: "https://cloudflare-ipfs.com/ipfs/" + (await results.path),
      isUploading: false,
    });
  };

  handleName = (event) => {
    this.setState({ name: event.target.value });
    this.setState({ errorName: false });
  };

  handleArtistName = (event) => {
    this.setState({ artistName: event.target.value });
    this.setState({ errorArtistName: false });
  };

  handleDesc = (event) => {
    this.setState({ description: event.target.value });
    this.setState({ errorDesc: false });
  };

  handleClick = (event) => {
    if (!this.state.imagePath.length > 0) return;
    if (!this.state.name.length > 0)
      return (
        this.setState({ errorName: true }),
        this.errorReturned("Must input some Token Name")
      );
    if (!this.state.artistName.length > 0)
      return (
        this.setState({ errorArtistName: true }),
        this.errorReturned("Must input Artist Name")
      );
    if (!this.state.description.length > 0)
      return (
        this.setState({ errorDesc: true }),
        this.errorReturned("Must input some description")
      );
    this.setState({ isUploading: true });

    let _editionNumber = (1 + parseInt(this.state.curEdit)) * 100;
    let _extURL =
      "https://longboardfamara.herokuapp.com/edition/" + _editionNumber;

    let metadata = {};
    metadata.name = this.state.name;
    metadata.description = this.state.description;
    metadata.artistName = this.state.artistName;
    metadata.external_url = _extURL;
    metadata.image = this.state.imagePath;
    metadata = JSON.stringify(metadata);

    let buffer = Buffer.from(metadata);

    this.uploadTokenURI(buffer);
  };

  handleChange = (event) => {
    switch (event.target.id) {
      case "artistAccount":
        this.setState({ artistAccount: event.target.value });
        this.setState({ errorAccount: false });
        dispatcher.dispatch({
          type: CHECK_ACCOUNT,
          content: event.target.value,
        });
        break;

      case "artistCommission":
        let _commission = event.target.value.replace(",", ".");

        this.setState({ commision: _commission });
        this.setState({ errorCommission: false });
        if (isNaN(_commission)) {
          this.setState({ errorCommission: true });
          this.setState({
            errMsgCommission: "commission must be a number between 0 and 100",
          });
        } else {
          if (_commission < 0 || _commission > 100) {
            this.setState({ errorCommission: true });
            this.setState({
              errMsgCommission: "commission must be a number between 0 and 100",
            });
          } else {
            this.setState({ errorCommission: false });
            this.setState({ errMsgCommission: "Artist commission share %" });
          }
        }
        break;

      case "price":
        let _price = event.target.value.replace(",", ".");
        this.setState({ price: _price });
        if (isNaN(_price)) {
          this.setState({ errorPrice: true });
          this.setState({ errMsgPrice: "Price must be a number" });
        } else {
          this.setState({ errorPrice: false });
          this.setState({ errMsgPrice: "Edition price in Eth" });
        }
        break;

      case "maxSupply":
        let _maxSupply = parseInt(event.target.value);
        this.setState({ maxSupply: _maxSupply });
        this.setState({ errorSupply: false });
        if (!Number.isInteger(_maxSupply)) {
          this.setState({ errorSupply: true });
          this.setState({ errMsgSupply: "Maximum supply must be an integer" });
        }
        if (Number.isInteger(_maxSupply)) {
          if (_maxSupply < 1 || _maxSupply > 99) {
            this.setState({ errorSupply: true });
            this.setState({
              errMsgSupply: "Max Supply must be a number between 1 and 99",
            });
          } else {
            this.setState({ errorSupply: false });
            this.setState({ errMsgSupply: "Maximum ammount available." });
          }
        }

        break;

      default:
        break;
    }
  };

  onSubmit = async () => {
    let _price = this.state.price.replace(",", ".");
    this.setState({ isUploading: true });
    if (!this.state.commision) {
      return (
        this.setState({ isUploading: false }),
        this.setState({ errorCommission: true }),
        this.setState({ errMsgCommission: "Must input some Commission value" }),
        this.errorReturned("Must input some Commission value")
      );
    }
    if (this.state.isAdmin) {
      if (!this.state.artistAccount) {
        return (
          this.setState({ isUploading: false }),
          this.setState({ errorAccount: true }),
          this.setState({ errMsgAccount: "Must input some artist Account" }),
          this.errorReturned("Must input some artist Account")
        );
      }
    } else {
      this.setState({ artistAccount: this.state.account });
    }
    if (!this.state.price) {
      return (
        this.setState({ isUploading: false }),
        this.setState({ errorPrice: true }),
        this.setState({ errMsgPrice: "Must input some price value" }),
        this.errorReturned("Must input some price value")
      );
    }
    if (!this.state.maxSupply) {
      return (
        this.setState({ isUploading: false }),
        this.setState({ errorSupply: true }),
        this.setState({ errMsgSupply: "Must input some max supply" }),
        this.errorReturned("Must input some max supply")
      );
    }

    if (
      this.state.errorAccount ||
      this.state.errorPrice ||
      this.state.errorCommission ||
      this.state.errorSupply
    ) {
      this.setState({ isUploading: false });
    } else {
      dispatcher.dispatch({
        type: CREATE_NEW_EDITION,
        content: {
          artistAccount: this.state.artistAccount,
          artistCommission: this.state.commision,
          price: _price,
          tokenURI: this.state.tokenURI,
          maxSupply: this.state.maxSupply,
        },
      });
    }
  };

  render() {
    const { classes, t } = this.props;
    const {
      loading,
      snackbarMessage,
      isAdmin,
      isMinter,
      isLF,
      isAllowedArtist,
      canCreate,
    } = this.state;

    return (
      <div className={classes.background}>
        <div className={classes.root}>
          {canCreate && (
            <Grid justify="space-evenly" container spacing={3}>
              <Grid item xs={12}>
                <Card className={classes.editionCreate} elevation={10}>
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                  >
                    <form
                      className={classes.root}
                      style={{
                        display: this.state.tokenURI ? "none" : "flex",
                      }}
                      noValidate
                      autoComplete="off"
                    >
                      <input
                        accept="image/*"
                        className={classes.input}
                        id="outlined-button-file"
                        type="file"
                        onChange={this.handleFile}
                        onClick={(event) => {
                          event.target.value = null;
                        }}
                      />
                      <label
                        htmlFor="outlined-button-file"
                        style={{
                          display: this.state.isUploading ? "block" : "block",
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          component="span"
                          style={{
                            display: this.state.imagePath ? "none" : "flex",
                          }}
                          disabled={this.state.isUploading}
                        >
                          {this.state.isUploading && (
                            <CircularProgress size={24} />
                          )}
                          {!this.state.isUploading && "Upload image"}
                        </Button>
                      </label>

                      <img
                        className={classes.image}
                        alt={this.state.imagePath}
                        src={this.state.imagePath}
                        borderRadius="8px"
                        style={{
                          display: this.state.imagePath ? "flex" : "none",
                        }}
                      ></img>

                      <TextField
                        id="standard-name"
                        label="Name"
                        fullWidth
                        onChange={this.handleName}
                        margin="normal"
                        error={this.state.errorName}
                        className={classes.form}
                        helperText={
                          this.state.errorName && "Please enter some token name"
                        }
                      />
                      <TextField
                        id="standard-multiline-flexible"
                        label="Description"
                        multiline
                        rowsMax="4"
                        onChange={this.handleDesc}
                        fullWidth
                        margin="normal"
                        error={this.state.errorDesc}
                        helperText={
                          this.state.errorDesc &&
                          "Please enter some description"
                        }
                      />
                      <TextField
                        id="standard-name"
                        label="Artist Name"
                        fullWidth
                        onChange={this.handleArtistName}
                        margin="normal"
                        error={this.state.errorArtistName}
                        helperText={
                          this.state.errorArtistName &&
                          "Please enter some artist name"
                        }
                      />
                      <Button
                        style={{
                          display: this.state.imagePath ? "flex" : "none",
                        }}
                        variant="outlined"
                        color="primary"
                        component="span"
                        className={classes.button}
                        onClick={this.handleClick}
                        disabled={this.state.isUploading}
                      >
                        {this.state.isUploading && (
                          <CircularProgress size={24} />
                        )}
                        {!this.state.isUploading && "Upload token"}
                      </Button>
                    </form>
                    <form
                      className={classes.root}
                      noValidate
                      autoComplete="off"
                      style={{
                        display: this.state.tokenURI ? "flex" : "none",
                      }}
                    >
                      {isAdmin && (
                        <TextField
                          fullWidth
                          id="artistAccount"
                          label="Artist Account"
                          onChange={this.handleChange}
                          helperText={this.state.errMsgAccount}
                          error={this.state.errorAccount}
                        />
                      )}

                      <TextField
                        fullWidth
                        id="artistCommission"
                        label="Artist Commision"
                        onChange={this.handleChange}
                        error={this.state.errorCommission}
                        helperText={this.state.errMsgCommission}
                      />
                      <TextField
                        fullWidth
                        id="price"
                        label="Price"
                        onChange={this.handleChange}
                        error={this.state.errorPrice}
                        helperText={this.state.errMsgPrice}
                      />
                      <TextField
                        fullWidth
                        label="Max Supply"
                        onChange={this.handleChange}
                        id="maxSupply"
                        error={this.state.errorSupply}
                        helperText={this.state.errMsgSupply}
                      />
                      <Button
                        variant="outlined"
                        disabled={this.state.isUploading}
                        onClick={this.onSubmit}
                        color="primary"
                      >
                        {this.state.isUploading && (
                          <CircularProgress size={24} />
                        )}
                        {!this.state.isUploading && "Submit"}
                      </Button>
                    </form>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          )}
          {!this.state.account.address && !canCreate && (
            <div>{t("Wallet.PleaseConnect")}</div>
          )}
          {this.state.account.address && !canCreate && (
            <div>{t("Wallet.NotLF")}</div>
          )}
          {loading && <Loader />}
          {snackbarMessage && this.renderSnackbar()}
        </div>
      </div>
    );
  }

  startLoading = () => {
    this.setState({ loading: true });
  };

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return (
      <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
    );
  };
}

export default withTranslation()(withRouter(withStyles(styles)(NewEdit)));
