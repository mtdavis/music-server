import React from 'react';

import { Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Point } from '@nivo/line';

interface Props {
  point: Point;
}

const ListensByYearTooltip = ({
  point,
}: Props) => {
  const theme = useTheme();

  return (
    <Paper style={{ padding: theme.spacing(1) }}>
      <Typography>
        <strong>
          {point.data.xFormatted}
          :
        </strong>
        {' '}
        {point.data.y.toLocaleString()}
        {' '}
        hours
      </Typography>
    </Paper>
  );
};

export default ListensByYearTooltip;
