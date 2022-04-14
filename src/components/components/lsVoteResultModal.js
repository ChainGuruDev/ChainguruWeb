import React, { Component } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { formatMoney } from "../helpers";

import {
  DialogContent,
  Dialog,
  Slide,
  Grid,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import CloseIcon from "@material-ui/icons/Close";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const styles = (theme) => ({
  root: {
    flex: 1,
    height: "auto",
    display: "flex",
    position: "relative",
  },
  closeIcon: {
    position: "fixed",
    right: "12px",
    top: "12px",
    cursor: "pointer",
  },
  contentContainer: {
    margin: "auto",
    textAlign: "center",
    padding: "12px",
    display: "flex",
    flexWrap: "wrap",
  },
});

const canvasStyles = {
  position: "fixed",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
};

class LSvoteResultModal extends Component {
  constructor(props) {
    super(props);
    this.animationInstance = null;
  }

  makeShot = (particleRatio, opts) => {
    this.animationInstance &&
      this.animationInstance({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
  };

  fire = () => {
    this.makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    this.makeShot(0.2, {
      spread: 60,
    });

    this.makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  handlerFire = () => {
    this.fire();
  };

  getInstance = (instance) => {
    this.animationInstance = instance;
  };

  render() {
    const { closeModal, modalOpen, modalData } = this.props;
    const { classes } = this.props;
    const fullScreen = window.innerWidth < 450;
    console.log(modalData);
    let answerOK;
    if (modalData) {
      answerOK = modalData.result;
    } else {
      answerOK = false;
    }

    return (
      <>
        <Dialog
          open={modalOpen}
          onClose={closeModal}
          fullWidth={true}
          maxWidth={"sm"}
          TransitionComponent={Transition}
          fullScreen={fullScreen}
        >
          <DialogContent>
            <div className={classes.root}>
              <div className={classes.closeIcon} onClick={closeModal}>
                <CloseIcon />
              </div>
              <div className={classes.contentContainer}>
                <Grid
                  container
                  direction="column"
                  justify="flex-start"
                  alignItems="stretch"
                >
                  <Grid item>
                    {answerOK && (
                      <>
                        <Typography variant="h3" gutterBottom color="primary">
                          Well done Guru!
                        </Typography>
                        <Typography variant="h3" gutterBottom color="primary">
                          Correct Forecast!
                        </Typography>
                      </>
                    )}
                    {!answerOK && (
                      <Typography variant="h3" gutterBottom color="secondary">
                        Ups...
                      </Typography>
                    )}
                  </Grid>
                  <Grid item>
                    {modalData && (
                      <Typography>
                        Price at Start: {modalData.priceStart}
                      </Typography>
                    )}
                    {modalData && (
                      <Typography>
                        Price at End: {modalData.priceEnd}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                <ReactCanvasConfetti
                  refConfetti={this.getInstance}
                  style={canvasStyles}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

export default withStyles(styles)(LSvoteResultModal);
