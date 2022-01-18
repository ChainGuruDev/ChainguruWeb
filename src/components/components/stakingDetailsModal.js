import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Modal,
  Slide,
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
import AddIcon from "@material-ui/icons/Add";

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class StakingDetailsModal extends Component {
  constructor(props) {
    super();

    this.state = {
      sparklineData: null,
    };
  }

  componentDidMount() {
    const assetCodes = [];

    this.props.data.items.forEach((item, i) => {
      if (item.chain === "ethereum") {
        assetCodes.push(item.asset.asset_code);
      }
    });
    dispatcher.dispatch({
      type: GECKO_GET_SPARKLINE_FROM_CONTRACT,
      assetCodes,
      vsCoin: this.props.vsCoin,
    });
    emitter.on(
      GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
      this.sparklineDataReturned
    );
  }

  componentWillUnmount() {
    emitter.removeListener(
      GECKO_GET_SPARKLINE_FROM_CONTRACT_RETURNED,
      this.sparklineDataReturned
    );
  }

  sparklineDataReturned = (payload) => {
    this.setState({
      sparklineData: payload,
    });
  };

  render() {
    const { closeModal, modalOpen, classes, data, vsCoin } = this.props;
    const { sparklineData } = this.state;
    const fullScreen = window.innerWidth < 450;

    return (
      <Modal
        id="stakingDetailsRoot"
        open={modalOpen}
        onClose={closeModal}
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
            id="stakingDetailsGrid"
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={3}
          >
            <IconButton
              className={classes.closeIcon}
              aria-label="close"
              onClick={closeModal}
            >
              <CloseIcon />
            </IconButton>
            <Grid item xs={12}>
              <Typography
                variant={"h2"}
                color="primary"
                style={{ textAlign: "left" }}
              >
                {data.protocol}
              </Typography>
            </Grid>
            <Divider variant="middle" style={{ width: "100%" }} />
            <Grid
              item
              container
              direction="row"
              justify="center"
              alignItems="center"
              style={{
                borderRadius: 10,
                boxShadow: "inset 0px 0px 15px rgba(0,0,0,0.5)",
                padding: "0px 10px",
                margin: "10px 0px 15px 0px",
              }}
            >
              <Grid item xs={6} style={{ padding: 5, textAlign: "left" }}>
                <Typography variant={"h4"}>{data.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant={"h2"}
                  color={"primary"}
                  style={{ textAlign: "right" }}
                >
                  {getVsSymbol(vsCoin) + " " + formatMoney(data.value)}
                </Typography>
              </Grid>
              <Divider variant="middle" style={{ width: "100%" }} />
              {data.items.map((item, i) => {
                return (
                  <React.Fragment key={item.id}>
                    {i > 0 && item.type !== data.items[i - 1].type && (
                      <Divider variant="middle" style={{ width: "100%" }} />
                    )}
                    <Grid
                      item
                      xs={1}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      {item.type !== "reward" && <LockIcon color="disabled" />}
                      {item.type === "reward" && <AddIcon color="primary" />}
                    </Grid>
                    <Grid item xs={5} style={{ padding: 5, textAlign: "left" }}>
                      <Typography variant={"h4"} color="primary">
                        {item.asset.name}{" "}
                        <span style={{ color: "gray", fontStyle: "italic" }}>
                          {item.type}
                        </span>
                      </Typography>
                      <Typography variant={"body1"}>
                        {item.quantityDecimals.toFixed(2)} {item.asset.symbol}{" "}
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
                    <Grid
                      item
                      xs={6}
                      container
                      direction="row"
                      alignItems="center"
                      justify="end"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexGrow: 1,
                          flexDirection: "column",
                          marginRight: sparklineData ? 10 : 0,
                          justifyContent: "end",
                        }}
                      >
                        <Typography
                          variant={"h3"}
                          color={"primary"}
                          style={{ textAlign: "right" }}
                        >
                          {getVsSymbol(vsCoin) + " " + formatMoney(item.value)}
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
                      {sparklineData && (
                        <SparklineChart
                          id={item.id}
                          data={sparklineData[i].price}
                        />
                      )}
                    </Grid>
                  </React.Fragment>
                );
              })}
            </Grid>
          </Grid>
        </Fade>
      </Modal>
    );
  }
}

export default withStyles(styles)(StakingDetailsModal);
