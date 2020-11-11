import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography, Paper, Grid, Button } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import { colors } from "../../theme";

const styles = (theme) => ({
  background: {
    flexGrow: 1,
  },
});

class BlueChipCard extends Component {
  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    const { classes, t, location } = this.props;
    return (
      <Grid item xs={6}>
        <Paper className={classes.paper}>
          <Grid container direction="row" spacing={2}>
            <Grid item xs={3} spacing={2}>
              <div className={classes.image}>
                <img
                  className={classes.img}
                  alt="coin-icon"
                  src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579"
                />
              </div>
            </Grid>
            <Grid item xs container direction="column" spacing={2}>
              <Typography gutterBottom variant="subtitle1">
                Bitcoin
              </Typography>
              <Typography variant="body2" gutterBottom>
                Current Price: 16700 usd
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Balance in BTC: 0.0btc
              </Typography>
              <Grid
                className={classes.buttonGrid}
                item
                xs
                container
                direction="row"
                spacing={2}
              >
                <Button
                  variant="outlined"
                  onClick={this.overlayClicked}
                  className={classes.button}
                  color="primary"
                  onClick={() => {
                    window.location.assign(
                      "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
                    );
                  }}
                >
                  Get Some
                </Button>
                <Button
                  spacing={2}
                  style={{
                    marginLeft: 10,
                  }}
                  variant="outlined"
                  onClick={this.overlayClicked}
                  className={classes.button}
                  color="primary"
                  onClick={() => {
                    window.location.assign(
                      "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
                    );
                  }}
                >
                  More Info
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(withRouter(withStyles(styles)(BlueChipCard)));
