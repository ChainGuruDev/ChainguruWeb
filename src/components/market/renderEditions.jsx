import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { ERROR, BUY_EDITION, BUY_RETURNED } from "../../constants";
import { colors } from "../../theme";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    width: 325,
    minHeight: 325,
    margin: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    background: "rgba(125,125,125,0.2)",
    border: `2px solid ${colors.cgOrange}`,
  },
  description: {},
});

class RenderEditions extends Component {
  static async getInitialProps(props) {
    return {
      key: this.props.key,
      editionNum: this.props.editionNum,
      details: this.props.details,
    };
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(BUY_RETURNED, this.buyReturned);
    this.getTokenJson(this.props.details._tokenURI);
    //this.getTokenJson(this.props.editionNum);
  }

  getTokenJson = async (url) => {
    let _tokenURI;
    await fetch(url)
      .then(function (response) {
        _tokenURI = response.json();
      })
      .then(function (data) {
        //console.log('JSON from "' + fullurl + '" parsed successfully!');
        //console.log(data.image);
      })
      .catch(function (error) {
        //console.error(error.message);
      });
    this.setState({ tokenURI: await _tokenURI });
  };

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(BUY_RETURNED, this.buyReturned);
  }

  state = {
    editionsDetails: [],
    details: {},
    tJSON: {},
    tokenURI: "",
    imageURL: "",
  };

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: error.toString(),
        snackbarType: "Error",
      };
      that.setState(snackbarObj);
    });
  };

  buyEdition = (editNum) => {
    this.startLoading();
    dispatcher.dispatch({
      type: BUY_EDITION,
      editNum: this.props.editionNum,
      value: this.props.details._priceInWei,
    });
  };

  buyReturned = () => {
    this.stopLoading();
  };

  startLoading = () => {
    this.setState({ loading: true });
  };

  stopLoading = () => {
    this.setState({ loading: false });
  };

  setNewToken(_tokenURI) {
    this.setState({ tokenURI: _tokenURI });
  }

  updateState(_tokenURI) {
    if (!this.state.tokenURI) {
      const fullurl = _tokenURI.image;
      this.setState({ imageURL: fullurl });
      this.setState({ tokenURI: _tokenURI });
    }
  }

  editionClicked = () => {
    let _editNumber = this.props.editionNum;
    this.nav(`/market/edition/${_editNumber}`);
  };

  render(props) {
    const { classes } = this.props;
    const { loading } = this.state;

    return (
      <div>
        <Card className={classes.root} elevation={6}>
          <CardActionArea
            onClick={this.editionClicked}
            style={{
              flexGrow: 5,
              justifyContent: "center",
            }}
          >
            <CardMedia
              component="img"
              alt={this.state.tokenURI.name}
              height="140"
              image={this.state.tokenURI.image}
              title={this.state.tokenURI.name}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {this.state.tokenURI.name}
              </Typography>
              <Typography
                className={classes.description}
                variant="body2"
                color="textSecondary"
                component="h2"
                gutterBottom
                noWrap
              >
                {this.state.tokenURI.description}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                by {this.state.tokenURI.artistName}
              </Typography>
            </CardContent>
          </CardActionArea>

          <CardActions
            style={{
              justifyContent: "center",
              alignItems: "end",
            }}
          >
            {this.props.details._maxAvailable -
              this.props.details._circulatingSupply !==
              0 && (
              <Button
                variant="contained"
                disabled={loading}
                onClick={this.buyEdition}
                size="small"
                color="primary"
              >
                {loading && <CircularProgress size={24} />}
                {!loading &&
                  this.props.details._maxAvailable -
                    this.props.details._circulatingSupply >
                    0 &&
                  "Buy for " +
                    this.props.details._priceInWei / 1000000000000000000 +
                    " eth"}
              </Button>
            )}
            {this.props.details._maxAvailable -
              this.props.details._circulatingSupply ===
              0 && (
              <Button
                variant="contained"
                disabled={loading}
                size="small"
                color="primary"
              >
                Sold Out
              </Button>
            )}
            <Button variant="contained" disabled size="small" color="secondary">
              {this.props.details._maxAvailable -
                this.props.details._circulatingSupply}
              {" / "}
              {this.props.details._maxAvailable} remaining
            </Button>
          </CardActions>
        </Card>
      </div>
    );
  }
}
export default withRouter(withStyles(styles)(RenderEditions));
