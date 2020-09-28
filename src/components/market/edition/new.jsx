import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  Grid,
  Card,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ipfs from "../../ipfs";

import Loader from "../../loader";
import UnlockModal from "../../unlock/unlockModal.jsx";
import Snackbar from "../../snackbar";
import { colors } from "../../../theme";

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_CURRENTEDITION,
  EDITION_RETURNED,
  CREATE_NEW_EDITION,
  ACCOUNT_ROLES_RETURNED,
  GET_ACCOUNT_ROLES,
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
  bigDisplay: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
    minWidth: "50%",
    minHeight: "100%",
  },
});

class NewEdit extends Component {
  constructor(props) {
    super();
    this.state = {
      name: "",
      description: "",
      artistName: "",
      external_url: "",
      tokenURI: "",
      imagePath: "",
      isUploading: false,
      loading: false,
      account: "",
      buffer: null,
    };
    const account = store.getStore("account");

    if (account && account.address) {
      dispatcher.dispatch({ type: GET_CURRENTEDITION, content: {} });
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
    }
  }

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(EDITION_RETURNED, this.editionReturned);
    emitter.on(ACCOUNT_ROLES_RETURNED, this.accountRolesReturned);
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
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
    emitter.removeListener(ACCOUNT_ROLES_RETURNED, this.accountRolesReturned);
  }

  editionReturned = (curEdit) => {
    this.setState({ curEdit: curEdit });
  };

  accountRolesReturned = (payload) => {
    console.log(payload);
    this.setState({ isAdmin: payload[0] });
    this.setState({ isMinter: payload[1] });
    this.setState({ isLF: payload[2] });
  };

  refresh = () => {
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
  };

  connectionConnected = () => {
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
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
    dispatcher.dispatch({
      type: GET_ACCOUNT_ROLES,
      content: {},
    });
  };

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
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
  };

  handleArtistName = (event) => {
    this.setState({ artistName: event.target.value });
  };

  handleDesc = (event) => {
    this.setState({ description: event.target.value });
  };

  handleClick = (event) => {
    if (!this.state.imagePath.length > 0) return;

    if (!this.state.name.length > 0 || !this.state.description.length > 0)
      return;
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

  render() {
    const { classes, t } = this.props;
    const { loading, snackbarMessage, isAdmin, isMinter, isLF } = this.state;
    let editionData, artistAccount, artistCommission, price, maxSupply;

    const handleChange = (event) => {
      switch (event.target.id) {
        case "editionData":
          editionData = event.target.value;
          break;
        case "artistAccount":
          artistAccount = event.target.value;
          break;
        case "artistCommission":
          artistCommission = event.target.value;
          break;
        case "price":
          price = event.target.value;
          break;
        case "maxSupply":
          maxSupply = event.target.value;
          break;
        default:
          break;
      }
    };

    const onSubmit = async () => {
      let _editionNumber = (1 + parseInt(this.state.curEdit)) * 100;

      dispatcher.dispatch({
        type: CREATE_NEW_EDITION,
        content: {
          editionNumber: _editionNumber,
          editionData: editionData,
          artistAccount: artistAccount,
          artistCommission: artistCommission,
          price: price,
          tokenURI: this.state.tokenURI,
          maxSupply: maxSupply,
        },
      });
    };

    return (
      <div className={classes.background}>
        <div className={classes.root}>
          {isAdmin && (
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
                          variant="contained"
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
                      <TextField
                        id="standard-name"
                        label="ImageURL"
                        fullWidth
                        disabled="True"
                        margin="normal"
                        value={this.state.imagePath}
                        style={{
                          display: this.state.imagePath ? "flex" : "none",
                        }}
                      />
                      <TextField
                        id="standard-name"
                        label="Name"
                        fullWidth
                        onChange={this.handleName}
                        margin="normal"
                      />
                      <TextField
                        id="standard-multiline-flexible"
                        label="Description"
                        multiline
                        rowsMax="4"
                        onChange={this.handleDesc}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        id="standard-name"
                        label="Artist Name"
                        fullWidth
                        onChange={this.handleArtistName}
                        margin="normal"
                      />

                      <Button
                        style={{
                          display: this.state.imagePath ? "flex" : "none",
                        }}
                        variant="contained"
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
                      <FormControl fullWidth>
                        <InputLabel id="editionData" htmlFor="editionData">
                          Edition Data
                        </InputLabel>
                        <Input
                          id="editionData"
                          variant="filled"
                          onChange={handleChange}
                          aria-describedby="my-helper-text"
                        />
                        <FormHelperText id="my-helper-text">
                          Additional Edition data.
                        </FormHelperText>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="artistAccount" htmlFor="artistAccount">
                          Artist Account
                        </InputLabel>
                        <Input
                          id="artistAccount"
                          onChange={handleChange}
                          variant="filled"
                        />
                        <FormHelperText id="my-helper-textartist">
                          Artist's ethereum Wallet address.
                        </FormHelperText>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel
                          id="artistCommission"
                          htmlFor="artistCommission"
                        >
                          Artist Commission
                        </InputLabel>
                        <Input
                          onChange={handleChange}
                          id="artistCommission"
                          variant="filled"
                          aria-describedby="my-helper-textartist"
                        />
                        <FormHelperText id="my-helper-textartist">
                          Artist's commision share 0 - 100%.
                        </FormHelperText>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="price" htmlFor="price">
                          Price
                        </InputLabel>
                        <Input
                          onChange={handleChange}
                          id="price"
                          variant="filled"
                          aria-describedby="my-helper-textprice"
                        />
                        <FormHelperText id="my-helper-textprice">
                          price per item in Eth.
                        </FormHelperText>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="tokenURI" htmlFor="tokenURI">
                          Token URI
                        </InputLabel>
                        <Input
                          id="tokenURI"
                          variant="filled"
                          value={this.state.tokenURI}
                          aria-describedby="my-helper-textprice"
                        />
                        <FormHelperText id="my-helper-textprice">
                          Token URI IPFS Link.
                        </FormHelperText>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="maxSupply" htmlFor="maxSupply">
                          Max Supply
                        </InputLabel>
                        <Input
                          onChange={handleChange}
                          id="maxSupply"
                          variant="filled"
                          aria-describedby="my-helper-textprice"
                        />
                        <FormHelperText id="my-helper-textprice">
                          Maximum ammount available.
                        </FormHelperText>
                      </FormControl>
                      <Button
                        variant="contained"
                        disabled={loading}
                        onClick={onSubmit}
                        color="primary"
                      >
                        Submit
                      </Button>
                    </form>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          )}
          {!this.state.account.address && !isAdmin && (
            <div>{t("Wallet.PleaseConnect")}</div>
          )}
          {this.state.account.address && !isAdmin && (
            <div>{t("Wallet.NotAdmin")}</div>
          )}
          {loading && <Loader />}
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
