import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./i18n";
import { isMobile } from "react-device-detect";
import createBreakpoints from "@material-ui/core/styles/createBreakpoints";
import Web3 from "web3";
import AcuminTTF from "./assets/fonts/AcuminVariableConcept.otf";

import Header from "./components/header";
import HeaderMobile from "./components/header/headerMobile.jsx";

import Home from "./components/home";
import Short from "./components/short";
import Medium from "./components/medium";
import Long from "./components/long";
import PortfolioManagement from "./components/portfolio";
import Market from "./components/market";
import AdminPanel from "./components/adminPanel";
import NewEdit from "./components/market/edition/new";
import Show from "./components/market/edition/show";
import Artist from "./components/market/artist/artist";
import User from "./components/market/user/user";

import Profile from "./components/profile";

import { colors } from "./theme";

import { injected } from "./stores/connectors";
import {
  CONNECTION_CONNECTED,
  DARKMODE_SWITCH_RETURN,
  CHECK_BETA_ACCESS,
  CHECK_BETA_ACCESS_RETURNED,
} from "./constants";

import Store from "./stores";
const emitter = Store.emitter;
const store = Store.store;
const dispatcher = Store.dispatcher;

class App extends Component {
  state = {
    headerValue: null,
    darkMode: true,
    theme: createMuiTheme(),
    vsCoin: "usd",
  };

  setHeaderValue = (newValue) => {
    this.setState({ headerValue: newValue });
  };
  componentDidMount = async () => {
    let web3 = new Web3(Web3.givenProvider);
    this.darkModeSwitch(this.getMode());

    injected.isAuthorized().then(async (isAuthorized) => {
      if (isAuthorized) {
        injected
          .activate()
          .then((a) => {
            store.setStore({
              account: { address: web3.utils.toChecksumAddress(a.account) },
              web3context: { library: { provider: a.provider } },
              chainId: a.provider.chainId,
            });
            emitter.emit(CONNECTION_CONNECTED);
          })
          .then((a) => {
            dispatcher.dispatch({
              type: CHECK_BETA_ACCESS,
            });
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
      }
    });

    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);

    this.setState({ vsCoin: this.getVsCoin() });
  };

  componentDidUpdate = () => {
    let web3 = new Web3(Web3.givenProvider);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", function (accounts) {
        // Time to reload your interface with accounts[0]!
        store.setStore({
          account: {
            address: web3.utils.toChecksumAddress(accounts[0]),
          },
          chainId: window.ethereum.chainId,
          web3context: { library: { provider: window.ethereum } },
          userAuth: false,
          authToken: null,
          authTokenExp: null,
          userWallets: null,
        });
        // console.log(window.ethereum);
        console.log("emitted on app render account change");
        emitter.emit(CONNECTION_CONNECTED);
      });

      window.ethereum.on("networkChanged", function (networkId) {
        // Time to reload your interface with the new networkId
        store.setStore({ chainId: networkId });
        // console.log(networkId);
        console.log("emitted on app render network changed");

        emitter.emit(CONNECTION_CONNECTED);
      });
    }
  };

  componentWillUnmount() {
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
  }

  getMode = () => {
    let savedmode;

    try {
      savedmode = JSON.parse(localStorage.getItem("dark"));
      if (savedmode) {
        store.setStore({ theme: savedmode ? "dark" : "light" });
      } else {
        store.setStore({ theme: "dark" });
      }
      return savedmode || true;
    } catch (err) {
      return true;
    }
  };

  getVsCoin = () => {
    let vsCoin;
    try {
      vsCoin = JSON.parse(localStorage.getItem("vsCoin"));
      return vsCoin || "usd";
    } catch (err) {
      return "usd";
    }
  };

  darkModeSwitch = (state) => {
    localStorage.setItem("dark", JSON.stringify(state));
    const mainPrimaryColor = state ? colors.cgGreen : colors.cgDarkGreen;
    const mainSecondaryColor = state ? colors.cgOrange : colors.cgOrange;
    // const Roboto = {
    //   fontFamily: "Roboto",
    //   fontStyle: "normal",
    //   fontWeight: 400,
    // };
    const Acumin = {
      fontFamily: "Acumin Variable Concept Default ExtraCondensed UltraBlack",
      fontStyle: "normal",
      fontWeight: "bold",
      fontStretch: "condensed",
      src: `
        local('Acumin Variable Concept Default ExtraCondensed UltraBlack'),
        local('Acumin Variable Concept Default ExtraCondensed UltraBlack'),
        url(${AcuminTTF}) format('opentype')
      `,
    };

    const breakpoints = createBreakpoints({
      keys: ["xs", "sm", "md", "lg", "xl"],
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1800,
      },
    });

    const tema = createMuiTheme({
      typography: {
        fontFamily: [
          "Acumin Variable Concept Default ExtraCondensed UltraBlack",
        ].join(","),
        fontStyle: "bold",
        h1: {
          fontSize: "48px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        h2: {
          fontSize: "36px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        h3: {
          fontSize: "28px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        h4: {
          fontSize: "20px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        h5: {
          fontSize: "16px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        h6: {
          fontSize: "14px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        body1: {
          fontSize: "18px",
          fontWeight: "300",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        body2: {
          fontSize: "16px",
          fontWeight: "300",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
      palette: {
        type: state ? "dark" : "light",
        primary: {
          main: mainPrimaryColor,
        },
        secondary: {
          main: mainSecondaryColor,
        },
      },
      overrides: {
        MuiCssBaseline: {
          "@global": {
            "@font-face": [Acumin],
          },
        },
        MuiSelect: {
          select: {
            padding: "9px",
          },
          selectMenu: {
            minHeight: "30px",
            display: "flex",
            alignItems: "center",
          },
        },
        MuiButton: {
          root: {
            borderRadius: "10px",
            padding: "10px 24px",
          },
          outlined: {
            padding: "10px 24px",
            borderWidth: "2px !important",
          },
          text: {
            padding: "10px 24px",
          },
          label: {
            textTransform: "none",
            fontSize: "1rem",
          },
        },
        MuiInputBase: {
          input: {
            fontSize: "16px",
            fontWeight: "600",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            lineHeight: 1.2,
          },
        },
        MuiOutlinedInput: {
          input: {
            padding: "14px",
            borderRadius: "10px",
          },
          root: {
            // border: "none !important",
            borderRadius: "10px",
          },
          notchedOutline: {
            // border: "none !important"
          },
        },
        MuiSnackbar: {
          root: {
            maxWidth: "calc(100vw - 24px)",
          },
          anchorOriginBottomLeft: {
            bottom: "12px",
            left: "12px",
            "@media (min-width: 960px)": {
              bottom: "50px",
              left: "80px",
            },
          },
        },

        MuiSnackbarContent: {
          root: {
            backgroundColor: colors.white,
            padding: "0px",
            minWidth: "auto",
            "@media (min-width: 960px)": {
              minWidth: "500px",
            },
          },
          message: {
            padding: "0px",
          },
          action: {
            marginRight: "0px",
          },
        },
        MuiAccordion: {
          rounded: {
            borderRadius: 10,
            "&:last-child": {
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,

              //underline color when textfield is inactive
            },
          },
          root: {
            border: "1px solid rgba(0,0,0,0.2)",
            backgroundColor: "rgba(255,255,255,0.15)",

            margin: "0px 0px",
            "&:before": {
              //underline color when textfield is inactive
              height: "0px",
            },
          },
        },
        MuiAccordionSummary: {
          root: {
            borderRadius: 25,
            padding: "1px 24px",
            "@media (min-width: 960px)": {
              padding: "1px 24px",
            },
          },
          content: {
            margin: "0px !important",
          },
        },
        MuiAccordionDetails: {
          root: {
            padding: "0 10px 5px 10px",
            "@media (min-width: 960px)": {
              padding: "0 20px 5px 20px",
            },
          },
        },
        MuiToggleButton: {
          root: {
            borderRadius: "50px",
            textTransform: "none",
            minWidth: "100px",
            border: "none",
            "& > span > h4": {
              color: "#555",
            },
            "&:hover": {
              backgroundColor: "rgba(47,128,237, 0.2)",
            },
            "&$selected": {
              backgroundColor: "#2f80ed",
              "& > span > h4": {
                color: "#fff",
              },
              "&:hover": {
                backgroundColor: "rgba(47,128,237, 0.2)",
                "& > span > h4": {
                  color: "#000",
                },
              },
            },
          },
        },
        MuiCard: {
          root: {
            background: state
              ? "rgba(255,255,255,0.1)"
              : "rgba(255, 255, 255, 0.75)",
          },
        },
        MuiPaper: {
          rounded: {
            borderRadius: 20,
          },
          root: {
            background: state
              ? "rgba(255,255,255,0.1)"
              : "rgba(255, 255, 255, 0.75)",
          },
          elevation1: {
            boxShadow: "none",
          },
        },
        MuiToggleButtonGroup: {
          root: {
            border: "1px solid " + colors.borderBlue,
            borderRadius: "50px",
          },
          groupedSizeSmall: {
            padding: "42px 30px",
          },
        },
        MuiFormControlLabel: {
          label: {
            color: colors.darkBlack,
            fontSize: "14px",
            fontWeight: "600",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            lineHeight: 1.2,
          },
        },
        MuiTooltip: {
          tooltip: {
            fontSize: 14,
          },
        },
      },

      // palette: {
      //   primary: {
      //     main: colors.buttonPrimary,
      //   },
      //   secondary: {
      //     main: colors.buttonSecondary,
      //   },
      //   text: {
      //     primary: colors.text,
      //     secondary: colors.text,
      //   },
      // },
      breakpoints: breakpoints,
    });
    this.setState({ darkMode: state, theme: tema });
  };

  render() {
    let web3 = new Web3(Web3.givenProvider);

    const { headerValue, darkMode, theme } = this.state;

    //ACA IBA LO COMPONENT UPDATE
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/short/:tool/:coinID/:coinID_B">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}

              <Short darkMode={darkMode} />
            </Route>
            <Route path="/short/:tool/:coinID">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Short darkMode={darkMode} />
            </Route>
            <Route path="/short/:tool/">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Short darkMode={darkMode} />
            </Route>
            <Route path="/short">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Short darkMode={darkMode} />
            </Route>
            <Route path="/medium/:tool/:coinID/:coinID_B">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Medium darkMode={darkMode} />
            </Route>
            <Route path="/medium/:tool/:coinID">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Medium darkMode={darkMode} />
            </Route>
            <Route path="/medium/:tool/">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Medium darkMode={darkMode} />
            </Route>
            <Route path="/medium">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Medium darkMode={darkMode} />
            </Route>
            <Route path="/long/:tool/:coinID">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Long />
            </Route>
            <Route path="/long/:tool">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Long />
            </Route>
            <Route path="/long">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Long />
            </Route>
            <Route path="/portfolio/:tool">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <PortfolioManagement />
            </Route>
            <Route path="/portfolio">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <PortfolioManagement />
            </Route>
            <Route path="/market/adminPanel">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <AdminPanel />
            </Route>
            <Route path="/market/artist/:artistAccount">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Artist />
            </Route>
            <Route path="/market/user/:userAccount">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <User />
            </Route>
            <Route path="/market/edition/new">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <NewEdit />
            </Route>
            <Route path="/market/edition/:editionNumber">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Show />
            </Route>
            <Route path="/market">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Market />
            </Route>
            <Route path="/user/profile">
              {isMobile && (
                <HeaderMobile
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              {!isMobile && (
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                  darkMode={darkMode}
                />
              )}
              <Profile />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
