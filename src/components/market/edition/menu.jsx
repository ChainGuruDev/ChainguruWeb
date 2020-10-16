import React, { Component } from "react";
import { withRouter, useParams } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import {
  Grid,
  GridList,
  Button,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@material-ui/core";

import Loader from "../../loader";
import Snackbar from "../../snackbar";
import { colors } from "../../../theme";
import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_EDITION_DETAILS,
  EDITION_DETAILS_RETURNED,
  BUY_RETURNED,
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
    width: "100%",
    minHeight: "100%",
    background: "linear-gradient(to top, #3cba92, #68efcf)",
    alignItems: "center",
  },
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: "1920px",
    width: "90%",
    minHeight: "100%",
  },

  gridList: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    padding: 50,

    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
  },
  imageContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  image: {
    display: "flex",
    flex: 1,
    maxWidth: "80%",
  },
  menuBar: {
    minWidth: 200,
  },
  menuItems: {
    padding: 15,
    alignItems: "center",
    textAlign: "left",

    background: colors.cardBackground,
  },
  divider: {
    margin: 15,
  },
  button: {
    marginRight: 15,
    marginBottom: 15,
  },
});

class Show extends Component {
  constructor() {
    super();

    if (account && account.address) {
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
    }
  }


  componentDidMount() {
    const account = store.getStore("account");

    emitter.on(ERROR, this.errorReturned);
    if (account && account.address) {
      dispatcher.dispatch({
        type: GET_ACCOUNT_ROLES,
        content: {},
      });
      dispatcher.dispatch({
        type: GET_EDITION_DETAILS,
        content: _editNumber,
      });
    }
  }



  render() {
    const { classes, t } = this.props;
    const {
      loading,
      editionToken,
      editionDetails,
    } = this.state;

    return (
<Paper className={classes.menuItems} elevation={3}>
  <Typography variant="subtitle2">Name:</Typography>
  <Typography variant="h6">{editionToken.name}</Typography>
  <Divider className={classes.divider} />
  <Typography variant="subtitle2">Description:</Typography>
  <Typography variant="body2">
    {editionToken.description}
  </Typography>
  <Divider className={classes.divider} />
  <Typography variant="subtitle2">Artist:</Typography>

  <Typography variant="h6">
    {editionToken.artistName}
  </Typography>
  <Divider className={classes.divider} />
  <Typography variant="subtitle2">
    Artist Commission:
  </Typography>
  <Typography variant="h6">
    {editionDetails._artistCommission}
  </Typography>
  <Divider className={classes.divider} />
  <Typography variant="subtitle2">Edition:</Typography>
  <Typography variant="h6">
    {this.state.editionNumber}
  </Typography>
  <Divider className={classes.divider} />
  <Typography variant="subtitle2">Price in Eth:</Typography>
  <Typography variant="h6">
    {editionDetails._priceInWei / 1000000000000000000}
  </Typography>
  <Divider className={classes.divider} />
  {editionDetails._maxAvailable -
    editionDetails._circulatingSupply !=
    0 && (
      <Button
        variant="outlined"
        disabled={loading}
        onClick={this.buyEdition}
        size="small"
        color="primary"
        className={classes.button}
      >
        {loading && <CircularProgress size={24} />}
        {!loading &&
          editionDetails._maxAvailable -
          editionDetails._circulatingSupply >
          0 &&
          "Buy for " +
          editionDetails._priceInWei / 1000000000000000000 +
        " eth"}
      </Button>
    )}
  {editionDetails._maxAvailable -
    editionDetails._circulatingSupply ===
    0 && (
      <Button
        variant="outlined"
        disabled={loading}
        size="small"
        color="primary"
        className={classes.button}
      >
        Sold Out
      </Button>
    )}
  <Button
    variant="outlined"
    disabled
    size="small"
    className={classes.button}
  >
    {editionDetails._maxAvailable -
    editionDetails._circulatingSupply}
    {" / "}
    {editionDetails._maxAvailable} remaining
  </Button>
</Paper>
        )}


    );
  }

  startLoading = () => {
    this.setState({ loading: true });
  };
  stopLoading = () => {
    this.setState({ loading: false });
  };

}

export default withTranslation()(withRouter(withStyles(styles)(Show)));
