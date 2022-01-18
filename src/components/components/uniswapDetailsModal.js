import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Modal,
  Grid,
  Typography,
  Divider,
  IconButton,
  Box,
  Backdrop,
  Fade,
} from "@material-ui/core";

import SparklineChart from "./SparklineChart.js";

import {
  GECKO_GET_SPARKLINE_FROM_CONTRACT,
  GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
} from "../../constants";

import LockIcon from "@material-ui/icons/Lock";

import CloseIcon from "@material-ui/icons/Close";
import { formatMoney, getVsSymbol } from "../helpers";
import { colors } from "../../theme";

import Store from "../../stores";
const dispatcher = Store.dispatcher;
const emitter = Store.emitter;

const styles = (theme) => ({
  root: {
    flex: 1,
    height: "auto",
    display: "flex",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    position: "absolute",
    right: "12px",
    top: "12px",
    cursor: "pointer",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: 20,
    width: 700,
    height: "fit-content",
    position: "absolute",
    padding: "0px 15px",
  },
});

class UniswapDetailsModal extends Component {
  constructor(props) {
    super();

    this.state = {
      sparklineData: null,
    };
  }

  componentDidMount() {
    const assetCodes = [];

    // this.props.data.items.forEach((item, i) => {
    //   if (item.chain === "ethereum") {
    //     assetCodes.push(item.asset.asset_code);
    //   }
    // });
    // dispatcher.dispatch({
    //   type: GECKO_GET_SPARKLINE_FROM_CONTRACT,
    //   assetCodes,
    //   vsCoin: this.props.vsCoin,
    // });
    // emitter.on(
    //   GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
    //   this.sparklineDataReturned
    // );
  }

  componentWillUnmount() {
    // emitter.removeListener(
    //   GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
    //   this.sparklineDataReturned
    // );
  }

  sparklineDataReturned = (payload) => {
    this.setState({
      sparklineData: payload,
    });
  };

  render() {
    const {
      closeModalUni,
      modalOpen,
      classes,
      data,
      vsCoin,
      assetBalance,
    } = this.props;
    const { sparklineData } = this.state;
    const fullScreen = window.innerWidth < 450;
    const components = [];
    for (var [key, value] of Object.entries(data.components)) {
      components.push(value); // "a 5", "b 7", "c 9"
    }
    return (
      <Modal
        id="uniswapDetailsRoot"
        open={modalOpen}
        onClose={closeModalUni}
        className={classes.root}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Grid
            className={classes.paper}
            id="uniswapDetailsGrid"
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={3}
          >
            <IconButton
              className={classes.closeIcon}
              aria-label="close"
              onClick={closeModalUni}
            >
              <CloseIcon />
            </IconButton>
            <Grid item xs={12}>
              <Typography
                variant={"h2"}
                color="primary"
                style={{ textAlign: "left" }}
              >
                {data.title}
              </Typography>
            </Grid>
            <Divider variant="middle" style={{ width: "100%" }} />
            <Grid
              item
              xs={6}
              style={{ padding: 5, textAlign: "left", alignSelf: "start" }}
            >
              <Grid item xs={12}>
                <Typography variant={"h4"}>{data.asset.name}</Typography>
                {assetBalance.toFixed(2)} {data.asset.symbol}{" "}
                <span style={{ color: "gray" }}>● </span>
                {
                  <span style={{ color: "gray" }}>
                    {getVsSymbol(vsCoin) +
                      " " +
                      formatMoney(data.asset.price.value)}
                  </span>
                }
              </Grid>
              <Grid item xs={12}>
                <Typography variant={"h2"} color={"primary"}>
                  {getVsSymbol(vsCoin) +
                    " " +
                    formatMoney(data.asset.price.value * assetBalance)}
                </Typography>
                <Typography
                  variant={"subtitle1"}
                  color={
                    data.asset.price.relative_change_24h > 0
                      ? "primary"
                      : "secondary"
                  }
                >
                  {formatMoney(data.asset.price.relative_change_24h) +
                    " % (last 24hs)"}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              {data.description}
            </Grid>
            <Grid
              item
              container
              direction="row"
              justify="center"
              style={{ padding: "30px 0px 30px" }}
            >
              {components.map((item, i) => {
                return (
                  <Grid
                    key={item.asset.id + Math.random()}
                    item
                    xs={6}
                    container
                    direction="row"
                    alignItems="flex-start"
                  >
                    <Grid
                      item
                      key={item.asset.id}
                      style={{
                        padding: 15,
                        boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.5)",
                        borderRadius: 20,
                        width: "100%",
                        margin: 10,
                        minHeight: "100%",
                      }}
                      container
                      direction="row"
                    >
                      <Grid item xs={12}>
                        <Typography variant={"h3"} color="primary">
                          {item.asset.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant={"body1"}>
                          {(item.quantity * assetBalance).toFixed(2)}{" "}
                          {item.asset.symbol}{" "}
                          <span style={{ color: "gray" }}>● </span>
                          {
                            <span style={{ color: "gray" }}>
                              {getVsSymbol(vsCoin) +
                                " " +
                                formatMoney(item.asset.price.value)}
                            </span>
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <div
                          style={{
                            display: "flex",
                            flexGrow: 1,
                            flexDirection: "column",
                            justifyContent: "end",
                          }}
                        >
                          <Typography
                            variant={"h3"}
                            color={"primary"}
                            style={{ textAlign: "right" }}
                          >
                            {getVsSymbol(vsCoin) +
                              " " +
                              formatMoney(
                                item.asset.price.value *
                                  (item.quantity * assetBalance)
                              )}
                          </Typography>
                          <Typography
                            variant={"subtitle1"}
                            color={
                              item.asset.price.relative_change_24h > 0
                                ? "primary"
                                : "secondary"
                            }
                            style={{ textAlign: "right" }}
                          >
                            {formatMoney(item.asset.price.relative_change_24h) +
                              " % (last 24hs)"}
                          </Typography>
                        </div>
                      </Grid>
                      {sparklineData && (
                        <SparklineChart
                          id={item.id}
                          data={sparklineData[i].price}
                        />
                      )}
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Fade>
      </Modal>
    );
  }
}

export default withStyles(styles)(UniswapDetailsModal);
