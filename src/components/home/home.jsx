import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

import { ReactComponent as FastIcon } from "../../assets/fast.svg";
import { ReactComponent as MediumIcon } from "../../assets/medium.svg";
import { ReactComponent as LongIcon } from "../../assets/long.svg";
// import { ReactComponent as MarketIcon } from "../../assets/market.svg";
import { ReactComponent as WalletIcon } from "../../assets/wallet.svg";

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
    background: "linear-gradient(to bottom, #f79d6b, #602505)",
    backgroundSize: "auto 175%",
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
    background: "linear-gradient(to bottom, #79d8a2 0%, #164B2D 100%)",
    backgroundSize: "auto 175%",
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
    background: "linear-gradient(to bottom, #9de2f9, #096989)",
    backgroundSize: "auto 175%",
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
    background: "linear-gradient(to bottom, #fcc98b, #6D3D03)",
    backgroundSize: "auto 175%",
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
    maxHeight: "250px",
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
  }

  render() {
    const { classes, t, location } = this.props;

    return (
      <div className={classes.root}>
        <Card
          className={`${classes.card} ${classes.short}`}
          onClick={() => {
            this.nav("/short/compare/bitcoin/ethereum");
          }}
        >
          <FastIcon fill={colors.white} className={`${classes.icon} icon`} />
          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.short")}
          </Typography>
        </Card>

        <Card
          className={`${classes.card} ${classes.mid}`}
          onClick={() => {
            this.nav("/medium/compare/bitcoin/ethereum");
          }}
        >
          <MediumIcon fill={colors.white} className={`${classes.icon} icon`} />

          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.medium")}
          </Typography>
        </Card>
        <Card
          className={`${classes.card} ${classes.long}`}
          onClick={() => {
            this.nav("/long");
          }}
        >
          <LongIcon stroke={colors.white} className={`${classes.icon} icon`} />
          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.long")}
          </Typography>
        </Card>

        <Card
          className={`${classes.card} ${classes.market}`}
          onClick={() => {
            this.nav("/portfolio");
          }}
        >
          <WalletIcon fill={colors.white} className={`${classes.icon} icon`} />
          <Typography variant={"h3"} className={`${classes.title} title`}>
            {t("Home.portfolio")}
          </Typography>
        </Card>
      </div>
    );
  }

  // <Card
  //   className={`${classes.card} ${classes.market}`}
  //   onClick={() => {
  //     this.nav(location.pathname + "market");
  //   }}
  // >
  //   <MarketIcon fill={colors.white} className={`${classes.icon} icon`} />
  //   <Typography variant={"h3"} className={`${classes.title} title`}>
  //     {t("Home.market")}
  //   </Typography>
  // </Card>

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(Home)));
