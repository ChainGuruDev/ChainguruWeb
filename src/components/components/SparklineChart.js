import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  root: {},
});

class SparklineChart extends Component {
  constructor(props) {
    super(props);
    let profit7D_BasedColor;
    if (props.data[0] < props.data[props.data.length - 1]) {
      profit7D_BasedColor = ["#247BA0"];
    } else {
      profit7D_BasedColor = ["#FF1654"];
    }

    this.state = {
      options: {
        chart: {
          type: "line",
          width: 150,
          height: 35,
          sparkline: {
            enabled: true,
          },
        },
        colors: profit7D_BasedColor,

        yaxis: {
          type: "numeric",
          decimalsInFloat: 2,
          forceNiceScale: true,
        },

        stroke: {
          width: 2,
          curve: "straight",
        },
        tooltip: {
          fixed: {
            enabled: false,
          },
          x: {
            show: false,
          },
          y: {
            title: {
              formatter: function (seriesName) {
                return "";
              },
            },
          },
          marker: {
            show: false,
          },
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
        <div className="row">
          <div className="chart">
            <Chart
              options={this.state.options}
              width="150"
              height="35"
              series={this.state.series}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SparklineChart);
