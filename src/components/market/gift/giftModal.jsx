import React, { Component } from "react";
import { DialogContent, Dialog, Slide } from "@material-ui/core";

import Gift from "./gift.jsx";

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class GiftModal extends Component {
  render() {
    const { closeModal, modalOpen, editionNumber, tokens } = this.props;

    const fullScreen = window.innerWidth < 450;

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
          <Gift
            closeModal={closeModal}
            editionNumber={editionNumber}
            tokens={tokens}
          />
        </DialogContent>
      </Dialog>
    );
  }
}

export default GiftModal;
