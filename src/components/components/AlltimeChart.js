import React, { Component, Suspense } from "react";
// import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";
import { Paper, CircularProgress, Card } from "@material-ui/core";

const Chart = React.lazy(() => import("react-apexcharts"));

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    backgroundColor: "rgba(255, 255, 255, 0.2);",
  },
  chart: {
    margin: 5,
  },
});

class AlltimeChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        chart: {
          animations: {
            enabled: false,
          },
          type: "line",
          sparkline: {
            enabled: true,
          },
        },
        colors: ["#2e2e2e"],

        yaxis: {
          type: "numeric",
          forceNiceScale: false,
        },

        stroke: {
          width: 2,
          curve: "straight",
        },
        tooltip: {
          enabled: false,
        },
      },
      series: [
        {
          name: props.id,
          data: props.data,
        },
      ],
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        series: [
          {
            name: this.props.id,
            data: this.props.data,
          },
        ],
      });
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Suspense
          fallback={
            <div style={{ textAlign: "center" }}>
              <Card className={classes.favCard} elevation={3}>
                <CircularProgress />
              </Card>
            </div>
          }
        >
          <Paper className={classes.paper} variant="outlined" spacing={3}>
            <Chart
              className={classes.chart}
              options={this.state.options}
              series={this.state.series}
            />
          </Paper>
        </Suspense>
      </div>
    );
  }
}

export default withStyles(styles)(AlltimeChart);
