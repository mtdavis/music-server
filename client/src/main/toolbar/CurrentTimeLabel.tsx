import React from 'react';
import {
  Typography,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {Theme} from '@material-ui/core/styles';

import {secondsToTimeString} from 'lib/util';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 'auto 24px auto 24px',
  },
  display1: {
    // playing
    color: theme.palette.primary.contrastText,
  },
  display2: {
    // stopped
    color: theme.palette.text.disabled,
  },
}));

interface Props {
  enabled: boolean;
  seconds: number;
}

const CurrentTimeLabel = ({
  enabled,
  seconds,
}: Props): React.ReactElement => {
  const classes = useStyles();

  const timeLabelClass = enabled ? classes.display1 : classes.display2;

  let timeString = secondsToTimeString(seconds);
  // strip off decimal
  if(timeString.indexOf(".") > -1) {
    timeString = timeString.split(".")[0];
  }

  return (
    <Typography
      variant="h6"
      color="inherit"
      className={timeLabelClass}
      classes={{root: classes.root}}
    >
      {timeString}
    </Typography>
  );
};

export default CurrentTimeLabel;
