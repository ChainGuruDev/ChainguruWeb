import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import { colors } from "../../theme";
import { timeDifference } from "../helpers";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";

import ThumbUpRoundedIcon from "@material-ui/icons/ThumbUp"; //Liked
import ThumbDownRoundedIcon from "@material-ui/icons/ThumbDownRounded"; //Disliked
import TrendingUpRoundedIcon from "@material-ui/icons/TrendingUpRounded"; //Bullish
import TrendingDownRoundedIcon from "@material-ui/icons/TrendingDownRounded"; //Bearish
import ReportProblemRoundedIcon from "@material-ui/icons/ReportProblemRounded"; //Important
import EmojiEmotionsRoundedIcon from "@material-ui/icons/EmojiEmotionsRounded"; //Lol
import StarRoundedIcon from "@material-ui/icons/StarRounded"; //Saved
import NotInterestedRoundedIcon from "@material-ui/icons/NotInterestedRounded"; //Toxic
import ChatRoundedIcon from "@material-ui/icons/ChatRounded"; //Comments

import LinkRoundedIcon from "@material-ui/icons/LinkRounded";

import {
  Card,
  Grid,
  CircularProgress,
  Typography,
  Divider,
  IconButton,
  Link,
} from "@material-ui/core";

import { DB_GET_CRYPTONEWS, DB_GET_CRYPTONEWS_RETURNED } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100%",
    justifyContent: "space-around",
  },
  rootCard: {
    padding: 12,
    display: "flex",
    flex: 1,
    direction: "row",
    alignContent: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  newsRow: {
    margin: "10px 0",
    borderRadius: 10,
    background: "#0002",
    padding: 10,
  },
  tickers: {
    margin: "0 5px",
    "&:hover": {
      color: colors.cgGreen,
      cursor: "pointer",
    },
  },
  newsTitle: {
    textAlign: "left",
    marginLeft: 10,
  },
});

class CryptoNews extends Component {
  constructor() {
    super();
    this._isMounted = false;

    this.state = {
      loading: true,
      news: null,
      page: 1,
      newsCurrencies: null,
      newsFilter: null,
      newsRegions: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    emitter.on(DB_GET_CRYPTONEWS_RETURNED, this.cryptoNewsReturned);

    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_CRYPTONEWS,
        params: {
          page: this.state.page,
        },
      });
  }

  componentWillUnmount() {
    emitter.removeListener(DB_GET_CRYPTONEWS_RETURNED, this.cryptoNewsReturned);
    this._isMounted = false;
  }

  getNews = (params) => {
    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_CRYPTONEWS,
        params: {},
      });
  };

  cryptoNewsReturned = (news) => {
    console.log(news);
    this.setState({
      news: news,
      loading: false,
    });
  };

  drawNewsIcons = (news) => {
    console.log(news);
    return (
      <Grid item style={{ display: "flex" }}>
        <Typography
          style={{ marginRight: 10 }}
        >{`Positive ${news.positive}`}</Typography>
        <Typography
          style={{ marginRight: 10 }}
        >{`Neg ${news.negative}`}</Typography>
        <Typography
          style={{ marginRight: 10 }}
        >{`Liked ${news.liked}`}</Typography>
        <Typography
          style={{ marginRight: 10 }}
        >{`Dislike ${news.disliked}`}</Typography>
        <Typography
          style={{ marginRight: 10 }}
        >{`Important ${news.important}`}</Typography>
        <Typography style={{ marginRight: 10 }}>{`Lol ${news.lol}`}</Typography>
        <Typography
          style={{ marginRight: 10 }}
        >{`Toxic ${news.toxic}`}</Typography>
        <Typography
          style={{ marginRight: 10 }}
        >{`Saved ${news.saved}`}</Typography>
      </Grid>
    );
  };

  drawNews = (news) => {
    const { classes } = this.props;
    if (news.length > 0) {
      return news.map((item) => (
        <Grid
          container
          direction="row"
          justify="left"
          alignItems="center"
          item
          xs={12}
          className={classes.newsRow}
        >
          <Grid item style={{ width: "80px" }}>
            <Grid container justify="space-between">
              <Typography variant="subtitle2" style={{ margin: "0 5px" }}>
                {timeDifference(item.published_at)}
              </Typography>
              <Divider orientation="vertical" flexItem />
            </Grid>
          </Grid>
          <Grid item className={classes.newsTitle}>
            <Grid container direction="column">
              <Grid item style={{ display: "flex" }}>
                {item.title}
                <Link target="_blank" href={item.url}>
                  <IconButton
                    color="primary"
                    aria-label="link to news"
                    size="small"
                    style={{ margin: "0 10px" }}
                  >
                    <LinkRoundedIcon />
                  </IconButton>
                </Link>
                <div style={{ margin: "0 0 0 auto" }}>
                  Source:{" "}
                  <Link
                    target="_blank"
                    href={`http://${item.domain}`}
                    style={{ color: colors.cgGreen, textDecoration: "inherit" }}
                  >
                    {item.source.title}
                  </Link>
                </div>
              </Grid>
              <Grid item>{this.drawNewsIcons(item.votes)}</Grid>
            </Grid>
          </Grid>
          {item.currencies && (
            <>
              <Grid item style={{ maxWidth: 150, margin: "0 0 0 auto" }}>
                <Grid container>
                  <Divider orientation="vertical" flexItem />
                  {item.currencies.map((token) => (
                    <Typography
                      variant="subtitle2"
                      onClick={() => this.detective(token.slug)}
                      className={classes.tickers}
                    >
                      {token.code}
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      ));
    }
  };

  detective = (id) => {
    this.nav("/short/detective/" + id);
  };

  nav = (screen) => {
    this.props.history.push(screen);
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      news,
      page,
      newsCurrencies,
      newsFilter,
      newsRegions,
    } = this.state;

    return (
      <div className={classes.root}>
        <Grid xs={8}>
          <Card className={classes.rootCard} elevation={3}>
            <Grid container direction="row" spacing={3}>
              <Grid item xs={12}>
                <Typography variant={"h3"} color={"primary"}>
                  Latest News
                </Typography>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                {loading && <CircularProgress />}
                {!loading && <>{this.drawNews(news)}</>}
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(CryptoNews));
