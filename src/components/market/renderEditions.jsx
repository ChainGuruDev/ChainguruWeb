import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { ERROR, BUY_EDITION } from "../../constants";
import { withTranslation } from "react-i18next";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  root: {
    width: 325,
    maxHeight: 325,
    padding: theme.spacing(0),
    margin: theme.spacing(2),
  },
});

class RenderEditions extends Component {
  static async getInitialProps(props) {
    return {
      key: this.props.key,
      editionNum: this.props.editionNum,
      details: this.props.details,
    };
  }

  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
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

  refresh() {}

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
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
      editNum: this.props.editionNum * 100,
      value: this.props.details._priceInWei,
    });
  };

  startLoading = () => {
    this.setState({ loading: true });
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

  render(props) {
    const { classes } = this.props;
    const { loading } = this.state;

    const editNum = this.props.editionNum;

    return (
      <div>
        <Card className={classes.root} elevation={10}>
          <CardActionArea>
            <CardMedia
              component="img"
              alt=""
              height="140"
              image={this.state.tokenURI.image}
              title=""
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {this.state.tokenURI.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="h2">
                {`Edition num.` + editNum * 100}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {this.props.description}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
            <Button
              variant="outlined"
              disabled={loading}
              onClick={this.buyEdition}
              size="small"
              color="primary"
            >
              {loading && <CircularProgress size={24} />}
              {!loading && "Buy"}
            </Button>
            <Button variant="outlined" size="small" color="primary">
              Learn More
            </Button>
          </CardActions>
        </Card>
      </div>
    );
  }
}
export default withStyles(styles)(RenderEditions);
