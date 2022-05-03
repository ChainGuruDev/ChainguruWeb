import React, { Component } from "react";
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

class LSvoteResultModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { closeModal, modalOpen, modalData } = this.props;
    const { classes } = this.props;
    const fullScreen = window.innerWidth < 450;

    let answerOK;
    let geckoData = false;
    let forecastTimeout = false;
    if (!modalData.type) {
      geckoData = true;
      answerOK = modalData.result;
    } else {
      if (modalData.type === "forecastDeletedAfterTimeout") {
        forecastTimeout = true;
      }
      geckoData = false;
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
                  {geckoData ? (
                    <>
                      <Grid item>
                        {answerOK && (
                          <>
                            <Typography
                              variant="h3"
                              gutterBottom
                              color="primary"
                            >
                              Well done Guru!
                            </Typography>
                            <Typography
                              variant="h3"
                              gutterBottom
                              color="primary"
                            >
                              Correct Forecast!
                            </Typography>
                          </>
                        )}
                        {!answerOK && (
                          <Typography
                            variant="h3"
                            gutterBottom
                            color="secondary"
                          >
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
                    </>
                  ) : (
                    <Grid item>
                      {forecastTimeout ? (
                        <>
                          <Typography
                            variant="h3"
                            gutterBottom
                            color="secondary"
                          >
                            Forecast canceled.
                          </Typography>
                          <Typography variant="h4" gutterBottom>
                            Coingecko still has no updated price data for the
                            forecast timeframe after 6hs since forecast ended.
                          </Typography>
                          <Typography variant="h4" gutterBottom color="primary">
                            This did NOT affect your XP or combo status.
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography
                            variant="h4"
                            gutterBottom
                            color="secondary"
                          >
                            Coingecko is missing price data at forecast end
                            time.
                          </Typography>
                          <Typography variant="h4" gutterBottom>
                            If after {modalData.timeLeftHuman} there's still no
                            data available for that timeframe, forecast will be
                            automagically canceled and deleted on your next
                            claim attempt.
                          </Typography>
                          <Typography variant="h4" gutterBottom color="primary">
                            This will NOT affect your XP or combo status.
                          </Typography>
                        </>
                      )}
                    </Grid>
                  )}
                </Grid>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

export default withStyles(styles)(LSvoteResultModal);
