import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Button,
  CircularProgress,
  Avatar,
  DialogContent,
  Dialog,
  Slide,
  Grid,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";

import { ERROR, DB_NEW_AVATAR, DB_NEW_AVATAR_RETURNED } from "../../constants";

import { colors } from "../../theme";

import Store from "../../stores";
const emitter = Store.emitter;
const store = Store.store;
const dispatcher = Store.dispatcher;

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
  profile: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    cursor: "pointer",
    opacity: "50%",
  },
  avatarPic: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedAvatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    cursor: "pointer",
    borderColor: colors.cgGreen,
    borderWidth: "5px",
    borderStyle: "solid",
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class AvatarSelectModal extends Component {
  constructor(props) {
    super();

    this.state = {
      error: null,
      loading: false,
      selectedAvatar: null,
    };
  }

  componentWillMount() {
    emitter.on(ERROR, this.error);
    emitter.on(DB_NEW_AVATAR_RETURNED, this.newAvatarReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(DB_NEW_AVATAR_RETURNED, this.newAvatarReturned);
  }

  error = (err) => {
    this.setState({
      loading: false,
      error: err,
    });
  };

  selectAvatar = (selected) => {
    this.setState({
      selectedAvatar: selected,
    });
  };

  saveProfile = (selected) => {
    this.setState({
      loading: true,
    });
    dispatcher.dispatch({
      type: DB_NEW_AVATAR,
      avatar: `local_${selected}`,
    });
  };

  newAvatarReturned = (data) => {
    const { closeModal } = this.props;
    this.setState({
      loading: false,
    });
    this.props.closeModal();
  };

  render() {
    const { closeModal, modalOpen, classes } = this.props;
    const { selectedAvatar } = this.state;
    const fullScreen = window.innerWidth < 450;

    return (
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        fullWidth={true}
        maxWidth={"sm"}
        TransitionComponent={Transition}
        fullScreen={fullScreen}
        style={{ overflowY: "clip" }}
      >
        <DialogContent style={{ overflowY: "clip" }}>
          <Grid
            id="avatarGrid"
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={3}
          >
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar1"
                src="/AvatarBeta/avatar-01.png"
                className={
                  selectedAvatar === 1
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(1)}
              />
            </Grid>
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar2"
                src="/AvatarBeta/avatar-02.png"
                className={
                  selectedAvatar === 2
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(2)}
              />
            </Grid>
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar3"
                src="/AvatarBeta/avatar-03.png"
                className={
                  selectedAvatar === 3
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(3)}
              />
            </Grid>
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar4"
                src="/AvatarBeta/avatar-04.png"
                className={
                  selectedAvatar === 4
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(4)}
              />
            </Grid>
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar5"
                src="/AvatarBeta/avatar-05.png"
                className={
                  selectedAvatar === 5
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(5)}
              />
            </Grid>
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar6"
                src="/AvatarBeta/avatar-06.png"
                className={
                  selectedAvatar === 6
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(6)}
              />
            </Grid>
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar6"
                src="/AvatarBeta/avatar-07.png"
                className={
                  selectedAvatar === 7
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(7)}
              />
            </Grid>
            <Grid className={classes.avatarPic} item xs={3}>
              <Avatar
                alt="avatar6"
                src="/AvatarBeta/avatar-08.png"
                className={
                  selectedAvatar === 8
                    ? classes.selectedAvatar
                    : classes.profile
                }
                onClick={() => this.selectAvatar(8)}
              />
            </Grid>
            <Grid
              style={{ marginTop: 10, display: "flex", justifyContent: "end" }}
              item
              xs={12}
            >
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => this.props.closeModal()}
                style={{ marginRight: 10 }}
              >
                Cancel
              </Button>
              {selectedAvatar != null && (
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => this.saveProfile(selectedAvatar)}
                  disabled={this.state.errorNick || this.state.loadingBTN}
                >
                  {!this.state.loading && "Save"}
                  {this.state.loading && <CircularProgress />}
                </Button>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(AvatarSelectModal);
