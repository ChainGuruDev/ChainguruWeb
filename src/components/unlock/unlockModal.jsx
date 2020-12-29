import React, { Component } from "react";
import { DialogContent, Dialog, Slide } from "@material-ui/core";

import Unlock from "./unlock.jsx";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class UnlockModal extends Component {
  render() {
    const { closeModal, modalOpen } = this.props;

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
          <Unlock closeModal={closeModal} />
        </DialogContent>
      </Dialog>
    );
  }
}

export default UnlockModal;
