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
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";
import SearchIcon from "@material-ui/icons/Search";
import LinkRoundedIcon from "@material-ui/icons/LinkRounded";

import {
  Card,
  Grid,
  CircularProgress,
  Typography,
  Divider,
  IconButton,
  Link,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  Checkbox,
  Input,
  ListItemText,
  TextField,
  InputAdornment,
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
    flexWrap: "nowrap",
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
  newsIcons: {
    display: "flex",
    alignItems: "center",
    cursor: "default",
    width: "auto",
  },
  tooltip: {
    maxWidth: 110,
    textAlign: "center",
  },
  newsFilterForm: {
    minWidth: "100px",
  },
  newsRegionsForm: {
    minWidth: "100px",
    marginLeft: 10,
  },
  pageCounter: {
    margin: "0 10px",
  },
  newsFilterSymbol: {
    alignSelf: "end",
    marginLeft: 10,
  },
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const validRegionsShort = ["en", "de", "nl", "es", "fr", "it", "pt", "ru"];
const validRegions = [
  "English",
  "Deutsch",
  "Dutch",
  "Español",
  "Français",
  "Italiano",
  "Português",
  "Русский",
];

class CryptoNews extends Component {
  constructor() {
    super();
    this._isMounted = false;

    this.state = {
      loading: true,
      news: null,
      page: 1,
      currencies: null,
      newsFilter: "",
      newsRegions: [],
    };
  }

  componentDidMount() {
    this._isMounted = true;
    emitter.on(DB_GET_CRYPTONEWS_RETURNED, this.cryptoNewsReturned);

    this._isMounted &&
      dispatcher.dispatch({
        type: DB_GET_CRYPTONEWS,
        params: {},
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
        params: params,
      });
  };

  cryptoNewsReturned = (news) => {
    this.setState({
      news: news,
      loading: false,
    });
  };

  drawNewsIcons = (news) => {
    const { props, classes } = this.props;
    return (
      <Grid item style={{ display: "flex", alignItems: "center" }}>
        <Tooltip title="Bullish" arrow>
          <Grid container item className={classes.newsIcons}>
            <TrendingUpRoundedIcon
              fontSize="small"
              style={{ color: colors.cgGreen }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.positive}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Bearish" arrow>
          <Grid container item className={classes.newsIcons}>
            <TrendingDownRoundedIcon
              fontSize="small"
              style={{ color: colors.cgRed }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.negative}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Liked" arrow>
          <Grid container item className={classes.newsIcons}>
            <ThumbUpRoundedIcon
              fontSize="small"
              style={{ color: colors.cgGreen }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.liked}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Disliked" arrow>
          <Grid container item className={classes.newsIcons}>
            <ThumbDownRoundedIcon
              fontSize="small"
              style={{ color: colors.cgRed }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.disliked}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Important" arrow>
          <Grid container item className={classes.newsIcons}>
            <ReportProblemRoundedIcon
              fontSize="small"
              style={{ color: colors.cgRed }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.important}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Lol" arrow>
          <Grid container item className={classes.newsIcons}>
            <EmojiEmotionsRoundedIcon
              fontSize="small"
              style={{ color: colors.cgYellow }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.lol}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Toxic" arrow>
          <Grid container item className={classes.newsIcons}>
            <NotInterestedRoundedIcon
              fontSize="small"
              style={{ color: colors.cgRed }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.toxic}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Saved" arrow>
          <Grid container item className={classes.newsIcons}>
            <StarRoundedIcon
              fontSize="small"
              style={{ color: colors.cgYellow }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.saved}
            </Typography>
          </Grid>
        </Tooltip>
        <Tooltip title="Comments" arrow>
          <Grid container item className={classes.newsIcons}>
            <ChatRoundedIcon
              fontSize="small"
              style={{ color: colors.cgGreen }}
            />
            <Typography style={{ margin: "0px 10px 0 5px" }}>
              {news.comments}
            </Typography>
          </Grid>
        </Tooltip>
      </Grid>
    );
  };

  drawNews = (news) => {
    const { classes } = this.props;
    if (news.length > 0) {
      return news.map((item) => (
        <Grid
          key={item.id}
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          item
          xs={12}
          className={classes.newsRow}
        >
          <Grid item style={{ minWidth: "65px" }}>
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
              </Grid>
              <Grid item style={{ display: "flex" }}>
                <Link target="_blank" href={item.url}>
                  <Tooltip
                    classes={{ tooltip: classes.tooltip }}
                    title="Join discussion on CryptoPanic"
                    arrow
                  >
                    <IconButton
                      color="primary"
                      aria-label="link to news"
                      size="small"
                      style={{ marginRight: 5 }}
                    >
                      <LinkRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Link>
                <div style={{ display: "flex" }}>
                  <Typography variant="subtitle2">Source: </Typography>
                  <Link
                    target="_blank"
                    href={`http://${item.domain}`}
                    style={{ color: colors.cgGreen, textDecoration: "inherit" }}
                  >
                    <Typography variant="subtitle2">
                      {` ${item.source.title}`}
                    </Typography>
                  </Link>
                </div>
              </Grid>
              <Grid item>{this.drawNewsIcons(item.votes)}</Grid>
            </Grid>
          </Grid>
          {item.currencies && (
            <>
              <Grid
                item
                style={{
                  maxWidth: 100,
                  width: "inherit",
                  margin: "0 0 0 auto",
                }}
              >
                <Grid container key={"tokensCont_" + item.id}>
                  <Divider orientation="vertical" flexItem />
                  {item.currencies.map((token, i) => (
                    <Typography
                      key={token.code + i}
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

  handleChangeFilter = (event) => {
    const { currencies, newsRegions } = this.state;
    const newFilter = event.target.value;
    const params = {
      filter: newFilter,
      regions: newsRegions,
      page: 1,
      currencies: currencies,
    };

    this.setState({
      newsFilter: newFilter,
      page: 1,
      loading: true,
    });
    this.getNews(params);
  };

  handleChangeRegions = (event) => {
    const { currencies, newsFilter } = this.state;
    const newRegions = event.target.value;

    const params = {
      filter: newsFilter,
      regions: newRegions,
      page: 1,
      currencies: currencies,
    };

    this.setState({
      newsRegions: newRegions,
      page: 1,
      loading: true,
    });

    this.getNews(params);
  };

  changeNewsPage = (action) => {
    const { page, currencies, newsFilter, newsRegions } = this.state;

    const params = {
      filter: newsFilter,
      regions: newsRegions,
      currencies: currencies,
    };

    let newPage;
    switch (action) {
      case "prev":
        newPage = page - 1;
        this.setState({ page: newPage, loading: true });
        params.page = newPage;

        this.getNews(params);
        break;
      case "next":
        newPage = page + 1;
        this.setState({ page: newPage, loading: true });
        params.page = newPage;

        this.getNews(params);
        break;
      default:
        break;
    }
  };

  delayedHandleNewFilter = (newFilter) => {
    let that = this;
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    this.state.timeout = setTimeout(function () {
      that.handleNewFilter(newFilter); //this is your existing function
    }, 600);
  };

  handleNewFilter = (newFilter) => {
    this.setState({
      currencies: newFilter,
    });
  };

  handleClickFilter = () => {
    const { newsFilter, newsRegions, currencies } = this.state;

    const params = {
      filter: newsFilter,
      regions: newsRegions,
      currencies: currencies,
      page: 1,
    };

    this.setState({
      page: 1,
      loading: true,
    });
    this.getNews(params);
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      news,
      page,
      currencies,
      newsFilter,
      newsRegions,
    } = this.state;

    return (
      <div className={classes.root}>
        <Grid item xs={8}>
          <Card className={classes.rootCard} elevation={3}>
            <Grid container direction="row" spacing={3}>
              <Grid
                item
                xs={12}
                style={{
                  padding: 12,
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <FormControl className={classes.newsFilterForm}>
                  <InputLabel shrink id="demo-simple-select-label">
                    Showing
                  </InputLabel>
                  <Select
                    value={newsFilter}
                    onChange={this.handleChangeFilter}
                    displayEmpty
                    className={classes.newsFilterSelect}
                    inputProps={{ "aria-label": "News Filter" }}
                  >
                    <MenuItem value={""}>All</MenuItem>
                    <MenuItem value={"rising"}>Rising</MenuItem>
                    <MenuItem value={"hot"}>Hot</MenuItem>
                    <MenuItem value={"bullish"}>Bullish</MenuItem>
                    <MenuItem value={"bearish"}>Bearish</MenuItem>
                    <MenuItem value={"important"}>Important</MenuItem>
                    <MenuItem value={"lol"}>Lol</MenuItem>
                    <MenuItem value={"saved"}>Saved</MenuItem>
                  </Select>
                </FormControl>
                <FormControl className={classes.newsRegionsForm}>
                  <InputLabel shrink id="news-region-filter-label">
                    From regions
                  </InputLabel>
                  <Select
                    labelId="news-region-filter-label"
                    id="news-region-filter"
                    multiple
                    value={newsRegions}
                    onChange={this.handleChangeRegions}
                    input={<Input />}
                    renderValue={(selected) => selected.join(",")}
                    MenuProps={MenuProps}
                  >
                    {validRegionsShort.map((region, i) => (
                      <MenuItem key={region} value={region}>
                        <Checkbox checked={newsRegions.indexOf(region) > -1} />
                        <ListItemText primary={validRegions[i]} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl className={classes.newsFilterSymbol}>
                  <InputLabel shrink htmlFor="filter-currency">
                    Filter by Token Symbol
                  </InputLabel>
                  <Input
                    id="news-query-filter"
                    onChange={(e) =>
                      this.delayedHandleNewFilter(e.target.value)
                    }
                    style={{ height: "48px" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => this.handleClickFilter()}
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {loading && <CircularProgress />}
                {!loading && <>{this.drawNews(news)}</>}
              </Grid>

              <Grid
                container
                direction="row"
                justify="flex-end"
                alignItems="center"
                style={{ padding: 12 }}
              >
                <IconButton
                  disabled={page === 1}
                  size="small"
                  onClick={() => this.changeNewsPage("prev")}
                >
                  <KeyboardArrowLeftRoundedIcon />
                </IconButton>
                <div className={classes.pageCounter}>{page}</div>
                <IconButton
                  disabled={page === 10}
                  size="small"
                  onClick={() => this.changeNewsPage("next")}
                >
                  <KeyboardArrowRightRoundedIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(CryptoNews));
