import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./i18n";
import cgTheme from "./theme";
import RobotoTTF from "typeface-roboto";
import createBreakpoints from "@material-ui/core/styles/createBreakpoints";
import Web3 from "web3";

import Header from "./components/header";
import Footer from "./components/footer";
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

import { colors } from "./theme";

import { injected } from "./stores/connectors";
import {
  CONNECTION_CONNECTED,
  DARKMODE_SWITCH_RETURN,
  SWITCH_VS_COIN_RETURNED,
  accountsChanged,
} from "./constants";

import Store from "./stores";
const emitter = Store.emitter;
const store = Store.store;
const dispatcher = Store.dispatcher;

class App extends Component {
  state = {
    headerValue: null,
    darkMode: false,
    theme: createMuiTheme(),
    vsCoin: "usd",
  };

  setHeaderValue = (newValue) => {
    console.log(newValue);

    this.setState({ headerValue: newValue });
  };

  componentDidMount = async () => {
    let web3 = new Web3(Web3.givenProvider);

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
          .catch((e) => {
            console.log(e);
          });
      } else {
      }
    });

    emitter.on(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);

    this.darkModeSwitch(this.getMode());
    this.setState({ vsCoin: this.getVsCoin() });
  };

  componentWillUnmount() {
    emitter.removeListener(DARKMODE_SWITCH_RETURN, this.darkModeSwitch);
  }

  getMode = () => {
    let savedmode;
    try {
      savedmode = JSON.parse(localStorage.getItem("dark"));
      store.setStore({ theme: savedmode ? "dark" : "light" });
      return savedmode || false;
    } catch (err) {
      return false;
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
    const mainPrimaryColor = state ? colors.cgGreen : colors.cgGreen;
    const mainSecondaryColor = state ? colors.cgOrange : colors.cgOrange;
    const Roboto = {
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: 400,
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
        fontFamily: ["Roboto"].join(","),
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
          fontSize: "24px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        h4: {
          fontSize: "16px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        h5: {
          fontSize: "14px",
          fontWeight: "600",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          lineHeight: 1.2,
        },
        body1: {
          fontSize: "16px",
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
        type: "light",
      },
      overrides: {
        MuiCssBaseline: {
          "@global": {
            "@font-face": [Roboto],
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
            borderRadius: "5px",
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
          root: {
            border: "1px solid " + "rgba(0,0,0,0.2)",
            //backgroundColor: "rgba(255,255,255,0.25)",

            margin: "0px 0px",
            "&:before": {
              //underline color when textfield is inactive
              height: "0px",
            },
          },
        },
        MuiAccordionSummary: {
          root: {
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
        MuiPaper: {
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

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", function (accounts) {
        // Time to reload your interface with accounts[0]!
        store.setStore({
          account: {
            address: web3.utils.toChecksumAddress(accounts[0]),
          },
          chainId: window.ethereum.chainId,
          web3context: { library: { provider: window.ethereum } },
        });
        console.log(window.ethereum);
        emitter.emit(CONNECTION_CONNECTED);
      });

      window.ethereum.on("networkChanged", function (networkId) {
        // Time to reload your interface with the new networkId
        store.setStore({ chainId: networkId });
        console.log(networkId);

        emitter.emit(CONNECTION_CONNECTED);
      });
    }

    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/coins/:coinID">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
              />
              <Short tool="detective" />
            </Route>
            <Route path="/short/:tool/:coinID/:coinID_B">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                darkMode={darkMode}
              />
              <Short />
            </Route>
            <Route path="/short/:tool/:coinID">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                darkMode={darkMode}
              />
              <Short />
            </Route>
            <Route path="/short">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                darkMode={darkMode}
                vsCoin={this.state.vsCoin}
              />
              <Short />
            </Route>
            <Route path="/medium/:tool/:coinID/:coinID_B">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                darkMode={darkMode}
              />
              <Medium />
            </Route>
            <Route path="/medium/:tool/:coinID">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                darkMode={darkMode}
              />
              <Medium />
            </Route>
            <Route path="/medium">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                vsCoin={this.state.vsCoin}
              />
              <Medium />
            </Route>
            <Route path="/long/:toolID">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                vsCoin={this.state.vsCoin}
              />
              <Long />
            </Route>
            <Route path="/long">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                vsCoin={this.state.vsCoin}
              />
              <Long />
            </Route>
            <Route path="/portfolio">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
                vsCoin={this.state.vsCoin}
              />
              <PortfolioManagement />
            </Route>
            <Route path="/market/adminPanel">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
              />
              <AdminPanel />
            </Route>
            <Route path="/market/artist/:artistAccount">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
              />
              <Artist />
            </Route>
            <Route path="/market/user/:userAccount">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
              />
              <User />
            </Route>

            <Route path="/market/edition/new">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
              />
              <NewEdit />
            </Route>
            <Route path="/market/edition/:editionNumber">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
              />
              <Show />
            </Route>
            <Route path="/market">
              <Header
                setHeaderValue={this.setHeaderValue}
                headerValue={headerValue}
              />
              <Market />
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
//<Footer />
export default App;
