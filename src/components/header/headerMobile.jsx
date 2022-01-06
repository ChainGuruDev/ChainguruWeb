import React, { Component } from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import {
  Paper,
  Grid,
  IconButton,
  SwipeableDrawer,
  List,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@material-ui/core";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { withRouter } from "react-router-dom";
import { colors } from "../../theme";
import ENS from "ethjs-ens";
import { withTranslation } from "react-i18next";
import debounce from "lodash/throttle";

import { isMobile, withOrientationChange } from "react-device-detect";

//IMPORT CUSTOM LOGOS AND SVGS
import { ReactComponent as CGLogo } from "../../assets/logos/logo_chainguru.svg";
import { ReactComponent as CGIsologo } from "../../assets/logos/iso_chainguru.svg";
import { ReactComponent as Usd } from "../../assets/dolar.svg";
import { ReactComponent as Eur } from "../../assets/euro.svg";
import { ReactComponent as Btc } from "../../assets/bitcoin.svg";
import { ReactComponent as Eth } from "../../assets/ethereum.svg";

import { ReactComponent as FastIcon } from "../../assets/fast.svg";
import { ReactComponent as MediumIcon } from "../../assets/medium.svg";
import { ReactComponent as LongIcon } from "../../assets/longDrawer.svg";

import { ReactComponent as WalletIcon } from "../../assets/wallet.svg";

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  LOGIN,
  LOGIN_RETURNED,
  DB_GET_USERDATA,
  DARKMODE_SWITCH_RETURN,
  CHECK_GASPRICE,
  GASPRICE_RETURNED,
  SWITCH_VS_COIN_RETURNED,
} from "../../constants";

import Brightness2OutlinedIcon from "@material-ui/icons/Brightness2Outlined";
import Brightness2RoundedIcon from "@material-ui/icons/Brightness2Rounded";
import EvStationIcon from "@material-ui/icons/EvStation";

import SettingsIcon from "@material-ui/icons/Settings";
import MenuIcon from "@material-ui/icons/Menu";

import UnlockModal from "../unlock/unlockModal.jsx";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  rootHeader: {
    borderRadius: "0px",
    verticalAlign: "top",
    width: "100%",
    display: "flex",
  },
  headerV2: {
    width: "100%",
    minHeight: "60px",
    height: "60px",
    display: "flex",
    padding: "10px 12px",
  },
  icon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    cursor: "pointer",
    maxHeight: "40px",
    maxWidth: "40px",
    margin: "0px auto 0px auto",
  },
  iconDrawer: {
    display: "flex",
    maxHeight: "50px",
    margin: "10px 0px",
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
    alignItems: "flex-start",
    justifyContent: "center",
  },
  link: {
    padding: "12px 0px",
    margin: "0px 12px",
    transition: "0.25s",
    cursor: "pointer",
    "&:hover": {
      paddingBottom: "8px",
      borderBottom: "3px solid " + colors.cgGreen,
    },
  },
  title: {
    transition: "0.25s",
    textTransform: "capitalize",
    "&:hover": {
      color: colors.cgGreen,
    },
  },
  titleShort: {
    transition: "0.25s",
    textTransform: "capitalize",
    "&:hover": {
      color: colors.cgOrange,
    },
  },
  titleMedium: {
    transition: "0.25s",
    textTransform: "capitalize",
    "&:hover": {
      color: colors.cgGreen,
    },
  },
  titleLong: {
    transition: "0.25s",
    textTransform: "capitalize",
    "&:hover": {
      color: colors.cgBlue,
    },
  },
  titlePortfolio: {
    transition: "0.25s",
    textTransform: "capitalize",
    "&:hover": {
      color: colors.cgYellow,
    },
  },
  titleMarket: {
    transition: "0.25s",
    textTransform: "capitalize",
    "&:hover": {
      color: colors.cgRed,
    },
  },
  linkActive: {
    padding: "12px 0px",
    margin: "0px 12px",
    cursor: "pointer",
    paddingBottom: "9px",
    borderBottom: "3px solid " + colors.cgGreen,
    boxShadow: `rgba(247, 157, 107, 0.37) 0px 10px 5px -5px`,
  },
  account: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  darkModeSwitch: {
    display: "flex",
    flex: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
  walletAddress: {
    padding: "12px",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      border: "2px solid " + colors.cgOrange,
      background: "rgba(47, 128, 237, 0.1)",
    },
  },
  menuIcon: {
    maxHeight: "45px",
    maxWidth: "45px",
    padding: "12px",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "25px",
    alignSelf: "center",
    cursor: "pointer",
    "&:hover": {
      background: "rgba(47, 128, 237, 0.1)",
    },
  },
  vsCoinDIV: {
    alignSelf: "center",
    maxHeight: "45px",
    maxWidth: "45px",
    padding: "0px",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 10px 0 auto",
    cursor: "pointer",
    "&:hover": {
      background: "rgba(47, 128, 237, 0.1)",
    },
  },
  vsCoinIcon: {
    maxHeight: "40px",
  },
  longIcon: {
    maxHeight: 45,
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

class HeaderMobile extends Component {
  constructor(props) {
    super(props);

    const account = store.getStore("account");
    const theme = store.getStore("theme");
    const vsCoin = store.getStore("vsCoin");
    const userAuth = store.getStore("userAuth");

    if (account && account.address) {
      if (!userAuth) {
        dispatcher.dispatch({
          type: LOGIN,
          address: account.address,
        });
      }
      var address = account.address.substring(0, 6) + "...";
    }

    const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const timeFrame = this.props.match.path.split("/")[1];
    this.state = {
      account: account,
      theme: theme,
      darkModeBool: this.getMode(),
      modalOpen: false,
      gasColor: colors.lightGray,
      vsCoin: vsCoin,
      address: address ? address : null,
      drawerOpen: false,
      iOS: iOS,
      timeFrame: timeFrame,
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

    const currentSection = this.props.match.path.split("/")[1];
    if (currentSection === "short") {
      this.setState({ cgLogoColor: colors.cgOrange });
    } else if (currentSection === "medium") {
      this.setState({ cgLogoColor: colors.cgGreen });
    } else if (currentSection === "long") {
      this.setState({ cgLogoColor: colors.cgBlue });
    } else if (currentSection === "portfolio") {
      this.setState({ cgLogoColor: colors.cgYellow });
    } else {
      this.setState({ cgLogoColor: colors.cgRed });
    }
  }

  componentDidUpdate(prevProps) {
    const currentSection = this.props.match.path.split("/")[1];
    if (prevProps.match.path !== this.props.match.path) {
      if (currentSection === "short") {
        this.setState({
          cgLogoColor: colors.cgOrange,
          timeFrame: currentSection,
        });
      } else if (currentSection === "medium") {
        this.setState({
          cgLogoColor: colors.cgGreen,
          timeFrame: currentSection,
        });
      } else if (currentSection === "long") {
        this.setState({
          cgLogoColor: colors.cgBlue,
          timeFrame: currentSection,
        });
      } else if (currentSection === "portfolio") {
        this.setState({
          cgLogoColor: colors.cgYellow,
          timeFrame: currentSection,
        });
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

    if (_acc && _acc.address) {
      var address = _acc.address.substring(0, 6) + "...";
    }

    this.setState({ account: _acc, address: address });
    //WALLET IS NOW CONNECTED
    //CHECK IF USER IS ALREADY CREATED
    dispatcher.dispatch({
      type: LOGIN,
      address: _acc.address,
    });
    // dispatcher.dispatch({
    //   type: DB_GET_USERDATA,
    //   address: _acc.address,
    // });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore("account"), address: null });
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
    this.emitvsCoinSwitch(vsCoin);
  };
  //Debounce switchVsCoin return message once every .75sec
  debouncedVsCoinSwitch(vsCoin) {
    return emitter.emit(SWITCH_VS_COIN_RETURNED, vsCoin);
  }
  emitvsCoinSwitch = debounce(
    (payload) => {
      return this.debouncedVsCoinSwitch(payload);
    },
    750,
    { leading: false, trailing: true }
  );

  render() {
    const { classes, t } = this.props;
    const {
      account,
      modalOpen,
      darkModeBool,
      address,
      drawerOpen,
      iOS,
      timeFrame,
    } = this.state;

    const toggleDrawer = (newState) => (event) => {
      this.setState({ drawerOpen: newState });
    };

    const handleChangeDarkMode = (event) => {
      let state = event.target.checked;
      dispatcher.dispatch({
        type: "DARKMODE_SWITCH",
        content: state,
      });
    };

    const renderDrawer = (timeFrame) => {
      const { match, location, history } = this.props;

      const header = (
        <React.Fragment>
          <div className={classes.iconDrawer}>
            <CGLogo
              className={classes.imageIcon}
              fill={this.state.cgLogoColor}
            />
          </div>
          <Divider />
        </React.Fragment>
      );
      const timeFrameIcons = [
        <FastIcon style={{ maxHeight: 45, fill: colors.cgOrange }} />,
        <MediumIcon style={{ maxHeight: 45, fill: colors.cgGreen }} />,
        <LongIcon className={classes.longIcon} />,
        <WalletIcon style={{ maxHeight: 45, fill: colors.cgYellow }} />,
      ];

      const navPointer = [
        "/short/shortLong",
        "/medium/compare/bitcoin/ethereum",
        "/long/bluechips",
        "/portfolio",
      ];

      const navBar = (url) => {
        toggleDrawer(false);
        history.push(url);
      };

      switch (timeFrame) {
        case "short":
          var body = (
            <>
              {["short", "medium", "long", "portfolio"].map((text, index) => (
                <ListItem
                  button
                  key={text}
                  onClick={() => navBar(navPointer[index])}
                >
                  <ListItemIcon>{timeFrameIcons[index]}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </>
          );
          break;
        default:
          break;
      }

      return (
        <div style={{ width: 200 }}>
          {header}
          <List>{body}</List>
        </div>
      );
    };

    // <div
    //   className={classes.vsCoinDIV}
    //   style={{ border: `2px solid ${this.state.cgLogoColor}` }}
    // >
    //   {this.state.vsCoin === "usd" && (
    //     <Usd
    //       className={classes.vsCoinIcon}
    //       fill={this.state.cgLogoColor}
    //       onClick={() => {
    //         this.vsCoinSwitch("eur");
    //       }}
    //     />
    //   )}
    //   {this.state.vsCoin === "eur" && (
    //     <Eur
    //       className={classes.vsCoinIcon}
    //       fill={this.state.cgLogoColor}
    //       onClick={() => {
    //         this.vsCoinSwitch("btc");
    //       }}
    //     />
    //   )}
    //   {this.state.vsCoin === "btc" && (
    //     <Btc
    //       className={classes.vsCoinIcon}
    //       fill={this.state.cgLogoColor}
    //       onClick={() => {
    //         this.vsCoinSwitch("eth");
    //       }}
    //     />
    //   )}
    //   {this.state.vsCoin === "eth" && (
    //     <Eth
    //       className={classes.vsCoinIcon}
    //       fill={this.state.cgLogoColor}
    //       onClick={() => {
    //         this.vsCoinSwitch("usd");
    //       }}
    //     />
    //   )}
    // </div>
    // <div
    //   className={classes.gasPrice}
    //   style={{ border: `2px solid ${this.state.gasColor}` }}
    // >
    //   <Typography variant={"h5"}>{this.state.gasPrice}</Typography>
    //   <EvStationIcon
    //     style={{
    //       color: this.state.gasColor + "50",
    //       position: "absolute",
    //       scale: "1.4",
    //     }}
    //     onClick={() => {
    //       dispatcher.dispatch({
    //         type: CHECK_GASPRICE,
    //       });
    //     }}
    //   />
    // </div>
    // <div className={classes.account}>
    //   {address && (
    //     <Typography
    //       variant={"h5"}
    //       className={classes.walletAddress}
    //       noWrap
    //       onClick={this.addressClicked}
    //     >
    //       {address}
    //       <div className={classes.connectedDot}></div>
    //     </Typography>
    //   )}
    //   {!address && (
    //     <Typography
    //       variant={"h5"}
    //       className={classes.walletAddress}
    //       noWrap
    //       onClick={this.addressClicked}
    //     >
    //       {t("Market.Connect")}
    //     </Typography>
    //   )}
    //   <IconButton
    //     onClick={() => {
    //       this.nav("user/profile");
    //     }}
    //     style={{ marginLeft: 10 }}
    //     aria-label="settings"
    //   >
    //     <SettingsIcon />
    //   </IconButton>
    // </div>

    return (
      <Paper className={classes.rootHeader}>
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
            <div
              className={classes.menuIcon}
              style={{ border: `2px solid ${this.state.cgLogoColor}` }}
            >
              <IconButton onClick={toggleDrawer(true)} aria-label="settings">
                <MenuIcon />
              </IconButton>
            </div>
            <div className={classes.icon}>
              <CGIsologo
                className={classes.imageIcon}
                fill={this.state.cgLogoColor}
                onClick={() => {
                  this.nav("");
                }}
              />
            </div>
            <div className={classes.account}>
              {address && (
                <Typography
                  variant={"h5"}
                  className={classes.walletAddress}
                  style={{
                    border: "2px solid " + this.state.cgLogoColor,
                  }}
                  noWrap
                  onClick={this.addressClicked}
                >
                  {address}
                  <div className={classes.connectedDot}></div>
                </Typography>
              )}
              {!address && (
                <Typography
                  variant={"h5"}
                  className={classes.walletAddress}
                  noWrap
                  onClick={this.addressClicked}
                  style={{
                    border: "2px solid " + this.state.cgLogoColor,
                  }}
                >
                  {t("Market.Connect")}
                </Typography>
              )}
            </div>
          </div>
        </Grid>
        <SwipeableDrawer
          anchor={"left"}
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          {renderDrawer(timeFrame)}
        </SwipeableDrawer>
        {modalOpen && this.renderModal()}
      </Paper>
    );
  }
  //
  // {this.renderLink("short")}
  // {this.renderLink("medium")}
  // {this.renderLink("long")}
  // {this.renderLink("portfolio")}
  // {this.renderLink("market")}

  // <div className={classes.darkModeSwitch}>
  //   <FormGroup
  //     style={{
  //       display: "flex",
  //       justifyContent: "right",
  //       alignItems: "center",
  //     }}
  //   >
  //     <FormControlLabel
  //       style={{
  //         display: "flex",
  //         justifyContent: "right",
  //         alignItems: "center",
  //       }}
  //       control={
  //         <Checkbox
  //           style={{
  //             display: "flex",
  //             justifyContent: "right",
  //             alignItems: "center",
  //           }}
  //           icon={<Brightness2OutlinedIcon fontSize="small" />}
  //           checkedIcon={<Brightness2RoundedIcon fontSize="small" />}
  //           name="darkModeSwitch"
  //           onChange={handleChangeDarkMode}
  //           checked={darkModeBool}
  //         />
  //       }
  //     />
  //   </FormGroup>
  // </div>

  renderLink = (screen) => {
    const { classes, t } = this.props;
    const currentSection = this.props.match.path.split("/")[1];

    return (
      <div
        className={
          currentSection === screen ? classes.linkActive : classes.link
        }
        style={
          currentSection === screen
            ? {
                borderBottom: "3px solid" + this.state.cgLogoColor,
                boxShadow: `${this.state.cgLogoColor}50 0px 10px 5px -5px`,
              }
            : {}
        }
        onClick={() => {
          this.nav(screen);
        }}
      >
        <span
          className={
            currentSection === screen
              ? classes.titleActive
              : screen === "short"
              ? classes.titleShort
              : screen === "medium"
              ? classes.titleMedium
              : screen === "long"
              ? classes.titleLong
              : screen === "portfolio"
              ? classes.titlePortfolio
              : classes.titleMarket
          }
        >
          <Typography
            variant={"h4"}
            style={
              currentSection === screen
                ? {
                    textTransform: "uppercase",
                    color: this.state.cgLogoColor,
                  }
                : { textTransform: "uppercase" }
            }
          >
            {t("Home." + screen)}
          </Typography>
          {(screen === "short" || screen === "medium" || screen === "long") && (
            <Typography
              variant={"body2"}
              style={
                currentSection === screen
                  ? {
                      textTransform: "uppercase",
                      color: this.state.cgLogoColor,
                      textAlign: "center",
                    }
                  : { textTransform: "uppercase", textAlign: "center" }
              }
            >
              strategy
            </Typography>
          )}
        </span>
      </div>
    );
  };

  nav = (screen) => {
    if (screen === "cover") {
      window.open("https://chainguru.app/", "_blank");
      return;
    } else if (screen === "profile") {
      window.open("/user/profile", "_self");
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

export default withTranslation()(
  withRouter(withStyles(styles)(withOrientationChange(HeaderMobile)))
);
