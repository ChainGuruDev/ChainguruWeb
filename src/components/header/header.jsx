import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import { Paper, Grid, Icon, SvgIcon, IconButton } from "@material-ui/core";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { withRouter } from "react-router-dom";
import { colors } from "../../theme";
import ENS from "ethjs-ens";
import { withTranslation } from "react-i18next";

import { ReactComponent as CGLogo } from "../../assets/logos/logo_chainguru.svg";
import { ReactComponent as GASIcon } from "../../assets/gas.svg";
import { ReactComponent as Usd } from "../../assets/dolar.svg";
import { ReactComponent as Eur } from "../../assets/euro.svg";
import { ReactComponent as Btc } from "../../assets/bitcoin.svg";
import { ReactComponent as Eth } from "../../assets/ethereum.svg";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  DB_GET_USERDATA,
  DARKMODE_SWITCH,
  DARKMODE_SWITCH_RETURN,
  CHECK_GASPRICE,
  SWITCH_VS_COIN,
  GASPRICE_RETURNED,
  SWITCH_VS_COIN_RETURNED,
} from "../../constants";

import Brightness2OutlinedIcon from "@material-ui/icons/Brightness2Outlined";
import Brightness2RoundedIcon from "@material-ui/icons/Brightness2Rounded";
import LocalGasStationOutlinedIcon from "@material-ui/icons/LocalGasStationOutlined";
import SettingsIcon from "@material-ui/icons/Settings";

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
    padding: "17px 24px",
  },
  icon: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    cursor: "pointer",
    maxHeight: "50px",
    maxWidth: "100px",
  },
  imageIcon: {
    display: "flex",
    maxWidth: "100%",
    maxHeight: "inherit",
  },
  iconVS: {
    display: "flex",
    cursor: "pointer",
    maxHeight: "50px",
  },
  imageIconVS: {
    maxHeight: "50px",
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
      borderBottom: "3px solid " + colors.cgGreen,
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
    borderBottom: "3px solid " + colors.cgGreen,
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
    justifyContent: "center",
    alignItems: "center",
  },
  walletAddress: {
    padding: "12px",
    border: "2px solid rgb(174, 174, 174)",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      border: "2px solid " + colors.cgOrange,
      background: "rgba(47, 128, 237, 0.1)",
    },
  },
  gasPrice: {
    padding: "12px",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "25px",
    cursor: "pointer",
    "&:hover": {
      background: "rgba(47, 128, 237, 0.1)",
    },
  },
  vsCoinDIV: {
    padding: "0px",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "15px",
    cursor: "pointer",
    "&:hover": {
      background: "rgba(47, 128, 237, 0.1)",
    },
  },

  walletTitle: {
    flex: 1,
    color: colors.darkGray,
  },
  connectedDot: {
    background: colors.cgGreen,
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
    super(props);

    const account = store.getStore("account");
    const theme = store.getStore("theme");
    const vsCoin = store.getStore("vsCoin");

    const darkModeBool = theme === "dark" ? true : false;

    this.state = {
      account: account,
      theme: theme,
      darkModeBool: this.getMode(),
      modalOpen: false,
      gasColor: colors.lightGray,
      vsCoin: vsCoin,
    };
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
    emitter.on(GASPRICE_RETURNED, this.gasPriceReturned);
    emitter.on(SWITCH_VS_COIN_RETURNED, this.switchVsCoinReturned);

    this.getVsCoin();

    dispatcher.dispatch({
      type: CHECK_GASPRICE,
    });

    if (window.location.pathname === "/" + "short") {
      this.setState({ cgLogoColor: colors.cgOrange });
    } else if (window.location.pathname === "/" + "medium") {
      this.setState({ cgLogoColor: colors.cgGreen });
    } else if (window.location.pathname === "/" + "long") {
      this.setState({ cgLogoColor: colors.cgBlue });
    } else if (window.location.pathname === "/" + "portfolio") {
      this.setState({ cgLogoColor: colors.cgGreen });
    } else {
      this.setState({ cgLogoColor: colors.cgRed });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.path !== this.props.match.path) {
      if (this.props.match.path === "/" + "short") {
        this.setState({ cgLogoColor: colors.cgOrange });
      } else if (this.props.match.path === "/" + "medium") {
        this.setState({ cgLogoColor: colors.cgGreen });
      } else if (this.props.match.path === "/" + "long") {
        this.setState({ cgLogoColor: colors.cgBlue });
      } else if (this.props.match.path === "/" + "portfolio") {
        this.setState({ cgLogoColor: colors.cgGreen });
      } else {
        this.setState({ cgLogoColor: colors.cgRed });
      }
    }
  }

  getVsCoin = () => {
    let vsCoin;
    try {
      vsCoin = JSON.parse(localStorage.getItem("vsCoin"));
      if (!vsCoin) {
        vsCoin = "usd";
        localStorage.setItem("vsCoin", JSON.stringify(vsCoin));
      }
      store.setStore({ vsCoin: vsCoin });
      this.setState({ vsCoin: vsCoin });
    } catch (err) {
      vsCoin = "usd";
      localStorage.setItem("vsCoin", JSON.stringify(vsCoin));
      store.setStore({ vsCoin: vsCoin });
      this.setState({ vsCoin: vsCoin });
    }
  };

  getMode = () => {
    let savedmode;
    try {
      savedmode = JSON.parse(localStorage.getItem("dark"));
      return savedmode || false;
    } catch (err) {
      return false;
    }
  };

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(
      CONNECTION_DISCONNECTED,
      this.connectionDisconnected
    );
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitchReturned);
    emitter.removeListener(GASPRICE_RETURNED, this.gasPriceReturned);
    emitter.removeListener(SWITCH_VS_COIN_RETURNED, this.switchVsCoinReturned);
  }

  switchVsCoinReturned = (vscoin) => {
    localStorage.setItem("vsCoin", JSON.stringify(vscoin));
    this.setState({ vsCoin: vscoin });
    store.setStore({ vsCoin: vscoin });
  };

  gasPriceReturned = (payload) => {
    let gasColor = colors.primary;
    if (payload < 50) {
      gasColor = colors.cgGreen;
    } else if (payload < 100) {
      gasColor = colors.cgYellow;
    } else if (payload >= 100) {
      gasColor = colors.cgRed;
    }
    this.setState({ gasPrice: payload, gasColor: gasColor });
  };

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
        console.log(addressEnsName);
        this.setState({ addressEnsName });
      }
    }
  };

  darkModeSwitchReturned = (payload) => {
    this.setState({ darkModeBool: payload });
  };

  vsCoinSwitch = (vsCoin) => {
    switch (vsCoin) {
      case "usd":
        this.setState({ vsCoin: "usd" });
        break;
      case "eur":
        this.setState({ vsCoin: "eur" });
        break;
      case "btc":
        this.setState({ vsCoin: "btc" });
        break;
      case "eth":
        this.setState({ vsCoin: "eth" });
        break;
      default:
    }
    return emitter.emit(SWITCH_VS_COIN_RETURNED, vsCoin);
  };

  render() {
    const { classes, t, vsCoin } = this.props;
    const {
      account,
      addressEnsName,
      modalOpen,
      darkMode,
      darkModeBool,
    } = this.state;

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
          <div
            className={classes.headerV2}
            style={{ borderBottom: `3px solid ${this.state.cgLogoColor}` }}
          >
            <div className={classes.icon}>
              <CGLogo
                className={classes.imageIcon}
                fill={this.state.cgLogoColor}
                onClick={() => {
                  this.nav("");
                }}
              />
            </div>
            <div className={classes.links}>
              {this.renderLink("short")}
              {this.renderLink("medium")}
              {this.renderLink("long")}
              {this.renderLink("portfolio")}
              {this.renderLink("market")}
            </div>
            <div
              className={classes.vsCoinDIV}
              style={{ border: `2px solid ${this.state.cgLogoColor}` }}
            >
              {this.state.vsCoin == "usd" && (
                <Usd
                  className={classes.vsCoinIcon}
                  fill={this.state.cgLogoColor}
                  onClick={() => {
                    this.vsCoinSwitch("eur");
                  }}
                />
              )}
              {this.state.vsCoin === "eur" && (
                <Eur
                  className={classes.vsCoinIcon}
                  fill={this.state.cgLogoColor}
                  onClick={() => {
                    this.vsCoinSwitch("btc");
                  }}
                />
              )}
              {this.state.vsCoin === "btc" && (
                <Btc
                  className={classes.vsCoinIcon}
                  fill={this.state.cgLogoColor}
                  onClick={() => {
                    this.vsCoinSwitch("eth");
                  }}
                />
              )}
              {this.state.vsCoin === "eth" && (
                <Eth
                  className={classes.vsCoinIcon}
                  fill={this.state.cgLogoColor}
                  onClick={() => {
                    this.vsCoinSwitch("usd");
                  }}
                />
              )}
            </div>
            <div
              className={classes.gasPrice}
              style={{ border: `2px solid ${this.state.gasColor}` }}
            >
              <LocalGasStationOutlinedIcon
                style={{ color: this.state.gasColor }}
                onClick={() => {
                  dispatcher.dispatch({
                    type: CHECK_GASPRICE,
                  });
                }}
              />
              <Typography variant={"h4"}>{this.state.gasPrice}</Typography>
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
                      checked={darkModeBool}
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
              <IconButton aria-label="settings">
                <SettingsIcon />
              </IconButton>
            </div>
          </div>
        </Grid>
        {modalOpen && this.renderModal()}
      </Paper>
    );
  }

  renderLink = (screen) => {
    const { classes, t } = this.props;
    // if (window.location.pathname === "/" + "short") {
    //   if (this.state.cgLogoColor !== colors.cgOrange) {
    //     this.setState({ cgLogoColor: colors.cgOrange });
    //   }
    // } else if (window.location.pathname === "/" + "medium") {
    //   if (this.state.cgLogoColor !== colors.cgGreen) {
    //     this.setState({ cgLogoColor: colors.cgGreen });
    //   }
    // } else if (window.location.pathname === "/" + "long") {
    //   if (this.state.cgLogoColor !== colors.cgBlue) {
    //     this.setState({ cgLogoColor: colors.cgBlue });
    //   }
    // } else if (window.location.pathname === "/" + "portfolio") {
    //   if (this.state.cgLogoColor !== colors.cgGreen) {
    //     this.setState({ cgLogoColor: colors.cgGreen });
    //   }
    // } else {
    //   if (this.state.cgLogoColor !== colors.cgRed) {
    //     this.setState({ cgLogoColor: colors.cgRed });
    //   }
    // }

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
      window.open("https://chainguru.app/", "_blank");
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
