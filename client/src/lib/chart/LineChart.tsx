import React from 'react';

import * as Colors from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import { ResponsiveLine, LineProps } from '@nivo/line';

const LineChart = (props: LineProps) => {
  const theme = useTheme();

  return (
    <ResponsiveLine
      margin={{
        top: 32, right: 48, bottom: 48, left: 48,
      }}
      colors={[Colors.lightBlue['600']]}
      enableArea
      xScale={{
        type: 'time',
        format: '%Y-%m-%d',
        useUTC: false,
        precision: 'year',
      }}
      xFormat='time:%Y'
      axisBottom={{
        tickSize: 0,
        tickValues: 'every 5 years',
        format: '%Y',
        legend: 'Year',
        legendPosition: 'middle',
        legendOffset: 40,
      }}
      axisLeft={{
        tickSize: 0,
        legend: 'Hours Listened',
        legendPosition: 'middle',
        legendOffset: -40,
      }}
      enableCrosshair={false}
      useMesh
      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

export default LineChart;
