import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

import { UPDATE_WAIT_COMPLETE } from "../../constants";

import Store from "../../stores";
const emitter = Store.emitter;

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

export default function CargaLineal() {
  const classes = useStyles();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          // console.log("espera carga completada");
          emitter.emit(UPDATE_WAIT_COMPLETE);

          return 0;
        }
        const diff = 0.25;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={classes.root}>
      <LinearProgress variant="determinate" value={progress} />
    </div>
  );
}
