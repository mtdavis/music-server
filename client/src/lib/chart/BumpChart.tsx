import React from 'react';

import { useTheme } from '@mui/material/styles';
import {
  BumpDatum,
  BumpSvgProps,
  ResponsiveBump,
} from '@nivo/bump';

import LinesLayer from './bump/LinesLayer';
import Point from './bump/Point';
import Tooltip from './bump/Tooltip';
import { COLORS, BumpSerieExtraProps } from './util';

const BumpChart = (props: Omit<BumpSvgProps<BumpDatum, BumpSerieExtraProps>, 'width' | 'height'>) => {
  const theme = useTheme();

  return (
    <ResponsiveBump
      margin={{
        top: 32, right: 200, bottom: 40, left: 40,
      }}
      colors={COLORS}
      axisTop={null}
      axisBottom={{
        tickSize: 0,
      }}
      axisLeft={{
        tickSize: 0,
      }}
      tooltip={Tooltip}
      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}
      pointComponent={Point}
      layers={[
        'grid',
        'axes',
        'labels',
        LinesLayer,
        'points',
      ]}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

export default BumpChart;
