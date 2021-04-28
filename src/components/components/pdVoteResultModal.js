import React, { Component } from "react";
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

class PDvoteResultModal extends Component {
  render() {
    const { closeModal, modalOpen, modalData } = this.props;
    const { classes } = this.props;

    const fullScreen = window.innerWidth < 450;

    let answerOK;
    if (modalData) {
      answerOK = modalData.result === modalData.vote ? true : false;
    } else {
      answerOK = false;
    }

    return (
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
                    <Typography variant="h3" gutterBottom color="primary">
                      To the moon!!!
                    </Typography>
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
                    <Typography>Price at End: {modalData.priceEnd}</Typography>
                  )}
                </Grid>
              </Grid>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(PDvoteResultModal);
