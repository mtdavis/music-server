import React from 'react';
import {Typography} from '@mui/material';

import {secondsToTimeString} from 'lib/util';

interface Props {
  enabled: boolean;
  seconds: number;
}

const CurrentTimeLabel = ({
  enabled,
  seconds,
}: Props): React.ReactElement => {
  let timeString = secondsToTimeString(seconds);
  // strip off decimal
  if(timeString.indexOf(".") > -1) {
    timeString = timeString.split(".")[0];
  }

  return (
    <Typography
      variant="h6"
      color="inherit"
      sx={{
        color: enabled ? 'primary.contrastText' : 'text.disabled',
      }}
    >
      {timeString}
    </Typography>
  );
};

export default CurrentTimeLabel;
