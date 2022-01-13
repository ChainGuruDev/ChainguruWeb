import React, { Component } from "react";
import Chart from "react-apexcharts";
import { withStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";

const styles = (theme) => ({
  root: {},
});

class SparklineChart extends Component {
  constructor(props) {
    super(props);
    let profit7D_BasedColor;
    if (props.data[0] < props.data[props.data.length - 1]) {
      profit7D_BasedColor = [colors.cgGreen];
    } else {
      profit7D_BasedColor = [colors.cgOrange];
    }

    this.state = {
      options: {
        chart: {
          animations: {
            enabled: false,
          },
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
          enabled: false,
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

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      let profit7D_BasedColor;
      if (this.props.data[0] < this.props.data[this.props.data.length - 1]) {
        profit7D_BasedColor = [colors.cgGreen];
      } else {
        profit7D_BasedColor = [colors.cgOrange];
      }

      this.setState({
        options: {
          colors: profit7D_BasedColor,
        },
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
    console.log(this.props.id);
    console.log(this.props.data);
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
