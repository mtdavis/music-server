import React, {Component} from 'react';
import {
  colors,
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
      ...theme.typography.title,
      color: theme.palette.primary.contrastText,
    },
    display2: {
      // stopped
      ...theme.typography.title,
      color: theme.palette.text.disabled,
    },
  };
}

@withStyles(styles, {withTheme: true})
class CurrentTimeLabel extends Component {
  render() {
    const {classes, enabled, seconds} = this.props;

    const timeLabelVariant = enabled ? 'display1' : 'display2';

    let timeString = secondsToTimeString(seconds);
    // strip off decimal
    if(timeString.indexOf(".") > -1) {
      timeString = timeString.split(".")[0];
    }

    return (
      <Typography variant={timeLabelVariant} color="inherit" classes={classes}>
        {timeString}
      </Typography>
    );
  }
}

export default CurrentTimeLabel;
