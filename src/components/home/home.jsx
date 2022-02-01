import React, { Component } from "react";
import {
  isBrowser,
  isMobile,
  withOrientationChange,
} from "react-device-detect";

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
import AccountBalanceWalletRoundedIcon from "@material-ui/icons/AccountBalanceWalletRounded";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import LensIcon from "@material-ui/icons/Lens";

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
    "& .titleMobile": {
      opacity: 0.35,
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
    "& .titleMobile": {
      opacity: 0.35,
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
    "& .titleMobile": {
      opacity: 0.35,
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
    "& .titleMobile": {
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
    paddingBottom: "0px",
    [theme.breakpoints.up("sm")]: {},
  },
  icon: {
    maxHeight: "250px",
    fontSize: "60px",
    [theme.breakpoints.up("sm")]: {
      fontSize: "100px",
    },
  },
  iconMobile: {
    width: "50%",
  },
  link: {
    textDecoration: "none",
  },
  mobileDiv: {
    justifyContent: "inherit",
    display: "flex",
    flexDirection: "column",
    minWidth: "50%",
  },
  mobileDivLandscape: {
    justifyContent: "inherit",
    display: "flex",
    flexDirection: "row",
    minWidth: "50%",
  },
});

class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, t, isPortrait } = this.props;
    if (isMobile) {
      return (
        <div className={classes.root}>
          <div style={{ display: "flex", flex: 1, width: "100%" }}>
            <div
              className={
                isPortrait ? classes.mobileDiv : classes.mobileDivLandscape
              }
            >
              <Card
                className={`${classes.card} ${classes.short}`}
                onClick={() => {
                  this.nav("/short/shortLong");
                }}
              >
                <FastIcon
                  fill={colors.white}
                  className={`${classes.iconMobile} icon`}
                />
                <Typography
                  variant={"h3"}
                  className={`${classes.title} titleMobile`}
                >
                  {t("Home.short")}
                </Typography>
                <Typography
                  variant={"h3"}
                  className={`${classes.title} titleMobile`}
                >
                  Strategy
                </Typography>
              </Card>
              <Card
                className={`${classes.card} ${classes.mid}`}
                onClick={() => {
                  this.nav("/medium/compare/bitcoin/ethereum");
                }}
              >
                <MediumIcon
                  fill={colors.white}
                  className={`${classes.iconMobile} icon`}
                />
                <Typography
                  variant={"h3"}
                  className={`${classes.title} titleMobile`}
                >
                  {t("Home.medium")}
                </Typography>
                <Typography
                  variant={"h3"}
                  className={`${classes.title} titleMobile`}
                >
                  Strategy
                </Typography>
              </Card>
            </div>
            <div
              className={
                isPortrait ? classes.mobileDiv : classes.mobileDivLandscape
              }
            >
              <Card
                className={`${classes.card} ${classes.long}`}
                onClick={() => {
                  this.nav("/long");
                }}
              >
                <LongIcon
                  stroke={colors.white}
                  className={`${classes.iconMobile} icon`}
                />
                <Typography
                  variant={"h3"}
                  className={`${classes.title} titleMobile`}
                >
                  {t("Home.long")}
                </Typography>
                <Typography
                  variant={"h3"}
                  className={`${classes.title} titleMobile`}
                >
                  Strategy
                </Typography>
              </Card>
              <Card
                className={`${classes.card} ${classes.market}`}
                onClick={() => {
                  this.nav("/portfolio");
                }}
              >
                <AccountBalanceWalletRoundedIcon
                  fill={colors.white}
                  className={`${classes.iconMobile} icon`}
                />
                <Typography
                  variant={"h3"}
                  className={`${classes.title} titleMobile`}
                >
                  {t("Home.portfolio")}
                </Typography>
              </Card>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={classes.root}>
          <Card
            className={`${classes.card} ${classes.market}`}
            onClick={() => {
              this.nav("/portfolio");
            }}
          >
            <WalletIcon
              fill={colors.white}
              className={`${classes.icon} icon`}
            />
            <Typography variant={"h3"} className={`${classes.title} title`}>
              {t("Home.portfolio")}
            </Typography>
          </Card>
          <Card
            className={`${classes.card} ${classes.short}`}
            onClick={() => {
              this.nav("/short/shortLong");
            }}
          >
            <TrendingUpIcon
              fill={colors.white}
              className={`${classes.icon} icon`}
            />
            <Typography variant={"h3"} className={`${classes.title} title`}>
              Short & Long
            </Typography>
          </Card>
          <Card
            className={`${classes.card} ${classes.mid}`}
            onClick={() => {
              this.nav("/medium/favorites");
            }}
          >
            <FlashOnIcon
              fill={colors.white}
              className={`${classes.icon} icon`}
            />
            <Typography variant={"h3"} className={`${classes.title} title`}>
              Favorites
            </Typography>
          </Card>
          <Card
            className={`${classes.card} ${classes.long}`}
            onClick={() => {
              this.nav("/long/coins");
            }}
          >
            <LensIcon
              stroke={colors.white}
              className={`${classes.icon} icon`}
            />
            <Typography variant={"h3"} className={`${classes.title} title`}>
              Coins
            </Typography>
          </Card>
        </div>
      );
    }
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

export default withTranslation()(
  withRouter(withStyles(styles)(withOrientationChange(Home)))
);
