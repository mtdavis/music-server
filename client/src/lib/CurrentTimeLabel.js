import React, {Component} from 'react';
import {
  Typography,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import {secondsToTimeString} from './util';

function styles(theme) {
  return {
    root: {
      margin: 'auto 24px auto 10px',
    },
    display1: {
      // playing
      color: theme.palette.primary.contrastText,
    },
    display2: {
      // stopped
      color: theme.palette.text.disabled,
    },
  };
}

@withStyles(styles, {withTheme: true})
class CurrentTimeLabel extends Component {
  render() {
    const {classes, enabled, seconds} = this.props;

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
  }
}

export default CurrentTimeLabel;
