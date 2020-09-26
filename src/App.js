import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Switch, Route, BrowserRouter } from "react-router-dom";

import "./i18n";
import interestTheme from "./theme";

import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./components/home";
import Short from "./components/short";
import Medium from "./components/medium";
import Long from "./components/long";
import Market from "./components/market";
import NewEdit from "./components/market/edition/new";

import { injected } from "./stores/connectors";
import { CONNECTION_CONNECTED } from "./constants";

import Store from "./stores";
const emitter = Store.emitter;
const store = Store.store;

class App extends Component {
  state = {
    headerValue: null,
  };

  setHeaderValue = (newValue) => {
    this.setState({ headerValue: newValue });
  };

  componentDidMount() {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        injected
          .activate()
          .then((a) => {
            store.setStore({
              account: { address: a.account },
              web3context: { library: { provider: a.provider } },
            });
            emitter.emit(CONNECTION_CONNECTED);
            console.log(a);
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
      }
    });
  }

  render() {
    const { headerValue } = this.state;

    return (
      <MuiThemeProvider theme={createMuiTheme(interestTheme)}>
        <CssBaseline />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            alignItems: "center",
            background: "#f9fafb",
          }}
        >
          <BrowserRouter>
            <Switch>
              <Route path="/short">
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                />
                <Short />
              </Route>
              <Route path="/medium">
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                />
                <Medium />
              </Route>
              <Route path="/long">
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                />
                <Long />
              </Route>
              <Route path="/market">
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                />
                <Market />
              </Route>
              <Route path="/edition/new">
                <Header
                  setHeaderValue={this.setHeaderValue}
                  headerValue={headerValue}
                />
                <NewEdit />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
            <Footer />
          </BrowserRouter>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
