import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";
import AttachMoneyRoundedIcon from "@material-ui/icons/AttachMoneyRounded";
import WhatshotRoundedIcon from "@material-ui/icons/WhatshotRounded";
import AccountBalanceWalletRoundedIcon from "@material-ui/icons/AccountBalanceWalletRounded";
import AccountBalanceRoundedIcon from "@material-ui/icons/AccountBalanceRounded";
import TrendingUpRoundedIcon from "@material-ui/icons/TrendingUpRounded";
import GolfCourseRoundedIcon from "@material-ui/icons/GolfCourseRounded";
import StoreIcon from "@material-ui/icons/Store";

const styles = (theme) => ({
  root: {
    outline: "none",

    flex: 1,
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
    },
  },
  card: {
    flex: "1",
    height: "33vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    cursor: "pointer",
    borderRadius: "0px",
    transition: "background-position 0.5s ease-in-out",
    [theme.breakpoints.up("sm")]: {
      height: "100vh",
      minWidth: "20%",
      minHeight: "50vh",
    },
  },
  //linear-gradient(to right, #FF512F 0%, #F09819 51%, #FF512F 100%)}
  short: {
    background: "linear-gradient(to top, #d32f2f, #ffab13)",
    backgroundSize: "auto 200%",
    backgroundPosition: "0px 100%",
    "&:hover": {
      backgroundPosition: "0px 0%",
      "& .title": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 0.35,
      },
      "& .icon": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 1,
        color: colors.white,
      },
    },
    "& .title": {
      transition: "opacity 0.5s ease-in-out",

      opacity: 0,
      color: colors.white,
    },
    "& .icon": {
      transition: "opacity 0.5s ease-in-out",
      opacity: 0.35,
      color: colors.white,
    },
  },
  mid: {
    background: "linear-gradient(to top, #0ba360 0%, #3cba92 100%)",
    backgroundSize: "auto 200%",
    backgroundPosition: "0px 100%",
    "&:hover": {
      backgroundPosition: "0px 0%",
      "& .title": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 0.35,
      },
      "& .icon": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 1,
        color: colors.white,
      },
    },
    "& .title": {
      transition: "opacity 0.5s ease-in-out",
      opacity: 0.0,
      color: colors.white,
    },
    "& .icon": {
      transition: "opacity 0.5s ease-in-out",
      opacity: 0.35,
      color: colors.white,
    },
  },
  long: {
    background: "linear-gradient(to top, #209cff, #68e0cf)",
    backgroundSize: "auto 200%",
    backgroundPosition: "0px 100%",
    "&:hover": {
      backgroundPosition: "0px 0%",
      "& .title": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 0.35,
      },
      "& .icon": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 1,
        color: colors.white,
      },
    },
    "& .title": {
      transition: "opacity 0.5s ease-in-out",

      opacity: 0.0,
      color: colors.white,
    },
    "& .icon": {
      transition: "opacity 0.5s ease-in-out",
      opacity: 0.35,
      color: colors.white,
    },
  },
  market: {
    background: "linear-gradient(to top, #3cba92, #68efcf)",
    backgroundSize: "auto 200%",
    backgroundPosition: "0px 100%",
    "&:hover": {
      backgroundPosition: "0px 0%",
      "& .title": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 0.35,
      },
      "& .icon": {
        transition: "opacity 0.5s ease-in-out",
        opacity: 1,
        color: colors.white,
      },
    },
    "& .title": {
      transition: "opacity 0.5s ease-in-out",

      opacity: 0.0,
      color: colors.white,
    },
    "& .icon": {
      transition: "opacity 0.5s ease-in-out",
      opacity: 0.35,
      color: colors.white,
    },
  },
  cover: {
    backgroundColor: colors.white,
    "&:hover": {
      backgroundColor: colors.compoundGreen,
      "& .title": {
        color: colors.white,
        display: "none",
      },
      "& .soon": {
        color: colors.white,
        display: "block",
      },
      "& .icon": {
        color: colors.white,
      },
    },
    "& .title": {
      color: colors.compoundGreen,
    },
    "& .soon": {
      color: colors.compoundGreen,
      display: "none",
    },
    "& .icon": {
      color: colors.compoundGreen,
    },
  },
  title: {
    padding: "24px",
    paddingBottom: "0px",
    [theme.breakpoints.up("sm")]: {
      paddingBottom: "24px",
    },
  },
  icon: {
    fontSize: "60px",
    [theme.breakpoints.up("sm")]: {
      fontSize: "100px",
    },
  },
  link: {
    textDecoration: "none",
  },
});

class Home extends Component {
  constructor(props) {
    super();

    this.state = {};
  }

  render() {
    const { classes, t, location } = this.props;

    return (
      <div className={classes.root}>
        <Card
          className={`${classes.card} ${classes.short}`}
          onClick={() => {
            this.nav(location.pathname + "short");
          }}
        >
          <AttachMoneyRoundedIcon className={`${classes.icon} icon`} />
          <WhatshotRoundedIcon className={`${classes.icon} icon`} />
          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.short")}
          </Typography>
        </Card>

        <Card
          className={`${classes.card} ${classes.mid}`}
          onClick={() => {
            this.nav(location.pathname + "medium");
          }}
        >
          <AccountBalanceWalletRoundedIcon className={`${classes.icon} icon`} />
          <GolfCourseRoundedIcon className={`${classes.icon} icon`} />

          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.medium")}
          </Typography>
        </Card>
        <Card
          className={`${classes.card} ${classes.long}`}
          onClick={() => {
            this.nav(location.pathname + "long");
          }}
        >
          <AccountBalanceRoundedIcon className={`${classes.icon} icon`} />
          <TrendingUpRoundedIcon className={`${classes.icon} icon`} />
          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.long")}
          </Typography>
        </Card>

        <Card
          className={`${classes.card} ${classes.market}`}
          onClick={() => {
            this.nav(location.pathname + "market");
          }}
        >
          <StoreIcon className={`${classes.icon} icon`} />
          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.market")}
          </Typography>
        </Card>
      </div>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Home)));
