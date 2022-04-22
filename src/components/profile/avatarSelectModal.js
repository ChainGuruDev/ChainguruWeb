import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  CircularProgress,
  Avatar,
  DialogContent,
  Dialog,
  Slide,
  Grid,
} from "@material-ui/core";

import {
  ERROR,
  DB_NEW_AVATAR,
  DB_NEW_AVATAR_RETURNED,
  DB_UTILS_RESIZE_IMG,
  DB_UTILS_RESIZE_IMG_RETURNED,
} from "../../constants";

import { colors } from "../../theme";
import ipfs from "../ipfs";

import Store from "../../stores";
const emitter = Store.emitter;
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
      largeImage: false,
    };
  }

  componentDidMount() {
    emitter.on(ERROR, this.error);
    emitter.on(DB_NEW_AVATAR_RETURNED, this.newAvatarReturned);
    emitter.on(DB_UTILS_RESIZE_IMG_RETURNED, this.resizedReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.error);
    emitter.removeListener(DB_NEW_AVATAR_RETURNED, this.newAvatarReturned);
    emitter.removeListener(DB_UTILS_RESIZE_IMG_RETURNED, this.resizedReturned);
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
    if (selected === 9) {
      dispatcher.dispatch({
        type: DB_NEW_AVATAR,
        avatar: `custom_${this.state.imagePath}`,
      });
    } else {
      dispatcher.dispatch({
        type: DB_NEW_AVATAR,
        avatar: `local_${selected}`,
      });
    }
  };

  newAvatarReturned = (data) => {
    this.setState({
      loading: false,
    });
    this.props.closeModal();
  };

  handleFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    //Check if file provided is an image
    if (!/image/i.test(file.type)) {
      alert("File " + file.name + " is not an image.");
      return false;
    }
    const fileSizeMB = parseFloat((file.size / Math.pow(1024, 2)).toFixed(2));
    const maxFileSizeMB = 5;
    if (fileSizeMB > maxFileSizeMB) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const buffer = await this.convertToBuffer(reader);
        this.resizeImage(file, file.name);
      };
    } else {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = async () => {
        const buffer = await this.convertToBuffer(reader);
        this.uploadImage(buffer);
      };
    }
  };

  resizeImage = (file, name) => {
    this.setState({
      largeImage: true,
    });
    dispatcher.dispatch({
      type: DB_UTILS_RESIZE_IMG,
      file: file,
      filename: name,
    });
  };

  resizedReturned = (data) => {
    console.log("image resized");
    this.setState({
      imagePath: "https://cloudflare-ipfs.com/ipfs/" + data.path,
      isUploading: false,
      largeImage: false,
      selectedAvatar: 9,
    });
  };

  convertToBuffer = async (reader) => {
    this.setState({ isUploading: true });
    const buffer = await Buffer.from(reader.result);
    return await buffer;
  };

  uploadImage = async (buffer) => {
    console.log("uploading");
    let results = await ipfs.add(buffer);
    this.setState({
      imagePath: "https://cloudflare-ipfs.com/ipfs/" + (await results.path),
      isUploading: false,
      selectedAvatar: 9,
    });
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
            <Grid item container direction="row" xs={12} spacing={3}>
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
              <Grid className={classes.avatarPic} item xs={12}>
                <Avatar
                  alt="customAvatar"
                  src={this.state.imagePath}
                  className={
                    selectedAvatar === 9
                      ? classes.selectedAvatar
                      : classes.profile
                  }
                  style={{
                    display: this.state.imagePath ? "flex" : "none",
                  }}
                  onClick={() => this.selectAvatar(9)}
                />
              </Grid>
            </Grid>
            <Grid style={{ marginTop: 10, display: "flex" }} item xs={12}>
              <Grid style={{ align: "left" }} item xs={3}>
                <form
                  className={classes.root}
                  style={{
                    display: "flex",
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <input
                    style={{
                      display: "none",
                    }}
                    accept="image/*"
                    className={classes.input}
                    id="outlined-button-file"
                    type="file"
                    onChange={this.handleFile}
                    onClick={(event) => {
                      event.target.value = null;
                    }}
                  />
                  <label
                    htmlFor="outlined-button-file"
                    style={{
                      display: "block",
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      component="span"
                      style={{
                        display: "flex",
                        textAlign: "center",
                      }}
                      disabled={this.state.isUploading}
                    >
                      {this.state.isUploading && !this.state.largeImage && (
                        <CircularProgress size={24} />
                      )}
                      {!this.state.isUploading && "Upload"}
                      {this.state.isUploading &&
                        this.state.largeImage &&
                        "Optimizing large file..."}
                    </Button>
                  </label>
                </form>
              </Grid>
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => this.props.closeModal()}
                style={{ marginRight: 10, marginLeft: "auto" }}
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
