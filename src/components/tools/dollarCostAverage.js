import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { colors } from "../../theme";

//Import UI elements
import {
  Card,
  Typography,
  Grid,
  Divider,
  TextField,
  Button,
} from "@material-ui/core";

import CoinSearchBar from "../components/CoinSearchBar.js";
import DCAchart from "../components/dcaChart.js";

import { COIN_DATA_RETURNED } from "../../constants";

import Store from "../../stores";
const store = Store.store;
const emitter = Store.emitter;

const APIURL = "https://api.coingecko.com/api/v3/";
dayjs.extend(advancedFormat);

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  form: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  dcaForm: {
    margin: 10,
  },
  dcaCard: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    display: "flex",
    flex: 1,
    alignItems: "stretch",
    background: "rgba(255,255,255,0.05)",
    border: `2px solid ${colors.cgBlue}`,
  },
  dcaCardLight: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    display: "flex",
    flex: 1,
    alignItems: "stretch",
    background: "rgba(157,226,249,0.25)",
    border: `2px solid ${colors.cgBlue}`,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 350,
    margin: "10px auto",
  },
  title: {
    fontWeight: 600,
    margin: 0,
  },
  value: {
    color: "#f7931a",
    fontSize: 24,
    margin: 0,
  },
  graphCard: {
    display: "flex",
  },
  divColor: {
    backgroundColor: colors.cgBlue,
  },
});

class DollarCostAverage extends Component {
  constructor(props) {
    super();

    this.state = {
      coinData: [],
      startDate: "1/1/2019",
      endDate: new Date(),
      freqInDays: 30,
      amountToInvest: 200,
      isLoading: false,
      error: false,
      totals: [],
      graphData: {},
    };
  }

  componentDidMount() {
    emitter.on(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(COIN_DATA_RETURNED, this.coinDataReturned);
  }

  coinDataReturned = (data) => {
    this.setState({ coinData: data });
  };

  getDCA = async () => {
    const {
      startDate,
      endDate,
      coinData,
      freqInDays,
      amountToInvest,
    } = this.state;

    this.setState({
      isLoading: true,
    });
    const startDateUnix = dayjs(startDate).format("X");
    const endDateUnix = dayjs(endDate).format("X");

    let dayDiff = dayjs(endDate).diff(dayjs(startDate), "day");

    const range = `range?vs_currency=usd&from=${startDateUnix}&to=${endDateUnix}`;
    const url = `${APIURL}/coins/${coinData[0].id}/market_chart/${range}`;

    if (dayDiff > 0) {
      try {
        const coinResponse = await fetch(url);
        const data = await coinResponse.json();
        this.setState({
          isLoading: false,
          error: false,
        });
        if (data.prices) {
          this.Totals(data.prices, freqInDays, amountToInvest, dayDiff);
        }
      } catch (e) {
        this.setState({
          isLoading: false,
          error: e,
        });
      }
    } else {
      this.setState({
        isLoading: false,
        error: "Start / End Date are inverted?",
      });
    }
  };

  Totals = (priceArr, freqInDays, amountToInvest, numberOfDays) => {
    const numOfDays = priceArr.length;

    let coinAmount = 0;
    let totalInvested = 0;
    let dataArr = [];

    if (numberOfDays > 90) {
      for (let i = 0; i < numOfDays; i += freqInDays) {
        const coinValue = priceArr[i][1];
        coinAmount += amountToInvest / coinValue;
        totalInvested += parseFloat(amountToInvest);
        const total = coinAmount * coinValue;
        const date = dayjs(priceArr[i][0]).format("X");
        dataArr.push({
          TotalInvested: totalInvested,
          CoinAmount: coinAmount,
          CoinPrice: coinValue,
          Total: total,
          date: date,
        });
      }
    } else {
      for (let i = 0; i < numOfDays; i += freqInDays * 24) {
        const coinValue = priceArr[i][1];
        coinAmount += amountToInvest / coinValue;
        totalInvested += parseFloat(amountToInvest);
        const total = coinAmount * coinValue;
        const date = dayjs(priceArr[i][0]).format("DD/MM/YYYY");
        dataArr.push({
          TotalInvested: totalInvested,
          CoinAmount: coinAmount,
          CoinPrice: coinValue,
          Total: total,
          date: date,
        });
      }
    }

    const totalCoinAmount = coinAmount;
    const endTotal = totalCoinAmount * priceArr[priceArr.length - 1][1];
    const numberGained = endTotal - totalInvested;
    const percentGained = ((endTotal - totalInvested) / totalInvested) * 100;

    this.setState({
      graphData: dataArr,
      totals: [
        totalCoinAmount,
        totalInvested,
        endTotal,
        numberGained,
        percentGained,
      ],
    });
  };

  round = (num, digit) => {
    return +(Math.round(num + "e+" + digit) + "e-" + digit);
  };

  handleChangeFrequency = (event) => {
    this.setState({ freqInDays: parseInt(event.target.value) });
  };

  handleChangeAmount = (event) => {
    this.setState({ amountToInvest: event.target.value });
  };

  handleDateChange = (event) => {
    switch (event.target.id) {
      case "startDate":
        this.setState({ startDate: event.target.value });
        break;
      case "endDate":
        this.setState({ endDate: event.target.value });
        break;
      default:
    }
  };

  render() {
    const { classes } = this.props;
    const darkMode = store.getStore("theme") === "dark" ? true : false;
    const {
      coinData,
      error,
      isLoading,
      startDate,
      endDate,
      totals,
      freqInDays,
      graphData,
    } = this.state;
    const frequencies = [
      {
        value: 1,
        label: "daily",
      },
      {
        value: 2,
        label: "Every other day",
      },
      {
        value: 7,
        label: "Weekly",
      },
      {
        value: 14,
        label: "Every two weeks",
      },
      {
        value: 30,
        label: "Every month",
      },
      {
        value: 60,
        label: "Every two months",
      },
    ];

    let content = "";
    if (isLoading) {
      content = <div>Loading...</div>;
    } else {
      content = "";
    }
    if (error) console.log(error);

    if (!isLoading && !coinData.prices) {
    }

    return (
      <Grid>
        <Typography
          color="textPrimary"
          align="center"
          variant="subtitle1"
          component={"span"}
        >
          {content}
        </Typography>
        <Card
          className={darkMode ? classes.dcaCard : classes.dcaCardLight}
          elevation={3}
        >
          <Grid
            container
            justify="space-evenly"
            alignItems="stretch"
            padding={3}
            spacing={3}
          >
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="stretch"
              item
              xs={4}
              padding={3}
              className={classes.dcaForm}
            >
              <CoinSearchBar
                style={{
                  marginTop: 15,
                }}
              />
              <TextField
                id="howMuch"
                label="How Much? (in USD)"
                variant="outlined"
                onChange={this.handleChangeAmount}
                style={{
                  marginTop: 15,
                }}
              />
              <TextField
                id="howFrequent"
                select
                label="How frequent?"
                value={freqInDays}
                onChange={this.handleChangeFrequency}
                SelectProps={{
                  native: true,
                }}
                helperText="every X time you want to purchase"
                variant="outlined"
                style={{
                  marginTop: 15,
                }}
              >
                {frequencies.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
              <TextField
                id="startDate"
                label="Start Date"
                type="date"
                defaultValue={startDate}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={this.handleDateChange}
                style={{
                  marginTop: 15,
                }}
              />
              <TextField
                id="endDate"
                label="End Date"
                type="date"
                defaultValue={endDate}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={this.handleDateChange}
                style={{
                  marginTop: 15,
                }}
              />
              {darkMode && (
                <Button
                  style={{
                    marginTop: 15,
                    border: `1px solid ${colors.cgBlue}`,
                  }}
                  variant="outlined"
                  onClick={this.getDCA}
                >
                  Calculate
                </Button>
              )}
              {!darkMode && (
                <Button
                  style={{
                    marginTop: 15,
                    background: colors.cgBlue,
                  }}
                  onClick={this.getDCA}
                >
                  Calculate
                </Button>
              )}
            </Grid>
            <Divider
              className={classes.divColor}
              orientation="vertical"
              flexItem
            />
            <Grid item xs={7} padding={3}>
              {totals[0] && (
                <Grid container justify="center" item direction="row">
                  <Grid item direction="column" xs={12}>
                    <DCAchart data={graphData} />
                  </Grid>
                  <Grid
                    item
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    xs={6}
                  >
                    <Typography>Total invested in USD </Typography>
                    <Typography color={"primary"} variant={"h3"}>
                      ${Math.round(totals[1])}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    xs={6}
                  >
                    <Typography>End Total in USD</Typography>
                    <Typography color={"primary"} variant={"h3"}>
                      ${Math.round(totals[2])}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    xs={6}
                  >
                    <Typography>Total gain in USD</Typography>
                    <Typography color={"primary"} variant={"h3"}>
                      ${Math.round(totals[3])}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    xs={6}
                  >
                    <Typography>Percent Gained</Typography>
                    <Typography color={"primary"} variant={"h3"}>
                      {Math.round(totals[4])}%
                    </Typography>
                  </Grid>
                  <Typography>
                    Total amount in coin
                    <Typography color={"primary"} variant={"h3"}>
                      {totals[0]}
                    </Typography>
                  </Typography>
                </Grid>
              )}
              {!totals[0] &&
                ("What Is Dollar-Cost Averaging (DCA)?",
                "Dollar-cost averaging (DCA) is an investment strategy in which an investor divides up the total amount to be invested across periodic purchases of a target asset in an effort to reduce the impact of volatility on the overall purchase. The purchases occur regardless of the asset's price and at regular intervals. In effect, this strategy removes much of the detailed work of attempting to time the market in order to make purchases of equities at the best prices. Dollar-cost averaging is also known as the constant dollar plan. ")}
            </Grid>
          </Grid>
        </Card>
      </Grid>
    );
  }

  nav = (screen) => {
    this.props.history.push(screen);
  };
}

export default withTranslation()(
  withRouter(withStyles(styles)(DollarCostAverage))
);
