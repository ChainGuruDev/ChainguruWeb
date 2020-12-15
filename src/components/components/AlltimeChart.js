import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";

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
          type: "line",
          sparkline: {
            enabled: true,
          },
        },
        colors: ["#2e2e2e"],

        yaxis: {
          type: "numeric",
          forceNiceScale: true,
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

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Paper className={classes.paper} variant="outlined" spacing={3}>
          <Chart
            className={classes.chart}
            options={this.state.options}
            series={this.state.series}
          />
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(AlltimeChart);
