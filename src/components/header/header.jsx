import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import { Paper, Grid } from "@material-ui/core";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { withRouter } from "react-router-dom";
import { colors } from "../../theme";
import ENS from "ethjs-ens";
import { withTranslation } from "react-i18next";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DARKMODE_SWITCH,
} from "../../constants";

import Brightness2OutlinedIcon from "@material-ui/icons/Brightness2Outlined";
import Brightness2RoundedIcon from "@material-ui/icons/Brightness2Rounded";

import UnlockModal from "../unlock/unlockModal.jsx";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    borderRadius: "0px",
    verticalAlign: "top",
    width: "100%",
    display: "flex",
  },
  headerV2: {
    width: "100%",
    display: "flex",
    borderBottom: "3px solid " + colors.cgOrange,
    padding: "24px 32px",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "space-between",
      padding: "16px 24px",
    },
  },
  icon: {
    display: "flex",
    alignItems: "flex-start",
    flex: 1,
    cursor: "pointer",
  },
  links: {
    display: "flex",
    flex: "auto",
    width: "inherit",
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    padding: "12px 0px",
    margin: "0px 12px",
    cursor: "pointer",
    "&:hover": {
      paddingBottom: "9px",
      borderBottom: "3px solid " + colors.compoundGreen,
    },
  },
  title: {
    textTransform: "capitalize",
  },
  linkActive: {
    padding: "12px 0px",
    margin: "0px 12px",
    cursor: "pointer",
    paddingBottom: "9px",
    borderBottom: "3px solid " + colors.green,
  },
  account: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: "auto",
    [theme.breakpoints.down("sm")]: {
      flex: "0",
    },
  },
  darkModeSwitch: {
    display: "flex",
    flex: "auto",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  walletAddress: {
    padding: "12px",
    border: "2px solid rgb(174, 174, 174)",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      border: "2px solid " + colors.borderBlue,
      background: "rgba(47, 128, 237, 0.1)",
    },
  },
  walletTitle: {
    flex: 1,
    color: colors.darkGray,
  },
  connectedDot: {
    background: colors.compoundGreen,
    opacity: "1",
    borderRadius: "10px",
    width: "10px",
    height: "10px",
    marginRight: "3px",
    marginLeft: "6px",
  },
  name: {
    paddingLeft: "24px",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
});

class Header extends Component {
  constructor(props) {
    super();

    this.state = {
      account: store.getStore("account"),
      modalOpen: false,
    };
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
  }

  connectionConnected = () => {
    let _acc = store.getStore("account");
    this.setState({ account: _acc });
    dispatcher.dispatch({
      type: DB_GET_USERDATA,
      address: _acc.address,
    });

    //this.setAddressEnsName();
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account") });
  };

  setAddressEnsName = async () => {
    const context = store.getStore("web3context");
    if (context && context.library && context.library.provider) {
      const provider = context.library.provider;
      const account = store.getStore("account");
      const { address } = account;
      const network = provider.networkVersion;
      const ens = new ENS({ provider, network });
      const addressEnsName = await ens.reverse(address).catch(() => {});
      if (addressEnsName) {
        this.setState({ addressEnsName });
      }
    }
  };

  render() {
    const { classes, t } = this.props;

    const { account, addressEnsName, modalOpen, darkMode } = this.state;

    var address = null;
    if (account.address) {
      address =
        account.address.substring(0, 6) +
        "..." +
        account.address.substring(
          account.address.length - 4,
          account.address.length
        );
    }
    const addressAlias = addressEnsName || address;

    const handleChangeDarkMode = (event) => {
      let state = event.target.checked;
      dispatcher.dispatch({
        type: "DARKMODE_SWITCH",
        content: state,
      });
    };

    return (
      <Paper className={classes.root}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <div className={classes.headerV2}>
            <div className={classes.icon}>
              <img
                alt=""
                height={"40px"}
                onClick={() => {
                  this.nav("");
                }}
              />
              <Typography
                variant={"h3"}
                className={classes.name}
                onClick={() => {
                  this.nav("");
                }}
              >
                ChainGuru
              </Typography>
            </div>
            <div className={classes.links}>
              {this.renderLink("short")}
              {this.renderLink("medium")}
              {this.renderLink("long")}
              {this.renderLink("market")}
            </div>
            <div className={classes.darkModeSwitch}>
              <FormGroup
                style={{
                  display: "flex",
                  justifyContent: "right",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  style={{
                    display: "flex",
                    justifyContent: "right",
                    alignItems: "center",
                  }}
                  control={
                    <Checkbox
                      style={{
                        display: "flex",
                        justifyContent: "right",
                        alignItems: "center",
                      }}
                      icon={<Brightness2OutlinedIcon fontSize="small" />}
                      checkedIcon={<Brightness2RoundedIcon fontSize="small" />}
                      name="darkModeSwitch"
                      onChange={handleChangeDarkMode}
                    />
                  }
                />
              </FormGroup>
            </div>
            <div className={classes.account}>
              {address && (
                <Typography
                  variant={"h4"}
                  className={classes.walletAddress}
                  noWrap
                  onClick={this.addressClicked}
                >
                  {addressAlias}
                  <div className={classes.connectedDot}></div>
                </Typography>
              )}
              {!address && (
                <Typography
                  variant={"h4"}
                  className={classes.walletAddress}
                  noWrap
                  onClick={this.addressClicked}
                >
                  {t("Market.Connect")}
                </Typography>
              )}
            </div>
          </div>
        </Grid>
        {modalOpen && this.renderModal()}
      </Paper>
    );
  }

  renderLink = (screen) => {
    const { classes, t } = this.props;
    return (
      <div
        className={
          window.location.pathname === "/" + screen
            ? classes.linkActive
            : classes.link
        }
        onClick={() => {
          this.nav(screen);
        }}
      >
        <Typography variant={"h4"} className={`title`}>
          {t("Home." + screen)}
        </Typography>
      </div>
    );
  };

  nav = (screen) => {
    if (screen === "cover") {
      window.open("https://longboardfamara.herokuapp.com/", "_blank");
      return;
    }
    this.props.history.push("/" + screen);
  };

  addressClicked = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  renderModal = () => {
    return (
      <UnlockModal
        closeModal={this.closeModal}
        modalOpen={this.state.modalOpen}
      />
    );
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Header)));
